import mongoose from 'mongoose';

/**
 * Read-only view of the tenant-factory `tenants` collection. The factory owns
 * this schema; the storefront only needs enough to resolve a host to a database
 * and to know whether the tenant is still active.
 */
const tenantReadSchema = new mongoose.Schema(
  {
    businessName: String,
    logo: String,
    primaryColor: String,
    databaseName: String,
    status: String,
  },
  { collection: 'tenants' }
);

export interface TenantRecord {
  businessName: string;
  logo: string | null;
  primaryColor: string;
  databaseName: string;
}

const FACTORY_DB = process.env.TENANT_FACTORY_DB || 'oneshop-tenant-factory';
const CACHE_TTL_MS = Number(process.env.TENANT_CACHE_TTL_MS ?? 60_000);

/** Resolved tenants, keyed by normalized subdomain. */
const cache = new Map<string, { value: TenantRecord | null; expiresAt: number }>();

/**
 * Reduces a subdomain or database name to a comparable key:
 * `oneshop_open_door` -> `opendoor`, `Open-Door` -> `opendoor`.
 */
export function normalizeTenantKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/^oneshop[-_]/, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts the tenant subdomain from a Host header.
 * Returns null for bare hosts, `www`, IP addresses, and localhost, so those
 * fall through to DEFAULT_TENANT_DB.
 */
export function subdomainFromHost(host: string | undefined): string | null {
  if (!host) return null;

  const hostname = host.split(':')[0].toLowerCase();
  if (/^[\d.]+$/.test(hostname) || hostname === 'localhost') return null;

  const labels = hostname.split('.');
  // Need at least sub.domain.tld to have a tenant label.
  if (labels.length < 3) return null;

  const sub = labels[0];
  if (sub === 'www' || sub === 'api') return null;

  return sub;
}

function isFresh(entry: { expiresAt: number } | undefined): boolean {
  return !!entry && entry.expiresAt > Date.now();
}

/**
 * Looks up an active tenant by subdomain in the tenant-factory registry.
 * Results (including misses) are cached briefly so a burst of storefront
 * traffic does not hit the registry on every request.
 */
export async function findTenantBySubdomain(subdomain: string): Promise<TenantRecord | null> {
  const key = normalizeTenantKey(subdomain);

  const cached = cache.get(key);
  if (isFresh(cached)) return cached!.value;

  const factoryConn = mongoose.connection.useDb(FACTORY_DB, { useCache: true });
  const Tenant =
    factoryConn.models['Tenant'] ?? factoryConn.model('Tenant', tenantReadSchema);

  const rows = await Tenant.find({ status: 'active', databaseName: { $ne: null } })
    .select('businessName logo primaryColor databaseName')
    .lean<
      Array<{
        businessName: string;
        logo: string | null;
        primaryColor: string;
        databaseName: string;
      }>
    >();

  const match =
    rows.find((t) => normalizeTenantKey(t.databaseName) === key) ??
    rows.find((t) => normalizeTenantKey(t.businessName) === key) ??
    null;

  const value: TenantRecord | null = match
    ? {
        businessName: match.businessName,
        logo: match.logo ?? null,
        primaryColor: match.primaryColor ?? '#0891b2',
        databaseName: match.databaseName,
      }
    : null;

  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/** Clears the resolution cache — used by tests and after tenant provisioning. */
export function clearTenantCache(): void {
  cache.clear();
}
