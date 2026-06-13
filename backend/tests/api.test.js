const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Visit = require('../models/Visit');

let token = '';
let userId = '';
let urlId = '';
let shortCode = '';

beforeAll(async () => {
  // Use test DB or in-memory
  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connect(process.env.MONGODB_URI);
  }
});

afterAll(async () => {
  // Clean up test data
  if (token) {
    await request(app)
      .delete(`/api/urls/${urlId}`)
      .set('Authorization', `Bearer ${token}`);
  }
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testEmail = `test_${Date.now()}@smartlink.test`;
  const testPassword = 'Test@12345';

  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User 2',
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/login - should login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  test('POST /api/auth/login - should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me - should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  test('GET /api/auth/me - should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

describe('URL API', () => {
  test('POST /api/urls - should create a short URL', async () => {
    const res = await request(app)
      .post('/api/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://www.example.com/test-page' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.url.shortCode).toBeDefined();
    urlId = res.body.data.url._id;
    shortCode = res.body.data.url.shortCode;
  });

  test('POST /api/urls - should reject invalid URL', async () => {
    const res = await request(app)
      .post('/api/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'not-a-url' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/urls - should create URL with custom alias', async () => {
    const alias = `test-alias-${Date.now()}`;
    const res = await request(app)
      .post('/api/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://www.example.com', customAlias: alias });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.url.shortCode).toBe(alias);
    // Clean up
    await request(app)
      .delete(`/api/urls/${res.body.data.url._id}`)
      .set('Authorization', `Bearer ${token}`);
  });

  test('GET /api/urls - should list user URLs', async () => {
    const res = await request(app)
      .get('/api/urls')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.urls)).toBe(true);
  });

  test('GET /api/urls/:id - should fetch URL by ID', async () => {
    const res = await request(app)
      .get(`/api/urls/${urlId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.url._id).toBe(urlId);
  });

  test('PUT /api/urls/:id - should update URL', async () => {
    const res = await request(app)
      .put(`/api/urls/${urlId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.url.title).toBe('Updated Title');
  });

  test('GET /api/urls/:id/analytics - should return analytics', async () => {
    const res = await request(app)
      .get(`/api/urls/${urlId}/analytics`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalClicks).toBeDefined();
  });

  test('GET /api/urls/:id/daily-clicks - should return daily click data', async () => {
    const res = await request(app)
      .get(`/api/urls/${urlId}/daily-clicks`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.dailyClicks)).toBe(true);
  });

  test('DELETE /api/urls/:id - should remove the URL and all analytics history', async () => {
    const createRes = await request(app)
      .post('/api/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://example.org/delete-me' });

    const createdId = createRes.body.data.url._id;
    const createdCode = createRes.body.data.url.shortCode;

    await Visit.create({
      urlId: createdId,
      browser: 'Chrome',
      device: 'Desktop',
      operatingSystem: 'Windows',
      visitedAt: new Date(),
      userAgent: 'jest-test',
    });

    const deleteRes = await request(app)
      .delete(`/api/urls/${createdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(await Visit.countDocuments({ urlId: createdId })).toBe(0);

    const statsRes = await request(app).get(`/stats/${createdCode}`);
    expect(statsRes.statusCode).toBe(404);
  });
});

describe('Redirect', () => {
  test('GET /:shortCode - should use a temporary redirect so clicks are not cached', async () => {
    const res = await request(app).get(`/${shortCode}`);
    expect(res.statusCode).toBe(302);
  });

  test('GET /stats/:shortCode - should return public stats', async () => {
    const res = await request(app).get(`/stats/${shortCode}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalClicks).toBeDefined();
  });
});
