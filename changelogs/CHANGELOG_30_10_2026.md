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

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.2): Informasi Harga Jual (Buyback) Historis saat Pembelian Emas

Menambahkan field opsional Harga Jual / Buyback pada saat pembelian (`buyback_price_per_piece`, bisa `null`) di Form Tambah/Ubah Pembelian Emas serta menampilkan informasinya pada kartu riwayat pembelian emas di halaman list (`/emas`).

### Detail Perubahan:
1. **Skema Database (`supabase/migrations/20261025000000_init_schema.sql`, `supabase/migrations/20261030000000_add_buyback_price_to_gold_purchases.sql`)**:
   - Menambahkan kolom `buyback_price_per_piece NUMERIC(15, 2) DEFAULT NULL` pada tabel `public.gold_purchases`.

2. **Tipe Data & Form Modal (`src/lib/gold/actions.ts`, `src/components/gold/PurchaseModal.tsx`)**:
   - Menambahkan properti `buyback_price_per_piece?: number | null` pada interface `GoldPurchase`.
   - Menambahkan field input opsional `NumberInput` dengan label `"Harga Jual / Buyback saat Beli per Keping (Rp) (Opsional)"` (`id="gold-buyback-price"`) pada `PurchaseModal`.
   - Mereset nilai input buyback bersama harga beli dan catatan saat menggunakan tombol `"Simpan & Tambah Lagi"`.

3. **Tampilan Kartu di Halaman List (`src/components/gold/GoldCard.tsx`)**:
   - Menampilkan baris informasi historis `Buyback saat beli: Rp X.XXX.XXX` (dilengkapi keterangan `/ keping` bila `piece_count > 1`) atau `Buyback saat beli: -` apabila nilai `buyback_price_per_piece` adalah `null`/kosong.

4. **Pengujian Unit (`tests/gold-buyback-history.test.tsx`, `tests/schema.test.ts`)**:
   - Menambahkan pengujian unit untuk memverifikasi keberadaan input opsional di `PurchaseModal`, format mata uang Rp saat nilai tersedia di `GoldCard`, fallback `-` saat nilai `null`, serta keberadaan kolom di skema SQL.
   - Seluruh 27 test suites (90 test cases) lulus 100%.

5. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F2.3, F2.4, dan tabel model data `gold_purchases`.

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.3): Pagination Progresif (Setiap 5 Data) pada Halaman List Emas & List Zakat

Menambahkan mekanisme pagination progresif / load more setiap 5 data pada halaman List Emas (`/emas`) dan bagian Riwayat Rekap Tahunan pada halaman List Zakat (`/zakat`), seragam dengan pola pagination pada List Motor.

### Detail Perubahan:
1. **Helper & Logika Pagination (`src/lib/gold/actions.ts`, `src/lib/zakat/engine.ts`)**:
   - Menambahkan `DEFAULT_GOLD_PAGE_SIZE = 5` dan fungsi `paginateGoldPurchases` yang menggunakan ulang helper paginasi generik.
   - Menambahkan `DEFAULT_ZAKAT_PAGE_SIZE = 5` dan fungsi `paginateZakatYears`.

2. **Halaman List Emas (`src/app/emas/page.tsx`)**:
   - Menambahkan state `visibleCount` dengan nilai awal `DEFAULT_GOLD_PAGE_SIZE` (5), serta auto-reset ke 5 saat filter pemilik (`selectedPersonId`) atau status terjual (`showSold`) berubah.
   - Menampilkan kartu keping emas terpaginasi (`paginatedPurchases.items`), sedangkan kartu ringkasan portofolio (`summary`) tetap menghitung seluruh keping emas aktif.
   - Menambahkan tombol mobile-first "Tampilkan 5 Lainnya" (`minHeight: '44px'`, ikon `ChevronDown`), informasi counter "Menampilkan X dari Y keping emas", dan keterangan saat seluruh data telah ditampilkan.

