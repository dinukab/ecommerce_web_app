import type { TenantRequest } from '../types/index.js';

export interface StoreIdentity {
  storeId: string;
  storeName: string;
}

/**
 * Each tenant database carries a single `storesettings` document whose
 * `storeId` is the tenant's id in the tenant-factory registry. The POS writes
 * that same value onto every record it creates, so the storefront must reuse it
 * rather than inventing one — otherwise POS-side queries filtered by storeId
 * silently skip orders placed online.
 *
 * Cached per tenant database; the value never changes for a provisioned tenant.
 */
const cache = new Map<string, StoreIdentity>();

export async function resolveStoreIdentity(req: TenantRequest): Promise<StoreIdentity> {
  const dbName = req.tenantDbName!;

  const hit = cache.get(dbName);
  if (hit) return hit;

  const settings = await req
    .models!.StoreSetting.findOne({})
    .select('storeId storeName')
    .lean<{ storeId?: string; storeName?: string }>();

  if (!settings?.storeId) {
    throw new Error(`Tenant '${dbName}' has no storesettings.storeId — provision it first`);
  }

  const identity: StoreIdentity = {
    storeId: settings.storeId,
    storeName: settings.storeName ?? '',
  };

  cache.set(dbName, identity);
  return identity;
}

/** Clears the cache — used by tests and after store settings change. */
export function clearStoreIdentityCache(): void {
  cache.clear();
}
