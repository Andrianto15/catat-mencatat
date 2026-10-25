# PRD: Catat-Mencatat

| | |
|---|---|
| Status | Implementation Complete (v0.4.1) |
| Tanggal | 25-10-2026 |
| Pemilik | Andrian (pengguna tunggal) |
| Stack | Next.js (App Router) + Supabase (Postgres, Auth) + PWA + Vercel |
| Lisensi | MIT License |
| Sumber | `docs/app_requirement.txt`, `docs/req_catat_zakat_mal.png`, sesi brainstorming 25-10-2026 |

Penanda: **[keputusan builder/AI]** = ditetapkan saat diskusi tanpa konfirmasi eksplisit, boleh dikoreksi.

---

## 1. Executive Summary

Catat-Mencatat adalah Progressive Web App (PWA) pribadi (mobile-first) untuk mencatat tiga hal yang selama ini tersebar di spreadsheet: riwayat servis motor, pembelian emas, dan perhitungan zakat mal tahunan. Dapat diinstall ke home screen smartphone dengan tampilan standalone menyerupai aplikasi native.

Halaman utama hanya berisi ikon tiga modul. Setiap modul punya riwayat, filter, form input via modal, dan pengaturan master data-nya sendiri. Modul emas menghitung profit berdasarkan harga buyback harian yang diambil otomatis dari situs Galeri24, dengan fallback isi manual. Modul zakat menggantikan tabel spreadsheet per tahun Hijriah, otomatis mengambil nilai emas dari modul emas, mengecek nisab, dan menyediakan perbandingan antar tahun.

Pengguna saat ini satu orang. Data tetap dipisah per `user_id` dengan RLS agar aman dan siap bila nanti dipakai anggota keluarga.

## 2. Problem Statement

- Data servis motor, emas, dan zakat tersimpan di spreadsheet terpisah; sulit difilter dan dibandingkan.
- Profit emas harus dihitung manual dengan mengecek harga buyback Galeri24 setiap kali.
- Tabel zakat (lihat `docs/req_catat_zakat_mal.png`) tumbuh ke kanan setiap tahun, sulit dibaca di HP, dan nilai emas di dalamnya diisi manual walau datanya sudah ada di catatan emas.

## 3. Goals & Objectives

### Goals
1. Satu tempat untuk tiga catatan, nyaman dipakai dari HP sebagai PWA installable.
2. Profit dan total aset emas per pemilik terhitung otomatis dengan harga terbaru.
3. Isi zakat tahunan cukup mengisi saldo; total, zakat 2,5%, nisab, dan nilai emas terhitung otomatis.
4. Perbandingan zakat antar tahun mudah dibaca di HP.

### Non-goals
- Import otomatis dari spreadsheet (data lama diinput manual oleh pengguna).
- Multi-user / login anggota keluarga (struktur data siap, fitur tidak dibuat).
- Pengingat jadwal servis, notifikasi, atau analitik servis.
- Aplikasi native khusus toko aplikasi (App Store/Play Store) & full offline data sync (mutasi data tetap butuh internet ke Supabase).

### Anti-goals (gagal walau "jalan")
- Angka zakat tahun lalu berubah sendiri karena harga emas berubah.
- Hasil scraping menimpa harga yang sudah dikoreksi manual.
- Data keuangan bisa dibaca tanpa login atau orang lain bisa mendaftar akun.
- Di HP, pengguna harus scroll horizontal untuk membaca informasi utama.

## 4. User Persona

**Andrian, pengguna tunggal.** Mencatat untuk dirinya dan keluarga (pemilik emas dan pelaku zakat bisa orang berbeda, misal istri). Lebih sering membuka dari HP sebagai PWA. Biasa mengecek harga emas di Galeri24. Mengisi zakat setahun sekali menjelang/saat Ramadhan dengan melihat saldo setiap rekening.

## 5. Fitur & User Stories

### 5.0 Umum

