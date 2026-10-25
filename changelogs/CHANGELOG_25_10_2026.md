# CHANGELOG - 25-10-2026

## Ringkasan Perubahan (Catat-Mencatat v0.4.1)

Implementasi native MVP aplikasi PWA pribadi **Catat-Mencatat** sesuai `PRD.md` dan `DESIGN.md`.

### Fitur & Modul:

1. **Scaffolding & Design System**:
   - Next.js 14 (App Router), TypeScript, Jest test runner.
   - Design system tokens: Public Sans font, steel blue (`#4682b4`), hairline borders, dark/light theme support.
   - 10 unit test suites dengan 26 test cases passing.

2. **Supabase Schema & Security**:
   - 8 tabel database Postgres dengan Row Level Security (RLS) aktif: `people`, `motors`, `motor_services`, `gold_prices`, `gold_purchases`, `zakat_accounts`, `zakat_years`, `zakat_balances`.
   - SSR auth client, session handling, dan redirect middleware.

3. **Modul Servis Motor (`/motor`)**:
   - Riwayat servis dengan card mobile-first dan tabel desktop.
   - Bottom sheet modal untuk input servis cepat dengan sticky field dan tombol "Simpan & Tambah Lagi".
   - Filter berdasarkan motor dan rentang tanggal.
   - Master data motor (`/motor/settings`).

4. **Modul Emas Fisik (`/emas`)**:
   - Scraper & parser HTML resilient harga emas Galeri24 (`/lib/gold/scraper.ts`).
   - Endpoint Vercel Cron `/api/cron/sync-gold` untuk penarikan harga otomatis harian dengan fallback status `gagal` jika terjadi error.
   - Halaman lihat & edit harga emas manual (`/emas/prices`).
   - Portofolio keping emas dengan indikator profit berjalan (▲/▼) terhadap harga buyback terkini.
   - Fitur jual keping emas & soft delete (`sold_at`, `sold_price_per_piece`).
   - Master pemilik emas / keluarga (`/emas/settings`).

5. **Modul Zakat Mal (`/zakat`)**:
   - Engine kalkulasi zakat mal murni: total harta, nisab 85 gram emas, syarat wajib zakat (2.5%).
   - Konversi kalender Hijriah ke 1 Ramadhan Masehi (`/lib/zakat/hijri.ts`).
   - Logika cutoff keping emas terjual: keping yang dijual setelah 1 Ramadhan tetap masuk haul tahun berjalan.
   - Chip pembulatan pembayaran zakat (+10rb, +50rb, +100rb).
   - Tampilan komparasi dua tahun berdampingan untuk mobile (Opsi B) dan tabel spreadsheet horizontal + grafik tren untuk desktop.
   - Master data rekening bank / tabungan per orang (`/zakat/settings`).

6. **PWA Standalone & Mobile Polish**:
   - Web App Manifest (`/public/manifest.json`) dengan standalone display.
   - PWA app icons (192x192 dan 512x512).
   - Service worker offline cache (`/public/sw.js`) dan halaman fallback offline (`/offline`).
   - Safe-area insets dan minimum touch target 44px di seluruh interaksi.

7. **Theme Switcher (Dark / Light / System Mode)**:
   - Komponen `ThemeToggle` (`src/components/ThemeToggle.tsx`) dengan dukungan 3 mode: Terang (`light`), Gelap (`dark`), dan Sistem (`system`).
   - Penambahan CSS rules `[data-theme="light"]` dan `[data-theme="dark"]` di `src/app/globals.css` dengan fallback preferensi sistem.
   - Script anti-flicker (anti-FOUC) pada `<head>` di `src/app/layout.tsx` untuk rendering instan tanpa kedipan warna.
   - Sinkronisasi event `matchMedia` otomatis saat berada pada mode Sistem.
   - Persistensi state pilihan tema di `localStorage` (`catat_theme`).
   - Integrasi tombol toggle tema dengan tap target 44px di header dashboard (`/`), Servis Motor (`/motor`), Emas Fisik (`/emas`), dan Zakat Mal (`/zakat`).
   - Unit test Jest lengkap di `tests/theme.test.ts` (7 test cases).

8. **Open-Source License**:
   - Lisensi MIT resmi ditambahkan di file `LICENSE` (Copyright 2026 Andrianto Nur Iskandar).
   - Penambahan atribut `"license": "MIT"` pada `package.json`.
   - Dokumentasi lisensi diperbarui pada `PRD.md`.
   - Unit test verifikasi lisensi di `tests/license.test.ts` (2 test cases passing).

9. **Footer Aplikasi (Semua Halaman)**:
   - Komponen `Footer` (`src/components/Footer.tsx`) dengan semantik `<footer>` dan styling *mobile-first*.
   - Menampilkan nama aplikasi "Catat-Mencatat", deskripsi fungsi, tahun berjalan dinamis, dan rujukan lisensi MIT.
   - Mengadopsi padding safe area bawah (`calc(1.25rem + env(safe-area-inset-bottom))`) untuk perangkat mobile/PWA.
   - Integrasi sticky bottom flex layout di `src/app/layout.tsx` dan `src/app/globals.css`.
   - Penyesuaian tata letak kontainer halaman login (`/login`), home (`/`), motor, emas, zakat, dan offline ke `flex: 1` agar footer konsisten berada di dasar layar.
   - Unit test Jest lengkap di `tests/footer.test.tsx` (3 test cases passing).

