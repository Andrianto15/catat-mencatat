# Saldo Akhir Tahun & Reminder Telegram (30 Desember) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan modul ke-4 **Saldo Akhir Tahun** (`/saldo-tahun`) dengan perhitungan saldo rekening dikurangi pengeluaran per tahun Masehi, grafik garis perkembangan tahunan, daftar ringkasan expandable (accordion Opsi A), serta fitur **Reminder Telegram Tahunan setiap 30 Desember** yang bisa dikonfigurasi dan dites langsung dari UI.

**Architecture:** Menggunakan Next.js 16 App Router dan Supabase Postgres dengan RLS. Master orang (`people`) dan master rekening (`zakat_accounts`) dibagi bersama modul Zakat Mal; data saldo tahunan disimpan di tabel `annual_balances` dan `annual_balance_items`, sedangkan konfigurasi Telegram disimpan di `telegram_settings` dan dieksekusi oleh route cron `/api/cron/telegram-reminder` serta endpoint tes `/api/telegram/test`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Lucide React, Jest 30.

**Spec:** `docs/superpowers/specs/2026-10-31-annual-balance-and-telegram-design.md`

## Global Constraints

- Runtime Node.js `>=26.0.0`, TypeScript `~5.9.3`, tanpa menambah dependensi npm baru (gunakan SVG murni untuk grafik garis dan `fetch` bawaan Node untuk Telegram Bot API).
- Berbagi tabel `people` dan `zakat_accounts` dengan modul Zakat Mal; tidak boleh mengubah/merusak data `zakat_years` atau `zakat_balances`.
- Perhitungan Saldo Akhir Tahun: `Total Rekening = Σ saldo rekening` (presisi 2 digit desimal), `Saldo Akhir Tahun = Total Rekening - Pengeluaran` (tanpa nilai emas fisik).
- Mobile-first (`antislop`, `antislop-ui`, `antislop-layoutmobile`, `antislop-code`): seluruh kontrol interaktif memiliki `minHeight: '44px'`, bebas horizontal overflow, menggunakan CSS variables dari `src/app/globals.css`, bebas em-dash (`—`) pada teks UI, dan memiliki state empty/loading/error.
- Semua tabel baru wajib mengaktifkan RLS (`ENABLE ROW LEVEL SECURITY`) dengan policy kepemilikan `auth.uid() = user_id`.

## Review Focus

1. **Presisi Desimal Floating-Point pada Saldo & Pengeluaran**: Penjumlahan saldo seperti `6951418.61 + 120000000.39` dikurangi pengeluaran desimal tidak boleh menghasilkan artefak `0.000000001` — diuji di Task 2.
2. **Tahun Sebelumnya Bernilai 0 atau Tahun Pertama (Tanpa Tahun Pembanding)**: Saat menghitung persentase perubahan (`deltaPct`) dibanding tahun sebelumnya yang bernilai `0` atau tidak ada tahun sebelumnya, hasil tidak boleh `NaN` atau `Infinity` — diuji di Task 2.
3. **Kredensial Telegram Kosong atau Spasi**: Pengiriman pesan Telegram (baik via tes manual maupun cron) saat `bot_token` atau `chat_id` kosong harus gagal secara aman dengan pesan error yang jelas tanpa memanggil URL invalid — diuji di Task 4.
4. **Otorisasi Endpoint Cron `/api/cron/telegram-reminder`**: Request tanpa header `Authorization: Bearer ${CRON_SECRET}` saat `CRON_SECRET` diset wajib ditolak dengan HTTP `401 Unauthorized` — diuji di Task 4.
5. **Aksesibilitas Accordion (Opsi A) & Modal Input**: Tombol expand/collapse tahun wajib memiliki `aria-expanded` dan `minHeight: '44px'`, serta modal input wajib memiliki `role="dialog"`, `aria-modal="true"`, dan split input desimal `,00` — diuji di Task 3.

---

### Task 1: Skema Database Supabase & Konfigurasi Cron Vercel

**Files:**
- Create: `supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql`
- Modify: `supabase/migrations/20261025000000_init_schema.sql`
- Create: `vercel.json`
- Modify: `tests/schema.test.ts`

