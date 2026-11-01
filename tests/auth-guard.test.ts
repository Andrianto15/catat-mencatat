import { resolveAuthRedirect, isAllowedUser } from '../src/lib/supabase/middleware';

describe('Auth Guard Redirect Logic', () => {
  it('should redirect unauthenticated users to /login for protected routes', () => {
    expect(resolveAuthRedirect('/', false)).toBe('/login');
    expect(resolveAuthRedirect('/motor', false)).toBe('/login');
    expect(resolveAuthRedirect('/emas', false)).toBe('/login');
    expect(resolveAuthRedirect('/zakat', false)).toBe('/login');
    expect(resolveAuthRedirect('/saldo-tahun', false)).toBe('/login');
    expect(resolveAuthRedirect('/saldo-tahun/settings', false)).toBe('/login');
  });

  it('should redirect authenticated users away from /login to /', () => {
    expect(resolveAuthRedirect('/login', true)).toBe('/');
  });

  it('should allow unauthenticated access to /login and cron endpoints', () => {
    expect(resolveAuthRedirect('/login', false)).toBeNull();
    expect(resolveAuthRedirect('/api/cron/sync-gold', false)).toBeNull();
    expect(resolveAuthRedirect('/api/cron/telegram-reminder', false)).toBeNull();
  });

  it('should pass through all /api/ routes so handlers return JSON 401/403 instead of 307 redirect', () => {
    expect(resolveAuthRedirect('/api/motor/reminder/telegram', false)).toBeNull();
    expect(resolveAuthRedirect('/api/telegram/test', false)).toBeNull();
    expect(resolveAuthRedirect('/api/motor/reminder/telegram', true, false)).toBeNull();
    expect(resolveAuthRedirect('/api/telegram/test', true, false)).toBeNull();
  });

  it('should allow authenticated users to access protected routes', () => {
    expect(resolveAuthRedirect('/', true)).toBeNull();
    expect(resolveAuthRedirect('/motor', true)).toBeNull();
    expect(resolveAuthRedirect('/emas', true)).toBeNull();
    expect(resolveAuthRedirect('/zakat', true)).toBeNull();
    expect(resolveAuthRedirect('/saldo-tahun', true)).toBeNull();
    expect(resolveAuthRedirect('/saldo-tahun/settings', true)).toBeNull();
  });

  it('should validate owner email allowlist correctly via isAllowedUser', () => {
    // If no config provided, defaults to open / allow all authenticated users
    expect(isAllowedUser('stranger@example.com', undefined)).toBe(true);
    expect(isAllowedUser('stranger@example.com', '')).toBe(true);

    // If config provided, only listed emails are allowed (case-insensitive & trimmed)
    expect(isAllowedUser('owner@example.com', 'owner@example.com')).toBe(true);
    expect(isAllowedUser('OWNER@EXAMPLE.COM', 'owner@example.com')).toBe(true);
    expect(isAllowedUser('co-owner@example.com', 'owner@example.com, co-owner@example.com')).toBe(true);
    expect(isAllowedUser('stranger@example.com', 'owner@example.com')).toBe(false);
    expect(isAllowedUser(undefined, 'owner@example.com')).toBe(false);
  });

  it('should redirect non-allowed authenticated users to /login and allow them to stay on /login', () => {
    expect(resolveAuthRedirect('/', true, false)).toBe('/login');
    expect(resolveAuthRedirect('/motor', true, false)).toBe('/login');
    // On /login page, if authenticated but not allowed, do NOT redirect to / (stay on /login)
    expect(resolveAuthRedirect('/login', true, false)).toBeNull();
  });

  it('should list OWNER_EMAIL in .env.example', () => {
    const fs = require('fs');
    const path = require('path');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    expect(content).toContain('OWNER_EMAIL');
  });

  it('should define createClient in server.ts as an async function awaiting cookies()', () => {
    const fs = require('fs');
    const serverCode = fs.readFileSync('src/lib/supabase/server.ts', 'utf8');
    expect(serverCode).toContain('export async function createClient()');
    expect(serverCode).toContain('await cookies()');
  });
});
