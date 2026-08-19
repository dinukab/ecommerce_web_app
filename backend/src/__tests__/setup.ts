import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { clearStoreIdentityCache } from '../db/storeId.js';
import { clearTenantCache } from '../db/tenantRegistry.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Point the storefront at the same database the fixtures write to, so
  // useDb() in tenantMiddleware resolves back to this connection's database.
  process.env.DEFAULT_TENANT_DB = mongoose.connection.name;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  clearStoreIdentityCache();
  clearTenantCache();
});

// Every tenant database carries exactly one storesettings document; the
// storefront reads the tenant's storeId from it when writing orders.
beforeEach(async () => {
  await mongoose.connection.collection('storesettings').insertOne({
    storeId: 'TEST-STORE-0001',
    storeName: 'Test Store',
    currency: 'LKR',
    currencyLocale: 'en-LK',
  });
});
