# Desain Modul Saldo Akhir Tahun & Reminder Telegram (30 Desember)

| | |
|---|---|
| Tanggal | 31-10-2026 |
| Status | Draft Desain |
| Modul | `Saldo Akhir Tahun` (`/saldo-tahun`) & `Reminder Telegram` |
| Referensi | Spreadsheet Saldo Akhir Tahun (2018–2025), `PRD.md`, `DESIGN.md` |

Penanda: **[keputusan builder]** = keputusan teknis/default yang diambil oleh builder tanpa mengubah kesepakatan pengguna, dapat dikoreksi oleh pengguna.

---

## 1. Tujuan & Latar Belakang (Intent & Why)

Pengguna mencatat rekap saldo akhir tahun (tahun Masehi, contoh: 2018–2025) di spreadsheet yang memuat saldo tiap rekening/dompet (BNI/BSI, Mandiri, Muamalat, Jago Syariah, CIMB, Octo Pay, Gopay, OVO, Dana, ShopeePay, Cash), dikurangi baris **Pengeluaran**, menghasilkan **Saldo Akhir Tahun**, lalu diplot ke grafik garis perkembangan tiap tahun.

Modul ke-4 **Saldo Akhir Tahun** (`/saldo-tahun`) memindahkan alur ini ke aplikasi **Catat-Mencatat** dengan berbagi master pemilik (`people`) dan master rekening (`zakat_accounts`) dari modul Zakat Mal agar pengguna tidak perlu menduplikasi daftar rekening.

Untuk **Tahap 2**, pengguna membutuhkan pengingat otomatis ke **Telegram setiap tanggal 30 Desember** agar tidak lupa mencatat saldo akhir tahun sebelum pergantian tahun, dengan konfigurasi Bot Token & Chat ID yang dapat diatur langsung dari dalam aplikasi.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
1. Menyediakan modul ke-4 **Saldo Akhir Tahun** (`/saldo-tahun`) di halaman utama (`/`).
2. Berbagi data `people` (pemilik) dan `zakat_accounts` (daftar rekening/tabungan/dompet/cash) dengan modul Zakat Mal.
3. Mencatat saldo per rekening dan nominal **Pengeluaran** per tahun Masehi (contoh: 2018–2025) tanpa menyertakan nilai emas fisik.
4. Menampilkan grafik garis (**SVG Line Chart**) perkembangan Saldo Akhir Tahun antar-tahun.
5. Menampilkan daftar ringkasan per tahun (**Tahun, Total Rekening, Pengeluaran, Saldo Akhir Tahun, serta selisih ▲/▼ nominal & % dibanding tahun sebelumnya**) yang saat di-klik melakukan **Expand Inline (Accordion - Opsi A)** untuk memperlihatkan rincian saldo tiap rekening dan tombol Edit/Hapus.
6. Menyediakan pengaturan **Reminder Telegram Tahunan (30 Desember)** yang bisa diatur langsung di UI (Bot Token, Chat ID, pesan pengingat, status Aktif/Nonaktif, dan tombol **Kirim Tes Sekarang**), serta job Vercel Cron setiap 30 Desember.

### Non-Goals
- Memasukkan nilai aset emas fisik ke dalam perhitungan Saldo Akhir Tahun (sesuai instruksi pengguna: mengikuti tabel Excel, emas tidak perlu).
- Membuat master rekening terpisah dari modul Zakat Mal.
- Menampilkan tabel matriks penuh di halaman utama list (cukup ringkasan Saldo Akhir Tahun yang bisa di-klik/expand untuk rincian rekening).

### Anti-Goals
- Mengubah atau merusak data `zakat_years` / `zakat_balances` saat pengguna mengisi atau mengedit Saldo Akhir Tahun.
- Membocorkan `bot_token` Telegram ke pihak tidak berwenang tanpa autentikasi RLS (`auth.uid() = user_id`).
- Layout mobile bocor horizontal (`overflow-x`) atau target sentuh di bawah `44x44px`.

---

## 3. Keputusan Desain (Sesuai Kesepakatan Pengguna)