3. **Halaman List Zakat (`src/app/zakat/page.tsx`)**:
   - Menambahkan state `visibleCount` dengan nilai awal `DEFAULT_ZAKAT_PAGE_SIZE` (5), serta auto-reset ke 5 saat tab pemilik/pelaku (`selectedPersonId`) berganti.
   - Menerapkan paginasi pada daftar kartu "Riwayat Rekap Tahunan" (`paginatedYears.items`), sementara komponen perbandingan tahun, tabel spreadsheet, dan grafik tren tetap menerima keseluruhan data tahun.
   - Menambahkan tombol mobile-first "Tampilkan 5 Lainnya" (`minHeight: '44px'`, ikon `ChevronDown`), informasi counter "Menampilkan X dari Y riwayat zakat", dan keterangan saat seluruh riwayat telah ditampilkan.

4. **Pengujian Unit (`tests/gold-pagination.test.tsx`, `tests/zakat-pagination.test.tsx`)**:
   - Menambahkan unit test untuk logika dan rendering komponen paginasi pada List Emas dan List Zakat (kondisi > 5 item dan <= 5 item).

5. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F2.3 (Riwayat pembelian emas) dan F3.5 (Riwayat Rekap Tahunan Zakat).

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.4): Perbaikan Parser Harga Emas Galeri24 (`parseGaleri24Html`) & Ekstraksi Nuxt 3 Payload

Memperbaiki logika parser harga emas Galeri 24 agar mampu mengekstrak langsung state data harga live dari payload Nuxt 3 (`<script>`) situs Galeri 24, serta mendukung parsing tabel HTML multi-format (3 kolom dengan heading vendor dan 4 kolom lama).

### Detail Perubahan:
1. **Parser Logam Mulia (`src/lib/gold/scraper.ts`)**:
   - Menambahkan fungsi `parseNuxtPayload` untuk mem-parsing dehydrated state JSON Nuxt 3 (`useAsyncData` / devalue payload) yang memuat data live harga seluruh vendor (Galeri 24, Antam, UBS, Lotus Archi, Dinar, dll.).
   - Menambahkan helper `cleanBrandName` untuk normalisasi nama brand (Galeri 24, Antam, UBS) dan membersihkan kata umum (Harga, Emas, Batangan, Gold).
   - Memperbarui `parseGaleri24Html` untuk memprioritaskan ekstraksi Nuxt payload sebelum fallback ke pemindaian tabel HTML.
   - Memperbarui parser tabel HTML untuk memindai per blok `<table>`, membaca brand dari tag heading terdekat (`<h1>`-`<h6>` atau class vendor/title), dan mem-parsing baris 3 kolom `[Berat, Harga Jual, Harga Buyback]`.
2. **Penanganan Error Sinkronisasi UI (`src/app/emas/prices/page.tsx`)**:
   - Memvalidasi respons `!data.success` sehingga menampilkan pesan error yang deskriptif dan tidak menampilkan alert palsu "0 harga diperbarui".
3. **Fixture & Pengujian Unit (`tests/fixtures/galeri24-3col-sample.html`, `tests/scraper.test.ts`)**:
   - Menambahkan fixture HTML 3 kolom multi-brand.
   - Menambahkan unit test untuk de-serialisasi Nuxt 3 payload dan tabel multi-vendor.
   - Seluruh 29 test suites (98 tests) lolos 100%.
4. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui catatan teknis pada seksi Scraping Galeri24.


---

## Ringkasan Perubahan (Catat-Mencatat v0.5.5): Filter Jenis Emas & Gramasi serta Pagination Progresif pada Halaman Harga Emas (`/emas/prices`)

Menambahkan filter berbasis dropdown `<select>` (Jenis Emas & Gramasi) dan mekanisme pagination progresif ("Tampilkan 5 Lainnya") pada halaman Harga Emas Harian (`/emas/prices`).

