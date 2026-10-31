# CHANGELOG - 31-10-2026

## Ringkasan Perubahan: Impeccable Audit Fixes (P1, P2, P3) - Aksesibilitas, Semantik Tema & Ergonomi Mobile

Menyelesaikan seluruh temuan audit teknis frontend lintas dimensi (A11y WCAG AA, Theming & Tokens, Responsive Design, Implementation Integrity, Performance & Polish).

### Detail Perubahan:

1. **Aksesibilitas & Standar WCAG AA (P1)**:
   - **Perbaikan Kontras Warna (WCAG AA 1.4.3)**: Mengganti penggunaan teks hardcoded `#10b981` (kontras 2.53:1 gagal WCAG) ke semantic token `var(--color-success-text)` (`#15803d` mode terang, `#6ee7b7` mode gelap) pada `GoldCard.tsx`, `CompareTwoYears.tsx`, `YearModal.tsx`, `emas/page.tsx`, `emas/prices/page.tsx`, dan halaman settings.
   - **Eliminasi Landmark `<main>` Ganda (WCAG A 1.3.1)**: Mengubah pembungkus `RootLayout` (`src/app/layout.tsx`) menjadi `<div className="app-content">` sehingga tag `<main>` menjadi unik dan dimiliki masing-masing route halaman Next.js.
   - **Aksesibilitas Form & Relasi Label (WCAG A 4.1.2)**: Memasangkan `<label htmlFor="...">` dan `id` pada seluruh input form di `emas/settings/page.tsx`, `motor/settings/page.tsx`, dan `ServiceFilter.tsx`.
   - **Accessible Name Tombol & Link (WCAG A 2.4.4)**: Menambahkan `aria-label` deskriptif pada seluruh link kembali (`ArrowLeft`), tombol logout (`LogOut`), dan tombol header navigasi.

2. **Theming, Ergonomi Mobile & Dialog (P2)**:
   - **Touch Target Mobile (WCAG 2.5.5)**: Menstandarisasi tombol pill filter motor (`ServiceFilter.tsx`), selector pemilik zakat (`zakat/settings/page.tsx`), dan input filter tanggal ke tinggi minimal 44x44px (`minHeight: 44px`).
   - **Semantic Warning Tokens**: Menambahkan `--color-warning-bg` dan `--color-warning-text` pada `globals.css` untuk mode terang dan gelap. Mengganti hardcoded `#fef3c7` / `#d97706` di `GoldCard.tsx` agar badge emas tidak menyilaukan di dark mode.
   - **Keyboard Focus Trap (WCAG AA 2.4.3)**: Memasang penangkap siklus fokus `Tab` dan `Shift+Tab` di dalam modal dialog (`PurchaseModal`, `ServiceModal`, `SellModal`, `YearModal`) agar fokus keyboard tidak bocor ke latar belakang halaman saat modal aktif.
   - **Semantik Chart & Tabel**: Menambahkan `role="img"` dan `aria-label` pada `ZakatTrendChart.tsx`, serta melengkapi `scope="col"`, `scope="row"`, dan `<caption>` pada `ZakatSpreadsheetTable.tsx`.
   - **Normalisasi Ramp DESIGN.md**: Menambahkan ukuran tipografi `sub-body` (`0.8125rem`), `micro` (`0.6875rem`), `subhead` (`0.9375rem`), `title-lg` (`1.25rem`), dan radius token ke `DESIGN.md`. Hasil detektor `impeccable detect` turun dari 131 menjadi 0 temuan.

3. **Motion & Animasi Keyframe (P3)**:
   - **Keyframe `.animate-spin`**: Menambahkan `@keyframes spin` dan class `.animate-spin` ke `globals.css` sehingga indikator refresh harga emas harian berputar proporsional saat sinkronisasi berjalan.
   - **Prefers-Reduced-Motion**: Menambahkan media query `@media (prefers-reduced-motion: reduce)` pada `globals.css` untuk menghormati preferensi pengguna yang sensitif terhadap pergerakan visual.