1. **Berbagi Master Rekening & Per Orang**:
   - Menggunakan tabel `people` dan `zakat_accounts` yang sudah ada.
   - Halaman `/saldo-tahun` memiliki tab/chip pemilih orang (`people`) di bagian atas.
   - Tombol pengaturan di header `/saldo-tahun` mengarah ke `/saldo-tahun/settings` yang berisi pengaturan Reminder Telegram dan tautan/pengelolaan rekening (`zakat_accounts`). **[keputusan builder]**
2. **Rumus Perhitungan (Sesuai Tabel Excel)**:
   - `Total Rekening = Σ saldo tiap rekening pada tahun tersebut` (mendukung presisi 2 digit desimal di belakang koma seperti `NumberInput` + input sen 2 digit pada modul Zakat). **[keputusan builder]**
   - `Pengeluaran = nominal pengurang pada tahun tersebut (default 0, ≥ 0)`.
   - `Saldo Akhir Tahun = Total Rekening - Pengeluaran` (dibulatkan 2 desimal `Math.round((total - expense) * 100) / 100`).
3. **Grafik Perkembangan Tahunan**:
   - Komponen `AnnualBalanceTrendChart` menggunakan **SVG Line Chart** responsif (dengan area fill lembut di bawah garis, titik data tiap tahun Masehi terurut naik misal `2018` s.d. `2025`, label sumbu Y ringkas, serta tabel/ringkasan aksesibel `role="img"` + `aria-label`). **[keputusan builder]**
4. **Daftar Ringkasan & Expand Inline (Opsi A - Accordion)**:
   - Diurutkan dari tahun Masehi terbaru di atas (misal `2025`, `2024`, ..., `2018`) dengan progressive pagination 5 item per halaman (`DEFAULT_ANNUAL_BALANCE_PAGE_SIZE = 5`). **[keputusan builder]**
   - Setiap kartu menampilkan:
     - **Tahun Masehi** (misal `Tahun 2025`)
     - Badge selisih dibanding tahun sebelumnya (`▲ +Rp ... (+X%)` atau `▼ -Rp ... (-X%)`, menggunakan token warna semantik `--color-success-bg`/`--color-success-text` dan `--color-danger-bg`/`--color-danger-text`)
     - **Saldo Akhir Tahun** (angka utama menonjol)
     - Sub-baris ringkas: `Total Rekening: Rp ... • Pengeluaran: Rp ...`
   - Saat kartu di-klik (`aria-expanded`), bagian bawah kartu terbuka secara inline (Accordion) menampilkan:
     - Daftar rincian tiap rekening beserta saldonya (hanya rekening yang memiliki saldo > 0 atau tercatat pada tahun tersebut, diurutkan sesuai `display_order` / nilai). **[keputusan builder]**
     - Baris Total Rekening, Pengeluaran, dan Saldo Akhir Tahun.
     - Tombol **Edit Tahun** dan **Hapus Tahun** (dengan konfirmasi hapus). **[keputusan builder]**
5. **Modal Input / Edit Tahun (`AnnualBalanceModal`)**:
   - Field **Tahun Masehi** (integer, misal `2025`; default mengusulkan `tahun_terbaru + 1` atau tahun berjalan jika belum ada). **[keputusan builder]**
   - Daftar input saldo per rekening aktif milik orang tersebut (menggunakan `NumberInput` ribuan + input 2 digit desimal sen `,00` seperti `YearModal` Zakat). **[keputusan builder]**
   - Field **Pengeluaran (Rp)** (`NumberInput`, default `0`).
   - Field **Catatan (Opsional)** (teks bebas maks 500 karakter). **[keputusan builder]**
   - Ringkasan real-time di dalam modal: `Total Rekening`, `Pengeluaran`, dan `Saldo Akhir Tahun`.
