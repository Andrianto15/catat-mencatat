import { NextRequest } from 'next/server';
import { POST as motorReminderHandler } from '@/app/api/motor/reminder/telegram/route';
import * as telegramSender from '@/lib/telegram/sender';

// Mock Supabase server client
const mockGetUser = jest.fn();
const mockMotorsSelect = jest.fn();
const mockServicesSelect = jest.fn();
const mockTelegramSettingsSelect = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: (table: string) => {
      if (table === 'motors') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockMotorsSelect,
            }),
          }),
        };
      }
      if (table === 'motor_services') {
        return {
          select: () => ({
            eq: () => ({
              order: mockServicesSelect,
            }),
          }),
        };
      }
      if (table === 'telegram_settings') {
        return {
          select: () => ({
            maybeSingle: mockTelegramSettingsSelect,
          }),
        };
      }
      return {
        select: jest.fn(),
      };
    },
  })),
}));

describe('POST /api/motor/reminder/telegram', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OWNER_EMAIL;
    delete process.env.OWNER_EMAILS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('menolak request jika Content-Type bukan application/json', async () => {
    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'text/plain',
      },
      body: 'test',
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.error).toContain('Unsupported Media Type');
  });

  it('menolak request cross-site (CSRF protection)', async () => {
    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.com',
        host: 'localhost:3000',
      },
      body: JSON.stringify({ motor_id: 'm1' }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Forbidden');
  });

  it('menolak request jika pengguna belum login', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: 'm1' }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(401);
  });

  it('menolak request jika email pengguna tidak ada di OWNER_EMAIL (403)', async () => {
    const originalOwner = process.env.OWNER_EMAIL;
    process.env.OWNER_EMAIL = 'owner@example.com';
    try {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'u-stranger', email: 'stranger@example.com' } },
      });

      const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ motor_id: '11111111-1111-4111-8111-111111111111' }),
      });

      const res = await motorReminderHandler(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('tidak memiliki akses');
    } finally {
      process.env.OWNER_EMAIL = originalOwner;
    }
  });

  it('menolak request jika motor_id tidak dikirim', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('motor_id wajib diisi');
  });

  it('menolak request jika JSON body malformed (400)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{ malformed json',
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Format JSON tidak valid');
  });

  it('menolak request jika motor_id bukan format UUID yang valid (400)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: 'not-a-valid-uuid' }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Format motor_id tidak valid');
  });

  it('mengembalikan 404 jika motor tidak ditemukan', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockMotorsSelect.mockResolvedValueOnce({ data: null, error: null });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: 'a0000000-0000-4000-8000-000000000404' }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(404);
  });

  it('menolak jika konfigurasi Telegram belum diisi di database', async () => {
    const validMotorId = 'a0000000-0000-4000-8000-000000000001';
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockMotorsSelect.mockResolvedValueOnce({
      data: { id: validMotorId, name: 'Honda Vario', plate_number: 'B 1234 CD', is_active: true },
      error: null,
    });
    mockTelegramSettingsSelect.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: validMotorId }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Pengaturan Telegram');
  });

  it('berhasil mengirim pesan notifikasi reminder servis ke Telegram', async () => {
    const validMotorId = 'a0000000-0000-4000-8000-000000000001';
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockMotorsSelect.mockResolvedValueOnce({
      data: { id: validMotorId, name: 'Honda Vario', plate_number: 'B 1234 CD', is_active: true },
      error: null,
    });
    mockServicesSelect.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          motor_id: validMotorId,
          service_date: '2026-08-15',
          current_km: 15000,
          cost: 150000,
        },
      ],
      error: null,
    });
    mockTelegramSettingsSelect.mockResolvedValueOnce({
      data: {
        bot_token: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chat_id: '987654321',
        is_enabled: true,
      },
      error: null,
    });

    const sendSpy = jest.spyOn(telegramSender, 'sendTelegramMessage').mockResolvedValueOnce({
      ok: true,
      messageId: 555,
    });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: validMotorId }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '987654321',
        text: expect.stringContaining('Honda Vario'),
      })
    );
  });

  it('memotong (truncate) teks pesan jika melebihi 4000 karakter sebelum kirim ke Telegram', async () => {
    const validMotorId = 'a0000000-0000-4000-8000-000000000001';
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
    mockMotorsSelect.mockResolvedValueOnce({
      data: {
        id: validMotorId,
        name: 'A'.repeat(5000),
        plate_number: 'B 1234 CD',
        is_active: true,
      },
      error: null,
    });
    mockServicesSelect.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          motor_id: validMotorId,
          service_date: '2026-08-15',
          current_km: 15000,
          cost: 150000,
        },
      ],
      error: null,
    });
    mockTelegramSettingsSelect.mockResolvedValueOnce({
      data: {
        bot_token: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chat_id: '987654321',
        is_enabled: true,
      },
      error: null,
    });

    const sendSpy = jest.spyOn(telegramSender, 'sendTelegramMessage').mockResolvedValueOnce({
      ok: true,
      messageId: 556,
    });

    const req = new NextRequest('http://localhost:3000/api/motor/reminder/telegram', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ motor_id: validMotorId }),
    });

    const res = await motorReminderHandler(req);
    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalled();
    const sentParams = sendSpy.mock.calls[sendSpy.mock.calls.length - 1][0];
    expect(sentParams.text.length).toBeLessThanOrEqual(4000);
    expect(sentParams.text).toContain('...');
  });
});