4. **Pengujian Unit & Verifikasi**:
   - Menambahkan test suite komprehensif `tests/a11y-audit-fixes.test.tsx` (13 test cases) mencakup verifikasi kontras, keunikan landmark `<main>`, label input form, touch target min 44px, token warning, aksesibilitas chart & tabel, dan keyframe animasi.
   - Seluruh 32 test suites (137 test cases) lulus 100%.
   - Build produksi Next.js (`npm run build`) sukses tanpa error TypeScript/Turbopack.
   - Detektor Impeccable mengonfirmasi 0 temuan drift.

---

## Ringkasan Perubahan: Impeccable Polish Pass - Final Quality & Keyboard Focus Hygiene

Melakukan pass polish akhir pada input control dan combobox:
- Menstandarisasi input login (`login/page.tsx`) dan `WorkshopAutocomplete` menggunakan class terpadu `.form-input` dengan `:focus-visible` outline terpusat.
- Menghapus inline focus styling hacks dan outline bypass.
- Memverifikasi konsistensi seluruh empty states dan validasi produksi.


---

## Ringkasan Perubahan: Modul Saldo Akhir Tahun & Reminder Telegram Tahunan (30 Desember)

Menambahkan modul baru ke-4 **Saldo Akhir Tahun** (`/saldo-tahun`) untuk mencatat dan memvisualisasikan perkembangan saldo rekening dikurangi pengeluaran per tahun Masehi (menggantikan spreadsheet 2018–2025), serta fitur **Reminder Telegram Tahunan setiap 30 Desember** yang terintegrasi dengan Vercel Cron.

### Detail Perubahan:

1. **Skema Database & Migrasi Supabase (`supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql`, `supabase/migrations/20261025000000_init_schema.sql`)**:
   - Tabel `public.annual_balances`: Menyimpan rekap saldo tahunan per orang (`person_id`), `masehi_year`, `total_accounts`, `expense_amount`, `net_balance`, dan `notes`, lengkap dengan RLS policy (`auth.uid() = user_id`) dan constraint unik `(person_id, masehi_year)`.
   - Tabel `public.annual_balance_items`: Menyimpan rincian saldo per rekening (`zakat_accounts`), dengan foreign key cascade dan RLS berbasis `annual_balances`.
   - Tabel `public.telegram_settings`: Menyimpan kredensial Telegram (`bot_token`, `chat_id`, `reminder_message`, `is_enabled`, `last_sent_at`) per pengguna terautentikasi dengan RLS policy.
   - Konfigurasi `vercel.json`: Menjadwalkan cron harian harga emas `/api/cron/sync-gold` (`0 2 * * *`) dan cron pengingat Telegram tahunan `/api/cron/telegram-reminder` (`0 2 30 12 *`).

2. **Engine Perhitungan & Komparasi Antar-Tahun (`src/lib/saldo-tahun/engine.ts`)**:
   - Fungsi `calculateAnnualBalance`: Menghitung total saldo seluruh rekening dikurangi pengeluaran dengan presisi pembulatan 2 digit desimal sen.
   - Fungsi `computeAnnualBalanceDeltas`: Menghitung selisih nominal dan persentase perubahan (▲/▼) antar-tahun terurut descending secara aman (mencegah error `NaN`/`Infinity` untuk basis 0 atau tahun pertama).
   - Fungsi `paginateAnnualBalances` & `suggestNextMasehiYear`: Menyediakan progressive pagination 5 item per halaman dan saran tahun berikutnya secara otomatis.

