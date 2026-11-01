# Motor Service Reminder (2-3 Months) & Telegram Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan kartu pengingat jadwal servis motor berikutnya (estimasi 2-3 bulan dari tanggal servis terakhir) pada halaman List Servis Motor (`/motor`) dan menyediakan integrasi pengiriman notifikasi pengingat ke Telegram.

**Architecture:**
- Business logic di `src/lib/motor/actions.ts`: kalkulasi kalender +2 s.d. +3 bulan dari servis terakhir per motor menggunakan `addMonthsClamped`, penghitungan sisa hari, dan status pengingat (`UPCOMING`, `DUE`, `OVERDUE`, `NO_SERVICE`).
- Endpoint API di `src/app/api/motor/reminder/telegram/route.ts`: menerima permintaan pengiriman reminder servis motor dari user terautentikasi, membaca konfigurasi `telegram_settings`, dan mengirim pesan reminder terformat via helper `sendTelegramMessage`.
- Komponen UI di `src/components/motor/ServiceReminderCard.tsx`: antarmuka responsif mobile-first dengan token CSS semantik, status badge kontras tinggi, tombol kirim telegram dengan tap target min 44px, terintegrasi pada `src/app/motor/page.tsx`.

**Tech Stack:** Next.js (App Router), TypeScript, React, Supabase Client/Server, Telegram Bot API, Jest + Testing Library.

**Spec:** Dokumen PRD F1.5 & Implementation Plan yang telah disetujui.

## Global Constraints
- Mobile-first: Desain ramah sentuhan, min touch target 44x44px, safe area padding.
- Theme tokens: Gunakan CSS variables yang ada (`var(--bg-card)`, `var(--text-main)`, `var(--color-primary)`, status token).
- Anti-slop: Tanpa gradien berlebihan, tanpa glassmorphism berlebih, penamaan dan copy to the point.
- Keamanan: Validasi sesi Supabase, proteksi CSRF (Origin/Host match), sanitasi input.
- TDD: Seluruh unit test Jest harus pass sebelum commit.

---

### Task 1: Kalkulasi Jadwal Servis Motor & Status Pengingat (TDD)

**Files:**
- `src/lib/motor/actions.ts`
- `tests/motor-reminder.test.ts`

- [x] Step 1.1: Tulis unit test untuk fungsi kalkulasi penambahan bulan aman (`addMonthsClamped`), penghitungan rentang servis (+2 dan +3 bulan), serta penentuan status pengingat (`UPCOMING`, `DUE`, `OVERDUE`, `NO_SERVICE`).
- [x] Step 1.2: Jalankan test dengan `rtk npm test tests/motor-reminder.test.ts` untuk memastikan test gagal (merah).
- [x] Step 1.3: Implementasikan `MotorServiceReminder` interface, `addMonthsClamped`, `calculateMotorReminder`, dan `getAllMotorReminders` di `src/lib/motor/actions.ts`.
- [x] Step 1.4: Jalankan test ulang dengan `rtk npm test tests/motor-reminder.test.ts` untuk memastikan test berhasil (hijau).

---

### Task 2: Endpoint API Notifikasi Telegram Servis Motor

**Files:**
- `src/app/api/motor/reminder/telegram/route.ts`
- `tests/motor-telegram-api.test.ts`

- [x] Step 2.1: Tulis unit test untuk route `POST /api/motor/reminder/telegram` (verifikasi auth user, validasi input `motor_id`, pengecekan token/chatId Telegram di DB, format pesan, dan CSRF guard).
- [x] Step 2.2: Jalankan test `rtk npm test tests/motor-telegram-api.test.ts` untuk memastikan test gagal (merah).
- [x] Step 2.3: Implementasikan route handler `POST /api/motor/reminder/telegram/route.ts`.
- [x] Step 2.4: Jalankan test ulang untuk memastikan test berhasil (hijau).

---

### Task 3: Komponen UI `ServiceReminderCard` & Integrasi Halaman List `/motor`

**Files:**
- `src/components/motor/ServiceReminderCard.tsx`
- `src/app/motor/page.tsx`
- `tests/motor-reminder-ui.test.tsx`

- [x] Step 3.1: Tulis unit test UI untuk `ServiceReminderCard`: menampilkan status motor, tanggal estimasi servis berikutnya, penanganan klik tombol kirim Telegram, serta tap target 44px.
- [x] Step 3.2: Implementasikan `src/components/motor/ServiceReminderCard.tsx` dengan layout mobile-first dan token tema.
- [x] Step 3.3: Integrasikan `ServiceReminderCard` ke dalam `src/app/motor/page.tsx`.
- [x] Step 3.4: Jalankan test `rtk npm test tests/motor-reminder-ui.test.tsx` dan pastikan seluruh test UI lulus.

---

### Task 4: Verifikasi Menyeluruh, PRD Update, & Changelog

**Files:**
- `PRD.md`
- `changelogs/CHANGELOG_01_11_2026.md`

- [x] Step 4.1: Jalankan seluruh test suite (`rtk npm test`) untuk memverifikasi 100% test lulus tanpa regresi.
- [x] Step 4.2: Update `PRD.md` menambahkan fitur `F1.5 Pengingat Servis Motor & Notifikasi Telegram`.
- [x] Step 4.3: Buat changelog `changelogs/CHANGELOG_01_11_2026.md` merangkum penambahan fitur.
