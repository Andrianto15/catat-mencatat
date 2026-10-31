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