3. **Antarmuka Pengguna & Komponen UI (`/saldo-tahun`)**:
   - `AnnualBalanceTrendChart`: Visualisasi grafik garis SVG responsif dengan area bayangan kurva, titik data tahunan, label compact rupiah, dan aksesibilitas `role="img"`.
   - `AnnualBalanceAccordionList`: Kartu ringkasan tahunan dengan interaksi inline accordion (Opsi A) saat baris di-klik untuk membuka rincian rekening, baris total & pengeluaran, serta tombol aksi Edit dan Hapus.
   - `AnnualBalanceModal`: Formulir input responsif (bottom-sheet di mobile, modal dialog di desktop) dengan input Tahun Masehi, split input nominal ribuan + 2 digit desimal sen (`,00`), input pengeluaran, catatan, dan ringkasan kalkulasi real-time.
   - `src/app/page.tsx`: Menambahkan modul ke-4 "Saldo Akhir Tahun" pada beranda launcher dengan warna aksen `#0ea5e9`.

4. **Tahap 2: Reminder Telegram & Pengaturan Modul (`src/lib/telegram/sender.ts`, `/saldo-tahun/settings`)**:
   - Library `validateTelegramConfig` & `sendTelegramMessage`: Validasi kredensial dan pengiriman pesan via Telegram Bot API (`https://api.telegram.org/bot<token>/sendMessage`) dengan penanganan error yang andal.
   - Route `POST /api/telegram/test`: Endpoint pengujian notifikasi Telegram bagi pengguna terautentikasi.
   - Route `GET /api/cron/telegram-reminder`: Endpoint cron tahunan 30 Desember yang dilindungi `CRON_SECRET` untuk memicu pengiriman pesan reminder ke seluruh akun aktif.
   - Halaman `/saldo-tahun/settings`: Formulir pengaturan Telegram lengkap dengan tombol "Simpan Pengaturan" dan "Kirim Tes Sekarang", serta pengelolaan master rekening (`zakat_accounts`).

5. **Pengujian Unit & TDD (`tests/`)**:
   - `tests/schema.test.ts`: Memvalidasi definisi tabel baru, RLS, dan cron di `vercel.json`.
   - `tests/annual-balance-engine.test.ts`: Memvalidasi kalkulasi Excel 2018, presisi desimal 2 digit, dan delta komparasi.
   - `tests/annual-balance-ui.test.tsx`: Memvalidasi render SVG Line Chart, Accordion List, Modal Input, dan kartu beranda.
   - `tests/telegram-reminder.test.tsx`: Memvalidasi helper Telegram, endpoint cron, dan halaman pengaturan.
   - `tests/auth-guard.test.ts`: Memvalidasi proteksi middleware untuk `/saldo-tahun` dan `/saldo-tahun/settings`.

6. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui Executive Summary, F0.2 Halaman Utama, Bagian 5.4 Fitur Saldo Akhir Tahun & Telegram, Scope, dan Model Data.


---

## Ringkasan Perubahan: Interaktivitas Hover/Tap Tooltip Saldo pada Dot Grafik Saldo Akhir Tahun

Menambahkan fitur interaktif pada titik data (dot) grafik tahunan di `AnnualBalanceTrendChart`:
- **Interaktivitas Desktop & Mobile**:
  - Saat dot di-hover (desktop) atau di-tap (mobile), muncul kartu tooltip SVG yang memuat Tahun Masehi dan saldo akhir tahun lengkap berformat Rupiah (`Rp X.XXX.XXX`).
  - Menampilkan garis pemandu vertikal (*vertical guideline*) dan lingkaran halo aktif pada dot terpilih.
  - Memperlebar target sentuhan lingkaran tak terlihat (`r=18`) untuk kenyamanan penggunaan di layar ponsel (*mobile touch ergonomis*).
- **Aksesibilitas & Keyboard Navigation**:
  - Menyertakan native SVG `<title>` pada setiap dot.
  - Menambahkan atribut WAI-ARIA `role="button"`, `tabIndex={0}`, dan `aria-label` deskriptif.
  - Navigasi keyboard penuh menggunakan tombol `Enter` dan `Space` untuk menampilkan/menyembunyikan tooltip saldo.