10. **Impeccable Audit & Aksesibilitas (WCAG / Mobile Ergonomics)**:
   - Viewport zoom: Menghapus pembatasan `userScalable: false` dan `maximumScale: 1` di `src/app/layout.tsx` demi kepatuhan WCAG 1.4.4 Resize Text.
   - WAI-ARIA modal dialog: Seluruh modal bottom-sheet (`ServiceModal`, `PurchaseModal`, `SellModal`, `YearModal`) kini dilengkapi `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, listener tombol `Escape`, dan penutup luar modal.
   - Target sentuhan (Touch Targets): Tombol penutup modal dan pill tab pemilih pemilik zakat ditingkatkan ke target minimal 44x44px dengan `aria-label="Tutup"`.
   - Form accessibility: Semua field input/select/textarea di formulir login dan modal dihubungkan secara eksplisit dengan `<label htmlFor="...">` dan `id="..."`, serta mempertahankan visual focus indicator.
   - Desain token semantik status: Menambahkan variabel warna status `--color-danger-bg`, `--color-danger-text`, `--color-success-bg`, dan `--color-success-text` di `src/app/globals.css` dengan varian adaptif mode terang dan gelap.
   - Grid responsif: Kartu ringkasan statistik servis motor diubah ke `repeat(auto-fit, minmax(100px, 1fr))` agar angka tidak terpotong pada layar HP sempit (<360px).
   - Sinkronisasi `DESIGN.md`: Memperbarui dokumentasi desain system agar mencerminkan aplikasi Catat-Mencatat.
   - Unit tests: Menambahkan 5 test suite baru (`a11y-layout.test.ts`, `theme-tokens.test.ts`, `modal-a11y.test.tsx`, `responsive-targets.test.ts`, `design-doc.test.ts`). Total test suite kini 18 passing (46 unit tests passing).

11. **Impeccable Polish (Focus Rings & Card Ergonomics)**:
   - Outline fokus global: Menambahkan `:focus-visible` dengan outline 2px steel blue di `globals.css` agar navigasi keyboard konsisten di semua halaman.
   - Target sentuhan aksi card: Mengoptimalkan tombol Edit, Hapus, dan Jual pada `ServiceCard` dan `GoldCard` menjadi minimal 44x44px.
   - Badge status semantik: Mengganti warna hardcoded badge 'Terjual' pada `GoldCard` dengan token `--color-danger-bg` dan `--color-danger-text`.
   - Kontras footer: Menghapus reduksi opacity teks hak cipta pada footer agar kontras teks tetap tajam pada mode gelap.
   - Unit tests: Menambahkan `tests/polish.test.tsx` (3 test cases). Total 19 test suites passing (49 tests passing).

12. **Desktop Modal Centering & Dropdown Arrow Spacing**:
   - Tata letak modal responsif:
     - Mobile (< 640px): Tetap menggunakan ergonomi bottom-sheet dengan rounded corner atas dan padding safe area bawah (`env(safe-area-inset-bottom)`).
     - Desktop (≥ 640px): Modal diposisikan tepat di tengah layar vertikal dan horizontal (`align-items: center`), dilengkapi rounded corner menyeluruh (`var(--radius-xl)`) dan elevasi bayangan halus.
     - Terapkan `.modal-overlay` dan `.modal-content` pada semua modal aplikasi: `PurchaseModal`, `SellModal`, `ServiceModal`, dan `YearModal`.
   - Dropdown arrow styling (`.form-select`):
     - Mengganti panah native OS yang mepet tepi kanan dengan panah SVG chevron custom.
     - Memberikan jarak aman dari tepi kanan (`background-position: right 1rem center`) dan padding kanan teks yang lega (`padding-right: 2.5rem`) agar isi teks tidak menabrak ikon panah.
     - Stroke panah otomatis menyesuaikan dengan tema terang dan tema gelap.
     - Diterapkan pada elemen `<select>` di `PurchaseModal` (`gold-person`, `gold-brand`) dan `ServiceModal` (`service-motor`).
   - Pengujian: Memperbarui `tests/modal-a11y.test.tsx` dengan pengujian kelas modal responsif, styling dropdown arrow, dan desktop media query rules (52 unit tests passing).

13. **Textarea Resize Bounds & Backdrop Click Drag Guard**:
   - Batasan resize textarea (`.form-textarea`):
     - Membatasi arah resize hanya vertikal (`resize: vertical`), mencegah pelebaran tak sengaja secara horizontal.
     - Menetapkan `min-height: 60px` dan `max-height: 160px` agar textarea tidak bisa ditarik melebihi tinggi container modal dialog.
     - Diterapkan pada `PurchaseModal` (`gold-notes`) dan `ServiceModal` (`service-notes`).
   - Backdrop click drag guard:
     - Menggunakan referensi `isBackdropClickRef` yang hanya bernilai `true` jika event `onMouseDown` berawal langsung di `.modal-overlay`.
     - Mencegah penutupan modal otomatis ketika user menyeleksi teks atau menarik resize handle textarea lalu melepaskan klik mouse (`mouseUp`) di atas area backdrop overlay.
     - Diimplementasikan di semua modal: `PurchaseModal`, `SellModal`, `ServiceModal`, dan `YearModal`.
   - Unit tests: Menambahkan verifikasi `.form-textarea`, batasan resize `max-height: 160px`, dan `resize: vertical` di `tests/modal-a11y.test.tsx` (52 unit tests passing).

14. **Pemisah Ribuan pada Seluruh Form Angka (Thousand Separator)**:
    - Helper formatting & parsing (`src/lib/number.ts`):
      - Fungsi `formatThousand()` untuk memformat angka dengan pemisah titik ribuan (`1.500.000`) dan pemisah desimal koma (`0,5`).
      - Fungsi `parseThousand()` untuk mengembalikan string terformat ke tipe `number` murni untuk state dan database.
    - Komponen `NumberInput` (`src/components/NumberInput.tsx`):
      - Menggantikan elemen `<input type="number">` yang secara native memblokir titik separator.
      - Menggunakan `type="text"` dipadukan `inputMode="numeric"` (atau `inputMode="decimal"`) agar keyboard numerik pada smartphone tetap muncul otomatis saat field disentuh.
      - Placeholder angka otomatis disesuaikan dengan format ribuan.
    - Integrasi form:
      - **Modul Motor**: Field Kilometer (`service-km`) dan Biaya Servis (`service-cost`) di `ServiceModal.tsx`.
      - **Modul Zakat**: Field Harga Emas Acuan (`zakat-gold-price`) dan Saldo Setiap Rekening (`zakat-acc-{id}`) di `YearModal.tsx`.
      - **Modul Emas**: Field Gramasi Emas (`gold-weight`), Jumlah Keping (`gold-pieces`), dan Harga Beli (`gold-price`) di `PurchaseModal.tsx`, serta Harga Jual (`sell-price`) di `SellModal.tsx`.
      - **Harga Emas Harian**: Field Harga Jual dan Buyback manual di `src/app/emas/prices/page.tsx`.
    - Unit tests: Menambahkan `tests/number-input.test.tsx` yang menguji formatting ribuan, desimal koma, parsing angka, dan atribut mobile keypad `inputMode` (total 20 test suites, 58 tests passing).

15. **Penampilan Versi Aplikasi pada Footer (v0.4.4)**:
    - Menampilkan badge dinamis versi aplikasi (`v{version}`) bersumber langsung dari `package.json` di komponen `Footer` (`src/components/Footer.tsx`).
    - Desain mobile-first dengan pill badge berukuran kompak, padding `0.075rem 0.4rem`, font size `0.6875rem`, dan warna variabel CSS tema (`var(--bg-input)`, `var(--border-card)`, `var(--text-muted)`).
    - Unit tests: Menambahkan test case pada `tests/footer.test.tsx` untuk memastikan render string versi aplikasi dari `package.json` selalu hadir di markup footer (total 20 test suites, 59 tests passing).

16. **Logo Aplikasi, Favicon, dan Icon Mobile PWA (v0.4.5)**:
    - **Desain Logo Sederhana & Representatif**:
      - Mengusung metafora pencatatan/jurnal: buku catatan spiral berlatar Steel Blue (`#4682b4`), baris checklist aktif dengan checkmark hijau (`#10b981`), dan pensil aksen emas (`#f59e0b`) yang merepresentasikan aksi mencatat.
      - Master vektor tersedia di `public/logo.svg` dan `public/favicon.svg`.
      - Komponen React `Logo` (`src/components/Logo.tsx`) mandiri, scalable, dan memiliki atribut aksesibilitas semantik (`role="img"`, `aria-label="Logo Catat-Mencatat"`).
    - **Integrasi Halaman Login**:
      - Menyematkan `Logo` di bagian atas card form masuk pada `src/app/login/page.tsx` dengan tata letak centering responsif mobile (`size={60}`).
    - **Favicon & Apple Touch Icon**:
      - Menyediakan `public/favicon.ico` (32x32 MS ICO) dan `public/favicon.svg` (vektor modern).
      - Menyediakan `public/apple-touch-icon.png` (180x180 RGBA) untuk iOS home screen.
      - Mendaftarkan icon di `<head>` dan Next.js `metadata.icons` pada `src/app/layout.tsx`.
    - **PWA Mobile Home Screen**:
      - Memperbarui aset icon PWA resolusi tinggi: `public/icons/icon-192x192.png` dan `public/icons/icon-512x512.png`.
      - Menambahkan atribut `"purpose": "any maskable"` di `public/manifest.json`.
    - **Unit Tests**:
      - Menambahkan `tests/logo.test.tsx` yang memverifikasi render komponen `Logo`, custom size, ketersediaan seluruh file aset icon, dan integrasi di `LoginPage` (total 21 test suites, 63 tests passing).