**F0.1 Login**
As pengguna, I want login dengan email & password, so that data keuangan saya tidak terbuka untuk publik.
- Acceptance:
  - Semua halaman selain `/login` mengarah ke `/login` bila belum login.
  - Pendaftaran akun baru dimatikan (Supabase Auth: disable signups). Akun dibuat manual via dashboard Supabase.
  - Ada tombol logout kecil di header (ikon), tidak mengganggu grid modul. **[keputusan builder/AI]**

**F0.2 Halaman utama**
As pengguna, I want halaman utama hanya berisi ikon modul, so that tampilan bersih.
- Acceptance:
  - Hanya 3 ikon + label: Servis Motor, Emas, Zakat Mal.
  - Tidak ada menu pengaturan global; pengaturan berada di dalam modul masing-masing.

**F0.3 Input cepat**
As pengguna, I want form yang cepat diisi berulang, so that memasukkan data lama tidak melelahkan.
- Acceptance:
  - Form tambah memakai modal (bottom sheet di HP).
  - Tombol "Simpan" dan "Simpan & tambah lagi" (modal tetap terbuka, field direset kecuali field "sticky").
  - Field sticky (motor, tempat, pemilik, brand) default ke nilai input terakhir.
  - Tanggal boleh diisi mundur tanpa batas, tidak boleh di masa depan.
  - Setiap catatan bisa diedit dan dihapus (hapus dengan konfirmasi).

**F0.4 Format angka**
- Rupiah ditampilkan format `id-ID` (`Rp 1.234.567`); input angka mendukung pemisah ribuan.
- Kolom "No" pada riwayat = nomor urut tampilan, tidak disimpan di database.

**F0.5 Dukungan PWA (Progressive Web App)**
As pengguna, I want menginstall aplikasi ke home screen HP layaknya native app, so that akses lebih cepat dan tanpa address bar browser.
- Acceptance:
  - Tersedia Web App Manifest (`manifest.json` / `manifest.webmanifest`) dengan name "Catat Mencatat", short_name, icons (192x192, 512x512, maskable), theme_color (`#4682b4`), background_color (`#f8fafc`).
  - Display mode: `standalone`.
  - Service worker caching untuk app shell, static assets (CSS, JS, fonts).
  - Halaman offline fallback jika koneksi internet terputus saat mengakses halaman baru.

**F0.6 Switch Theme (Dark / Light / System)**
As pengguna, I want mengubah tema aplikasi antara Terang (Light), Gelap (Dark), dan Otomatis Sistem (System), so that mata nyaman saat menggunakan aplikasi dalam berbagai kondisi pencahayaan.
- Acceptance:
  - Tombol ikon toggle tema tersedia di header halaman utama dan header modul-modul (`/motor`, `/emas`, `/zakat`).
  - Siklus pergantian saat tombol diklik: Terang (`light`) -> Gelap (`dark`) -> Sistem (`system`) -> Terang.
  - Pilihan tersimpan di `localStorage` (`catat_theme`).
  - Script anti-flicker (anti-FOUC) disematkan di `<head>` agar tema langsung aktif sebelum render pertama tanpa flicker putih/hitam.
  - Mode sistem sinkron otomatis dengan perubahan `prefers-color-scheme` pada perangkat pengguna.
  - Aksesibilitas tap target minimal 44x44px untuk kenyamanan sentuhan mobile.

**F0.7 Footer Aplikasi**
As pengguna, I want melihat footer informatif di semua halaman termasuk login, so that terdapat informasi identitas aplikasi dan lisensi yang konsisten.
- Acceptance:
  - Footer terpasang di seluruh halaman aplikasi (`/login`, `/`, `/motor`, `/emas`, `/zakat`, dan halaman pengaturan).
  - Menggunakan tag semantik `<footer>`.
  - Memuat nama aplikasi "Catat-Mencatat", deskripsi ringkas "Aplikasi Pencatatan Pribadi (Motor, Emas, Zakat Mal)", tahun berjalan dinamis, serta status lisensi MIT.
  - Desain *mobile-first* bersih tanpa slop visual, mematuhi padding safe area bawah layar (`calc(1.25rem + env(safe-area-inset-bottom))`) agar ramah layar sentuh HP.
  - Tata letak sticky bottom flex flow sehingga footer tetap berada di bagian bawah tampilan pada halaman pendek maupun panjang.

