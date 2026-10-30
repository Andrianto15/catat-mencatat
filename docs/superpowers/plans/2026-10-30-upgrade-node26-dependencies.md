# Upgrade Node 26 & Urgent Dependencies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Node.js runtime to v26 LTS (Lithium), upgrade urgent vulnerable/outdated dependencies (`next`, `@supabase/ssr`, `@supabase/supabase-js`, `react`, `react-dom`, `lucide-react`, `@types/node`, `jest`, `ts-jest`, `typescript`), fix breaking API changes, and verify zero errors across tests, audit, and production build.

**Architecture:** Upgrade Node runtime to v26 via `nvm` and lock it with `.nvmrc` and `package.json#engines`. Upgrade Next.js to v16.4.3 and React to v19.3.1 to eliminate critical/high CVEs (`next` & `postcss`), migrate `cookies()` in `src/lib/supabase/server.ts` and `src/app/page.tsx` to async, and pin `typescript` to `~5.9.3` to maintain `ts-jest` peer compatibility (`<7`).

**Tech Stack:** Node.js 26 LTS, Next.js 16.4+, React 19.3+, Supabase SSR 0.12+, Jest 30+, TypeScript 5.9.

**Spec:** `PRD.md` (Section 8: Technical Considerations)

## Global Constraints

- Node.js runtime target: `>=26.0.0` (`.nvmrc` set to `26`).
- Zero `critical` or `high` vulnerabilities in `npm audit --omit=dev`.
- TypeScript must remain `<7.0.0` (`~5.9.3`) until `ts-jest` supports TypeScript 7.
- All unit tests in `tests/` must pass via `npm test` and production build via `npm run build`.
- `PRD.md` and `changelogs/CHANGELOG_30_10_2026.md` updated upon completion.

## Review Focus

1. Async `cookies()` breaking change in Next.js 15/16: `createClient()` in `src/lib/supabase/server.ts` must be `async` and awaited in `src/app/page.tsx` (both page render and `handleLogout` server action).
2. React 19 `renderToStaticMarkup` in Jest tests: existing `.test.tsx` files use `renderToStaticMarkup` from `react-dom/server` and must continue passing under React 19 + Jest 30.
3. Jest 30 + `ts-jest` 29.4.15 compatibility with Node 26 and TypeScript 5.9: ensure `jest.config.js` runs all 25+ test suites without peer dependency or transform errors.
4. Next.js 16 `tsconfig.json` / `next.config.mjs` compatibility: `jsx` transform and build output must succeed cleanly without type errors.
5. Engine & version enforcement: `tests/setup.test.ts` must verify `engines.node`, `.nvmrc`, and `@types/node` v26+.

---

### Task 1: Upgrade Node.js Runtime to v26 & Enforce Engine Config

**Files:**
- Create: `.nvmrc`
- Modify: `package.json`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: `.nvmrc` (`26`), `package.json` `engines.node` (`>=26.0.0`)

- [ ] **Step 1: Write the failing test in `tests/setup.test.ts`**

```typescript
import fs from 'fs';
import path from 'path';

describe('Project Environment & Node 26 Config', () => {
  it('should run Jest unit tests correctly', () => {
    expect(true).toBe(true);
  });

  it('should configure Node 26 in .nvmrc and package.json engines', () => {
    const nvmrcPath = path.join(process.cwd(), '.nvmrc');
    expect(fs.existsSync(nvmrcPath)).toBe(true);
    expect(fs.readFileSync(nvmrcPath, 'utf8').trim()).toMatch(/^26/);

    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.engines?.node).toBe('>=26.0.0');
    expect(pkg.devDependencies['@types/node']).toMatch(/^\^?26\./);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test -- tests/setup.test.ts`
Expected: FAIL (`expect(fs.existsSync(nvmrcPath)).toBe(true)` is false)

- [ ] **Step 3: Install Node 26 via nvm, create `.nvmrc`, and update `package.json`**

Run `nvm install 26 && nvm alias default 26`, write `26` to `.nvmrc`, and add `"engines": { "node": ">=26.0.0" }` to `package.json`.

- [ ] **Step 4: Upgrade dependencies & devDependencies in `package.json`**

Update `package.json` dependencies:
- `"next": "^16.4.3"`
- `"react": "^19.3.1"`
- `"react-dom": "^19.3.1"`
- `"@supabase/ssr": "^0.12.7"`
- `"@supabase/supabase-js": "^2.118.0"`
- `"lucide-react": "^1.64.0"`

Update `package.json` devDependencies:
- `"@types/node": "^26.6.6"`
- `"@types/react": "^19.3.0"`
- `"@types/react-dom": "^19.3.0"`
- `"@types/jest": "^30.0.0"`
- `"jest": "^30.5.2"`
- `"ts-jest": "^29.4.15"`
- `"typescript": "~5.9.3"`

Run `npm install` under Node 26.

- [ ] **Step 5: Run test to verify it passes**

Run: `rtk npm test -- tests/setup.test.ts`
Expected: PASS

---

### Task 2: Migrate Next.js 16 Async `cookies()` & Verify Build/Tests

**Files:**
- Modify: `src/lib/supabase/server.ts:4-6`
- Modify: `src/app/page.tsx:7-16`
- Modify: `PRD.md`
- Create: `changelogs/CHANGELOG_30_10_2026.md`
- Test: `tests/auth-guard.test.ts`

**Interfaces:**
- Consumes: `cookies()` from `next/headers` (returns `Promise<ReadonlyRequestCookies>` in Next.js 15/16)
- Produces: `export async function createClient()` in `src/lib/supabase/server.ts`

- [ ] **Step 1: Write test verifying async server client in `tests/auth-guard.test.ts`**

Add test case in `tests/auth-guard.test.ts`:
```typescript
  it('should define createClient in server.ts as an async function awaiting cookies()', () => {
    const fs = require('fs');
    const serverCode = fs.readFileSync('src/lib/supabase/server.ts', 'utf8');
    expect(serverCode).toContain('export async function createClient()');
    expect(serverCode).toContain('await cookies()');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test -- tests/auth-guard.test.ts`
Expected: FAIL (`serverCode` does not contain `export async function createClient()`)

- [ ] **Step 3: Update `src/lib/supabase/server.ts` and `src/app/page.tsx`**

In `src/lib/supabase/server.ts`:
```typescript
export async function createClient() {
  const cookieStore = await cookies();
```

In `src/app/page.tsx`:
```typescript
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleLogout = async () => {
    'use server';
    const s = await createClient();
    await s.auth.signOut();
    redirect('/login');
  };
```

- [ ] **Step 4: Run full test suite, production build, and security audit**

Run: `rtk npm test && rtk npm run build && rtk npm audit --omit=dev`
Expected: All test suites PASS, `next build` succeeds with 0 errors, `npm audit --omit=dev` reports 0 vulnerabilities.

- [ ] **Step 5: Update `PRD.md` and create `changelogs/CHANGELOG_30_10_2026.md`**

Update `PRD.md` stack/technical section with Node 26 LTS, Next.js 16, React 19, and Supabase SSR 0.12. Create `changelogs/CHANGELOG_30_10_2026.md` summarizing the upgrade and fixes.