### Detail Perubahan:
1. **Helper Filter & Pagination (`src/lib/gold/actions.ts`)**:
   - Menambahkan konstanta `DEFAULT_GOLD_PRICE_PAGE_SIZE = 5` dan fungsi `paginateGoldPrices`.
   - Menambahkan fungsi `getUniqueGoldBrands` untuk mengekstrak daftar jenis emas unik secara alfabetis.
   - Menambahkan fungsi `getUniqueGoldWeights` untuk mengekstrak daftar gramasi unik secara numerik ascending (mendukung filter per brand).
   - Menambahkan fungsi `filterGoldPrices` untuk memfilter daftar harga berdasarkan `brand` dan `weightGram`.
2. **Antarmuka Pengguna (`src/app/emas/prices/page.tsx`)**:
   - Menambahkan Filter Bar mobile-first berisi 2 dropdown `<select className="form-select">` (`minHeight: '44px'`, label aksesibel `htmlFor`/`id`):
     - **Jenis Emas**: `"Semua Jenis"` beserta daftar brand yang tersedia pada tanggal terpilih.
     - **Gramasi**: `"Semua Gramasi"` beserta daftar gramasi (`{w} gr`) yang tersedia.
   - Menambahkan empty state filter ketika kombinasi tidak ditemukan beserta tombol `"Reset Filter"`.
   - Menambahkan pagination progresif 5 item per halaman dengan tombol `"Tampilkan 5 Lainnya"` (`minHeight: '44px'`), informasi counter `"Menampilkan X dari Y harga emas"`, dan auto-reset ke 5 saat tanggal atau filter berubah.
3. **Pengujian Unit (`tests/gold-prices-filter-pagination.test.ts`)**:
   - Menambahkan unit test untuk `getUniqueGoldBrands`, `getUniqueGoldWeights`, `filterGoldPrices`, `paginateGoldPrices`, serta integrasi UI di `/emas/prices`.
4. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F2.2 (Lihat & edit harga harian).

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.6): Dropdown Jenis Rekening / Tabungan pada Pengaturan Modul Zakat (`/zakat/settings`)

Menambahkan dropdown jenis rekening (`Bank`, `e-Wallet`, `Reksadana / Investasi`, `Tunai / Cash`, `Lainnya`; default `Bank`) pada form Tambah/Edit Rekening di halaman Kelola Rekening & Tabungan (`/zakat/settings`), menyimpannya ke kolom baru `account_type` di tabel `zakat_accounts`, serta menampilkan metadata jenis rekening pada daftar rekening dan modal input zakat tahunan (`YearModal`).

### Detail Perubahan:
1. **Skema & Migrasi Database (`supabase/migrations/20261030000001_add_account_type_to_zakat_accounts.sql`, `supabase/migrations/20261025000000_init_schema.sql`)**:
   - Menambahkan kolom `account_type TEXT NOT NULL DEFAULT 'Bank'` pada tabel `public.zakat_accounts`.

2. **Konstanta & Helper (`src/lib/zakat/engine.ts`)**:
   - Menambahkan konstanta `ZAKAT_ACCOUNT_TYPES = ['Bank', 'e-Wallet', 'Reksadana / Investasi', 'Tunai / Cash', 'Lainnya']` dan tipe `ZakatAccountType`.
   - Menambahkan fungsi `formatZakatAccountMeta` untuk menggabungkan informasi jenis rekening, institusi, dan nomor rekening dengan fallback default `'Bank'`.

3. **Antarmuka Pengguna (`src/app/zakat/settings/page.tsx`, `src/components/zakat/YearModal.tsx`)**:
   - Menambahkan dropdown `<select id="zakat-account-type" className="form-select">` (`minHeight: '44px'`) dengan label aksesibel `htmlFor="zakat-account-type"` serta layout grid responsif mobile-first (`repeat(auto-fit, minmax(220px, 1fr))`).
   - Menyertakan `account_type` saat tambah rekening baru, edit rekening, dan mereset kembali ke `'Bank'` setelah simpan atau batal edit.
   - Menampilkan metadata jenis rekening menggunakan `formatZakatAccountMeta(acc)` pada daftar rekening di `/zakat/settings` dan daftar input saldo di `YearModal`.

