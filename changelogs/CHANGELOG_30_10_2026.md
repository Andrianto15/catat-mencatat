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

---

## Ringkasan Perubahan (Catat-Mencatat v0.4.9): Dropdown Autocomplete Nama Bengkel dengan Opsi Tambah Baru pada Modal Servis Motor

Mengubah input Nama Bengkel pada modal Tambah/Edit Catatan Servis Motor (`/motor`) menjadi dropdown autocomplete cerdas berbasis riwayat servis dengan kemampuan input bebas / tambah bengkel baru secara langsung.

### Detail Perubahan:
1. **Helper & Logika Bengkel (`src/lib/motor/actions.ts`)**:
   - Menambahkan fungsi helper `getUniqueWorkshops`: mengekstrak dan men-deduplikasi nama bengkel unik yang tersimpan dari seluruh riwayat servis, diurutkan secara alfabetis.
   - Menambahkan fungsi helper `filterWorkshopSuggestions`: melakukan pencarian dan pemfilteran saran bengkel secara *case-insensitive*.

2. **Komponen Autocomplete (`src/components/motor/WorkshopAutocomplete.tsx`)**:
   - Dibuat dengan arsitektur combobox aksesibel (`role="combobox"`, `role="listbox"`, `role="option"`).
   - Menampilkan daftar opsi bengkel dari riwayat pengguna saat fokus atau mengetik.
   - Menampilkan opsi interaktif `+ Tambah "[query]"` saat teks yang diketik pengguna belum tersedia pada daftar pilihan.
   - Mendukung penuh navigasi keyboard (Arrow Down, Arrow Up, Enter untuk memilih/menambahkan, Escape untuk menutup dropdown).
   - Mendukung penutupan otomatis saat klik di luar area (*click outside listener*).
   - Mematuhi standar antislop dan mobile-first: tap target setiap opsi minimal 44px (`minHeight: 44px`), styling adaptif menggunakan CSS semantic theme variables (`var(--bg-card)`, `var(--border-card)`, `var(--text-main)`, `var(--color-primary)`).

3. **Integrasi Modal & Halaman Servis Motor (`src/components/motor/ServiceModal.tsx`, `src/app/motor/page.tsx`)**:
   - `ServiceModal` menerima prop `existingWorkshops` dan mengintegrasikan `WorkshopAutocomplete` menggantikan tag `<input>` biasa.
   - Halaman `/motor` menghitung daftar riwayat bengkel unik dari seluruh state catatan servis dengan `useMemo` dan menyalurkannya ke modal.

4. **Pengujian Unit & TDD (`tests/workshop-autocomplete.test.tsx`)**:
   - Menguji kebenaran deduplikasi dan pengurutan daftar bengkel oleh `getUniqueWorkshops`.
   - Menguji pemfilteran *case-insensitive* oleh `filterWorkshopSuggestions`.
   - Menguji rendering `WorkshopAutocomplete` (placeholder, value, role combobox/listbox).
   - Menguji munculnya opsi `+ Tambah` saat query baru dimasukkan.
   - Menguji batas tap target mobile minimal 44px pada opsi dropdown.
   - Menguji integrasi komponen di dalam `ServiceModal`.
   - Seluruh 25 test suites (84 test cases) lulus 100%.

5. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui poin F1.3 Tambah/edit servis mencatat kolom Nama Bengkel / Tempat sebagai dropdown autocomplete dengan opsi tambah baru dan tap target mobile min 44px.

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.0): Upgrade Node.js 26 LTS & Dependensi Urgent (Next.js 16, React 19, Supabase, Jest 30)

Melakukan upgrade runtime Node.js ke versi 26 LTS (`v26.13.0`) serta memperbarui seluruh dependensi urgent yang memiliki celah keamanan (*critical* & *high* CVEs) maupun versi yang tertinggal jauh.

