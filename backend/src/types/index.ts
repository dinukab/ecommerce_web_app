import type { Request } from 'express';
import type { Connection } from 'mongoose';
import type { TenantModels } from '../db/tenantModels.js';

/**
 * Every storefront request carries tenant context resolved by tenantMiddleware.
 * `models` is the only supported way to reach the database from a controller —
 * importing a model module directly binds it to the default connection and
 * would read the wrong tenant's data.
 */
export interface TenantRequest extends Request {
  tenantDb?: Connection;
  tenantDbName?: string;
  models?: TenantModels;
  /** Populated by `protect`; the customer document from THIS tenant's database. */
  user?: any;
}