- **Pengujian & Build**:
  - Menambahkan test case TDD interaktivitas dot di `tests/annual-balance-ui.test.tsx`.
  - 35 test suite (156 unit tests) lulus 100%.
  - Build produksi Next.js terverifikasi sukses.

---

## Ringkasan Perubahan: Impeccable Audit Batch Fixes (Harden, Adapt, Optimize, Polish)

Menyelesaikan seluruh temuan P1/P2/P3 hasil audit Impeccable untuk menjamin kesempurnaan teknis, aksesibilitas, ergonomi mobile, dan performa aplikasi:

1. **Accessibility & Theming Hardening (`/impeccable harden`)**:
   - **Non-destructive Reduced Motion**: Mengganti wipe agresif `0.01ms !important` pada `@media (prefers-reduced-motion: reduce)` di `globals.css` dengan durasi aman `0.001s !important`, mempertahankan feedback interaktif dan mematikan perputaran `.animate-spin` tanpa merusak transisi status.
   - **Sinkronisasi Dark Mode Badge**: Mengganti hardcoded hex light (`#fee2e2`, `#fef3c7`, `#dcfce7`) di `emas/prices/page.tsx` dengan CSS tokens semantik `var(--color-danger-bg)`, `var(--color-warning-bg)`, dan `var(--color-success-bg)` beserta warna teks pendampingnya.
   - **Perbaikan Struktur ARIA SVG**: Memindahkan `role="img"` dari container `<div>` di `AnnualBalanceTrendChart` ke sub-elemen grafik `<g role="img">`, sehingga titik data interaktif `<g role="button">` tidak lagi tertelan oleh container gambar.
   - **Pembersihan Hardcoded Hex**: Mengganti `#ef4444` pada tombol hapus `ServiceCard` dengan `var(--color-danger-text)` dan tombol simpan `SellModal` dengan `var(--color-primary)`.

2. **Mobile Touch Targets & Standardisasi Form (`/impeccable adapt`)**:
   - **Standardisasi Input Modal**: Seluruh field input dan select pada `ServiceModal`, `PurchaseModal`, dan `YearModal` distandarisasi menggunakan class `.form-input` / `.form-select` dengan tinggi sentuhan minimal `minHeight: 44px`.
   - **Hit-area Chevron Autocomplete**: Memperbesar target klik tombol panah dropdown di `WorkshopAutocomplete` ke minimal 44x44px.
   - **Target Tap Checkbox Telegram**: Menambahkan touch padding min 44px pada label toggle pengingat tahunan di `saldo-tahun/settings/page.tsx`.
   - **Tombol Reset Filter**: Memastikan tombol Reset Filter pada `emas/prices/page.tsx` memiliki `minHeight: 44px`.

3. **Optimasi Performa & Bundle Client (`/impeccable optimize`)**:
   - **Decoupling package.json**: Memisahkan konstanta versi ke `src/lib/version.ts`, mencegah seluruh pohon `package.json` ter-bundle ke chunk JavaScript client `Footer.tsx`.
   - **Memoization Agregasi Keuangan**: Membungkus komputasi delta dan paginasi di `saldo-tahun/page.tsx` serta ringkasan portofolio emas di `emas/page.tsx` dengan `useMemo`.

4. **Hierarki Heading Semantik (`/impeccable polish`)**:
   - Menata ulang heading pada `saldo-tahun/page.tsx` dan `AnnualBalanceTrendChart.tsx` agar urut `<h1>` -> `<h2>` -> `<h3>` tanpa melompati level `<h2>`.

5. **Pengujian & Verifikasi**:
   - Menambahkan 4 file test baru: `tests/audit-harden-fixes.test.tsx`, `tests/audit-adapt-targets.test.tsx`, `tests/audit-optimize.test.tsx`, `tests/audit-polish-hierarchy.test.tsx`.
   - Seluruh 39 test suites (173 unit tests) lulus 100%.
   - Detektor Impeccable mengonfirmasi 0 temuan.
