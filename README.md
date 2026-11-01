<p align="center">
  <img src="public/logo.svg" alt="Catat-Mencatat Logo" width="128" height="128" />
</p>

<h1 align="center">Catat-Mencatat</h1>

<p align="center">
  Aplikasi web progresif (PWA) personal berbasis mobile-first untuk pencatatan riwayat servis motor, portofolio investasi emas, kalkulasi zakat mal tahunan, dan rekapitulasi saldo akhir tahun.
</p>

---

## Ringkasan Proyek

Catat-Mencatat memusatkan empat modul pencatatan pribadi dalam satu aplikasi web responsif berorientasi perangkat bergerak (PWA installable):
- **Servis Motor**: Riwayat berkala odometer, bengkel, biaya servis, dan pengingat servis berikutnya.
- **Investasi Emas**: Tracking kepemilikan keping emas fisik, sinkronisasi harga harian Galeri24, serta kalkulasi nilai aset dan profit berjalan.
- **Zakat Mal**: Rekapitulasi hisab saldo rekening per tahun Hijriah terintegrasi nilai acuan emas dan kalkulasi nisab otomatis.
- **Saldo Akhir Tahun**: Rekapitulasi tahunan per rekening dan pengeluaran Masehi dilengkapi visualisasi grafik tren serta reminder tahunan via Telegram.

> [!NOTE]
> Spesifikasi fungsional terperinci, formula kalkulasi bisnis, user stories, dan acceptance criteria lengkap didokumentasikan secara terpusat pada [`PRD.md`](PRD.md).

---

## Tech Stack & Prasyarat

- **Runtime**: [Node.js](https://nodejs.org/) `>=26.0.0` (ditetapkan pada `.nvmrc`)
- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, React 19, Server Components & Server Actions)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL dengan Row Level Security & Supabase Auth)
- **PWA**: Web Manifest & Service Worker untuk pengalaman standalone installable di smartphone
- **Styling**: Tailwind CSS & Design System tokens sesuai [`DESIGN.md`](DESIGN.md)
- **Pengujian**: [Jest](https://jestjs.io/) 30 & `@testing-library/react`
- **Automation & Background Jobs**: Vercel Cron untuk scraping harga harian dan reminder tahunan

---

## Persiapan Lingkungan & Instalasi

### 1. Klon Repositori & Pasang Dependensi

```bash
git clone https://github.com/<username>/catat-mencatat.git
cd catat-mencatat
npm install
```

### 2. Konfigurasi Environment Variables

Salin template variabel lingkungan ke konfigurasi lokal:

```bash
cp .env.example .env.local
```

Sesuaikan nilai variabel berikut pada `.env.local`:

| Variabel | Deskripsi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL endpoint instans Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role API key untuk operasi backend/cron |
| `CRON_SECRET` | Token otentikasi rahasia untuk Vercel Cron (`Bearer <token>`) |
| `OWNER_EMAIL` | Email pemilik aplikasi untuk proteksi single-owner |

> [!IMPORTANT]
> Aplikasi menerapkan proteksi single-owner di level middleware. Pastikan `OWNER_EMAIL` sesuai dengan akun user yang didaftarkan di Supabase Auth.

### 3. Migrasi Database Supabase

Jalankan seluruh skrip SQL migrasi yang terdapat di folder `supabase/migrations/` secara berurutan pada SQL Editor Supabase Anda, atau jalankan menggunakan Supabase CLI:

```bash
npx supabase db push
```

---

## Menjalankan Aplikasi

### Mode Pengembangan (Development)

Jalankan server pengembangan lokal:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban.

### Mode Produksi (Production Build)

Kompilasi dan jalankan build produksi:

```bash
npm run build
npm run start
```

---

## Skrip & Pengujian

Proyek menerapkan verifikasi otomatis menggunakan Jest:

```bash
# Menjalankan seluruh rangkaian unit & integration tests
npm test

# Menjalankan test dengan laporan code coverage
npm run test:coverage
```

> [!TIP]
> Seluruh unit test wajib berada dalam kondisi lolos (`pass`) sebelum melakukan perubahan kode atau commit baru.

---

## Background Jobs (Vercel Cron)

Aplikasi memiliki tiga endpoint cron terjadwal yang dikonfigurasi melalui `vercel.json`:

- `GET /api/cron/sync-gold`: Sinkronisasi otomatis harga harian emas dari Galeri24 (dijalankan setiap hari pukul 02:00 UTC).
- `GET /api/cron/telegram-reminder`: Pengiriman notifikasi reminder rekapitulasi tahunan via Telegram Bot (dijalankan setiap 30 Desember pukul 02:00 UTC).
- `GET /api/cron/motor-reminder`: Pengiriman notifikasi pengingat servis motor berkala 2-3 bulan via Telegram Bot (dijalankan tanggal 1 setiap bulan pukul 02:00 UTC).

Endpoint dilindungi dengan header otentikasi `Authorization: Bearer <CRON_SECRET>` atau sesi aktif Supabase pemilik akun.

---

## Struktur Repositori

```text
├── changelogs/          # Riwayat rilis dan pembaruan versi
├── docs/                # Dokumen pendukung dan artefak spesifikasi
├── public/              # Aset statis publik, logo, web manifest, dan service worker
├── scripts/             # Skrip utilitas pembantu (generasi icon, tes DB)
├── src/
│   ├── app/             # Next.js App Router (halaman, layout, API routes)
│   ├── components/      # Komponen antarmuka (modals, navbar, input helpers, cards)
│   └── lib/             # Helper utilitas bisnis, client Supabase, formatters
├── supabase/
│   └── migrations/      # Skema SQL, RLS hardening, dan migrasi database
└── tests/               # Pengujian Jest untuk logika bisnis, keamanan, dan komponen UI
```

---

## Referensi Dokumentasi

Informasi arsitektur sistem, aturan alur kerja, dan desain dapat diakses pada dokumen berikut:
- [`PRD.md`](PRD.md) – Product Requirements Document (PRD), logika bisnis, dan acceptance criteria lengkap.
- [`DESIGN.md`](DESIGN.md) – Panduan Design System, palet warna, tipografi, dan token UI.
- [`AGENTS.md`](AGENTS.md) – Panduan alur kerja agen AI, aturan pengujian, dan standar kualitas.