4. **Pengujian Unit (`tests/zakat-account-type.test.tsx`, `tests/schema.test.ts`)**:
   - Menambahkan unit test untuk memverifikasi opsi `ZAKAT_ACCOUNT_TYPES`, fungsi `formatZakatAccountMeta`, file migrasi SQL `account_type`, serta integrasi dropdown di `ZakatSettingsPage` dan `YearModal`.

5. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F3.1, F3.6, dan tabel model data `zakat_accounts`.

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.7): Text Box Terpisah untuk 2 Digit Desimal Saldo Zakat (`YearModal`)

Menyediakan input terpisah untuk 2 digit di belakang koma (default `00`) pada input saldo rekening zakat (`YearModal`), berdampingan dengan input utama ribuan murni (`NumberInput`). Dengan pemisahan ini, pengguna dapat mengetik angka nominal ribuan langsung tanpa repot atau terganggu pengetikan titik manual, sementara bagian sen/desimal dapat diisi hingga 2 digit secara spesifik.

### Detail Perubahan:
1. **Antarmuka Pengguna Input Saldo (`src/components/zakat/YearModal.tsx`)**:
   - Memisahkan input saldo rekening menjadi 2 field horizontal:
     - Field utama ribuan (`NumberInput`): format otomatis titik tanpa desimal, sehingga pengetikan angka langsung berjalan natural.
     - Label pemisah koma (`,`).
     - Field desimal (`<input>`): `type="text"`, `inputMode="numeric"`, `maxLength={2}`, `placeholder="00"`, `value` default `'00'`, lebar `44px`, tinggi minimal `44px` (mematuhi standar touch target mobile).
   - Menambahkan event handler `handleIntChange`, `handleDecChange`, dan `handleDecBlur` (auto-pad 2 digit atau reset ke `'00'` saat blur) yang secara reaktif menggabungkan integer dan desimal menjadi angka presisi 2 desimal.
   - Menggunakan lazy state initialization dari `initialData` untuk mencegah flash input kosong.
2. **Utilitas Format & Parse Angka (`src/lib/number.ts`, `src/components/NumberInput.tsx`)**:
   - Memperbarui fungsi `formatThousand` dan `parseThousand` untuk mendeteksi pemisah desimal dan ribuan secara cerdas serta mendukung parameter pemotongan `maxDecimals`.
3. **Mesin Kalkulasi Zakat (`src/lib/zakat/engine.ts`)**:
   - Menambahkan pembulatan presisi 2 desimal (`Math.round(val * 100) / 100`) pada perhitungan total kas, total aset, dan selisih komparasi antar tahun agar bebas dari artefak floating-point IEEE 754.
4. **Pengujian Unit & TDD (`tests/number-input.test.tsx`, `tests/zakat-engine.test.ts`, `tests/zakat-ui.test.ts`)**:
   - Menambahkan pengujian render komponen `YearModal` untuk memverifikasi split integer input dan decimal input (`zakat-acc-dec-*`) dengan default `00` dan batas `maxLength=2`.
   - Menguji penguraian saldo desimal (`6951418.61` -> integer `6.951.418` dan desimal `61`).
   - Seluruh 31 test suites (114 test cases) lulus 100%.
5. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F3.2 dan F3.4 untuk mencatat pemisahan text box nominal ribuan utama dan text box terpisah 2 digit desimal (default 00).

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.8): Input Nilai Emas Editable pada Modal Input Zakat (`YearModal`)

Mengubah informasi nilai emas dari modul Emas pada form input/edit Zakat (`YearModal`) menjadi field input yang **editable** (`NumberInput`). Secara default field langsung terisi otomatis dari perhitungan kepemilikan modul Emas per tanggal acuan 1 Ramadhan, namun dapat diedit secara bebas oleh pengguna untuk kebutuhan pencatatan data zakat tahun-tahun lalu.