**F0.8 Standar Aksesibilitas, Modal & Ergonomi Mobile (Audit Impeccable)**
As pengguna, I want aplikasi mematuhi standar aksesibilitas WCAG dan kenyamanan sentuhan mobile, so that navigasi dan input data selalu mulus dan inklusif.
- Acceptance:
  - Viewport tidak mengunci zoom pengguna (`userScalable: false` / `maximumScale: 1` ditiadakan untuk WCAG 1.4.4 Resize Text).
  - Seluruh modal dialog mengimplementasikan WAI-ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), tombol tutup 44x44px dengan `aria-label="Tutup"`, serta penutupan via tombol `Escape` dan klik luar modal.
  - Semua label formulir terhubung eksplisit dengan input ID (`<label htmlFor="...">` dan `<input id="...">`).
  - Target sentuhan interaktif (termasuk filter pills, tombol penutup modal, dan kontrol header) memenuhi standar minimal 44x44px.
  - Desain token semantik status (`--color-danger-bg`, `--color-danger-text`, `--color-success-bg`, `--color-success-text`) terdefinisi untuk mode terang dan gelap.
  - Kartu statistik ringkasan servis motor mengadopsi grid auto-fit responsif agar angka tidak terpotong pada layar HP sempit (<360px).

### 5.1 Modul Servis Motor

**F1.1 Riwayat servis**
As pengguna, I want melihat riwayat servis, so that saya tahu kapan dan berapa biaya servis sebelumnya.
- Kolom: No, Tanggal servis, Motor, KM, Harga, Tempat, Catatan.
- Urut default tanggal terbaru di atas.
- HP: tampil sebagai list card; desktop: tabel.
- Ringkasan kecil di atas list: jumlah servis & total biaya sesuai filter aktif. **[keputusan builder/AI]**

**F1.2 Filter**
- Filter motor (multi) dan rentang tanggal. Filter bisa direset.

**F1.3 Tambah/edit servis (modal)**
- Field wajib: tanggal, motor, KM (integer ≥ 0), harga (≥ 0).
- Field opsional: tempat, catatan (teks bebas, maks 1000 karakter).

**F1.4 Pengaturan modul: daftar motor**
- CRUD daftar motor (nama, misal "NMax", "Beat").
- Motor yang sudah punya riwayat tidak bisa dihapus, hanya dinonaktifkan (hilang dari pilihan form, tetap muncul di filter & riwayat).

### 5.2 Modul Emas

**F2.1 Harga emas harian (data `gold_prices`)**
As pengguna, I want harga jual & buyback Galeri24 tersimpan harian, so that profit dan nilai aset terhitung otomatis.
- Acceptance:
  - Job harian (Vercel Cron, 1x/hari, ±09:00 WIB) memanggil route handler Next.js yang dilindungi `CRON_SECRET`.
  - Job mengambil `https://galeri24.co.id/harga-emas`, mem-parsing harga per **brand + berat keping**: harga jual & buyback (harga per keping).
  - Hasil disimpan per (tanggal, brand, berat) dengan status `berhasil`.
  - **Bila gagal** (situs down, struktur berubah, hasil parsing kosong): tetap buat baris untuk tanggal itu dengan harga kosong dan status `gagal`. Kombinasi brand+berat mengikuti scraping terakhir yang berhasil. **[keputusan builder/AI]**
  - Job idempoten: dijalankan ulang di hari yang sama boleh mengisi/memperbarui baris `berhasil`/`gagal`, **tidak pernah menimpa baris `manual`**.
  - Ada tombol "Ambil ulang sekarang" di halaman harga untuk memicu job manual.

