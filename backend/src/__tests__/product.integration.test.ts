import request from 'supertest';
import { app } from '../server.js';
import Product from '../models/Product.js';

describe('Product Integration Tests', () => {
  const sampleProducts = [
    {
      name: 'Test Apple',
      sku: 'SKU-001',
      sellingPrice: 150,
      costPrice: 100,
      category: 'Fruits',
      rating: 5,
      stock: 20
    },
    {
      name: 'Test Banana',
      sku: 'SKU-002',
      sellingPrice: 50,
      costPrice: 30,
      category: 'Fruits',
      rating: 4,
      stock: 50
    },
    {
      name: 'Test Carrot',
      sku: 'SKU-003',
      sellingPrice: 80,
      costPrice: 50,
      category: 'Vegetables',
      rating: 3,
      stock: 100
    }
  ];

  beforeEach(async () => {
    // Insert mock data before each test
    await Product.insertMany(sampleProducts);
  });

  describe('GET /api/products', () => {
    it('should fetch all products with default pagination', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toHaveProperty('total', 3);
    });

    it('should filter products by search query', async () => {
      const response = await request(app).get('/api/products?search=Banana');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Test Banana');
    });

    it('should sort products by rating correctly', async () => {
      const response = await request(app).get('/api/products?sort=rating');

      expect(response.status).toBe(200);
      expect(response.body.data[0].name).toBe('Test Apple'); // rating 5
      expect(response.body.data[1].name).toBe('Test Banana'); // rating 4
      expect(response.body.data[2].name).toBe('Test Carrot'); // rating 3
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a single product by ID', async () => {
      // Find a product to get its ID
      const product = await Product.findOne({ sku: 'SKU-001' });
      
      const response = await request(app).get(`/api/products/${product?._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Apple');
    });

    it('should return 404 for non-existent but valid object ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // valid mongo ObjectId but doesn't exist
      const response = await request(app).get(`/api/products/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 500 for invalid object ID format', async () => {
      const response = await request(app).get('/api/products/invalid-id-format');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
