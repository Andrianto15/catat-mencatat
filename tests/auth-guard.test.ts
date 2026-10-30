import { resolveAuthRedirect } from '../src/lib/supabase/middleware';

describe('Auth Guard Redirect Logic', () => {
  it('should redirect unauthenticated users to /login for protected routes', () => {
    expect(resolveAuthRedirect('/', false)).toBe('/login');
    expect(resolveAuthRedirect('/motor', false)).toBe('/login');
    expect(resolveAuthRedirect('/emas', false)).toBe('/login');
    expect(resolveAuthRedirect('/zakat', false)).toBe('/login');
  });

  it('should redirect authenticated users away from /login to /', () => {
    expect(resolveAuthRedirect('/login', true)).toBe('/');
  });

  it('should allow unauthenticated access to /login and cron endpoints', () => {
    expect(resolveAuthRedirect('/login', false)).toBeNull();
    expect(resolveAuthRedirect('/api/cron/sync-gold', false)).toBeNull();
  });

  it('should allow authenticated users to access protected routes', () => {
    expect(resolveAuthRedirect('/', true)).toBeNull();
    expect(resolveAuthRedirect('/motor', true)).toBeNull();
    expect(resolveAuthRedirect('/emas', true)).toBeNull();
    expect(resolveAuthRedirect('/zakat', true)).toBeNull();
  });

  it('should define createClient in server.ts as an async function awaiting cookies()', () => {
    const fs = require('fs');
    const serverCode = fs.readFileSync('src/lib/supabase/server.ts', 'utf8');
    expect(serverCode).toContain('export async function createClient()');
    expect(serverCode).toContain('await cookies()');
  });
});
