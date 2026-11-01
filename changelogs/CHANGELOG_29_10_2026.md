# CHANGELOG - 29-10-2026

## Ringkasan Perubahan (Catat-Mencatat v0.4.6): Kilometer Opsional pada Catatan Servis Motor

Mengubah field Kilometer (km) pada formulir modal tambah/ubah catatan servis motor dari mandatory menjadi opsional, serta menampilkan tanda strip (`-`) pada riwayat jika kilometer tidak diisi.

### Detail Perubahan:
1. **Komponen Modal Form (`src/components/motor/ServiceModal.tsx`)**:
   - Memperbarui label menjadi `Kilometer (km) (Opsional)`.
   - Mengubah placeholder input menjadi `12000 (opsional)`.
   - Melonggarkan validasi `handleSubmit` agar mengizinkan nilai kosong (`""`), dan hanya memvalidasi jika diisi dengan angka negatif (`< 0`).
   - Mengirim nilai `null` jika kilometer tidak diisi.
   - Menjaga inisialisasi form edit agar menangani nilai `null` dengan fallback `""`.

2. **Logika & Validasi Modul Motor (`src/lib/motor/actions.ts`)**:
   - Memperbarui tipe data `MotorServiceItem.current_km` menjadi `number | null`.
   - Menyesuaikan `validateServiceInput` agar tidak lagi mewajibkan `current_km`, hanya menolak jika bernilai negatif.
   - Memperbarui kalkulasi `calculateMotorStats` agar aman terhadap nilai `null` dan memilih catatan servis terbaru yang memiliki kilometer valid untuk `latestKm`.

3. **Tampilan Kartu Servis (`src/components/motor/ServiceCard.tsx`)**:
   - Menampilkan fallback `-` jika `service.current_km` bernilai `null` atau `undefined` (alih-alih format KM kosong atau error).

4. **Migrasi Database Postgres/Supabase (`supabase/migrations/20261029000000_make_current_km_nullable.sql`)**:
   - Menambahkan migrasi DDL untuk mengubah kolom `current_km` di tabel `public.motor_services` menjadi `NULL` dan `DEFAULT NULL`.

5. **Pengujian Unit & Regresi (`tests/motor.test.ts`, `tests/service-km.test.tsx`)**:
   - Menambahkan test case untuk validasi input servis tanpa kilometer dan dengan `null`.
   - Menambahkan test case untuk kalkulasi statistik servis yang memuat catatan tanpa kilometer.
   - Menambahkan test case rendering `ServiceCard` untuk fallback `-` saat kilometer null.
   - Menambahkan test case label `Kilometer (km) (Opsional)` pada `ServiceModal`.
   - Memastikan seluruh 22 test suites (66 test cases) lulus 100%.

6. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui F1.3 dan F0.4 terkait status opsional kolom Kilometer.

---

## Ringkasan Perubahan (Catat-Mencatat v0.4.7): Perbaikan Load CSS, Reset Form Controls & Design Tokens

Memperbaiki issue stylesheet CSS yang gagal ter-load pada lingkungan Next.js, menghapus tag `<head>` manual duplikat di root layout, serta melengkapi deklarasi `color-scheme`, reset form typography inheritance, token `--bg-input`, dan kelas standar `.form-input`.

### Detail Perubahan:
1. **Root Layout (`src/app/layout.tsx`)**:
   - Menghapus tag `<head>` manual duplikat (`<link rel="icon">` dan `<link rel="apple-touch-icon">`) yang berpotensi konflik dengan Metadata API bawaan Next.js App Router.
   - Mempertahankan inline script tema anti-flicker secara aman.

2. **Penguatan Styling Global (`src/app/globals.css`)**:
   - Menambahkan deklarasi `color-scheme: light;` pada `:root` dan `[data-theme="light"]`, serta `color-scheme: dark;` pada `[data-theme="dark"]` dan query prefers-color-scheme.
   - Menambahkan reset `font-family: inherit` dan `font-size: inherit` untuk elemen `input`, `button`, `select`, dan `textarea`.
   - Mendefinisikan token semantic `--bg-input` untuk tema terang dan gelap.
   - Menambahkan kelas form helper `.form-input` dengan visual border, radius, background transparan, dan state `:focus-visible` seragam.

3. **Pengujian Unit Test (`tests/css-tokens.test.ts`)**:
   - Menambahkan unit test Jest untuk memvalidasi keberadaan `color-scheme` light & dark, token `--bg-input`, inheritance typography form control, dan kelas `.form-input`.
   - Memastikan seluruh 23 test suites (70 test cases) lulus 100%.

4. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui poin 9 Design & UX Requirements terkait token & CSS form resets.


