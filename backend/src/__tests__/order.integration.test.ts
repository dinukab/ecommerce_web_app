import request from 'supertest';
import { app } from '../server.js';
import Product from '../models/Product.js';
import DeliveryZone from '../models/DeliveryZone.js';
import { Order } from '../models/Order.js';

describe('Order Integration Tests', () => {
  let userToken: string;
  let testProductId: string;
  let testDeliveryZoneId: string;

  beforeEach(async () => {
    // 1. Create a user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Order Tester',
        email: 'ordertester@example.com',
        password: 'password123',
        phone: '0712345678'
      });
    userToken = registerResponse.body.data.token;

    // 2. Create a Delivery Zone
    const zone = await DeliveryZone.create({
      name: 'Colombo Zone',
      districts: ['Colombo'],
      deliveryFee: 300,
      estimatedDays: 2,
      isActive: true
    });
    testDeliveryZoneId = (zone._id as any).toString();

    // 3. Create a Product
    const product = await Product.create({
      name: 'Test Laptop',
      sku: 'SKU-LAPTOP',
      sellingPrice: 100000,
      costPrice: 80000,
      category: 'Electronics',
      stock: 5,
      storeId: '69e539fd180ff885ce56ca57'
    });
    testProductId = (product._id as any).toString();
  });

  describe('POST /api/orders', () => {
    it('should create a COD order successfully and deduct stock', async () => {
      const orderPayload = {
        orderItems: [
          {
            product: testProductId,
            quantity: 2
          }
        ],
        shippingAddress: {
          fullName: 'Order Tester',
          addressLine1: '123 Test St',
          city: 'Colombo 01',
          district: 'Colombo',
          postalCode: '00100',
          phone: '0712345678'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'cash-on-delivery',
        orderNotes: 'Please deliver fast'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('processing');
      expect(response.body.data.paymentStatus).toBe('pending');
      expect(response.body.data.deliveryFee).toBe(300); // from our test zone
      expect(response.body.data.totalPrice).toBe(200300); // (100000 * 2) + 300

      // Verify stock was deducted for COD
      const updatedProduct = await Product.findById(testProductId);
      expect(updatedProduct?.stock).toBe(3); // 5 - 2 = 3
    });

    it('should fail to create order if stock is insufficient', async () => {
      const orderPayload = {
        orderItems: [
          {
            product: testProductId,
            quantity: 10 // Only 5 in stock
          }
        ],
        shippingAddress: {
          fullName: 'Order Tester',
          addressLine1: '123 Test St',
          city: 'Colombo 01',
          district: 'Colombo',
          postalCode: '00100',
          phone: '0712345678'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'cash-on-delivery'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Insufficient stock/i);
    });

    it('should fail to create order if delivery district is not supported', async () => {
      const orderPayload = {
        orderItems: [{ product: testProductId, quantity: 1 }],
        shippingAddress: {
          fullName: 'Order Tester',
          addressLine1: '123 Test St',
          city: 'Unknown City',
          district: 'UnknownDistrict', // Not in our delivery zones
          postalCode: '00100',
          phone: '0712345678'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'cash-on-delivery'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Delivery not available for this district/i);
    });
  });

  describe('GET /api/orders/track/:trackingNumber', () => {
    it('should successfully track an order without authentication', async () => {
      // First create an order to track
      const orderPayload = {
        orderItems: [{ product: testProductId, quantity: 1 }],
        shippingAddress: {
          fullName: 'Order Tester',
          addressLine1: '123 Test St',
          city: 'Colombo',
          district: 'Colombo',
          postalCode: '00100',
          phone: '0712345678'
        },
        deliveryMethod: 'standard',
        paymentMethod: 'cash-on-delivery'
      };

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      const trackingNumber = createRes.body.data.trackingNumber;

      // Now track it
      const trackRes = await request(app).get(`/api/orders/track/${trackingNumber}`);

      expect(trackRes.status).toBe(200);
      expect(trackRes.body.success).toBe(true);
      expect(trackRes.body.data).toHaveProperty('trackingNumber', trackingNumber);
      expect(trackRes.body.data).toHaveProperty('status');
      // Should not contain sensitive user info like passwords
      expect(trackRes.body.data).not.toHaveProperty('user');
    });
  });
});
