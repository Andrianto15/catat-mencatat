# Catat-Mencatat MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi PWA pribadi (mobile-first) "Catat-Mencatat" dengan stack Next.js (App Router) + Supabase + Vercel untuk tiga modul: Servis Motor, Emas (dengan scraping harga harian Galeri24 & profit), dan Zakat Mal (tabel tahunan Hijriah, nisab, komparasi antar-tahun).

**Architecture:** Next.js App Router dengan Server Components & Server Actions untuk mutasi data; Supabase Postgres untuk persistence dengan RLS per `user_id`; `@supabase/ssr` untuk autentikasi session; Vercel Cron untuk scraping harga harian Galeri24; Service Worker via `@serwist/next` untuk kemampuan PWA standalone. Kalkulasi keuangan (profit emas, total zakat, nisab) dipisahkan menjadi fungsi murni (pure functions) yang diuji dengan Jest.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Supabase (Postgres, Auth, RLS), CSS Variables / Design System dari `DESIGN.md`, Jest (Unit Testing), `@serwist/next` (PWA).

**Spec:** [PRD.md](../../../PRD.md) dan [DESIGN.md](../../../DESIGN.md).

## Global Constraints

- Mobile-first: UI harus nyaman di layar smartphone (< 640px) sebelum adaptasi desktop (> 1024px).
- Sesuai `DESIGN.md`: token warna steel blue (`#4682b4`), font Public Sans, hairline borders (`1px solid var(--border-card)`), elevasi hanya saat interaksi.
- Sesuai `AGENTS.md`: unit test menggunakan Jest di folder `tests/`, seluruh test harus pass sebelum commit, commit message format `caveman`.
- Keamanan: RLS aktif di semua tabel Supabase. Tidak ada kebocoran data antar `user_id`. Service role key hanya di server backend.
- Halaman utama hanya memuat 3 ikon modul (clean home). Pengaturan master data berada di dalam modul masing-masing.

## Review Focus

1. **Galeri24 Parser Broken**: Struktur HTML berubah atau koneksi gagal -> scraper tetap membuat record `gold_prices` bertanggal hari ini dengan status `gagal` dan harga kosong; sistem memakai fallback harga valid terakhir dengan label tanggal.
2. **Gold Sold vs Zakat Reference Date**: Keping emas yang dijual *setelah* 1 Ramadhan tahun berjalan tetap wajib dihitung ke dalam zakat tahun tersebut (`sold_at > reference_date`).
3. **Floating Point Rounding in Currency & Grams**: Kalkulasi rupiah dan gramasi emas tidak boleh kehilangan presisi (gunakan pembulatan standar desimal atau integer basis sen).
4. **Zakat Gold Snapshot Lock**: Perubahan harga emas di masa depan tidak boleh mengubah angka zakat tahun lampau yang sudah disimpan (snapshot terkunci).
5. **PWA Standalone & Safe-Area Inset**: Di iOS/Android PWA, notch dan bottom home bar tidak boleh menutupi tombol FAB atau aksi modal drawer.

---

### Task 1: Scaffolding Project Next.js, Jest, & Design Tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `jest.config.js`, `src/app/layout.tsx`, `src/app/globals.css`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Base layout Next.js dengan CSS custom properties dari `DESIGN.md` dan test runner Jest siap jalan.

- [ ] **Step 1: Write failing test for base setup**

Create `tests/setup.test.ts`:
```typescript
describe('Project Environment', () => {
  it('should run Jest unit tests correctly', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure (belum ada dependencies)**

Run: `rtk npm test`
Expected: FAIL (missing jest / package.json script)

- [ ] **Step 3: Setup Next.js, TypeScript, Jest, & CSS Tokens**

Initialize Next.js App Router in `./` (or install dependencies: `next`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/node`, `jest`, `ts-jest`, `@types/jest`).
Define CSS custom properties in `src/app/globals.css` matching `DESIGN.md`:
```css
:root {
  --color-primary: #4682b4;
  --color-primary-hover: #36648b;
  --color-accent: #0ea5e9;
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --border-card: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-main: #090d16;
    --bg-card: #0f172a;
    --border-card: #1e293b;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.mjs jest.config.js src/ tests/
git commit -m "chore: setup nextjs jest design tokens"
```

---

### Task 2: Supabase Schema & Database Migrations

**Files:**
- Create: `supabase/migrations/20261025000000_init_schema.sql`
- Create: `supabase/seed.sql`
- Test: `tests/schema.test.ts` (validasi struktur tabel / mock schema types)

**Interfaces:**
- Produces: Tabel Postgres + RLS: `people`, `motors`, `motor_services`, `gold_prices`, `gold_purchases`, `zakat_accounts`, `zakat_years`, `zakat_balances`.

