import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateTelegramConfig, sendTelegramMessage } from '@/lib/telegram/sender';
import { isAllowedUser } from '@/lib/supabase/middleware';

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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Owner Allowlist verification
  if (!isAllowedUser(user.email, process.env.OWNER_EMAIL || process.env.OWNER_EMAILS)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Akun tidak memiliki akses.' },
      { status: 403 }
    );
  }

  // 4. Parse request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Bad Request: Format JSON tidak valid.' },
      { status: 400 }
    );
  }

  try {
    const validation = validateTelegramConfig({
      botToken: body?.bot_token,
      chatId: body?.chat_id,
      message: body?.reminder_message,
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