6. **Tahap 2: Reminder Telegram Setiap 30 Desember**:
   - Pengaturan disimpan di database per user (`telegram_settings`) agar bisa diatur langsung dari halaman `/saldo-tahun/settings`:
     - `bot_token` (TEXT)
     - `chat_id` (TEXT)
     - `reminder_message` (TEXT, default: `"Halo! Hari ini 30 Desember, waktunya mencatat Saldo Akhir Tahun di aplikasi Catat-Mencatat."`) **[keputusan builder]**
     - `is_enabled` (BOOLEAN, default `true`)
     - `last_sent_at` (TIMESTAMPTZ, nullable, mencatat kapan terakhir pesan berhasil dikirim) **[keputusan builder]**
   - Tombol **"Kirim Tes Sekarang"** di halaman `/saldo-tahun/settings` memanggil API route internal (`POST /api/telegram/test`) yang mengirim pesan tes ke Telegram menggunakan konfigurasi tersimpan/input dan menampilkan feedback berhasil/gagal. **[keputusan builder]**
   - Endpoint Cron (`GET /api/cron/telegram-reminder`) dilindungi `CRON_SECRET` (seperti `/api/cron/sync-gold`), dijadwalkan di `vercel.json` pada `0 2 30 12 *` (30 Desember pukul 02:00 UTC / 09:00 WIB), membaca baris `telegram_settings` yang `is_enabled = true`, mengirim pesan ke Telegram Bot API (`https://api.telegram.org/bot<token>/sendMessage`), dan memperbarui `last_sent_at`. **[keputusan builder]**

---

## 4. Skema Database (Supabase Migration)

File migrasi baru: `supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql` **[keputusan builder]**

1. Tabel `public.annual_balances`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE`
   - `masehi_year INTEGER NOT NULL`
   - `total_accounts NUMERIC(15, 2) NOT NULL DEFAULT 0`
   - `expense_amount NUMERIC(15, 2) NOT NULL DEFAULT 0`
   - `net_balance NUMERIC(15, 2) NOT NULL DEFAULT 0`
   - `notes TEXT`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `CONSTRAINT uq_annual_balance_person_year UNIQUE (person_id, masehi_year)`
   - RLS: `auth.uid() = user_id`

2. Tabel `public.annual_balance_items`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `annual_balance_id UUID NOT NULL REFERENCES public.annual_balances(id) ON DELETE CASCADE`
   - `account_id UUID NOT NULL REFERENCES public.zakat_accounts(id) ON DELETE CASCADE`
   - `balance NUMERIC(15, 2) NOT NULL DEFAULT 0`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `CONSTRAINT uq_annual_balance_item_account UNIQUE (annual_balance_id, account_id)`
   - RLS: `EXISTS (SELECT 1 FROM public.annual_balances ab WHERE ab.id = annual_balance_id AND ab.user_id = auth.uid())`

3. Tabel `public.telegram_settings`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `bot_token TEXT NOT NULL DEFAULT ''`
   - `chat_id TEXT NOT NULL DEFAULT ''`
   - `reminder_message TEXT NOT NULL DEFAULT 'Halo! Hari ini 30 Desember, waktunya mencatat Saldo Akhir Tahun di aplikasi Catat-Mencatat.'`
   - `is_enabled BOOLEAN NOT NULL DEFAULT true`
   - `last_sent_at TIMESTAMPTZ`
   - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `CONSTRAINT uq_telegram_settings_user UNIQUE (user_id)`
   - RLS: `auth.uid() = user_id`

---

## 5. Kepatuhan Desain, Mobile-First & Antislop

- **Palette & Tokens**: Menggunakan CSS variables di `src/app/globals.css` (`--color-primary` `#4682b4`, `--bg-card`, `--border-card`, `--text-main`, `--text-muted`, `--color-success-*`, `--color-danger-*`). Warna aksen ikon modul ke-4 di halaman utama menggunakan `#0ea5e9` (Accent Sky dari `DESIGN.md`). **[keputusan builder]**
- **Ergonomi Mobile**: Semua tombol interaktif, header, chip pemilik, baris accordion, dan tombol aksi memiliki `minHeight: '44px'`. Modal menggunakan bottom-sheet pada mobile (`< 640px`) dan centered dialog pada desktop.
- **UI States**: Menyediakan state *loading*, *empty* (dengan ajakan jelas membuat catatan tahun pertama), dan *error* (validasi form dan kegagalan pengiriman Telegram).
- **Bebas AI Slop**: Tanpa em-dash (`—`), tanpa data palsu/hardcoded metric, tanpa efek glow/glassmorphism berlebihan.