- [ ] **Step 1: Write schema SQL specification test**

Create `tests/schema.test.ts` untuk memastikan SQL migration memiliki definisi tabel lengkap dan RLS:
```typescript
import fs from 'fs';
describe('Supabase Schema Migration', () => {
  it('should define all 8 required tables and RLS policies', () => {
    const sql = fs.readFileSync('supabase/migrations/20261025000000_init_schema.sql', 'utf8');
    const requiredTables = [
      'people', 'motors', 'motor_services', 'gold_prices',
      'gold_purchases', 'zakat_accounts', 'zakat_years', 'zakat_balances'
    ];
    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
    expect(sql).toContain('sold_at');
    expect(sql).toContain('sold_price_per_piece');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npm test tests/schema.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Implement `supabase/migrations/20261025000000_init_schema.sql`**

Buat DDL lengkap dengan foreign keys, tipe `numeric`, index, constraint unique, dan RLS policy per `auth.uid() = user_id`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/ tests/schema.test.ts
git commit -m "feat: add supabase initial schema and rls"
```

---

### Task 3: Supabase Client, Auth Guard, & Layout Dasar

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`, `src/app/login/page.tsx`, `src/app/page.tsx`
- Test: `tests/auth-guard.test.ts`

**Interfaces:**
- Produces: `createClient()` helper untuk server/client component, middleware proteksi `/` ke `/login`, Halaman utama 3 icon (`/motor`, `/emas`, `/zakat`), dan login form.

- [ ] **Step 1: Write test for auth redirect logic**

Create `tests/auth-guard.test.ts` menguji URL guard mapping (unauthenticated -> redirect to /login).

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/auth-guard.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Supabase SSR clients, Middleware, Login page, and 3-icon clean Home page**

- Setup `@supabase/ssr` helper.
- `src/middleware.ts`: Redirect unauthenticated user to `/login`.
- `src/app/login/page.tsx`: Email & Password form, error handling.
- `src/app/page.tsx`: Clean dashboard dengan 3 icon besar (Servis Motor, Emas, Zakat Mal) + logout button kecil di header.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/auth-guard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ tests/auth-guard.test.ts
git commit -m "feat: add supabase auth middleware and home dashboard"
```

---

### Task 4: Modul Servis Motor (F1)

**Files:**
- Create: `src/app/motor/page.tsx`, `src/app/motor/settings/page.tsx`
- Create: `src/components/motor/ServiceModal.tsx`, `src/components/motor/ServiceFilter.tsx`, `src/components/motor/ServiceCard.tsx`
- Create: `src/lib/motor/actions.ts`
- Test: `tests/motor.test.ts`

**Interfaces:**
- Consumes: Supabase `motors` & `motor_services` tables.
- Produces: Riwayat servis motor, modal tambah/edit (sticky field & "Simpan & tambah lagi"), filter motor & tanggal, CRUD master motor.

- [ ] **Step 1: Write unit tests for motor logic**

Create `tests/motor.test.ts` menguji filtering, kalkulasi total servis & biaya, serta validasi form.

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/motor.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Servis Motor components & Server Actions**