### Detail Perubahan:
1. **Skema & Migrasi Database (`supabase/migrations/20261030000002_add_gold_value_snapshot_to_zakat_years.sql`, `supabase/migrations/20261025000000_init_schema.sql`)**:
   - Menambahkan kolom `gold_value_snapshot NUMERIC(15, 2) NOT NULL DEFAULT 0` pada tabel `public.zakat_years` untuk menyimpan nilai emas hasil input/snapshot tahun tersebut.
2. **Antarmuka Pengguna Modal Zakat (`src/components/zakat/YearModal.tsx`, `src/app/zakat/page.tsx`)**:
   - Mengganti kotak preview statis nilai emas menjadi field `NumberInput` yang editable dengan `id="zakat-gold-holdings"`, label `"Nilai Emas Fisik Tertahan (1 Ramadhan) (Rp)"`, dan tinggi minimal `44px` sesuai standar tap target mobile.
   - Saat tambah tahun baru, nilai default otomatis mengikuti hasil kalkulasi kepemilikan emas dari modul Emas (`computeGoldHoldingValue` / `goldValueFromHoldings`) dan otomatis ikut menyesuaikan ketika Tahun Hijriah, Tanggal Referensi 1 Ramadhan, atau Harga Emas Acuan diubah selama belum di-override manual.
   - Menyediakan tombol `"Ambil dari Modul Emas"` (`minHeight: '44px'`) untuk mereset kembali nilai ke perhitungan otomatis modul Emas apabila pengguna telah mengedit manual.
   - Saat edit tahun zakat yang sudah ada, nilai terisi dari `gold_value_snapshot` yang tersimpan (atau fallback selisih `total_assets - total_cash` untuk data lama).
   - Menyimpan `gold_value_snapshot` ke tabel `zakat_years` saat insert maupun update.
3. **Pengujian Unit & TDD (`tests/zakat-ui.test.ts`, `tests/schema.test.ts`)**:
   - Menambahkan pengujian unit untuk memverifikasi render input editable `#zakat-gold-holdings` dengan nilai default dari `goldValueFromHoldings`, pembacaan `gold_value_snapshot` saat edit tahun, fallback derivasi dari `total_assets`, serta keberadaan kolom `gold_value_snapshot` pada skema SQL.
4. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F3.3 untuk mencatat mekanisme auto-fill dari modul Emas yang dapat diedit manual beserta penyimpanan snapshot `gold_value_snapshot`.

---

## Ringkasan Perubahan (Catat-Mencatat v0.5.9): Acuan Zakat Dual Nisab (Emas & Perak) & Kolom "Yang Dibayarkan"

Menambahkan dukungan dua acuan nisab zakat mal (Nisab Emas 85g dan Nisab Perak 595g) dengan kolom zakat masing-masing, serta kolom "Yang Dibayarkan" yang dapat diedit secara bebas dengan nilai default pembulatan ke atas dari zakat 2.5%.

### Detail Perubahan:
1. **Skema & Migrasi Database (`supabase/migrations/20261030000003_add_silver_and_paid_to_zakat_years.sql`, `supabase/migrations/20261025000000_init_schema.sql`)**:
   - Menambahkan kolom `silver_price_per_gram NUMERIC(15, 2) NOT NULL DEFAULT 0`, `nisab_silver_nominal NUMERIC(15, 2) NOT NULL DEFAULT 0`, `zakat_silver_due NUMERIC(15, 2) NOT NULL DEFAULT 0`, dan `zakat_paid NUMERIC(15, 2) NOT NULL DEFAULT 0` pada tabel `public.zakat_years`.
