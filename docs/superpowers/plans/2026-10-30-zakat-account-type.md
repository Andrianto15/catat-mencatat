# Zakat Account Type Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `account_type` dropdown (`Bank`, `e-Wallet`, `Reksadana / Investasi`, `Tunai / Cash`, `Lainnya`) to Zakat Kelola Rekening & Tabungan form, store in new database column `account_type`, and display across Zakat account lists and YearModal.

**Architecture:** Add `account_type TEXT NOT NULL DEFAULT 'Bank'` column to `public.zakat_accounts` via SQL migration and update initial schema file. Export `ZAKAT_ACCOUNT_TYPES` constant and `ZakatAccountType` type from `src/lib/zakat/engine.ts`. Update `src/app/zakat/settings/page.tsx` and `src/components/zakat/YearModal.tsx` with accessible mobile-first `.form-select` dropdown and metadata display.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, Supabase (PostgreSQL), Jest.

**Spec:** `PRD.md` (Section 5.3 F3.1 & F3.6, Section 8 `zakat_accounts`)

## Global Constraints

- Mobile-first ergonomics: minimum 44x44px touch targets (`minHeight: '44px'`), explicit `<label htmlFor="...">` matching `<select id="...">` and `<input id="...">`, responsive grid stacking (`gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'`).
- Design system compliance (`DESIGN.md` & `antislop` rules): use `.form-select` and `.form-input` classes, no em-dashes in UI copy, no unrequested decorative badges/glows.
- All Jest unit tests in `tests/` must pass before commit.
- Update `PRD.md` and `changelogs/CHANGELOG_30_10_2026.md`.

## Review Focus

- Legacy or existing rows in `zakat_accounts` where `account_type` might be null/undefined in client state should safely fallback to `'Bank'`.
- Switching from editing an existing account back to "Batal" (cancel) or after saving must reset `accountType` to `'Bank'`.
- Selecting an account to edit (`handleEdit`) must populate `accountType` with `acc.account_type || 'Bank'`.
- Mobile viewport (< 640px) form inputs for Jenis, Institusi, and No. Rekening must not cause horizontal overflow.
- Accessible labels (`htmlFor` + `id`) must be present on all form fields in `ZakatSettingsPage`.

---

### Task 1: Database Migration, Constants & Unit Tests

**Files:**
- Create: `supabase/migrations/20261030000001_add_account_type_to_zakat_accounts.sql`
- Modify: `supabase/migrations/20261025000000_init_schema.sql:84-94`
- Modify: `src/lib/zakat/engine.ts:1-20`
- Modify: `tests/schema.test.ts:1-20`
- Create: `tests/zakat-account-type.test.tsx`

**Interfaces:**
- Produces in `src/lib/zakat/engine.ts`:
  ```ts
  export const ZAKAT_ACCOUNT_TYPES = [
    'Bank',
    'e-Wallet',
    'Reksadana / Investasi',
    'Tunai / Cash',
    'Lainnya',
  ] as const;

  export type ZakatAccountType = (typeof ZAKAT_ACCOUNT_TYPES)[number];

  export function formatZakatAccountMeta(account: {
    account_type?: string | null;
    institution?: string | null;
    account_number?: string | null;
  }): string;
  ```

- [ ] **Step 1: Write failing tests in `tests/schema.test.ts` and `tests/zakat-account-type.test.tsx`**

Update `tests/schema.test.ts` to assert `account_type` is present in schema, and create `tests/zakat-account-type.test.tsx`:
```tsx
import fs from 'fs';
import { ZAKAT_ACCOUNT_TYPES, formatZakatAccountMeta } from '@/lib/zakat/engine';

describe('Zakat Account Type Constants & Formatting', () => {
  it('exposes the standard account types with Bank as default first option', () => {
    expect(ZAKAT_ACCOUNT_TYPES).toEqual([
      'Bank',
      'e-Wallet',
      'Reksadana / Investasi',
      'Tunai / Cash',
      'Lainnya',
    ]);
  });

  it('formats account metadata combining type, institution, and account number', () => {
    expect(
      formatZakatAccountMeta({
        account_type: 'e-Wallet',
        institution: 'GoPay',
        account_number: '08123456',
      })
    ).toBe('e-Wallet • GoPay • 08123456');

    expect(
      formatZakatAccountMeta({
        account_type: 'Tunai / Cash',
        institution: null,
        account_number: null,
      })
    ).toBe('Tunai / Cash');

    expect(
      formatZakatAccountMeta({
        account_type: null,
        institution: 'BCA',
        account_number: null,
      })
    ).toBe('Bank • BCA');
  });

  it('has migration file for account_type column on zakat_accounts', () => {
    const migration = fs.readFileSync(
      'supabase/migrations/20261030000001_add_account_type_to_zakat_accounts.sql',
      'utf8'
    );
    expect(migration).toContain('ALTER TABLE public.zakat_accounts');
    expect(migration).toContain('account_type TEXT NOT NULL DEFAULT \'Bank\'');
  });
});
```

