# Vercel Cron Motor Service Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengotomatiskan pengiriman notifikasi pengingat servis motor berkala (2-3 bulan) ke Telegram melalui Vercel Cron job bulanan (`0 2 1 * *`) via endpoint `GET /api/cron/motor-reminder`.

**Architecture:**
- Route handler Next.js di `src/app/api/cron/motor-reminder/route.ts`:
  - Dilindungi otentikasi `CRON_SECRET` (fail-closed jika production tanpa secret atau authorization header tidak cocok) dengan opsi fallback sesi admin.
  - Membaca konfigurasi `telegram_settings` aktif.
  - Menghitung reminder motor aktif per user via `calculateMotorReminder` (`src/lib/motor/actions.ts`).
  - Mengirim ringkasan motor yang berstatus `DUE` atau `OVERDUE` ke Telegram via `sendTelegramMessage`.
- Konfigurasi penjadwalan di `vercel.json` (`schedule: "0 2 1 * *"`).

**Tech Stack:** Next.js (App Router), TypeScript, Supabase Service Client, Telegram Bot API, Jest.

**Spec:** PRD F1.5 & Implementation Plan yang telah disetujui.

## Global Constraints
- Security: Fail-closed saat production jika `CRON_SECRET` kosong. Proteksi Bearer token authorization.
- TDD: Test ditulis terlebih dahulu dan diverifikasi gagal sebelum implementasi.
- Anti-spam: Hanya kirim notifikasi jika terdapat minimal 1 motor yang berstatus `DUE` atau `OVERDUE`. Gabungkan motor dalam 1 pesan per pengguna.

---

### Task 1: Route Handler & Unit Test Cron Motor Reminder (TDD)

**Files:**
- `src/app/api/cron/motor-reminder/route.ts`
- `tests/cron-motor-reminder.test.ts`

- [x] Step 1.1: Tulis unit test di `tests/cron-motor-reminder.test.ts` menguji otentikasi `CRON_SECRET`, penanganan tanpa motor jatuh tempo, dan pengiriman notifikasi gabungan saat ada motor `DUE`/`OVERDUE`.
- [x] Step 1.2: Jalankan `rtk npm test tests/cron-motor-reminder.test.ts` untuk memastikan test gagal (merah).
- [x] Step 1.3: Implementasikan route handler `src/app/api/cron/motor-reminder/route.ts`.
- [x] Step 1.4: Jalankan `rtk npm test tests/cron-motor-reminder.test.ts` untuk memastikan test berhasil (hijau).

---

### Task 2: Konfigurasi Penjadwalan Vercel Cron

**Files:**
- `vercel.json`

- [x] Step 2.1: Daftarkan path `/api/cron/motor-reminder` dengan schedule `0 2 1 * *` di `vercel.json`.

---

### Task 3: Verifikasi Menyeluruh, PRD Update, & Changelog

**Files:**
- `PRD.md`
- `changelogs/CHANGELOG_01_11_2026.md`

- [x] Step 3.1: Jalankan seluruh test suite (`rtk npm test`) untuk memverifikasi 100% test lulus.
- [x] Step 3.2: Verifikasi build produksi Next.js dengan `rtk npm run build`.
- [x] Step 3.3: Perbarui `PRD.md` mencatat endpoint cron dan jadwal Vercel Cron.
- [x] Step 3.4: Perbarui `changelogs/CHANGELOG_01_11_2026.md`.
