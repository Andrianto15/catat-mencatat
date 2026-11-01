import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMotorReminder } from '@/lib/motor/actions';
import { sendTelegramMessage, validateTelegramConfig } from '@/lib/telegram/sender';

export async function POST(request: NextRequest) {
  // 1. Content-Type validation
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { success: false, error: 'Unsupported Media Type: Content-Type must be application/json' },
      { status: 415 }
    );
  }

  // 2. CSRF / Origin protection
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Cross-site request rejected' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Invalid origin' },
        { status: 403 }
      );
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Cross-site request rejected' },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const motorId = typeof body.motor_id === 'string' ? body.motor_id.trim() : '';

    if (!motorId) {
      return NextResponse.json(
        { success: false, error: 'Parameter motor_id wajib diisi.' },
        { status: 400 }
      );
    }

    // Fetch motor
    const { data: motor, error: motorErr } = await supabase
      .from('motors')
      .select('*')
      .eq('id', motorId)
      .maybeSingle();

    if (motorErr || !motor) {
      return NextResponse.json(
        { success: false, error: 'Data motor tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Fetch telegram configuration
    const { data: tgConfig, error: tgErr } = await supabase
      .from('telegram_settings')
      .select('*')
      .maybeSingle();

    if (tgErr || !tgConfig || !tgConfig.bot_token || !tgConfig.chat_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Pengaturan Telegram belum dikonfigurasi. Silakan lengkapi Bot Token dan Chat ID di Pengaturan.',
        },
        { status: 400 }
      );
    }

    const validation = validateTelegramConfig({
      botToken: tgConfig.bot_token,
      chatId: tgConfig.chat_id,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: `Konfigurasi Telegram tidak valid: ${validation.error}` },
        { status: 400 }
      );
    }

    // Fetch motor services
    const { data: services } = await supabase
      .from('motor_services')
      .select('*')
      .eq('motor_id', motorId)
      .order('service_date', { ascending: false });

    const reminder = calculateMotorReminder(services || [], motor);

    const statusLabel = {
      UPCOMING: 'Belum Waktunya Servis (Aman)',
      DUE: 'Waktunya Servis! (Sudah 2-3 bulan)',
      OVERDUE: 'PERHATIAN: Lewat Batas Servis! (> 3 bulan)',
      NO_SERVICE: 'Belum Ada Riwayat Servis',
    }[reminder.status];

    const lines = [
      '🔔 [PENGINGAT SERVIS MOTOR]',
      '',
      `🏍️ Motor: ${motor.name}${motor.plate_number ? ` (${motor.plate_number})` : ''}`,
      `📅 Servis Terakhir: ${reminder.lastServiceDate || 'Belum ada'}`,
      `🔢 KM Terakhir: ${
        reminder.lastKm != null && reminder.lastKm > 0
          ? `${reminder.lastKm.toLocaleString('id-ID')} km`
          : '-'
      }`,
      '',
      '⏳ Estimasi Jadwal Servis Berikutnya (2-3 bulan):',
      reminder.nextServiceMinDate && reminder.nextServiceMaxDate
        ? `👉 ${reminder.nextServiceMinDate} s.d. ${reminder.nextServiceMaxDate}`
        : '👉 Belum dapat dihitung (butuh minimal 1 catatan servis)',
      '',
      `📌 Status: ${statusLabel}`,
      '',
      'Aplikasi Catat-Mencatat',
    ];

    const text = lines.join('\n');

    const sendRes = await sendTelegramMessage({
      botToken: validation.botToken,
      chatId: validation.chatId,
      text,
    });

    if (!sendRes.ok) {
      return NextResponse.json(
        { success: false, error: sendRes.error || 'Gagal mengirim pesan ke Telegram.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notifikasi pengingat untuk motor ${motor.name} berhasil dikirim ke Telegram.`,
      reminder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

