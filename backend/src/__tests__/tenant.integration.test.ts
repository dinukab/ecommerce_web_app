import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { clearTenantCache } from '../db/tenantRegistry.js';

const FACTORY_DB = 'oneshop-tenant-factory';
const TENANT_A = 'oneshop_alpha_store';
const TENANT_B = 'oneshop_beta_store';

/** Registers a tenant in the factory registry and seeds its database. */
async function provision(dbName: string, businessName: string, productName: string) {
  await mongoose.connection.useDb(FACTORY_DB).collection('tenants').insertOne({
    businessName,
    databaseName: dbName,
    status: 'active',
    primaryColor: '#0891b2',
    logo: null,
  });

  const db = mongoose.connection.useDb(dbName);
  await db.collection('storesettings').insertOne({
    storeId: `STORE-${businessName}`,
    storeName: businessName,
    currency: 'LKR',
    currencyLocale: 'en-LK',
  });
  await db.collection('products').insertOne({
    name: productName,
    sku: `SKU-${businessName}`,
    sellingPrice: 1000,
    costPrice: 500,
    category: 'Electronics',
    stock: 5,
    images: [],
    storeId: `STORE-${businessName}`,
  });
}

describe('Multi-tenant request routing', () => {
  beforeEach(async () => {
    clearTenantCache();
    await provision(TENANT_A, 'alphastore', 'Alpha Widget');
    await provision(TENANT_B, 'betastore', 'Beta Gadget');
  });

  afterEach(async () => {
    for (const name of [FACTORY_DB, TENANT_A, TENANT_B]) {
      await mongoose.connection.useDb(name).dropDatabase();
    }
    clearTenantCache();
  });

  it('serves each subdomain only its own catalogue', async () => {
    const alpha = await request(app).get('/api/products').set('Host', 'alphastore.oneshop.lk');
    const beta = await request(app).get('/api/products').set('Host', 'betastore.oneshop.lk');

    expect(alpha.status).toBe(200);
    expect(alpha.body.data.map((p: any) => p.name)).toEqual(['Alpha Widget']);

    expect(beta.status).toBe(200);
    expect(beta.body.data.map((p: any) => p.name)).toEqual(['Beta Gadget']);
  });

  it('reads store settings from the requested tenant', async () => {
    const res = await request(app)
      .get('/api/store-settings')
      .set('Host', 'betastore.oneshop.lk');

    expect(res.status).toBe(200);
    expect(res.body.data.storeName).toBe('betastore');
  });

  it('rejects an unknown subdomain', async () => {
    const res = await request(app).get('/api/products').set('Host', 'nosuchstore.oneshop.lk');
    expect(res.status).toBe(404);
  });

  it('falls back to DEFAULT_TENANT_DB for apex and localhost hosts', async () => {
    // setup.ts points DEFAULT_TENANT_DB at the shared test database.
    const res = await request(app).get('/api/products').set('Host', 'oneshop.lk');
    expect(res.status).toBe(200);
    expect(res.body.data.map((p: any) => p.name)).not.toContain('Alpha Widget');
  });

  it('ignores the tenant header unless ALLOW_TENANT_HEADER is set', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Host', 'oneshop.lk')
      .set('OneShop-Tenant-ID', TENANT_A);

    expect(res.status).toBe(200);
    expect(res.body.data.map((p: any) => p.name)).not.toContain('Alpha Widget');
  });

  describe('behind a reverse proxy (CloudFront / Lambda Function URL)', () => {
    afterEach(() => {
      delete process.env.TRUST_PROXY_HOST;
    });

    it('resolves the tenant from X-Forwarded-Host when the proxy is trusted', async () => {
      process.env.TRUST_PROXY_HOST = 'true';

      const res = await request(app)
        .get('/api/products')
        // Host is what a Lambda Function URL origin would see.
        .set('Host', 'abc123.lambda-url.us-east-1.on.aws')
        .set('X-Forwarded-Host', 'alphastore.oneshop.lk');

      expect(res.status).toBe(200);
      expect(res.body.data.map((p: any) => p.name)).toEqual(['Alpha Widget']);
    });

    it('takes the first entry when a proxy chain appends hosts', async () => {
      process.env.TRUST_PROXY_HOST = 'true';

      const res = await request(app)
        .get('/api/products')
        .set('Host', 'abc123.lambda-url.us-east-1.on.aws')
        .set('X-Forwarded-Host', 'betastore.oneshop.lk, internal.proxy.local');

      expect(res.status).toBe(200);
      expect(res.body.data.map((p: any) => p.name)).toEqual(['Beta Gadget']);
    });

    it('ignores X-Forwarded-Host when the proxy is not trusted', async () => {
      // Default (unset) — a direct caller must not be able to pick a tenant.
      const res = await request(app)
        .get('/api/products')
        .set('Host', 'oneshop.lk')
        .set('X-Forwarded-Host', 'alphastore.oneshop.lk');

      expect(res.status).toBe(200);
      expect(res.body.data.map((p: any) => p.name)).not.toContain('Alpha Widget');
    });
  });

  it('will not let a session from one store be replayed against another', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .set('Host', 'alphastore.oneshop.lk')
      .send({
        name: 'Alpha Shopper',
        email: 'shopper@alpha.example',
        password: 'password123',
        phone: '0712345678',
      });

    expect(register.status).toBe(201);
    const token = register.body.data.token;

    const replayed = await request(app)
      .get('/api/auth/me')
      .set('Host', 'betastore.oneshop.lk')
      .set('Authorization', `Bearer ${token}`);

    expect(replayed.status).toBe(401);
    expect(replayed.body.message).toMatch(/different store/i);
  });
});
