import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { calculateMotorReminder } from '@/lib/motor/actions';
import { sendTelegramMessage } from '@/lib/telegram/sender';
import { isAllowedUser } from '@/lib/supabase/middleware';

export async function GET(request: NextRequest) {
  // Authorization check for Vercel Cron or authenticated user session
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  let isAuthorized = false;

  // 1. Check Bearer token if CRON_SECRET is configured
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  }

  // 2. If not authorized by cron token, check for authenticated user session
  if (!isAuthorized) {
    try {
      const serverSupabase = await createServerClient();
      const {
        data: { user },
      } = await serverSupabase.auth.getUser();
      if (user && isAllowedUser(user.email, process.env.OWNER_EMAIL || process.env.OWNER_EMAILS)) {
        isAuthorized = true;
      }
    } catch {
      // Ignore session check errors and fall through to unauthorized
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'dummy-key';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: configs, error: cfgErr } = await supabase
      .from('telegram_settings')
      .select('*')
      .eq('is_enabled', true)
      .neq('bot_token', '')
      .neq('chat_id', '');

    if (cfgErr) {
      throw cfgErr;
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active Telegram configurations found.',
        sentCount: 0,
        totalMotorsNotified: 0,
      });
    }

    let sentCount = 0;
    let totalMotorsNotified = 0;
    const nowIso = new Date().toISOString();

    for (const conf of configs) {
      // Fetch active motors for this user
      const { data: motors, error: motorErr } = await supabase
        .from('motors')
        .select('*')
        .eq('user_id', conf.user_id)
        .eq('is_active', true);

      if (motorErr || !motors || motors.length === 0) {
        continue;
      }

      const motorIds = motors.map((m) => m.id);

      // Fetch services for user's motors
      const { data: services, error: srvErr } = await supabase
        .from('motor_services')
        .select('*')
        .in('motor_id', motorIds)
        .order('service_date', { ascending: false });

      if (srvErr) {
        continue;
      }

      // Calculate reminders and filter DUE or OVERDUE
      const reminders = motors
        .map((m) => calculateMotorReminder(services || [], m))
        .filter((r) => r.status === 'DUE' || r.status === 'OVERDUE');

      if (reminders.length === 0) {
        continue;
      }

      // Build consolidated message
      const lines = [
        '🔔 [PENGINGAT SERVIS MOTOR BULANAN]',
        '',
        'Halo! Terdapat motor yang telah memasuki jadwal servis berkala (2-3 bulan):',
        '',
      ];

      for (const rem of reminders) {
        const statusText =
          rem.status === 'OVERDUE'
            ? '⚠️ LEWAT JADWAL (> 3 bulan)'
            : '⏳ WAKTUNYA SERVIS (2-3 bulan)';

        lines.push(`🏍️ *${rem.motorName}* ${rem.plateNumber ? `(${rem.plateNumber})` : ''}`);
        lines.push(`   - Servis Terakhir: ${rem.lastServiceDate || 'Belum ada'}`);
        lines.push(
          `   - KM Terakhir: ${
            rem.lastKm != null && rem.lastKm > 0 ? `${rem.lastKm.toLocaleString('id-ID')} km` : '-'
          }`
        );
        lines.push(`   - Estimasi Jadwal: ${rem.nextServiceMinDate} s.d. ${rem.nextServiceMaxDate}`);
        lines.push(`   - Status: ${statusText}`);
        lines.push('');
      }

      lines.push('Silakan jadwalkan servis motor Anda di aplikasi Catat-Mencatat.');

      const rawText = lines.join('\n');
      const text = rawText.length > 4000 ? `${rawText.slice(0, 3997)}...` : rawText;

      const sendRes = await sendTelegramMessage({
        botToken: conf.bot_token,
        chatId: conf.chat_id,
        text,
      });

      if (sendRes.ok) {
        sentCount++;
        totalMotorsNotified += reminders.length;
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalMotorsNotified,
      configsProcessed: configs.length,
      timestamp: nowIso,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error executing Motor Reminder Cron' },
      { status: 500 }
    );
  }
}