**Interfaces:**
- Consumes: Tabel `public.people` dan `public.zakat_accounts` dari `supabase/migrations/20261025000000_init_schema.sql`
- Produces: Tabel `public.annual_balances`, `public.annual_balance_items`, `public.telegram_settings`, serta jadwal cron di `vercel.json` (`/api/cron/sync-gold` dan `/api/cron/telegram-reminder` pada `0 2 30 12 *`).

- [ ] **Step 1: Write the failing test in `tests/schema.test.ts`**

Tambahkan pengujian di `tests/schema.test.ts` yang memverifikasi:
```typescript
it('should define annual_balances, annual_balance_items, telegram_settings tables with RLS and vercel.json cron', () => {
  const migrationSql = fs.readFileSync(
    'supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql',
    'utf8'
  );
  for (const table of ['annual_balances', 'annual_balance_items', 'telegram_settings']) {
    expect(migrationSql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
    expect(migrationSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  }
  expect(migrationSql).toContain('expense_amount');
  expect(migrationSql).toContain('net_balance');
  expect(migrationSql).toContain('reminder_message');

  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  expect(vercelConfig.crons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: '/api/cron/telegram-reminder',
        schedule: '0 2 30 12 *',
      }),
    ])
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/schema.test.ts`
Expected: FAIL karena file migrasi `20261031000000_add_annual_balances_and_telegram.sql` dan `vercel.json` belum ada.

- [ ] **Step 3: Create migration `supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql`, update `20261025000000_init_schema.sql`, and create `vercel.json`**

Buat `supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql` sesuai bagian 4 Spec (`annual_balances`, `annual_balance_items`, `telegram_settings`, RLS policies, dan `GRANT ALL`), tambahkan definisi yang sama ke `supabase/migrations/20261025000000_init_schema.sql`, lalu buat `vercel.json` dengan konfigurasi `crons` untuk `/api/cron/sync-gold` (`0 2 * * *`) dan `/api/cron/telegram-reminder` (`0 2 30 12 *`).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx jest tests/schema.test.ts`
Expected: PASS

---

### Task 2: Engine Kalkulasi, Komparasi Tahunan & Pagination (`src/lib/saldo-tahun/engine.ts`)

**Files:**
- Create: `src/lib/saldo-tahun/engine.ts`
- Create: `tests/annual-balance-engine.test.ts`

**Interfaces:**
- Consumes: `paginateMotorServices`, `DEFAULT_MOTOR_PAGE_SIZE`, `PaginatedResult` dari `@/lib/motor/actions`
- Produces:
  - `DEFAULT_ANNUAL_BALANCE_PAGE_SIZE: number` (`5`)
  - `AnnualAccountBalanceItem`: `{ account_id: string; account_name?: string; balance: number }`
  - `AnnualBalanceCalculationInput`: `{ balances: AnnualAccountBalanceItem[]; expenseAmount?: number }`
  - `AnnualBalanceCalculationResult`: `{ totalAccounts: number; expenseAmount: number; netBalance: number }`
  - `calculateAnnualBalance(input: AnnualBalanceCalculationInput): AnnualBalanceCalculationResult`
  - `AnnualBalanceYearRecord`: `{ id?: string; masehi_year: number; total_accounts: number; expense_amount: number; net_balance: number; notes?: string | null; balances?: AnnualAccountBalanceItem[] }`
  - `AnnualBalanceWithDelta`: `AnnualBalanceYearRecord & { prevYear: number | null; deltaNominal: number | null; deltaPct: number | null }`
  - `computeAnnualBalanceDeltas(years: AnnualBalanceYearRecord[]): AnnualBalanceWithDelta[]`
  - `paginateAnnualBalances<T>(years: T[], limit?: number): PaginatedResult<T>`
  - `suggestNextMasehiYear(years: Array<{ masehi_year: number }>, fallbackYear?: number): number`

- [ ] **Step 1: Write the failing test in `tests/annual-balance-engine.test.ts`**

```typescript
import {
  calculateAnnualBalance,
  computeAnnualBalanceDeltas,
  paginateAnnualBalances,
  suggestNextMasehiYear,
  DEFAULT_ANNUAL_BALANCE_PAGE_SIZE,
} from '../src/lib/saldo-tahun/engine';

