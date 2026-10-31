import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateTelegramConfig, sendTelegramMessage } from '@/lib/telegram/sender';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = validateTelegramConfig({
      botToken: body.bot_token,
      chatId: body.chat_id,
      message: body.reminder_message,
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const testText = `[TES NOTIFIKASI CATAT-MENCATAT]\n\n${validation.message}\n\nWaktu kirim: ${new Date().toLocaleString('id-ID')}`;

    const sendRes = await sendTelegramMessage({
      botToken: validation.botToken,
      chatId: validation.chatId,
      text: testText,
    });

    if (!sendRes.ok) {
      return NextResponse.json({ success: false, error: sendRes.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan tes berhasil dikirim ke Telegram.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

