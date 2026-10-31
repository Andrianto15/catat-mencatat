import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram/sender';

export async function GET(request: NextRequest) {
  // Authorization check for Vercel Cron or manual admin trigger
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production' && !cronSecret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is required in production' },
      { status: 500 }
    );
  }

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'dummy-key';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: configs, error: fetchErr } = await supabase
      .from('telegram_settings')
      .select('*')
      .eq('is_enabled', true)
      .neq('bot_token', '')
      .neq('chat_id', '');

    if (fetchErr) {
      throw fetchErr;
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active Telegram reminder configurations found.',
        sentCount: 0,
      });
    }

    let sentCount = 0;
    const nowIso = new Date().toISOString();

    for (const conf of configs) {
      const msg = conf.reminder_message || 'Halo! Hari ini 30 Desember, waktunya mencatat Saldo Akhir Tahun di aplikasi Catat-Mencatat.';
      const res = await sendTelegramMessage({
        botToken: conf.bot_token,
        chatId: conf.chat_id,
        text: msg,
      });

      if (res.ok) {
        sentCount++;
        await supabase
          .from('telegram_settings')
          .update({ last_sent_at: nowIso })
          .eq('id', conf.id);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalConfigs: configs.length,
      timestamp: nowIso,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error executing Telegram reminder cron' },
      { status: 500 }
    );
  }
}