describe('Annual Balance Engine', () => {
  it('calculates totalAccounts, expenseAmount, and netBalance matching Excel 2018 example', () => {
    const res = calculateAnnualBalance({
      balances: [
        { account_id: 'bni', balance: 4222841 },
        { account_id: 'mandiri', balance: 2198692 },
      ],
      expenseAmount: 812854,
    });
    expect(res.totalAccounts).toBe(6421533);
    expect(res.expenseAmount).toBe(812854);
    expect(res.netBalance).toBe(5608679);
  });

  it('maintains 2 decimal digits precision without floating-point artifacts', () => {
    const res = calculateAnnualBalance({
      balances: [
        { account_id: 'a1', balance: 6951418.61 },
        { account_id: 'a2', balance: 120000000.39 },
      ],
      expenseAmount: 500000.25,
    });
    expect(res.totalAccounts).toBe(126951419);
    expect(res.expenseAmount).toBe(500000.25);
    expect(res.netBalance).toBe(126451418.75);
  });

  it('computes year-over-year deltas sorted descending and handles first year or 0 base safely', () => {
    const records = [
      { masehi_year: 2018, total_accounts: 6421533, expense_amount: 812854, net_balance: 5608679 },
      { masehi_year: 2019, total_accounts: 11566529, expense_amount: 0, net_balance: 11566529 },
      { masehi_year: 2017, total_accounts: 0, expense_amount: 0, net_balance: 0 },
    ];
    const withDeltas = computeAnnualBalanceDeltas(records);
    expect(withDeltas.map((r) => r.masehi_year)).toEqual([2019, 2018, 2017]);

    // 2019 vs 2018: 11566529 - 5608679 = +5957850 (+106.23%)
    expect(withDeltas[0].prevYear).toBe(2018);
    expect(withDeltas[0].deltaNominal).toBe(5957850);
    expect(withDeltas[0].deltaPct).toBe(106.23);

    // 2018 vs 2017 (0 base): deltaNominal = 5608679, deltaPct = 0 (no Infinity/NaN)
    expect(withDeltas[1].prevYear).toBe(2017);
    expect(withDeltas[1].deltaNominal).toBe(5608679);
    expect(withDeltas[1].deltaPct).toBe(0);

    // 2017 (oldest): no previous year
    expect(withDeltas[2].prevYear).toBeNull();
    expect(withDeltas[2].deltaNominal).toBeNull();
    expect(withDeltas[2].deltaPct).toBeNull();
  });

  it('paginates annual balances with default page size 5 and suggests next year', () => {
    expect(DEFAULT_ANNUAL_BALANCE_PAGE_SIZE).toBe(5);
    const items = [1, 2, 3, 4, 5, 6];
    const page = paginateAnnualBalances(items);
    expect(page.items).toHaveLength(5);
    expect(page.hasMore).toBe(true);
    expect(suggestNextMasehiYear([{ masehi_year: 2024 }, { masehi_year: 2025 }])).toBe(2026);
    expect(suggestNextMasehiYear([], 2026)).toBe(2026);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/annual-balance-engine.test.ts`
Expected: FAIL karena `src/lib/saldo-tahun/engine.ts` belum ada.

- [ ] **Step 3: Implement `src/lib/saldo-tahun/engine.ts`**

Implementasikan fungsi murni `calculateAnnualBalance`, `computeAnnualBalanceDeltas`, `paginateAnnualBalances`, dan `suggestNextMasehiYear` dengan pembulatan `Math.round(val * 100) / 100`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx jest tests/annual-balance-engine.test.ts`
Expected: PASS

---

### Task 3: Komponen UI Saldo Akhir Tahun (Line Chart, Accordion Card, Modal Input, Halaman `/saldo-tahun`, & Beranda)

**Files:**
- Create: `src/components/saldo-tahun/AnnualBalanceTrendChart.tsx`
- Create: `src/components/saldo-tahun/AnnualBalanceModal.tsx`
- Create: `src/components/saldo-tahun/AnnualBalanceAccordionList.tsx`
- Create: `src/app/saldo-tahun/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `tests/auth-guard.test.ts`
- Create: `tests/annual-balance-ui.test.tsx`

**Interfaces:**
- Consumes: `calculateAnnualBalance`, `computeAnnualBalanceDeltas`, `paginateAnnualBalances`, `suggestNextMasehiYear`, `DEFAULT_ANNUAL_BALANCE_PAGE_SIZE`, `AnnualBalanceWithDelta` dari `@/lib/saldo-tahun/engine`; `ZakatAccount` & `formatZakatAccountMeta` dari `@/lib/zakat/engine`; `NumberInput` dari `@/components/NumberInput`.
- Produces:
  - `AnnualBalanceTrendChart({ years }: { years: AnnualBalanceYearRecord[] })`
  - `AnnualBalanceAccordionList({ items, onEdit, onDelete }: { items: AnnualBalanceWithDelta[]; onEdit: (item: AnnualBalanceWithDelta) => void; onDelete: (item: AnnualBalanceWithDelta) => void })`
  - `AnnualBalanceModal({ isOpen, onClose, personId, personName, accounts, suggestedYear, initialData, onSave })`
  - Halaman `/saldo-tahun` (`src/app/saldo-tahun/page.tsx`) dan item ke-4 di `src/app/page.tsx` (`href: '/saldo-tahun'`, title `'Saldo Akhir Tahun'`).

- [ ] **Step 1: Write the failing test in `tests/annual-balance-ui.test.tsx` and `tests/auth-guard.test.ts`**

Buat `tests/annual-balance-ui.test.tsx` yang menguji:
1. `AnnualBalanceTrendChart` merender SVG line chart (`<svg`, `<polyline`, `role="img"`, `aria-label="Grafik perkembangan saldo akhir tahun"`), mengurutkan tahun secara ascending (`2018` s.d. `2025`), dan menampilkan nilai ringkas.
2. `AnnualBalanceAccordionList` merender kartu ringkasan tahun dengan tombol header accordion (`aria-expanded`, `minHeight: '44px'`), menampilkan `Saldo Akhir Tahun`, `Total Rekening`, `Pengeluaran`, badge delta (`▲` / `▼`), dan ketika `defaultExpandedYear` diberikan atau di-expand menampilkan rincian saldo per rekening beserta tombol Edit & Hapus.
3. `AnnualBalanceModal` merender dialog WAI-ARIA (`role="dialog"`, `aria-modal="true"`), input `Tahun Masehi`, split input ribuan + desimal 2 digit (`id="annual-acc-dec-..."`, `maxLength={2}`, `placeholder="00"`), input `Pengeluaran (Rp)`, serta ringkasan real-time `Total Rekening` dikurangi `Pengeluaran` = `Saldo Akhir Tahun`.
4. `src/app/page.tsx` memuat modul ke-4 `'Saldo Akhir Tahun'` dengan `href: '/saldo-tahun'`.
5. Tambahkan `expect(resolveAuthRedirect('/saldo-tahun', false)).toBe('/login')` di `tests/auth-guard.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/annual-balance-ui.test.tsx tests/auth-guard.test.ts`
Expected: FAIL karena komponen dan halaman `/saldo-tahun` belum dibuat.

- [ ] **Step 3: Implement `AnnualBalanceTrendChart.tsx`, `AnnualBalanceAccordionList.tsx`, `AnnualBalanceModal.tsx`, `src/app/saldo-tahun/page.tsx`, and update `src/app/page.tsx`**

- `AnnualBalanceTrendChart.tsx`: SVG Line Chart responsif (`viewBox="0 0 600 200"`), area polygon transparan di bawah kurva, titik data `<circle>` dengan label tahun Masehi dan nominal compact (`Intl.NumberFormat('id-ID', { notation: 'compact' })`), dapat ditampilkan mulai dari 1 tahun ke atas.
- `AnnualBalanceAccordionList.tsx`: Kartu tahun yang klik-nya men-toggle state `expandedYear` (`aria-expanded`), menampilkan rincian rekening, baris Total Rekening, Pengeluaran, Saldo Akhir Tahun, serta tombol Edit dan Hapus (`minHeight: '44px'`).
- `AnnualBalanceModal.tsx`: Modal responsif (bottom-sheet di mobile, centered dialog di desktop) dengan focus trap `Tab`/`Escape`, guard `onMouseDown` backdrop, input Tahun Masehi, input saldo per rekening (ribuan + 2 digit desimal sen), input Pengeluaran (ribuan + 2 digit desimal sen), input catatan opsional, dan kalkulasi real-time `calculateAnnualBalance`.
- `src/app/saldo-tahun/page.tsx`: Halaman utama modul Saldo Akhir Tahun dengan pemilih orang (`people`), `AnnualBalanceTrendChart`, `AnnualBalanceAccordionList`, progressive pagination 5 tahun (`Tampilkan 5 Lainnya`), FAB tambah tahun baru, dan link ke `/saldo-tahun/settings`.
- `src/app/page.tsx`: Tambahkan kartu modul ke-4 `Saldo Akhir Tahun` (`href: '/saldo-tahun'`, icon `TrendingUp` / `Wallet`, warna `#0ea5e9`).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx jest tests/annual-balance-ui.test.tsx tests/auth-guard.test.ts`
Expected: PASS

---

### Task 4: Tahap 2 - Reminder Telegram (Helper, API Test, API Cron 30 Desember, & Halaman `/saldo-tahun/settings`)

**Files:**
- Create: `src/lib/telegram/sender.ts`
- Create: `src/app/api/telegram/test/route.ts`
- Create: `src/app/api/cron/telegram-reminder/route.ts`
- Create: `src/app/saldo-tahun/settings/page.tsx`
- Create: `tests/telegram-reminder.test.tsx`

**Interfaces:**
- Consumes: Tabel `telegram_settings`, `people`, `zakat_accounts`; `ZAKAT_ACCOUNT_TYPES`, `formatZakatAccountMeta` dari `@/lib/zakat/engine`
- Produces:
  - `DEFAULT_TELEGRAM_REMINDER_MESSAGE: string`
  - `validateTelegramConfig(input: { botToken?: string; chatId?: string; message?: string }): { valid: boolean; error?: string; botToken: string; chatId: string; message: string }`
  - `sendTelegramMessage(params: { botToken: string; chatId: string; text: string; fetchImpl?: typeof fetch }): Promise<{ ok: boolean; error?: string }>`
  - `POST /api/telegram/test`: Mengirim pesan tes ke Telegram untuk user yang sedang login.
  - `GET /api/cron/telegram-reminder`: Endpoint Vercel Cron (30 Desember) yang dilindungi `CRON_SECRET` untuk mengirim reminder ke seluruh konfigurasi `telegram_settings` yang `is_enabled = true`.
  - Halaman `/saldo-tahun/settings` (`src/app/saldo-tahun/settings/page.tsx`): Form pengaturan Reminder Telegram (Bot Token, Chat ID, Pesan Pengingat, toggle Aktif, tombol Simpan & tombol Kirim Tes Sekarang) serta pengelolaan daftar rekening (`zakat_accounts`).

- [ ] **Step 1: Write the failing test in `tests/telegram-reminder.test.tsx`**

Buat `tests/telegram-reminder.test.tsx` yang menguji:
1. `validateTelegramConfig` menolak `botToken` atau `chatId` yang kosong/spasi dengan pesan error yang jelas, dan mengisi `DEFAULT_TELEGRAM_REMINDER_MESSAGE` bila pesan kosong.
2. `sendTelegramMessage` memanggil `https://api.telegram.org/bot<token>/sendMessage` dengan method `POST` dan JSON body `{ chat_id, text }`, serta menangani respons sukses maupun error dari Telegram API tanpa melempar unhandled exception.
3. `GET /api/cron/telegram-reminder` mengembalikan `401 Unauthorized` jika `CRON_SECRET` diset dan header `Authorization` tidak cocok.
4. Halaman `/saldo-tahun/settings` memiliki input berlabel aksesibel untuk `Telegram Bot Token`, `Telegram Chat ID`, `Pesan Pengingat`, toggle status aktif, tombol `Simpan Pengaturan`, dan tombol `Kirim Tes Sekarang` dengan `minHeight: '44px'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/telegram-reminder.test.tsx`
Expected: FAIL karena `src/lib/telegram/sender.ts`, route API, dan halaman `/saldo-tahun/settings/page.tsx` belum ada.

- [ ] **Step 3: Implement `src/lib/telegram/sender.ts`, `/api/telegram/test/route.ts`, `/api/cron/telegram-reminder/route.ts`, and `src/app/saldo-tahun/settings/page.tsx`**

- `src/lib/telegram/sender.ts`: Fungsi `validateTelegramConfig` dan `sendTelegramMessage` dengan timeout aman dan sanitasi input.
- `src/app/api/telegram/test/route.ts`: Mengecek sesi user via `createClient()` (`@/lib/supabase/server`), memvalidasi payload `{ bot_token, chat_id, reminder_message }`, memanggil `sendTelegramMessage`, dan mengembalikan JSON `{ success, message }`.
- `src/app/api/cron/telegram-reminder/route.ts`: Memvalidasi `Authorization: Bearer ${process.env.CRON_SECRET}`, mengambil daftar `telegram_settings` dengan `is_enabled = true` dan `bot_token <> ''` serta `chat_id <> ''`, mengirim pesan via `sendTelegramMessage`, dan mengupdate `last_sent_at`.
- `src/app/saldo-tahun/settings/page.tsx`: Halaman pengaturan modul Saldo Akhir Tahun yang memuat bagian **Pengaturan Reminder Telegram (30 Desember)** (lengkap dengan Simpan & Kirim Tes Sekarang) serta pengelolaan **Daftar Rekening & Tabungan** (`zakat_accounts` per `people`).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx jest tests/telegram-reminder.test.tsx`
Expected: PASS

---

### Task 5: Verifikasi Akhir, Update `PRD.md`, & `changelogs/CHANGELOG_31_10_2026.md`

**Files:**
- Modify: `PRD.md`
- Create: `changelogs/CHANGELOG_31_10_2026.md`
- Modify: `tests/responsive-targets.test.ts` (atau verifikasi seluruh suite test)

**Interfaces:**
- Consumes: Seluruh artefak dari Task 1–4.
- Produces: Dokumentasi `PRD.md` yang mutakhir (mencakup Modul 5.4 Saldo Akhir Tahun & Reminder Telegram 30 Desember), `changelogs/CHANGELOG_31_10_2026.md`, serta seluruh unit test dan production build lulus 100%.

- [ ] **Step 1: Update `PRD.md` and create `changelogs/CHANGELOG_31_10_2026.md`**

- Perbarui `PRD.md`:
  - Executive Summary & F0.2 Halaman Utama (4 modul: Servis Motor, Emas Fisik, Zakat Mal, Saldo Akhir Tahun).
  - Tambahkan bagian **5.4 Modul Saldo Akhir Tahun & Reminder Telegram** (`F4.1 Struktur Data & Berbagi Rekening`, `F4.2 Input & Perhitungan Saldo Akhir Tahun`, `F4.3 Grafik Perkembangan & Ringkasan Expandable (Accordion)`, `F4.4 Reminder Telegram Setiap 30 Desember`).
  - Tambahkan tabel `annual_balances`, `annual_balance_items`, dan `telegram_settings` pada bagian 8 Model Data.
- Buat `changelogs/CHANGELOG_31_10_2026.md` dengan ringkasan perubahan tanggal `31-10-2026`.

- [ ] **Step 2: Run full test suite and Next.js build verification**

Run: `rtk npm test`
Expected: PASS (seluruh test suite hijau).

Run: `rtk npm run build`
Expected: Build Next.js berhasil tanpa error TypeScript maupun lint.

