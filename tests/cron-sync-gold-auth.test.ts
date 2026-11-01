import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mock gold scraper to avoid external network calls during route testing
jest.mock('@/lib/gold/scraper', () => ({
  fetchLiveGaleri24Prices: jest.fn().mockResolvedValue([
    {
      brand: 'ANTAM',
      weight_gram: 1,
      sell_price: 1500000,
      buyback_price: 1350000,
    },
  ]),
}));

// Mock Supabase server client
let mockUser: any = null;
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: mockUser ? null : new Error('No session'),
      }),
    },
  })),
}));

// Mock @supabase/supabase-js for route's service role client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
}));

import { GET } from '@/app/api/cron/sync-gold/route';

describe('GET /api/cron/sync-gold Authentication & Authorization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockUser = null;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should reject unauthenticated request with 401 when CRON_SECRET is unset (fail-closed)', async () => {
    delete process.env.CRON_SECRET;
    mockUser = null;

    const req = new NextRequest('http://localhost:3000/api/cron/sync-gold', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should allow request with valid Bearer CRON_SECRET token', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    mockUser = null;

    const req = new NextRequest('http://localhost:3000/api/cron/sync-gold', {
      method: 'GET',
      headers: {
        authorization: 'Bearer test-secret-123',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should reject request with invalid Bearer token', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    mockUser = null;

    const req = new NextRequest('http://localhost:3000/api/cron/sync-gold', {
      method: 'GET',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should allow request when called by an authenticated browser session (Tarik Live button)', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    mockUser = { id: 'owner-uuid-1', email: 'owner@example.com' };

    // Request from browser has no Authorization header
    const req = new NextRequest('http://localhost:3000/api/cron/sync-gold', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should list CRON_SECRET in .env.example', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    expect(content).toContain('CRON_SECRET');
  });
});
