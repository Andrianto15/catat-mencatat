import { NextRequest } from 'next/server';
import * as telegramSender from '@/lib/telegram/sender';

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

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: (table: string) => mockFrom(table),
  }),
}));

import { GET } from '@/app/api/cron/motor-reminder/route';

describe('GET /api/cron/motor-reminder', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockUser = null;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('menolak request jika tidak ada otentikasi cron secret maupun session (401)', async () => {
    process.env.CRON_SECRET = 'secret123';
    mockUser = null;

    const req = new NextRequest('http://localhost:3000/api/cron/motor-reminder', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('mengizinkan request dengan Bearer token CRON_SECRET yang valid', async () => {
    process.env.CRON_SECRET = 'secret123';

    // Mock no configs
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          neq: () => ({
            neq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/cron/motor-reminder', {
      method: 'GET',
      headers: {
        authorization: 'Bearer secret123',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.sentCount).toBe(0);
  });

  it('hanya mengirim notifikasi jika terdapat motor yang berstatus DUE atau OVERDUE', async () => {
    process.env.CRON_SECRET = 'secret123';

    const sendSpy = jest.spyOn(telegramSender, 'sendTelegramMessage').mockResolvedValue({
      ok: true,
      messageId: 999,
    });

    // Mock database tables:
    mockFrom.mockImplementation((table: string) => {
      if (table === 'telegram_settings') {
        return {
          select: () => ({
            eq: () => ({
              neq: () => ({
                neq: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'cfg-1',
                      user_id: 'u1',
                      bot_token: '123:token',
                      chat_id: '456',
                      is_enabled: true,
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'motors') {
        return {
          select: () => ({
            eq: () => ({
              eq: jest.fn().mockResolvedValue({
                data: [
                  { id: 'm1', name: 'Honda Beat', plate_number: 'B 1111 AA', is_active: true },
                  { id: 'm2', name: 'Honda PCX', plate_number: 'B 2222 BB', is_active: true },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'motor_services') {
        return {
          select: () => ({
            in: () => ({
              order: jest.fn().mockResolvedValue({
                data: [
                  // m1: servis 80 hari lalu (rentang 2-3 bulan -> DUE)
                  {
                    id: 's1',
                    motor_id: 'm1',
                    service_date: '2026-08-15',
                    current_km: 12000,
                    cost: 150000,
                  },
                  // m2: servis kemarin (UPCOMING -> tidak dikirim)
                  {
                    id: 's2',
                    motor_id: 'm2',
                    service_date: '2026-10-31',
                    current_km: 5000,
                    cost: 100000,
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const req = new NextRequest('http://localhost:3000/api/cron/motor-reminder', {
      method: 'GET',
      headers: {
        authorization: 'Bearer secret123',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.sentCount).toBe(1);
    expect(data.totalMotorsNotified).toBe(1);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        botToken: '123:token',
        chatId: '456',
        text: expect.stringContaining('Honda Beat'),
      })
    );
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.not.stringContaining('Honda PCX'),
      })
    );
  });
});

