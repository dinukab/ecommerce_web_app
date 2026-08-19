import type { Response, NextFunction } from 'express';
import type { TenantRequest } from '../types/index.js';
import { getTenantConnection } from '../db/connectionManager.js';
import { getModels } from '../db/tenantModels.js';
import { findTenantBySubdomain, subdomainFromHost } from '../db/tenantRegistry.js';

const TENANT_HEADER = 'oneshop-tenant-id';
const DB_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * The hostname the visitor actually typed.
 *
 * Behind CloudFront, an ALB, or any reverse proxy, `Host` is rewritten to the
 * origin's own hostname — with a Lambda Function URL it must be, because
 * SigV4 signs over it. The original hostname arrives in `X-Forwarded-Host`
 * instead, so without this every tenant would collapse onto DEFAULT_TENANT_DB.
 *
 * That header is trivially spoofable by a direct caller, and this storefront is
 * public, so it is only honoured when TRUST_PROXY_HOST=true — i.e. when the
 * origin is genuinely unreachable except through the proxy.
 */
function originalHost(req: TenantRequest): string | undefined {
  if (process.env.TRUST_PROXY_HOST === 'true') {
    const forwarded = req.headers['x-forwarded-host'];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    // Proxies may append rather than replace; the first entry is the client's.
    const first = value?.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.host;
}

/**
 * Resolves the tenant for each storefront request, in priority order:
 *
 *   1. Host subdomain      — opendoor.oneshop.lk -> oneshop_open_door
 *   2. OneShop-Tenant-ID   — explicit override, only when ALLOW_TENANT_HEADER=true
 *   3. DEFAULT_TENANT_DB   — single-tenant deploys and local development
 *
 * The header is opt-in because the storefront is public: with it always on, any
 * visitor could read another tenant's catalogue by setting one request header.
 */
export async function tenantMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let dbName: string | null = null;

    const subdomain = subdomainFromHost(originalHost(req));
    if (subdomain) {
      const tenant = await findTenantBySubdomain(subdomain);
      if (!tenant) {
        res.status(404).json({ success: false, message: `Unknown store '${subdomain}'` });
        return;
      }
      dbName = tenant.databaseName;
    }

    if (!dbName && process.env.ALLOW_TENANT_HEADER === 'true') {
      const header = req.headers[TENANT_HEADER];
      if (typeof header === 'string' && header.length > 0) {
        if (!DB_NAME_PATTERN.test(header)) {
          res.status(400).json({ success: false, message: 'Invalid OneShop-Tenant-ID header' });
          return;
        }
        dbName = header;
      }
    }

    if (!dbName) {
      dbName = process.env.DEFAULT_TENANT_DB || null;
    }

    if (!dbName) {
      res.status(400).json({
        success: false,
        message: 'Could not determine store for this request',
      });
      return;
    }

    if (!DB_NAME_PATTERN.test(dbName)) {
      res.status(500).json({ success: false, message: 'Misconfigured tenant database name' });
      return;
    }

    const conn = getTenantConnection(dbName);
    req.tenantDb = conn;
    req.tenantDbName = dbName;
    req.models = getModels(conn);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Guards handlers that cannot run without tenant context. tenantMiddleware
 * normally guarantees it, so reaching this is a wiring bug rather than a
 * client error.
 */
export function requireTenant(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.models) {
    res.status(400).json({ success: false, message: 'No store context for this request' });
    return;
  }
  next();
}