**F2.2 Lihat & edit harga harian (pengaturan modul Emas)**
As pengguna, I want melihat dan mengedit harga hasil scraping, so that saya bisa mengisi hari yang gagal atau mengoreksi angka.
- Acceptance:
  - List per tanggal (terbaru di atas), filter tanggal & brand, penanda jelas untuk baris harga kosong.
  - Edit harga jual/buyback; setelah diedit status menjadi `manual`.
  - Bisa menambah baris manual untuk tanggal/brand/berat yang tidak ada (misal tanggal lampau untuk data lama).

**F2.3 Riwayat pembelian emas**
- Kolom: No, Tanggal beli, Brand, Berat (gram), Harga beli (per keping), Buyback saat beli (per keping), Tempat, Pemilik, Profit (Rp), Profit (%), Aksi (Edit, Hapus, Jual).
- Satu baris = satu keping. Beli 3 keping = 3 baris (dibantu "Simpan & tambah lagi"). **[keputusan builder/AI]**
- Filter: brand, rentang tanggal, pemilik.
- Tampilan default: hanya menampilkan keping aktif (belum dijual). Keping yang sudah dijual disembunyikan dari layar utama (soft delete).
- HP: list card dengan profit menonjol (warna naik/turun + teks, bukan warna saja); desktop: tabel.

**F2.4 Tambah/edit pembelian (modal)**
- Field wajib: tanggal, brand (pilihan dari brand di `gold_prices`, default "Galeri24"), berat gram (> 0, desimal), harga beli per keping, pemilik.
- "Buyback saat beli" otomatis terisi dari `gold_prices` (tanggal beli, brand, berat yang sama); tetap bisa diubah; boleh kosong bila data tidak ada.
- Field opsional: tempat.

**F2.5 Perhitungan profit**
Definisi:
- `harga_beli_per_gram = harga_beli_per_keping / berat`
- `buyback_kini_per_gram = buyback per keping terbaru (non-kosong) untuk brand+berat yang sama / berat`
- `Profit (Rp) = (buyback_kini_per_gram − harga_beli_per_gram) × berat`
- `Profit (%) = (buyback_kini_per_gram − harga_beli_per_gram) / harga_beli_per_gram × 100`
- Bila harga hari ini kosong, pakai harga non-kosong terakhir dan tampilkan label "harga per DD-MM-YYYY".
- Bila tidak ada harga sama sekali untuk brand+berat itu: profit tampil "–" dengan keterangan "harga buyback belum ada".

**F2.6 Ringkasan aset per pemilik**
- Card per pemilik: total gram dan total nilai (Σ buyback kini per keping), plus total profit.
- Hanya menghitung keping aktif yang **belum dijual** (`sold_at IS NULL`). Ringkasan selalu seluruh aset aktif pemilik. **[keputusan builder/AI]**

**F2.7 Pengaturan modul: daftar orang**
- CRUD daftar orang (nama). Dipakai bersama modul Emas (pemilik) dan Zakat (pelaku). Bisa dibuka dari pengaturan kedua modul; datanya sama.
- Orang yang punya data tidak bisa dihapus, hanya dinonaktifkan.

**F2.8 Penjualan Emas (Modal Jual)**
As pengguna, I want tombol jual untuk mencatat emas yang dilepas, so that aset aktif berkurang dan tidak muncul lagi di layar utama.
- Acceptance:
  - Tombol "Jual" pada keping emas di riwayat.
  - Modal input: Tanggal jual (wajib, tidak boleh sebelum tanggal beli, tidak di masa depan) dan Harga jual per keping (wajib, numeric ≥ 0).
  - Setelah disimpan, keping ditandai telah terjual (`sold_at` dan `sold_price_per_piece` terisi) dan otomatis disembunyikan dari list aktif (soft delete).
  - Keping terjual tidak lagi dihitung di total aset aktif & profit berjalan.
  - (Opsional) Ada toggle filter "Tampilkan yang sudah terjual" di riwayat untuk kebutuhan audit/melihat riwayat penjualan. **[keputusan builder/AI]**

### 5.3 Modul Zakat Mal

Referensi tampilan lama: `docs/req_catat_zakat_mal.png` (baris = rekening/aset, kolom = tahun Hijriah, baris Total, Zakat 2,5%, Yang dibayarkan).

