const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

jest.setTimeout(30000);

// Mock the cache service globally so integration tests don't need Redis
jest.mock('../src/services/cache.service', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(),
  del: jest.fn().mockResolvedValue(),
  invalidatePattern: jest.fn().mockResolvedValue(),
}));

// Mock the rate limiter to avoid Redis dependency during tests
jest.mock('../src/middleware/rateLimiter', () => ({
  generalLimiter: (_req, _res, next) => next(),
  authLimiter: (_req, _res, next) => next(),
}));

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
