# CHANGELOG - 30-10-2026

## Ringkasan Perubahan (Catat-Mencatat v0.4.8): Pagination Progresif (Tampilkan 5 Catatan Terakhir) pada Modul Servis Motor

Menambahkan mekanisme pagination progresif / load more pada halaman riwayat servis motor (`/motor`) sehingga default menampilkan 5 catatan terakhir, dengan tombol interaktif untuk membuka 5 catatan lainnya secara bertahap hingga seluruh data tampil.

### Detail Perubahan:
1. **Helper & Logika Pagination (`src/lib/motor/actions.ts`)**:
   - Menambahkan konstanta `DEFAULT_MOTOR_PAGE_SIZE = 5`.
   - Menambahkan fungsi helper `paginateMotorServices` yang menerima array servis dan limit paginasi, mengembalikan `items`, `total`, `displayedCount`, dan `hasMore`.

2. **Antarmuka Pengguna (`src/app/motor/page.tsx`)**:
   - Menambahkan state `visibleCount` dengan nilai awal `DEFAULT_MOTOR_PAGE_SIZE`.
   - Menggunakan `useEffect` untuk mereset `visibleCount` ke default (5) saat filter aktif berubah (`selectedMotorId`, `startDate`, `endDate`).
   - Menyajikan daftar servis motor terpaginasi melalui `paginateMotorServices`.
   - Menambahkan tombol mobile-first "Tampilkan 5 Lainnya" dengan icon `ChevronDown` dan tap target minimal 44px (`minHeight: 44px`), mengikuti token tema semantik (`--bg-card`, `--border-card`, `--color-primary`).
   - Menambahkan label status pembaca "Menampilkan X dari Y catatan servis" dan pesan konfirmasi ketika seluruh data telah terbuka.
   - Ringkasan statistik (Total Biaya, Frekuensi, KM Terakhir) tetap menghitung seluruh `filteredServices`.

3. **Pengujian Unit & TDD (`tests/motor.test.ts`, `tests/motor-pagination.test.tsx`)**:
   - Menambahkan pengujian logika fungsi `paginateMotorServices` untuk default 5 item, penambahan +5 item, penanganan batas akhir array, dan array kosong.
   - Menambahkan pengujian render komponen UI untuk memverifikasi pemotongan 5 kartu servis, keberadaan tombol "Tampilkan 5 Lainnya", informasi counter jumlah catatan, dan kondisi saat data <= 5.
   - Seluruh 24 test suites (77 test cases) lulus 100%.

4. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi bagian 5.1 (F1.1 Riwayat Servis) mencakup progressive pagination 5 per 5 dan reset otomatis saat filter berubah.

