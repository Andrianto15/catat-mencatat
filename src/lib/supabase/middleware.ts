import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export function isAllowedUser(email?: string, ownerEmailsConfig?: string): boolean {
  if (!ownerEmailsConfig || !ownerEmailsConfig.trim()) {
    return true; // No allowlist configured, allow any authenticated user
  }
  if (!email) return false;
  const allowed = ownerEmailsConfig
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function resolveAuthRedirect(
  pathname: string,
  hasUser: boolean,
  isAllowed: boolean = true
): string | null {
  // Public or internal routes
  if (
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'
  ) {
    return null;
  }

  // Already at login page
  if (pathname === '/login') {
    return hasUser && isAllowed ? '/' : null;
  }

  // All other routes require authentication and allowed user
  if (!hasUser || !isAllowed) {
    return '/login';
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAllowed = isAllowedUser(
    user?.email,
    process.env.OWNER_EMAIL || process.env.OWNER_EMAILS
  );
  const redirectPath = resolveAuthRedirect(request.nextUrl.pathname, !!user, isAllowed);
  if (redirectPath) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
