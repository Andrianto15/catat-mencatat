import React from 'react';
import fs from 'fs';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  validateTelegramConfig,
  sendTelegramMessage,
  DEFAULT_TELEGRAM_REMINDER_MESSAGE,
} from '../src/lib/telegram/sender';
import { GET as cronHandler } from '../src/app/api/cron/telegram-reminder/route';

describe('Telegram Reminder Library and Cron', () => {
  describe('validateTelegramConfig', () => {
    it('rejects missing or whitespace-only bot token and chat id', () => {
      expect(validateTelegramConfig({ botToken: '', chatId: '123' })).toEqual({
        valid: false,
        error: 'Telegram Bot Token wajib diisi.',
        botToken: '',
        chatId: '123',
        message: DEFAULT_TELEGRAM_REMINDER_MESSAGE,
      });

      expect(validateTelegramConfig({ botToken: 'abc', chatId: '   ' })).toEqual({
        valid: false,
        error: 'Telegram Chat ID wajib diisi.',
        botToken: 'abc',
        chatId: '',
        message: DEFAULT_TELEGRAM_REMINDER_MESSAGE,
      });
    });

    it('trims tokens and applies default reminder message when empty', () => {
      const res = validateTelegramConfig({
        botToken: '  123:token  ',
        chatId: ' 987654 ',
        message: '   ',
      });
      expect(res.valid).toBe(true);
      expect(res.botToken).toBe('123:token');
      expect(res.chatId).toBe('987654');
      expect(res.message).toBe(DEFAULT_TELEGRAM_REMINDER_MESSAGE);
    });
  });

  describe('sendTelegramMessage', () => {
    it('sends POST request to Telegram Bot API, trims tokens, and parses response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 101 } }),
      });

      const res = await sendTelegramMessage({
        botToken: '  my-bot-token  ',
        chatId: '  chat-999  ',
        text: 'Test reminder',
        fetchImpl: mockFetch as any,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/botmy-bot-token/sendMessage',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: 'chat-999', text: 'Test reminder' }),
        })
      );
      expect(res.ok).toBe(true);
    });

    it('returns error when Telegram API responds with failure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ ok: false, description: 'Unauthorized bot' }),
      });

      const res = await sendTelegramMessage({
        botToken: 'bad-token',
        chatId: 'chat-999',
        text: 'Test reminder',
        fetchImpl: mockFetch as any,
      });

      expect(res.ok).toBe(false);
      expect(res.error).toBe('Unauthorized bot');
    });

    it('handles network throw gracefully', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const res = await sendTelegramMessage({
        botToken: 'bad-token',
        chatId: 'chat-999',
        text: 'Test reminder',
        fetchImpl: mockFetch as any,
      });

      expect(res.ok).toBe(false);
      expect(res.error).toContain('Connection failed');
    });
  });

  describe('Cron Endpoint /api/cron/telegram-reminder', () => {
    it('returns 500 when running in production without CRON_SECRET configured', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.CRON_SECRET;
      (process.env as any).NODE_ENV = 'production';
      delete process.env.CRON_SECRET;
      try {
        const req = new Request('http://localhost:3000/api/cron/telegram-reminder');
        const res = await cronHandler(req as any);
        expect(res.status).toBe(500);
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
        process.env.CRON_SECRET = originalSecret;
      }
    });

    it('returns 401 when CRON_SECRET is set and Authorization header does not match', async () => {
      const originalSecret = process.env.CRON_SECRET;
      process.env.CRON_SECRET = 'secret123';
      try {
        const req = new Request('http://localhost:3000/api/cron/telegram-reminder', {
          headers: { authorization: 'Bearer wrong-secret' },
        });
        const res = await cronHandler(req as any);
        expect(res.status).toBe(401);
      } finally {
        process.env.CRON_SECRET = originalSecret;
      }
    });
  });

  describe('Settings Page /saldo-tahun/settings', () => {
    it('source file defines Telegram inputs, Test button, and Account management', () => {
      const pageSrc = fs.readFileSync('src/app/saldo-tahun/settings/page.tsx', 'utf8');
      expect(pageSrc).toContain('telegram-bot-token');
      expect(pageSrc).toContain('telegram-chat-id');
      expect(pageSrc).toContain('telegram-reminder-msg');
      expect(pageSrc).toContain('Kirim Tes Sekarang');
      expect(pageSrc).toContain('Simpan Pengaturan');
      expect(pageSrc).toContain('zakat_accounts');
    });
  });
});

