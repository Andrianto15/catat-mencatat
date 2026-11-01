# CHANGELOG - 01-11-2026

## Ringkasan Perubahan: Remediasi Temuan Security Audit (Run-1)

Menyelesaikan seluruh 7 temuan keamanan (`needs_validation`) yang teridentifikasi dalam sesi Security Audit menyeluruh pada aplikasi `catat-mencatat`.

### Detail Perubahan:

1. **Perbaikan Otentikasi Cron & Kompatibilitas UI Sinkronisasi Emas (`cron-sync-gold-missing-cron-secret-fail-open`)**:
   - Memperbaiki endpoint `GET /api/cron/sync-gold` agar bersifat fail-closed (menolak akses tanpa otentikasi dengan status 401 saat `CRON_SECRET` belum diset).
   - Menerapkan mekanisme dual-auth: mengizinkan request yang membawa Bearer token `CRON_SECRET` (panggilan scheduler Vercel Cron) atau sesi login Supabase yang sah (tombol "Tarik Live" pada UI browser).
   - Menambahkan deklarasi `CRON_SECRET` pada `.env.example`.

2. **Pengerasan Scraper Emas & Pencegahan Penimpaan Data Valid (`gold-scraper-unbounded-fetch-and-failure-upsert-overwrite`)**:
   - Menambahkan timeout jaringan 10 detik (`AbortSignal.timeout(10000)`) dan pembatasan ukuran payload maksimal 2MB pada `fetchLiveGaleri24Prices()`.
   - Mengganti regex heading HTML berpotensi backtracking polinomial dengan parser linear yang aman dari serangan ReDoS.
   - Mengamankan proses upsert kegagalan di route cron agar tidak menimpa harga emas valid hari ini dengan status gagal/null.
   - Memperbaiki pemetaan buyback di `src/app/emas/page.tsx` agar mengabaikan entri null dan tetap mengambil harga valid dari hari sebelumnya.

3. **Validasi Telegram Bot Token & Proteksi CSRF (`telegram-bot-token-url-path-injection-and-csrf`)**:
   - Memvalidasi format Telegram Bot Token menggunakan regex ketat `/^[0-9]+:[A-Za-z0-9_-]+$/` dan Chat ID (`/^-?[0-9]+$/` atau `@channel`) guna mencegah injeksi path traversal (`../`), query parameter (`?`), atau fragment (`#`) ke endpoint Telegram Bot API.
   - Menolak token atau chat ID yang mengandung karakter pemisah URL terlarang sebelum pembuatan URL outbound di `sendTelegramMessage`.
   - Memasang validasi wajib `Content-Type: application/json` (status 415 jika tidak sesuai) serta proteksi CSRF Same-Origin dan `Sec-Fetch-Site` pada route `POST /api/telegram/test`.

4. **Proteksi Single-Owner di Level Aplikasi (`supabase-unrestricted-signup-and-missing-owner-allowlist`)**:
   - Menambahkan fungsi helper `isAllowedUser()` dan validasi allowlist `OWNER_EMAIL` / `OWNER_EMAILS` pada `src/lib/supabase/middleware.ts`.
   - Pengguna terautentikasi yang tidak terdaftar di email pemilik akan dialihkan ke `/login` dan dicegah mengakses modul-modul finansial aplikasi.
   - Menambahkan contoh konfigurasi `OWNER_EMAIL` di `.env.example` dan mendokumentasikan aturannya di `PRD.md`.

5. **Pengerasan Row Level Security (RLS) Database (`db-rls:gold_prices:unrestricted-authenticated-write-delete` & `db-rls:child-tables:missing-fk-tenant-ownership-check`)**:
   - Membuat migrasi `supabase/migrations/20261101000000_harden_rls_policies.sql`.
   - Menghapus policy `FOR ALL` pada tabel global `public.gold_prices` dan mencabut hak `DELETE` untuk role `authenticated`. Akses `authenticated` dibatasi hanya untuk `SELECT`, `INSERT`, dan `UPDATE`.
   - Memasang klausul `WITH CHECK` dan verifikasi kepemilikan tenant (`EXISTS`) untuk seluruh foreign key relasi:
     - `motor_services` memverifikasi `motor_id` milik `auth.uid()`.
     - `gold_purchases` memverifikasi `person_id` milik `auth.uid()`.
     - `zakat_accounts` memverifikasi `person_id` milik `auth.uid()`.
     - `zakat_years` memverifikasi `person_id` milik `auth.uid()`.
     - `zakat_balances` memverifikasi `zakat_year_id` dan `account_id` milik `auth.uid()`.
     - `annual_balances` memverifikasi `person_id` milik `auth.uid()`.
     - `annual_balance_items` memverifikasi `annual_balance_id` dan `account_id` milik `auth.uid()`.

6. **Isolasi Precache Service Worker & Pembersihan Cache Logout (`public/sw.js:PRECACHE_ASSETS:authenticated-root-cache-persists-after-logout`)**:
   - Menghapus route root terautentikasi `'/'` dari array `PRECACHE_ASSETS` di `public/sw.js` sehingga HTML dinamis yang memuat email user tidak disimpan permanen di `CacheStorage`.
   - Menambahkan listener event `message` dengan tipe `CLEAR_CACHE` pada Service Worker.
   - Menambahkan komponen client `LogoutButton` di `src/app/page.tsx` yang secara otomatis menghapus storage cache saat pengguna melakukan logout.

7. **Verifikasi Pengujian & Integritas Build**:
   - Menambahkan unit test baru:
     - `tests/cron-sync-gold-auth.test.ts` (5 test cases)
     - `tests/scraper-security.test.ts` (3 test cases)
     - `tests/telegram-sender-security.test.ts` (7 test cases)
     - `tests/rls-hardening-migration.test.ts` (2 test cases)
     - Penambahan test case di `tests/auth-guard.test.ts` dan `tests/pwa.test.ts`.
   - Seluruh 43 test suites (195 test cases) lulus 100% tanpa snapshot drift.
   - Build produksi Next.js 16 (`npm run build`) sukses tanpa error TypeScript/lint.
