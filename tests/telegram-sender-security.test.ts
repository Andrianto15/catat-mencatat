import { NextRequest } from 'next/server';
import { validateTelegramConfig, sendTelegramMessage } from '../src/lib/telegram/sender';

describe('Telegram Config Security Validation', () => {
  it('should reject bot tokens with URL traversal, query strings, or fragments', () => {
    expect(validateTelegramConfig({ botToken: '123:ABC/setWebhook?', chatId: '123' }).valid).toBe(false);
    expect(validateTelegramConfig({ botToken: '123:ABC#fragment', chatId: '123' }).valid).toBe(false);
    expect(validateTelegramConfig({ botToken: '123:ABC/../test', chatId: '123' }).valid).toBe(false);
    expect(validateTelegramConfig({ botToken: '123:ABC?query=val', chatId: '123' }).valid).toBe(false);
  });

  it('should accept valid standard Telegram bot tokens', () => {
    expect(
      validateTelegramConfig({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '123456789',
      }).valid
    ).toBe(true);

    // Negative group / channel ID
    expect(
      validateTelegramConfig({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '-1001234567890',
      }).valid
    ).toBe(true);

    // Public channel username
    expect(
      validateTelegramConfig({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '@my_test_channel',
      }).valid
    ).toBe(true);
  });

  it('should reject invalid chat IDs containing path or script injection', () => {
    expect(
      validateTelegramConfig({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '123/inject',
      }).valid
    ).toBe(false);

    expect(
      validateTelegramConfig({
        botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        chatId: '123?param=val',
      }).valid
    ).toBe(false);
  });

  it('sendTelegramMessage should reject tokens containing URL path delimiters or fragments', async () => {
    const mockFetch = jest.fn();
    const res = await sendTelegramMessage({
      botToken: '123:ABC/setWebhook?url=evil.com#',
      chatId: '123456',
      text: 'hello',
      fetchImpl: mockFetch as any,
    });

    expect(res.ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(res.error).toContain('tidak valid');
  });

  describe('POST /api/telegram/test Route Security', () => {
    it('should reject non-JSON Content-Type with 415', async () => {
      const { POST } = require('../src/app/api/telegram/test/route');
      const req = new NextRequest('http://localhost:3000/api/telegram/test', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: 'invalid',
      });

      const res = await POST(req);
      expect(res.status).toBe(415);
    });

    it('should reject cross-site origin with 403', async () => {
      const { POST } = require('../src/app/api/telegram/test/route');
      const req = new NextRequest('http://localhost:3000/api/telegram/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          host: 'catat-mencatat.app',
          origin: 'https://attacker.com',
        },
        body: JSON.stringify({ bot_token: '123:token', chat_id: '123' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('should reject sec-fetch-site: cross-site with 403', async () => {
      const { POST } = require('../src/app/api/telegram/test/route');
      const req = new NextRequest('http://localhost:3000/api/telegram/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'sec-fetch-site': 'cross-site',
        },
        body: JSON.stringify({ bot_token: '123:token', chat_id: '123' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });
  });
});