- [ ] **Step 2: Run Jest to verify tests fail**

Run: `rtk npx jest tests/schema.test.ts tests/zakat-account-type.test.tsx`
Expected: FAIL (`ZAKAT_ACCOUNT_TYPES` and migration file not found).

- [ ] **Step 3: Create SQL migration and implement constants/helper in `src/lib/zakat/engine.ts`**

Create `supabase/migrations/20261030000001_add_account_type_to_zakat_accounts.sql`:
```sql
-- Add account_type column to zakat_accounts
ALTER TABLE public.zakat_accounts ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'Bank';
```
Add `account_type TEXT NOT NULL DEFAULT 'Bank',` to `public.zakat_accounts` in `supabase/migrations/20261025000000_init_schema.sql`.
Implement `ZAKAT_ACCOUNT_TYPES`, `ZakatAccountType`, and `formatZakatAccountMeta` in `src/lib/zakat/engine.ts`.

- [ ] **Step 4: Run Jest to verify Task 1 tests pass**

Run: `rtk npx jest tests/schema.test.ts tests/zakat-account-type.test.tsx`
Expected: PASS

---

### Task 2: Zakat Settings UI Dropdown & YearModal Display

**Files:**
- Modify: `src/app/zakat/settings/page.tsx:9-345`
- Modify: `src/components/zakat/YearModal.tsx:9-15,320-330`
- Modify: `tests/zakat-account-type.test.tsx`
- Modify: `PRD.md:226-265,308`
- Create/Modify: `changelogs/CHANGELOG_30_10_2026.md`

**Interfaces:**
- Consumes: `ZAKAT_ACCOUNT_TYPES`, `ZakatAccountType`, `formatZakatAccountMeta` from `@/lib/zakat/engine`.
- Updates `AccountItem` in `src/app/zakat/settings/page.tsx` and `ZakatAccount` in `src/components/zakat/YearModal.tsx` to include `account_type?: string | null;`.

- [ ] **Step 1: Add UI component verification tests in `tests/zakat-account-type.test.tsx`**

Add tests checking `src/app/zakat/settings/page.tsx` and `src/components/zakat/YearModal.tsx` for:
- Accessible `<label htmlFor="zakat-account-type">` and `<select id="zakat-account-type" className="form-select">`
- Rendering of `ZAKAT_ACCOUNT_TYPES` options
- Inclusion of `account_type: accountType` in Supabase insert and update payloads
- `formatZakatAccountMeta` usage in account list and `YearModal`

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/zakat-account-type.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement dropdown and metadata display in `src/app/zakat/settings/page.tsx` and `src/components/zakat/YearModal.tsx`**

In `src/app/zakat/settings/page.tsx`:
- Add `account_type?: string | null;` to `AccountItem`.
- Add `const [accountType, setAccountType] = useState<string>('Bank');`.
- Include `account_type: accountType` in `.update(...)` and `.insert(...)` inside `handleSaveAccount`, then reset `setAccountType('Bank')`.
- In `handleEdit(acc)`, call `setAccountType(acc.account_type || 'Bank')`.
- In cancel button `onClick`, reset `setAccountType('Bank')`.
- Add `Jenis Rekening / Tabungan` `<select id="zakat-account-type" className="form-select" value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ minHeight: '44px' }}>` with `ZAKAT_ACCOUNT_TYPES` options, plus explicit `htmlFor`/`id` on Nama Rekening, Institusi, and No. Rekening inputs, using responsive grid `gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`.
- In Daftar Rekening item card, render `<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatZakatAccountMeta(acc)}</div>`.

In `src/components/zakat/YearModal.tsx`:
- Add `account_type?: string | null;` to `ZakatAccount`.
- Display `formatZakatAccountMeta(acc)` under `acc.account_name`.

- [ ] **Step 4: Update `PRD.md` and `changelogs/CHANGELOG_30_10_2026.md`, then run full test suite**

Run: `rtk npx jest`
Expected: All test suites PASS.

