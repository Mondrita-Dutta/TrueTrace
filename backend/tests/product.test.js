const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB } = require('./setup');
const { errorHandler } = require('../middlewares/errorMiddleware');

// Models
const Product = require('../models/Product');
const User = require('../models/User');

// Mock Auth Middleware to inject a user
jest.mock('../middlewares/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Cannot reference mongoose here because jest.mock is hoisted
    req.user = { id: '5f8d04b3b54764421b7156d1', role: 'manufacturer' };
    next();
  }
}));
jest.mock('../middlewares/roleMiddleware', () => ({
  authorize: () => (req, res, next) => next()
}));

// Mock Stellar Service
jest.mock('../services/stellarService', () => ({
  publishProductToBlockchain: jest.fn().mockResolvedValue({ hash: 'mock_tx_hash', ledger: 12345 }),
  initializeStellarAccount: jest.fn().mockResolvedValue(true)
}));

const productRoutes = require('../routes/productRoutes');
const publicRoutes = require('../routes/publicRoutes');

const app = express();
app.use(express.json());
// Map global formatters
app.use((req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => res.status(statusCode).json({ success: true, message, data });
  res.error = (message = 'Error', statusCode = 500, errors = null) => res.status(statusCode).json({ success: false, message, errors });
  next();
});

app.use('/api/products', productRoutes);
app.use('/api/public', publicRoutes);
app.use(errorHandler);

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Product API Endpoints', () => {
  let mockManufacturerId;

  beforeEach(() => {
    mockManufacturerId = new mongoose.Types.ObjectId();
  });

  const validProductPayload = {
    productName: 'Test Product',
    category: 'Electronics',
    brandName: 'BrandX',
    manufacturerName: 'ManX',
    manufacturerCompany: 'ManX Corp',
    description: 'A test product',
    batchNumber: 'BATCH-001',
    serialNumber: 'SN-001',
    manufacturingDate: '2025-01-01T00:00:00Z',
    countryOfOrigin: 'US'
  };

  it('should create a new product and return 201', async () => {
    const res = await request(app).post('/api/products').send(validProductPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productName).toBe('Test Product');
    expect(res.body.data.blockchainStatus).toBe('Verified');
    expect(res.body.data.qrImageUrl).toContain('qr-');
  });

  it('should reject creation with missing required fields (Validation)', async () => {
    const res = await request(app).post('/api/products').send({ productName: 'Missing fields' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toHaveProperty('category');
    expect(res.body.errors).toHaveProperty('brandName');
  });

  it('should reject creation with a duplicate serial number', async () => {
    await request(app).post('/api/products').send(validProductPayload);
    const res2 = await request(app).post('/api/products').send({
      ...validProductPayload,
      productName: 'Different Name'
    });
    // This is caught by mongoose uniqueness or manual check
    expect(res2.statusCode).toBe(400);
    expect(res2.body.success).toBe(false);
  });

  it('should retrieve a list of products', async () => {
    await request(app).post('/api/products').send(validProductPayload);
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(1);
  });

  it('should update a product', async () => {
    const createRes = await request(app).post('/api/products').send(validProductPayload);
    const productId = createRes.body.data._id;

    const updateRes = await request(app).put(`/api/products/${productId}`).send({
      productName: 'Updated Name',
      category: 'Updated Category'
    });
    
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.productName).toBe('Updated Name');
  });

  it('should delete a product', async () => {
    const createRes = await request(app).post('/api/products').send(validProductPayload);
    const productId = createRes.body.data._id;

    const deleteRes = await request(app).delete(`/api/products/${productId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/products/${productId}`);
    expect(getRes.statusCode).toBe(404);
  });

  describe('Public Verification Endpoint', () => {
    it('should return product not found for invalid ID', async () => {
      const res = await request(app).get('/api/public/verify/INVALID-ID');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