- List card mobile-first (< 640px) dan tabel desktop (> 1024px).
- Bottom sheet modal untuk input cepat servis.
- Halaman pengaturan master data motor (`/motor/settings`).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/motor.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/motor/ src/components/motor/ src/lib/motor/ tests/motor.test.ts
git commit -m "feat: implement motor service module and settings"
```

---

### Task 5: Galeri24 HTML Scraper, Parser, & Vercel Cron (F2.1 - F2.2)

**Files:**
- Create: `src/lib/gold/scraper.ts`, `src/app/api/cron/sync-gold/route.ts`
- Create: `src/app/emas/prices/page.tsx`
- Test: `tests/scraper.test.ts`, `tests/fixtures/galeri24-sample.html`

**Interfaces:**
- Produces: `parseGaleri24Html(html: string): ParsedGoldPrice[]`, route `/api/cron/sync-gold`, halaman lihat & edit harga emas harian (`/emas/prices`).

- [ ] **Step 1: Save HTML fixture and write unit test for HTML parser**

Save fixture dari live HTML Galeri24 ke `tests/fixtures/galeri24-sample.html`.
Create `tests/scraper.test.ts`:
```typescript
describe('Galeri24 Parser', () => {
  it('should parse brand, weight, sell_price, and buyback_price correctly', () => {
    const html = fs.readFileSync('tests/fixtures/galeri24-sample.html', 'utf8');
    const result = parseGaleri24Html(html);
    expect(result.length).toBeGreaterThan(0);
    const antam1g = result.find(r => r.brand.toUpperCase() === 'ANTAM' && r.weight_gram === 1);
    expect(antam1g).toBeDefined();
    expect(antam1g?.buyback_price).toBeGreaterThan(0);
  });
  it('should return empty array gracefully on broken HTML', () => {
    expect(parseGaleri24Html('<div>broken</div>')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/scraper.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `parseGaleri24Html`, Cron sync route, and Price Management UI**

- Parsing regex/DOM resilient.
- Cron route protected by `CRON_SECRET`.
- Fallback: jika scraping gagal, buat row status `gagal` dengan harga null.
- UI `/emas/prices`: list per tanggal, filter brand, edit harga manual (status berubah jadi `manual`).

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/scraper.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/gold/ src/app/api/cron/ src/app/emas/prices/ tests/scraper.test.ts tests/fixtures/
git commit -m "feat: add galeri24 price scraper parser and cron sync"
```

---

### Task 6: Modul Emas - Master Orang, Kalkulasi Profit, & Pembelian (F2.3 - F2.7)

**Files:**
- Create: `src/lib/gold/profit.ts`, `src/lib/gold/actions.ts`
- Create: `src/app/emas/page.tsx`, `src/app/emas/settings/page.tsx`
- Create: `src/components/gold/PurchaseModal.tsx`, `src/components/gold/GoldCard.tsx`
- Test: `tests/gold-profit.test.ts`

**Interfaces:**
- Produces: `calculateGoldProfit(purchase, currentBuyback)`, CRUD master orang (`people`), form beli keping emas, summary card aset per pemilik.

- [ ] **Step 1: Write failing unit test for profit and asset summary**

Create `tests/gold-profit.test.ts`:
```typescript
describe('Gold Profit & Asset Calculations', () => {
  it('should calculate profit Rp and profit % correctly', () => {
    // beli 1g harga 1.000.000, buyback kini 1.200.000 -> profit 200.000 (20%)
    const profit = calculateGoldProfit({ weight_gram: 1, price_per_piece: 1000000 }, 1200000);
    expect(profit.profit_rp).toBe(200000);
    expect(profit.profit_pct).toBe(20);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/gold-profit.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement profit logic, master people, and purchase flow**

- Pure function `calculateGoldProfit`.
- Master orang di `/emas/settings` (CRUD `people`).
- Halaman riwayat `/emas`: list card mobile dengan indikator profit ▲/▼, summary total aset per orang.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/gold-profit.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/gold/ src/app/emas/ src/components/gold/ tests/gold-profit.test.ts
git commit -m "feat: implement gold purchase profit calculation and asset summary"
```

---

### Task 7: Modul Emas - Fitur Jual Emas & Soft Delete (F2.8)

**Files:**
- Create: `src/components/gold/SellModal.tsx`
- Modify: `src/lib/gold/actions.ts`, `src/app/emas/page.tsx`
- Test: `tests/gold-sell.test.ts`

**Interfaces:**
- Consumes: `gold_purchases`
- Produces: Aksi "Jual" per keping emas, modal input `sold_at` dan `sold_price_per_piece`, soft delete dari list aktif, pengecualian dari total aset aktif.

- [ ] **Step 1: Write unit test for sold gold exclusion logic**

Create `tests/gold-sell.test.ts` memastikan keping dengan `sold_at != null` tidak dimasukkan dalam total aset aktif dan profit berjalan.

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/gold-sell.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement SellModal & action `sellGoldPiece`**

- Validasi: `sold_at >= purchase_date` dan tidak di masa depan.
- Update `sold_at` dan `sold_price_per_piece`.
- List default memfilter `sold_at IS NULL`. Tambah toggle filter opsional "Tampilkan yang sudah terjual".

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/gold-sell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/gold/SellModal.tsx src/lib/gold/actions.ts src/app/emas/page.tsx tests/gold-sell.test.ts
git commit -m "feat: implement gold sell action and soft delete"
```

---

### Task 8: Modul Zakat Mal - Core Calculation Engine & Nisab (F3.1 - F3.4)

**Files:**
- Create: `src/lib/zakat/engine.ts`, `src/lib/zakat/hijri.ts`
- Test: `tests/zakat-engine.test.ts`

**Interfaces:**
- Produces: `calculateZakat(...)`, `getHijriRamadhanDate(...)`, `resolveZakatGoldValue(...)`, pembulatan chip pembayaran (10rb/50rb/100rb).

- [ ] **Step 1: Write unit tests for Zakat engine and sold gold cutoff**

Create `tests/zakat-engine.test.ts`:
- Uji total = Σ saldo rekening + emas.
- Uji nisab = 85 × harga jual 1g Galeri24.
- Uji wajib zakat (total ≥ nisab -> 2.5%, total < nisab -> belum wajib).
- Uji keping emas terjual: keping yang dijual *sebelum* 1 Ramadhan dikecualikan, keping yang dijual *setelah* 1 Ramadhan tetap dihitung.
- Uji chip pembulatan (contoh: zakat 2.637.054 -> opsi 2.640.000 / 2.650.000 / 2.700.000).

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/zakat-engine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Zakat engine & Hijri converter**

- Implementasi kalkulasi murni di `src/lib/zakat/engine.ts`.
- Konversi kalender Umm al-Qura di `src/lib/zakat/hijri.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/zakat-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/zakat/ tests/zakat-engine.test.ts
git commit -m "feat: implement zakat calculation engine and nisab rules"
```

---

### Task 9: Modul Zakat Mal - UI & Komparasi Antar-Tahun (F3.5 - F3.6)

**Files:**
- Create: `src/app/zakat/page.tsx`, `src/app/zakat/settings/page.tsx`
- Create: `src/components/zakat/YearModal.tsx`, `src/components/zakat/CompareTwoYears.tsx`, `src/components/zakat/ZakatSpreadsheetTable.tsx`, `src/components/zakat/ZakatTrendChart.tsx`
- Test: `tests/zakat-ui.test.ts`

**Interfaces:**
- Consumes: `src/lib/zakat/engine.ts`
- Produces: Halaman Zakat per orang, form modal input saldo tahun baru, perbandingan 2 tahun mobile-first (Opsi B), tabel spreadsheet & grafik tren di desktop.

- [ ] **Step 1: Write component/helper test for year comparison diff**

Create `tests/zakat-ui.test.ts` memverifikasi delta nominal dan persentase perubahan per rekening antar-tahun.

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/zakat-ui.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Zakat pages & comparison components**

- `/zakat`: selector orang di atas, tahun aktif, input saldo via modal/drawer dengan copy rekening otomatis dari tahun sebelumnya.
- HP (< 640px): Tampilan utama B (dua tahun berdampingan dengan badge ▲/▼).
- Desktop (> 1024px): Tabel spreadsheet horizontal scrollable + grafik tren.
- `/zakat/settings`: kelola daftar rekening per orang.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/zakat-ui.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/zakat/ src/components/zakat/ tests/zakat-ui.test.ts
git commit -m "feat: implement zakat ui and year comparison views"
```

---

### Task 10: PWA Integration & Mobile-First Polish (F0.5)

**Files:**
- Create: `public/manifest.json`, `public/icons/`, `src/app/offline/page.tsx`, `src/sw.ts`
- Modify: `next.config.mjs`, `src/app/layout.tsx`
- Test: `tests/pwa.test.ts`

**Interfaces:**
- Produces: PWA manifest, service worker caching static assets, offline fallback page, audit safe-area dan touch target.

- [ ] **Step 1: Write PWA manifest validation test**

Create `tests/pwa.test.ts` memverifikasi manifest.json memiliki required keys (`name`, `short_name`, `icons`, `start_url`, `display: standalone`).

- [ ] **Step 2: Run test to verify failure**

Run: `rtk npm test tests/pwa.test.ts`
Expected: FAIL

- [ ] **Step 3: Setup `@serwist/next`, generate icons, manifest, and offline shell**

- Konfigurasi `@serwist/next` di `next.config.mjs`.
- Buat app icons (192x192, 512x512) di `public/icons/`.
- Daftarkan metadata PWA di `src/app/layout.tsx`.
- Pastikan tap target min 44px dan CSS `env(safe-area-inset-bottom)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npm test tests/pwa.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/ src/app/offline/ next.config.mjs src/app/layout.tsx tests/pwa.test.ts
git commit -m "feat: setup pwa manifest service worker and offline shell"
```

---

### Task 11: End-to-End Verification & Changelog

**Files:**
- Create: `changelogs/CHANGELOG_25_10_2026.md`
- Modify: `PRD.md` (update status menjadi Approved / Implementation Complete)

- [ ] **Step 1: Run complete Jest test suite**

Run: `rtk npm test -- --coverage`
Expected: ALL PASS, 100% test passing

- [ ] **Step 2: Build verification**

Run: `rtk npm run build`
Expected: Next.js build succeeds with 0 lint/type errors.

- [ ] **Step 3: Create Changelog**

Buat summary pengerjaan di `changelogs/CHANGELOG_25_10_2026.md` sesuai aturan Rule 10 `AGENTS.md`.

- [ ] **Step 4: Commit**

```bash
git add changelogs/ PRD.md
git commit -m "docs: add changelog and update prd status"
```