**F3.1 Struktur data**
- Dikelompokkan per **orang** (pelaku). Pilih orang via chip/tab di atas halaman.
- Setiap orang punya daftar **rekening/aset** sendiri (Mandiri, BSI, Gopay, Cash Kertas, dll), bisa ditambah, diurutkan, dinonaktifkan.
- Setiap orang punya catatan per **tahun Hijriah** (misal 1447 H) berisi saldo per rekening.

**F3.2 Isi tahun baru**
As pengguna, I want membuat tahun baru dan tinggal mengisi saldo, so that pengisian tahunan cepat.
- Acceptance:
  - "Tambah tahun" mengusulkan tahun Hijriah berikutnya; daftar rekening aktif disalin dari tahun sebelumnya dengan saldo kosong.
  - Saldo mendukung desimal 2 digit (contoh data lama `6.951.418,61`).
  - **Tanggal acuan** = 1 Ramadhan tahun tersebut, dikonversi otomatis ke Masehi (kalender Umm al-Qura), bisa diubah manual (beda tanggal Kemenag ±1 hari). **[keputusan builder/AI]**
  - Rekening yang nonaktif tidak disalin, tapi saldo lamanya tetap tersimpan di tahun lama.
  - Tahun lama bisa dibuat (untuk input data 1444–1446 H).

**F3.3 Baris Emas otomatis**
- Baris "Emas" bukan rekening manual; nilainya dihitung dari modul Emas:
  `Σ (buyback per keping pada tanggal acuan, per brand+berat) untuk semua keping milik orang itu dengan tanggal beli ≤ tanggal acuan DAN (sold_at IS NULL ATAU sold_at > tanggal acuan)`.
- Bila harga tanggal acuan kosong, pakai harga non-kosong terakhir sebelum tanggal acuan; bila tidak ada sama sekali, nilai bisa diisi manual.
- Saat tahun disimpan, nilai emas (dan total gram) **dikunci sebagai snapshot**. Tombol "Hitung ulang emas" untuk memperbarui snapshot secara sadar. **[keputusan builder/AI]**

**F3.4 Perhitungan**
- `Total = Σ saldo rekening + nilai emas`
- `Nisab = 85 × harga emas per gram pada tanggal acuan`. Harga per gram diambil dari harga **jual** Galeri24 keping 1 gram brand "Galeri24" pada tanggal acuan (fallback ke harga terakhir sebelumnya); bisa diubah manual dan ikut tersimpan sebagai snapshot. **[keputusan builder/AI]**
- `Wajib zakat = Total ≥ Nisab`
- `Zakat 2,5% = 0,025 × Total` bila wajib; bila tidak, tampil label "Belum mencapai nisab" dan zakat 0.
- **Yang dibayarkan**: diisi pengguna. Ada chip pembulatan ke atas cepat (kelipatan 10rb / 50rb / 100rb) dari nilai zakat 2,5%; angka tetap bisa diketik bebas (termasuk saat belum nisab).

**F3.5 Perbandingan antar tahun**
- **HP (tampilan utama):** pilih dua tahun (default: tahun terbaru vs sebelumnya). Per rekening tampil saldo tahun terpilih + perubahan (▲/▼, nominal & %) dibanding tahun pembanding. Baris Total, Zakat 2,5%, dan Yang dibayarkan juga dibandingkan.
- **Desktop (tambahan):**
  - Tabel seperti spreadsheet: rekening di kolom kiri (sticky), tahun sebagai kolom, scroll horizontal.
  - Grafik batang tren Total & Yang dibayarkan per tahun.
- Rekening yang tidak ada di salah satu tahun tampil "–".

**F3.6 Pengaturan modul Zakat**
- Daftar rekening per orang (CRUD, urutan, aktif/nonaktif).
- Daftar orang (sama dengan F2.7).

## 6. Success Metrics

Aplikasi pribadi, metrik sederhana:

