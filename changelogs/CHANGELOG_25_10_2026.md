# CHANGELOG - 25-10-2026

## Ringkasan Perubahan (Catat-Mencatat MVP v0.1.0)

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
