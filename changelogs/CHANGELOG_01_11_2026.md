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


8. **Rilis Versi 0.9.0**:
   - Bump versi aplikasi dari `0.8.0` ke `0.9.0` pada `package.json`, `package-lock.json`, dan `src/lib/version.ts`.

---

## Ringkasan Perubahan: Pengingat Servis Motor (2-3 Bulan) & Notifikasi Telegram

Menambahkan fitur pengingat jadwal servis motor berkala di halaman riwayat/list Servis Motor (`/motor`) yang menghitung estimasi servis berikutnya (rentang 2 - 3 bulan dari tanggal servis terakhir) serta integrasi pengiriman notifikasi pengingat ke Telegram.

### Detail Perubahan:

1. **Engine Kalkulasi Jadwal Servis Motor (`src/lib/motor/actions.ts`)**:
   - Menambahkan fungsi kalender aman `addMonthsClamped(dateStr, months)` yang meng-clamp tanggal tujuan secara otomatis untuk bulan dengan jumlah hari lebih pendek (termasuk kabisat) dan menangani pergantian tahun.
   - Menambahkan fungsi `calculateMotorReminder` untuk menghitung:
     - `nextServiceMinDate` (+2 bulan dari tanggal servis terakhir).
     - `nextServiceMaxDate` (+3 bulan dari tanggal servis terakhir).
     - Penentuan status pengingat: `UPCOMING` (< 2 bulan), `DUE` (2-3 bulan), `OVERDUE` (> 3 bulan), dan `NO_SERVICE` (belum ada riwayat servis).
   - Menambahkan fungsi `getAllMotorReminders` untuk mengevaluasi seluruh motor aktif.

2. **Endpoint API Notifikasi Telegram (`src/app/api/motor/reminder/telegram/route.ts`)**:
   - Menyediakan handler `POST /api/motor/reminder/telegram` dengan validasi sesi login Supabase Auth.
   - Proteksi keamanan: validasi `Content-Type: application/json` (415) dan guard CSRF Same-Origin serta `Sec-Fetch-Site` (403).
   - Mengambil konfigurasi bot token dan chat ID dari tabel `telegram_settings` milik pengguna.
   - Mengirim notifikasi Telegram dengan ringkasan nama motor, tanggal servis terakhir, KM terakhir, rentang tanggal estimasi servis berikutnya, dan status servis.

3. **Komponen UI Mobile-First (`src/components/motor/ServiceReminderCard.tsx`)**:
   - Desain antarmuka responsif tanpa slop visual menggunakan CSS variables tema yang ada (`var(--bg-card)`, `var(--border-card)`, `var(--text-main)`, `var(--text-muted)`).
   - Badge status semantik dengan kontras warna tinggi (Waktunya Servis, Lewat Jadwal, Belum Waktunya, Belum Ada Riwayat).
   - Tombol aksi "Kirim Pengingat Telegram" dengan touch target mobile minimal 44px (`minHeight: 44px`), state loading interaktif, dan banner notifikasi hasil pengiriman.
   - Terintegrasi di halaman utama modul Servis Motor (`src/app/motor/page.tsx`), otomatis menyesuaikan saat filter motor aktif dipilih.

4. **Pengujian Unit Test (Jest)**:
   - `tests/motor-reminder.test.ts`: 10 test case untuk fungsi kalkulasi bulan, clamp tanggal, status pengingat, dan handling banyak motor.
   - `tests/motor-telegram-api.test.ts`: 7 test case untuk route API (Content-Type, CSRF, auth, motor_id, konfigurasi telegram, pengiriman pesan).
   - `tests/motor-reminder-ui.test.tsx`: 4 test case untuk render status DUE, OVERDUE, UPCOMING, NO_SERVICE, dan touch target 44px.
   - Seluruh 46 test suites (216 test cases) lulus 100%.

5. **Pembaruan Dokumentasi**:
   - Menambahkan spesifikasi fitur `F1.5 Pengingat Servis Motor (2-3 Bulan) & Notifikasi Telegram` pada `PRD.md`.

6. **Rilis Versi 0.10.0**:
   - Bump versi aplikasi ke `0.10.0` pada `package.json`, `package-lock.json`, `src/lib/version.ts`, dan `PRD.md`.

---

## Ringkasan Perubahan: Remediasi Security Re-Audit (Motor & Telegram Features)

Menyelesaikan 5 temuan keamanan (SEC-08 s.d. SEC-12) yang teridentifikasi dalam sesi audit ulang keamanan setelah penambahan fitur motor service reminder & notifikasi Telegram.

### Detail Perubahan:

1. **Penegakan Owner Allowlist pada Endpoint Telegram (`SEC-08`)**:
   - Memasang verifikasi `isAllowedUser()` pada `POST /api/motor/reminder/telegram` dan `POST /api/telegram/test`.
   - Mengembalikan HTTP 403 Forbidden (`Forbidden: Akun tidak memiliki akses`) jika user yang login via Supabase tidak terdaftar dalam allowlist `OWNER_EMAIL` / `OWNER_EMAILS`.

2. **Perbaikan Fail-Closed Cron Telegram Reminder (`SEC-09`)**:
   - Menghapus celah fail-open di non-production pada `GET /api/cron/telegram-reminder`.
   - Wajib membawa Bearer token `CRON_SECRET` yang valid di semua environment (status 401 jika salah/kosong di non-production, status 500 jika tidak dikonfigurasi di production).

3. **Penanganan Malformed JSON (400) & Validasi Format UUID (`SEC-10`)**:
   - Menangani `SyntaxError` saat parse JSON payload pada route API POST dengan respon 400 Bad Request (`Format JSON tidak valid`), bukan 500 Internal Server Error.
   - Memvalidasi format UUID regex pada parameter `motor_id` sebelum melakukan query database.

4. **Normalisasi Respon Otorisasi API di Middleware (`SEC-11`)**:
   - Memperbarui `resolveAuthRedirect` di `src/lib/supabase/middleware.ts` untuk meloloskan route `/api/*` agar route handler API mengembalikan respon semantik 401/403 JSON, mencegah redirect 307 ke halaman HTML login.

5. **Defensive Date Clamping & Truncation Teks Telegram (`SEC-12`)**:
   - Menambahkan validasi regex format `YYYY-MM-DD` pada `addMonthsClamped` di `src/lib/motor/actions.ts` agar tidak menghasilkan `NaN-NaN-NaN` pada input invalid.
   - Membatasi panjang teks pengingat maksimal 4000 karakter (`slice(0, 3997) + '...'`) sebelum dikirim ke Telegram Bot API guna mencegah error 400 batasan 4096 karakter dari Telegram.

6. **Verifikasi Pengujian & Integritas Build**:
   - Menambahkan 9 test case baru di `tests/motor-telegram-api.test.ts`, `tests/telegram-sender-security.test.ts`, `tests/telegram-reminder.test.tsx`, `tests/auth-guard.test.ts`, dan `tests/motor-reminder.test.ts`.
   - Seluruh 46 test suites (225 test cases) PASS 100%.
   - Build produksi Next.js 16 (`npm run build`) sukses tanpa error.

7. **Rilis Versi 0.10.1**:
   - Bump versi aplikasi dari `0.10.0` ke `0.10.1` pada `package.json`, `package-lock.json`, `src/lib/version.ts`, dan `PRD.md`.