| Metrik | Target |
|---|---|
| Spreadsheet lama tidak dipakai lagi | 100% data lama terinput dalam 1 bulan setelah rilis |
| Zakat Ramadhan berikutnya diisi lewat app | Ya, tanpa kembali ke spreadsheet |
| Keberhasilan scraping harian | ≥ 90% hari berstatus `berhasil` per bulan |
| Waktu input 1 catatan servis/emas di HP | ≤ 30 detik |
| Angka zakat tahun lalu stabil | 0 perubahan tanpa aksi "Hitung ulang" |

## 7. Scope

### In scope (MVP)
F0.1–F0.5, F1.1–F1.4, F2.1–F2.8, F3.1–F3.6.

### Out of scope
- Import CSV/spreadsheet, export.
- Multi-user, berbagi data, role.
- Notifikasi, reminder servis.
- Sumber harga selain Galeri24 / API pihak ketiga berbayar.
- Full offline background sync untuk mutasi data (mutasi data tetap butuh koneksi ke Supabase).

## 8. Technical Considerations

### Arsitektur
- Next.js App Router, Server Components + Server Actions untuk CRUD; client components untuk modal, filter, grafik.
- Supabase: Postgres + Auth (email/password), akses via `@supabase/ssr`. Middleware Next.js untuk proteksi route.
- PWA: Dukungan Progressive Web App via `@serwist/next` (atau `@ducanh2912/next-pwa`) dengan `manifest.webmanifest`, app icons, dan service worker caching untuk app shell & static assets.
- Hosting: Vercel (Cron untuk scraping). **[keputusan builder/AI]**
- Bahasa: TypeScript.

### Model data (usulan)

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `people` | id, user_id, name, is_active | dipakai emas & zakat |
| `motors` | id, user_id, name, is_active | |
| `motor_services` | id, user_id, motor_id, service_date, km int, price numeric, place, notes | |
| `gold_prices` | id, price_date, brand, weight_gram numeric, sell_price numeric null, buyback_price numeric null, status (`berhasil`/`gagal`/`manual`), updated_at | unique(price_date, brand, weight_gram); data global (bukan per user) |
| `gold_purchases` | id, user_id, owner_id→people, purchase_date, brand, weight_gram, price_per_piece, buyback_at_purchase_per_piece null, place, sold_at date null, sold_price_per_piece numeric null | 1 baris = 1 keping; sold_at terisi berarti terjual (soft delete) |
| `zakat_accounts` | id, user_id, person_id, name, sort_order, is_active | |
| `zakat_years` | id, user_id, person_id, hijri_year int, reference_date, gold_value_snapshot, gold_grams_snapshot, gold_price_per_gram_nisab, paid_amount null, notes | unique(person_id, hijri_year) |
| `zakat_balances` | id, zakat_year_id, account_id, balance numeric(15,2) | unique(zakat_year_id, account_id) |

- Uang memakai `numeric` (bukan float). Total, zakat, nisab, profit dihitung di kode (fungsi murni), tidak disimpan, kecuali snapshot yang disebut di atas.

### Keamanan
- RLS aktif di semua tabel. Tabel ber-`user_id`: hanya `auth.uid() = user_id` boleh select/insert/update/delete. `zakat_balances` lewat join ke `zakat_years`.
- `gold_prices`: select & update untuk user terautentikasi; insert/upsert oleh job cron memakai service role key (hanya di server, tidak pernah ke client).
- Route cron menolak request tanpa header `Authorization: Bearer ${CRON_SECRET}`.
- Validasi input di server (zod atau sejenis): angka ≥ 0, tanggal valid & tidak di masa depan, panjang teks dibatasi.
- Teks pengguna dirender sebagai teks (tanpa `dangerouslySetInnerHTML`); query via Supabase client (parameterized).

### Scraping Galeri24
- Halaman `galeri24.co.id/harga-emas` dirender server-side; harga jual & buyback per brand per berat ada di HTML (dicek 25-10-2026).
- Parser dipisah sebagai fungsi murni `parseGaleri24Html(html) → [{brand, weight_gram, sell_price, buyback_price}]` agar bisa dites dengan fixture HTML.
- Risiko struktur berubah ditangani oleh status `gagal` + isi manual (F2.1–F2.2).
- Request dengan User-Agent wajar, 1x/hari, timeout ±15 detik.