2. **Mesin Kalkulasi Zakat (`src/lib/zakat/engine.ts`)**:
   - Menambahkan konstanta `GOLD_NISAB_GRAMS = 85`, `SILVER_NISAB_GRAMS = 595`, dan `DEFAULT_SILVER_PRICE = 18000`.
   - Mengembangkan fungsi `calculateZakat` untuk menghitung:
     - `nisabGoldNominal` (85g) dan `nisabSilverNominal` (595g).
     - Status kewajiban terpisah: `isWajibGold` dan `isWajibSilver`.
     - Nilai zakat masing-masing acuan: `zakatGoldDue` dan `zakatSilverDue`. Jika emas tidak wajib namun perak wajib, zakat perak tampil `2.5% × Total Harta`. Jika kedua acuan wajib, kedua nilai zakat bernilai sama. Jika keduanya tidak wajib, kedua zakat bernilai 0.
     - `defaultZakatPaid`: pembulatan ke atas dari nilai zakat 2.5% ke kelipatan 10.000 terdekat (`Math.ceil(zakatDue / 10000) * 10000`), atau 0 jika tidak wajib.
   - Memperbarui `compareTwoZakatYears` untuk menghitung selisih zakat perak (`zakatSilverDueDelta`) dan nominal zakat yang dibayarkan (`zakatPaidDelta` & `zakatPaidDeltaPct`).
3. **Form Input / Edit Modal Zakat (`src/components/zakat/YearModal.tsx`)**:
   - Menambahkan field input `Harga Perak Acuan (Rp/g)` berdampingan dengan `Harga Emas Acuan (Rp/g)` dalam grid responsif dengan tap target minimal 44px.
   - Menampilkan card komparasi dual nisab: Nisab Emas (85g) dan Nisab Perak (595g) beserta status kewajiban dan nominal zakat 2.5% masing-masing acuan secara real-time.
   - Menambahkan input field editable `"Yang Dibayarkan (Rp)"` (`#zakat-paid-amount`) yang otomatis terisi default pembulatan ke atas dari nilai zakat 2.5%, disertai tombol `"Reset Default"` saat diubah manual.
   - Menyediakan quick rounding chips interaktif (Pas, +10rb, +50rb, +100rb) untuk mengisi nominal pembayaran dengan satu ketukan.
   - Menyalurkan `silver_price_per_gram`, `nisab_silver_nominal`, `zakat_silver_due`, dan `zakat_paid` ke payload penyimpanan `onSave`.
4. **Tampilan Spreadsheet & Komparasi Antar-Tahun (`src/components/zakat/ZakatSpreadsheetTable.tsx`, `src/components/zakat/CompareTwoYears.tsx`, `src/app/zakat/page.tsx`)**:
   - `ZakatSpreadsheetTable`: Menambahkan baris terpisah untuk `Nisab (85g Emas)`, `Zakat Emas (2.5%)`, `Nisab (595g Perak)`, `Zakat Perak (2.5%)`, dan baris `Yang Dibayarkan`.
   - `CompareTwoYears`: Menyajikan komparasi kartu mobile-first untuk Total Harta, Yang Dibayarkan, Zakat Acuan Emas (85g), dan Zakat Acuan Perak (595g).
   - Halaman `/zakat`: Menampilkan rincian kedua acuan nisab dan nominal dibayarkan pada overview card tahun aktif serta riwayat rekap tahunan.
5. **Pengujian Unit & TDD (`tests/zakat-engine.test.ts`, `tests/zakat-ui.test.ts`, `tests/schema.test.ts`)**:
   - Menambahkan pengujian kalkulasi dual nisab, kondisi emas tidak wajib tapi kena perak, kondisi keduanya wajib bernilai sama, kondisi keduanya belum wajib, default pembulatan ke atas 10k, perbandingan antar tahun, dan render UI modal, spreadsheet, serta komparasi dua tahun.
   - Seluruh 31 test suites (124 test cases) lulus 100%.
6. **Dokumentasi PRD (`PRD.md`)**:
   - Memperbarui spesifikasi F3.4 dan F3.5 mencakup kalkulasi dual nisab dan field "Yang Dibayarkan".
