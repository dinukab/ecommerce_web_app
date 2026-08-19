import request from 'supertest';
import { app } from '../server.js';

/**
 * Regression guard. The original allowlist was localhost plus a single
 * FRONTEND_URL, which rejected every tenant subdomain in a browser — curl
 * never sends Origin, so the failure only appeared in real use.
 */
describe('CORS across tenant subdomains', () => {
  const origins = [
    'https://allinoneshop.store',
    'https://opendoor.allinoneshop.store',
    'https://bookmart.allinoneshop.store',
    'https://opendoor.pos.allinoneshop.store',
    'http://localhost:3000',
  ];

  for (const origin of origins) {
    it(`allows ${origin}`, async () => {
      const res = await request(app).get('/api/products').set('Origin', origin);
      expect(res.status).not.toBe(500);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
    });
  }

  const rejected = [
    'https://evil.com',
    'https://allinoneshop.store.evil.com',
    'https://notallinoneshop.store',
  ];

  for (const origin of rejected) {
    it(`rejects ${origin}`, async () => {
      const res = await request(app).get('/api/products').set('Origin', origin);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  }

  it('allows requests with no Origin header at all', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
  });
});
