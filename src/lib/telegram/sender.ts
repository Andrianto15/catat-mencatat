export const DEFAULT_TELEGRAM_REMINDER_MESSAGE =
  'Halo! Hari ini 30 Desember, waktunya mencatat Saldo Akhir Tahun di aplikasi Catat-Mencatat.';

export interface TelegramConfigValidationResult {
  valid: boolean;
  error?: string;
  botToken: string;
  chatId: string;
  message: string;
}

export function validateTelegramConfig(input: {
  botToken?: string | null;
  chatId?: string | null;
  message?: string | null;
}): TelegramConfigValidationResult {
  const botToken = (input.botToken || '').trim();
  const chatId = (input.chatId || '').trim();
  const rawMsg = (input.message || '').trim();
  const message = rawMsg.length > 0 ? rawMsg : DEFAULT_TELEGRAM_REMINDER_MESSAGE;

  if (!botToken) {
    return {
      valid: false,
      error: 'Telegram Bot Token wajib diisi.',
      botToken,
      chatId,
      message,
    };
  }

  if (!chatId) {
    return {
      valid: false,
      error: 'Telegram Chat ID wajib diisi.',
      botToken,
      chatId,
      message,
    };
  }

  return {
    valid: true,
    botToken,
    chatId,
    message,
  };
}

export interface SendTelegramMessageParams {
  botToken: string;
  chatId: string;
  text: string;
  fetchImpl?: typeof fetch;
}

export interface SendTelegramMessageResult {
  ok: boolean;
  error?: string;
  messageId?: number;
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  fetchImpl = fetch,
}: SendTelegramMessageParams): Promise<SendTelegramMessageResult> {
  const cleanToken = (botToken || '').trim();
  const cleanChatId = (chatId || '').trim();
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
      }),
      signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(10000)
        : undefined,
    });

    const data: any = await res.json();
    if (data && data.ok) {
      return {
        ok: true,
        messageId: data.result?.message_id,
      };
    }

    return {
      ok: false,
      error: data?.description || `Telegram API error status ${res.status}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Gagal terhubung ke Telegram API',
    };
  }
}