### Tanggal Hijriah
- Konversi 1 Ramadhan → Masehi memakai kalender `islamic-umalqura` (`Intl.DateTimeFormat`), hasil bisa diubah manual.

### Testing (sesuai AGENTS.md)
- Jest, file di `tests/`.
- Wajib dites: perhitungan profit (F2.5), pemilihan harga fallback, nilai emas zakat (F3.3), total/nisab/zakat (F3.4), pembulatan chip, konversi tanggal Hijriah, parser Galeri24 (fixture HTML tersimpan di `tests/fixtures/`).

## 9. Design & UX Requirements

- Mengikuti `DESIGN.md` (token warna steel blue `#4682b4`, Public Sans, light/dark mode via CSS variables, card radius 1rem, hairline border, elevasi hanya saat interaksi). Nama brand di `DESIGN.md` diganti "Catat-Mencatat"; token dipakai apa adanya.
- **Mobile-first**: desain HP dulu, lalu desktop.
  - HP < 640px: list card, modal sebagai bottom sheet, tombol tambah sebagai FAB, target sentuh ≥ 44px, safe-area inset.
  - Desktop > 1024px: tabel untuk riwayat; tambahan tabel & grafik di zakat.
- Navigasi modul: header berisi tombol kembali ke beranda, judul modul, ikon pengaturan modul.
- Aksesibilitas: kontras ≥ 4,5:1, `:focus-visible`, naik/turun tidak hanya dibedakan warna (pakai ▲/▼ + tanda), `prefers-reduced-motion` dihormati.
- State kosong, loading, dan error untuk setiap list & form.
- Mockup referensi zakat (input tahun baru + opsi perbandingan): `.superpowers/brainstorm/*/content/zakat-layout.html`.

## 10. Timeline & Milestones

Urutan fase (tanpa tanggal target):

| Fase | Isi |
|---|---|
| 0 | Setup Next.js + Supabase + PWA dasar (manifest, icon, service worker), skema & RLS, auth, layout dasar + token DESIGN.md, halaman utama |
| 1 | Modul Servis Motor (F1) |
| 2 | Harga emas harian: parser, cron, halaman lihat/edit (F2.1–F2.2) |
| 3 | Pembelian & penjualan emas, profit, ringkasan, daftar orang (F2.3–F2.8) |
| 4 | Zakat: rekening, tahun, baris emas, nisab, perbandingan (F3) |
| 5 | Polish: PWA install & offline fallback audit, state kosong/error, dark mode, aksesibilitas, input data lama |

## 11. Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Struktur HTML Galeri24 berubah / situs memblokir | Harga harian kosong | Status `gagal` + baris kosong + edit manual; parser terisolasi & dites dengan fixture |
| Tidak ada harga historis untuk data lama (1444–1446 H, pembelian lama) | Profit/emas zakat tidak terhitung | Tambah baris harga manual untuk tanggal lampau; nilai emas zakat bisa diisi manual |
| Konversi Hijriah beda dengan Kemenag | Tanggal acuan meleset 1 hari | Tanggal acuan bisa diubah manual |
| Service role key bocor | Data global bisa diubah | Key hanya di env server Vercel; tidak diakses dari client |
| Vercel Cron Hobby 1x/hari & bisa telat | Harga hari itu belum ada pagi hari | Fallback harga terakhir + tombol "Ambil ulang sekarang" |

## 12. Dependencies & Assumptions

- Akun Supabase & Vercel tersedia (free tier cukup).
- Mayoritas emas dibeli di Galeri24; brand lain yang tercantum di Galeri24 (Antam, UBS, dll) ikut di-scrape.
- Harga beli emas yang dicatat = harga per keping.
- Pengguna tunggal; akun dibuat manual.
- Data lama diinput manual oleh pengguna.

## 13. Open Questions

*(Semua pertanyaan desain utama sudah terjawab)*
