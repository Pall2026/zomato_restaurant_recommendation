import request from 'supertest';
import { app } from '../index';

jest.mock('../llm/groq', () => ({
  getGroqRecommendations: jest.fn().mockResolvedValue([]),
}));

jest.mock('../db/client', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    on: jest.fn(),
  },
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

describe('Health API', () => {
  it('should return a 200 OK from the /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
