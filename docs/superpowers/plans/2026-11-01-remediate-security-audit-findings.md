# Remediate Security Audit Findings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all 7 source-verified security findings identified during the security audit of `catat-mencatat`.

**Architecture:** Harden API routes, input validators, middleware session gates, Service Worker cache scoping, and database Row-Level Security policies to eliminate fail-open auth, bot token path injection, unbounded scraper buffering, authenticated cache persistence across logout, and cross-tenant foreign-key tampering.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL RLS), Service Worker CacheStorage API, Jest 30.

**Spec:** [`NEEDS-VALIDATION.md`](file:///Users/andriantonuriskandar/.gemini/antigravity/brain/7679f598-0f23-4d34-ac06-75d7b88246d7/security-audit-skill/catat-mencatat/run-1/NEEDS-VALIDATION.md)

## Global Constraints

- Never break existing functionality: UI "Tarik Live" gold price sync and manual edits must continue working for authenticated users.
- Read-only integrity: All existing unit tests (39 suites, 173 tests) must continue to pass.
- Follow `AGENTS.md` rules: update `PRD.md` on logic changes, add unit tests in `tests/`, and maintain mobile-first UI responsiveness.
- Zero external runtime dependencies added; reuse standard library and existing installed packages.

## Review Focus

- Unauthenticated GET requests to `/api/cron/sync-gold` without `Authorization` header must be rejected with 401 even if `CRON_SECRET` is unset.
- Valid browser sessions calling `/api/cron/sync-gold` via "Tarik Live" button must succeed with 200 without requiring `CRON_SECRET` in client JavaScript.
- Upstream Galeri24 failures must never overwrite valid non-null prices for today with `null`, and buyback calculation must skip `null` rows to fall back to prior valid days.
- Telegram Bot tokens with slashes, query strings, or fragments (e.g. `123:token/test?foo#`) must be rejected at input validation before constructing outbound URLs.
- Authenticated root document `'/'` containing user email must never be stored in persistent Service Worker precache.

---

### Task 1: Fix Fail-Open Authentication on `/api/cron/sync-gold` & UI Sync Compatibility

**Files:**
- Modify: `src/app/api/cron/sync-gold/route.ts:5-25`
- Modify: `.env.example:1-4`
- Test: `tests/cron-sync-gold-auth.test.ts`

**Interfaces:**
- Consumes: `process.env.CRON_SECRET`, `createClient()` from `@/lib/supabase/server`
- Produces: `GET(request: NextRequest)` route handler requiring either valid Bearer `CRON_SECRET` or authenticated Supabase user session.

- [ ] **Step 1: Write the failing unit tests for `/api/cron/sync-gold` authentication**

```typescript
// tests/cron-sync-gold-auth.test.ts
import { NextRequest } from 'next/server';

describe('GET /api/cron/sync-gold Auth Logic', () => {
  it('should reject unauthenticated request when CRON_SECRET is unset', async () => {
    // delete process.env.CRON_SECRET
    // expect GET(req) to return status 401
  });

  it('should allow request with valid Bearer CRON_SECRET token', async () => {
    // set process.env.CRON_SECRET = 'secret123'
    // request with Authorization: Bearer secret123
    // expect authentication to succeed
  });

  it('should reject request with invalid Bearer token', async () => {
    // set process.env.CRON_SECRET = 'secret123'
    // request with Authorization: Bearer wrong
    // expect status 401
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/cron-sync-gold-auth.test.ts`
Expected: FAIL (test file not yet implemented or fail-open behavior allows unauthenticated call)

- [ ] **Step 3: Implement dual-auth check in `src/app/api/cron/sync-gold/route.ts` and update `.env.example`**

Update `GET` in `src/app/api/cron/sync-gold/route.ts`:
1. Check `authHeader === \`Bearer \${cronSecret}\`` if `cronSecret` is defined.
2. If cron token is not provided or doesn't match, verify if the request comes from an authenticated Supabase user session via `createClient` from `@/lib/supabase/server`.
3. If neither cron Bearer token nor authenticated user session exists, return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`.
4. Add `CRON_SECRET=your-cron-secret-here` to `.env.example`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/cron-sync-gold-auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add src/app/api/cron/sync-gold/route.ts .env.example tests/cron-sync-gold-auth.test.ts
rtk git commit -m "fix(security): enforce fail-closed auth on sync-gold route"
```

---

### Task 2: Harden Gold Scraper Regex, Add Fetch Timeout, and Prevent Destructive Null Upsert

**Files:**
- Modify: `src/lib/gold/scraper.ts:160-210`
- Modify: `src/app/api/cron/sync-gold/route.ts:25-45`
- Modify: `src/app/emas/page.tsx:55-65`
- Test: `tests/scraper-security.test.ts`

**Interfaces:**
- Consumes: `fetchLiveGaleri24Prices()`, `parseGaleri24Html(html: string)`
- Produces: Linear-time HTML regex parsing, `AbortSignal.timeout(10000)` on upstream fetch, safe failure upsert that does not overwrite existing valid prices, and non-null buyback mapping fallback.

- [ ] **Step 1: Write the failing unit tests for scraper security and buyback mapping**

```typescript
// tests/scraper-security.test.ts
import { parseGaleri24Html } from '../src/lib/gold/scraper';

describe('Gold Scraper Security & Fallback Integrity', () => {
  it('should parse malformed unclosed tags in linear time without catastrophic backtracking', () => {
    const maliciousHtml = '<div class="vendor '.repeat(500) + 'ANTAM' + '</div>'.repeat(500);
    const start = Date.now();
    const result = parseGaleri24Html(maliciousHtml);
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails or runs as expected**

Run: `rtk npm test tests/scraper-security.test.ts`
Expected: Check execution behavior and establish benchmark.

- [ ] **Step 3: Implement hardening in `src/lib/gold/scraper.ts`, `sync-gold/route.ts`, and `src/app/emas/page.tsx`**

1. In `src/lib/gold/scraper.ts`:
   - Replace backtracking `headingRegex` with non-backtracking tag scanner.
   - In `fetchLiveGaleri24Prices()`, add `signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(10000) : undefined`.
   - Add max response size check (e.g. check `content-length` and slice string at max 2MB).
2. In `src/app/api/cron/sync-gold/route.ts`:
   - Before upserting `status: 'gagal'` when `parsedPrices.length === 0`, check if an existing non-null price already exists for `todayStr` and `ANTAM 1g`. If it exists, do not overwrite valid price data with `null`.
3. In `src/app/emas/page.tsx`:
   - In `fetchData`, update the `map[key]` loop so it only assigns `p.buyback_price` if `p.buyback_price !== null && p.buyback_price !== undefined`, ensuring that any `gagal` record does not shadow older valid buyback prices.

- [ ] **Step 4: Run tests to verify all pass**

Run: `rtk npm test tests/scraper-security.test.ts tests/scraper.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add src/lib/gold/scraper.ts src/app/api/cron/sync-gold/route.ts src/app/emas/page.tsx tests/scraper-security.test.ts
rtk git commit -m "fix(security): harden gold scraper regex and prevent destructive null upsert"
```

---

### Task 3: Telegram Bot Token Validation, Path Traversal Prevention & CSRF Protection

**Files:**
- Modify: `src/lib/telegram/sender.ts:12-48, 63-75`
- Modify: `src/app/api/telegram/test/route.ts:5-25`
- Test: `tests/telegram-sender-security.test.ts`

**Interfaces:**
- Consumes: `validateTelegramConfig(input)`, `sendTelegramMessage(params)`
- Produces: Strict token regex `/^[0-9]+:[A-Za-z0-9_-]+$/`, chat ID regex `/^-?[0-9]+$/` or `/^@[A-Za-z0-9_]{5,}$/`, strict `Content-Type: application/json` enforcement, and Origin verification.

- [ ] **Step 1: Write the failing unit tests for Telegram validation & URL construction**

```typescript
// tests/telegram-sender-security.test.ts
import { validateTelegramConfig, sendTelegramMessage } from '../src/lib/telegram/sender';

describe('Telegram Config Security Validation', () => {
  it('should reject bot tokens with URL traversal, query strings, or fragments', () => {
    expect(validateTelegramConfig({ botToken: '123:ABC/setWebhook?', chatId: '123' }).valid).toBe(false);
    expect(validateTelegramConfig({ botToken: '123:ABC#fragment', chatId: '123' }).valid).toBe(false);
    expect(validateTelegramConfig({ botToken: '123:ABC/../test', chatId: '123' }).valid).toBe(false);
  });

  it('should accept valid standard Telegram bot tokens', () => {
    expect(validateTelegramConfig({ botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ', chatId: '123' }).valid).toBe(true);
  });

  it('should reject invalid chat IDs containing non-numeric injection', () => {
    expect(validateTelegramConfig({ botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ', chatId: '123/inject' }).valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/telegram-sender-security.test.ts`
Expected: FAIL (currently `validateTelegramConfig` only checks `.trim().length > 0`)

- [ ] **Step 3: Implement validation in `src/lib/telegram/sender.ts` and `src/app/api/telegram/test/route.ts`**

1. In `src/lib/telegram/sender.ts`:
   - Validate `botToken` format with `/^[0-9]+:[A-Za-z0-9_-]+$/`. Return descriptive Indonesian error if invalid.
   - Validate `chatId` format with `/^-?[0-9]+$/` or `/^@[A-Za-z0-9_]{5,}$/`. Return descriptive Indonesian error if invalid.
2. In `src/app/api/telegram/test/route.ts`:
   - Enforce `request.headers.get('content-type')?.includes('application/json')`. Return 415 if missing or incorrect.
   - Enforce Same-Origin verification: if `origin` header is present, check that its host matches `request.headers.get('host')`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/telegram-sender-security.test.ts tests/telegram-reminder.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add src/lib/telegram/sender.ts src/app/api/telegram/test/route.ts tests/telegram-sender-security.test.ts
rtk git commit -m "fix(security): validate telegram bot token format and protect test endpoint against csrf"
```

---

### Task 4: Enforce Single-Owner Allowlist in Next.js Middleware

**Files:**
- Modify: `src/lib/supabase/middleware.ts:4-65`
- Modify: `.env.example:1-5`
- Modify: `PRD.md:60-70`
- Test: `tests/auth-guard.test.ts`

**Interfaces:**
- Consumes: `process.env.OWNER_EMAIL`, `process.env.OWNER_EMAILS`
- Produces: `isAllowedUser(email, config)` helper, updated `resolveAuthRedirect` supporting owner allowlist.

- [ ] **Step 1: Write the failing unit tests for owner allowlist in `tests/auth-guard.test.ts`**

```typescript
// tests/auth-guard.test.ts additions
it('should reject authenticated users not in OWNER_EMAIL allowlist', () => {
  expect(isAllowedUser('stranger@example.com', 'owner@example.com')).toBe(false);
  expect(isAllowedUser('owner@example.com', 'owner@example.com')).toBe(true);
});

it('should redirect non-allowed authenticated users to /login', () => {
  expect(resolveAuthRedirect('/', true, false)).toBe('/login');
  expect(resolveAuthRedirect('/login', true, false)).toBeNull(); // stays on login page to see message
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/auth-guard.test.ts`
Expected: FAIL (functions not yet taking allowlist parameter)

- [ ] **Step 3: Implement owner allowlist logic in `src/lib/supabase/middleware.ts` and update `.env.example` & `PRD.md`**

1. In `src/lib/supabase/middleware.ts`:
   - Export `isAllowedUser(email?: string, ownerEmailsConfig?: string): boolean`:
     If `!ownerEmailsConfig || !ownerEmailsConfig.trim()`, return `true` (unconfigured = open).
     If configured, check whether `email.toLowerCase()` is in the comma-separated list of allowed emails.
   - Update `resolveAuthRedirect(pathname: string, hasUser: boolean, isAllowed: boolean = true): string | null`:
     If `hasUser && !isAllowed`, allow `/login` (return `null`) and redirect all other paths to `/login`.
   - In `updateSession(request)`:
     Compute `isAllowed = isAllowedUser(user?.email, process.env.OWNER_EMAIL || process.env.OWNER_EMAILS);`
     Pass `isAllowed` into `resolveAuthRedirect`.
2. Update `.env.example`: add `OWNER_EMAIL=owner@example.com`.
3. Update `PRD.md` Section 3 & 4 with owner allowlist documentation.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/auth-guard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add src/lib/supabase/middleware.ts .env.example PRD.md tests/auth-guard.test.ts
rtk git commit -m "feat(security): enforce owner email allowlist in session middleware"
```

---

### Task 5: Database RLS Migration: Restrict `gold_prices` DELETE & Enforce Cross-Tenant Foreign Key Ownership

**Files:**
- Create: `supabase/migrations/20261101000000_harden_rls_policies.sql`
- Modify: `PRD.md`
- Test: `tests/rls-hardening-migration.test.ts`

**Interfaces:**
- Consumes: PostgreSQL RLS policies in `public` schema
- Produces: Migration SQL revoking `DELETE` on `gold_prices` from `authenticated`, and adding `WITH CHECK` tenant `EXISTS` ownership checks on `motor_services`, `gold_purchases`, `zakat_accounts`, `zakat_years`, `annual_balances`, `zakat_balances`, and `annual_balance_items`.

- [ ] **Step 1: Write test verifying migration SQL definitions**

```typescript
// tests/rls-hardening-migration.test.ts
import fs from 'fs';
import path from 'path';

describe('RLS Hardening Migration SQL', () => {
  it('should contain policy dropping unrestricted modify on gold_prices and separate insert/update policies without delete', () => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261101000000_harden_rls_policies.sql'), 'utf8');
    expect(sql).toContain('DROP POLICY IF EXISTS "Authenticated users can modify gold prices" ON public.gold_prices');
    expect(sql).toContain('CREATE POLICY "Authenticated users can insert gold prices"');
    expect(sql).toContain('CREATE POLICY "Authenticated users can update gold prices"');
    expect(sql).not.toContain('FOR DELETE TO authenticated');
  });

  it('should verify foreign key ownership in motor_services, gold_purchases, zakat_accounts, and annual_balances', () => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261101000000_harden_rls_policies.sql'), 'utf8');
    expect(sql).toContain('public.motors');
    expect(sql).toContain('public.people');
    expect(sql).toContain('public.zakat_accounts');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/rls-hardening-migration.test.ts`
Expected: FAIL (migration file does not exist yet)

- [ ] **Step 3: Create `supabase/migrations/20261101000000_harden_rls_policies.sql`**

Write SQL migration:
1. `public.gold_prices`:
   - Drop `"Authenticated users can modify gold prices"`.
   - Create `FOR INSERT TO authenticated WITH CHECK (true)` and `FOR UPDATE TO authenticated USING (true) WITH CHECK (true)`.
   - No `DELETE` policy for `authenticated`.
2. Drop and recreate policies with `EXISTS` ownership validation:
   - `public.motor_services`: check `EXISTS (SELECT 1 FROM public.motors m WHERE m.id = motor_id AND m.user_id = auth.uid())`.
   - `public.gold_purchases`: check `EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_id AND p.user_id = auth.uid())`.
   - `public.zakat_accounts`: check `EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_id AND p.user_id = auth.uid())`.
   - `public.zakat_years`: check `EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_id AND p.user_id = auth.uid())`.
   - `public.zakat_balances`: check `EXISTS` on `zakat_years` AND `EXISTS (SELECT 1 FROM public.zakat_accounts a WHERE a.id = account_id AND a.user_id = auth.uid())`.
   - `public.annual_balances`: check `EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_id AND p.user_id = auth.uid())`.
   - `public.annual_balance_items`: check `EXISTS` on `annual_balances` AND `EXISTS (SELECT 1 FROM public.zakat_accounts a WHERE a.id = account_id AND a.user_id = auth.uid())`.
3. Update `PRD.md` with the enhanced security RLS architecture.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/rls-hardening-migration.test.ts tests/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add supabase/migrations/20261101000000_harden_rls_policies.sql PRD.md tests/rls-hardening-migration.test.ts
rtk git commit -m "feat(security): add database migration for RLS hardening and tenant foreign key checks"
```

---

### Task 6: Remove Authenticated Root Route from Service Worker Precache & Clear Cache on Logout

**Files:**
- Modify: `public/sw.js:4-20`
- Modify: `src/app/page.tsx:70-95`
- Test: `tests/pwa.test.ts`

**Interfaces:**
- Consumes: `PRECACHE_ASSETS`, `caches.delete()`, `postMessage({ type: 'CLEAR_CACHE' })`
- Produces: Service Worker caching only static assets (`/offline`, `/manifest.json`, icons) and client-side cache eviction during logout.

- [ ] **Step 1: Write unit test in `tests/pwa.test.ts` for Service Worker precache security**

```typescript
// tests/pwa.test.ts additions
it('should not include root route "/" in PRECACHE_ASSETS in public/sw.js', () => {
  const swCode = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');
  expect(swCode).not.toMatch(/PRECACHE_ASSETS\s*=\s*\[[^\]]*'\/',/);
  expect(swCode).toContain("'/offline'");
});

it('should listen for CLEAR_CACHE message in public/sw.js', () => {
  const swCode = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');
  expect(swCode).toContain('CLEAR_CACHE');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/pwa.test.ts`
Expected: FAIL (currently `PRECACHE_ASSETS` includes `'/'`)

- [ ] **Step 3: Modify `public/sw.js` and `src/app/page.tsx`**

1. In `public/sw.js`:
   - Remove `'/'` from `PRECACHE_ASSETS`. Keep only `'/offline'`, `'/manifest.json'`, and icons.
   - Add `message` event listener to delete all caches when `{ type: 'CLEAR_CACHE' }` is received.
2. In `src/app/page.tsx`:
   - On the logout form, attach client-side action or script to clear `caches` via `window.caches?.delete('catat-mencatat-v1')` and notify service worker before submitting form.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/pwa.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
rtk git add public/sw.js src/app/page.tsx tests/pwa.test.ts
rtk git commit -m "fix(security): remove authenticated root document from service worker precache"
```

---

### Task 7: Full Test Suite Verification, PRD Sync & Changelog Entry

**Files:**
- Modify: `PRD.md`
- Create: `changelogs/CHANGELOG_01_11_2026.md`

- [ ] **Step 1: Run full test suite and build check**

Run: `rtk npm test`
Expected: All test suites PASS (43+ test suites)

Run: `rtk npm run build`
Expected: Build succeeds with 0 errors

- [ ] **Step 2: Update `PRD.md` with all final logic changes and test coverage descriptions**

Ensure all 7 remediated security controls are documented in `PRD.md`.

- [ ] **Step 3: Create `changelogs/CHANGELOG_01_11_2026.md`**

Create `changelogs/CHANGELOG_01_11_2026.md` summarizing the changes under date `01-11-2026` as required by rule 10 in `AGENTS.md`.

- [ ] **Step 4: Commit**

```bash
rtk git add PRD.md changelogs/CHANGELOG_01_11_2026.md
rtk git commit -m "docs: update PRD and add changelog for security audit remediations"
```