### Detail Perubahan:
1. **Runtime Node.js 26 LTS (`.nvmrc`, `package.json`)**:
   - Menginstall dan mengaktifkan Node.js `v26.13.0` (LTS: Lithium) sebagai default via `nvm`.
   - Menambahkan file `.nvmrc` (`26`) dan mengunci `"engines": { "node": ">=26.0.0" }` pada `package.json`.
   - Memperbarui `@types/node` dari `^20.17.19` ke `^26.6.6`.

2. **Upgrade Dependensi Utama & Security Patch (`package.json`, `package-lock.json`)**:
   - `next`: `14.2.24` -> `^16.4.3` (menutup 30+ CVE berstatus *Critical* dan *High* pada Next.js & transitive `postcss`).
   - `react` & `react-dom`: `^18.3.1` -> `^19.3.1` (`@types/react` & `@types/react-dom` -> `^19.3.0`).
   - `@supabase/ssr`: `^0.5.2` -> `^0.12.7`.
   - `@supabase/supabase-js`: `^2.49.1` -> `^2.118.0`.
   - `lucide-react`: `^0.475.0` -> `^1.64.0`.
   - `jest`: `^29.7.0` -> `^30.5.2`, `@types/jest`: `^29.5.14` -> `^30.0.0`, `ts-jest`: `^29.2.5` -> `^29.4.15`.
   - `typescript`: di-pin pada `~5.9.3` agar kompatibel dengan batas peer dependency `ts-jest` (`<7.0.0`).

3. **Penyesuaian Breaking Changes Next.js 16 (`src/lib/supabase/server.ts`, `src/app/page.tsx`, `tsconfig.json`)**:
   - Mengubah `createClient()` pada `src/lib/supabase/server.ts` menjadi fungsi `async` yang melakukan `await cookies()` sesuai perubahan API dinamis Next.js 15/16.
   - Memperbarui pemanggilan `await createClient()` pada `HomePage` dan server action `handleLogout` di `src/app/page.tsx`.
   - Penyesuaian otomatis `tsconfig.json` (`jsx: "react-jsx"` dan `.next/dev/types/**/*.ts`) untuk Next.js 16.

4. **Pengujian Unit & Verifikasi Build (`tests/setup.test.ts`, `tests/auth-guard.test.ts`)**:
   - Menambahkan unit test untuk memverifikasi konfigurasi Node 26 pada `.nvmrc`, `package.json#engines`, dan `@types/node`.
   - Menambahkan unit test untuk memverifikasi `createClient()` server menggunakan `async` / `await cookies()`.
   - Seluruh 25 test suites (86 test cases) lulus 100%, `npm run build` sukses tanpa error, dan `npm audit --omit=dev` melaporkan **0 vulnerabilities**.

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.1): Perbaikan Jarak (Spacing) Label ke Input Text Box pada Form Edit Harga Emas

Memperbaiki layout form inline edit harga emas harian (`/emas/prices`) agar label "Harga Jual (Rp)" dan "Harga Buyback (Rp)" tidak menempel terlalu dekat dengan text box `NumberInput`.

### Detail Perubahan:
1. **Antarmuka Pengguna (`src/app/emas/prices/page.tsx`)**:
   - Menambahkan margin bawah `marginBottom: '0.375rem'` pada elemen `<label>` untuk "Harga Jual (Rp)" dan "Harga Buyback (Rp)".
   - Memberikan ruang napas visual yang jelas dan ergonomis baik di tampilan mobile maupun desktop sesuai standar `antislop-layoutmobile`.

2. **Pengujian Unit (`tests/gold-price-edit.test.tsx`)**:
   - Menambahkan unit test TDD untuk memverifikasi style `marginBottom: '0.375rem'` pada label Harga Jual dan Harga Buyback.
   - Seluruh 26 test suites (87 test cases) lulus 100%.

3. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F2.2 untuk mencatat spasi vertikal proporsional antara label dan field input pada form inline edit harga emas.




