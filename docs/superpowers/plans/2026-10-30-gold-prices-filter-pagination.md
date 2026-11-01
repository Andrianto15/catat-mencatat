# Gold Prices Filter & Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan filter jenis emas (`brand`) dan gramasi (`weight_gram`) berbasis pill buttons serta progressive pagination ("Tampilkan 5 Lainnya") pada halaman harga emas harian (`/emas/prices`).

**Architecture:** Ekstrak logika murni filter, ekstraksi opsi unik (`getUniqueGoldBrands`, `getUniqueGoldWeights`, `filterGoldPrices`), dan paginasi (`paginateGoldPrices`) di `src/lib/gold/actions.ts`. Gunakan fungsi tersebut di `src/app/emas/prices/page.tsx` dengan UI mobile-first (horizontal-scrollable pill buttons minHeight 44px dan tombol "Tampilkan 5 Lainnya").

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, Jest 30.

**Spec:** `PRD.md` (Section 5.2 F2.2 Lihat & edit harga harian)

## Global Constraints

- Mobile-first UI (`antislop-layoutmobile` R-03): Semua tombol filter pill dan tombol paginasi wajib memiliki tap target minimal `44px` (`minHeight: '44px'`) dan tidak menyebabkan horizontal overflow pada halaman.
- Tidak boleh ada karakter em dash (`—`) pada teks UI (`antislop` R-02).
- Gunakan token CSS semantik (`var(--bg-card)`, `var(--border-card)`, `var(--color-primary)`, `var(--text-main)`, `var(--text-muted)`).
- Reset `visibleCount` ke `DEFAULT_GOLD_PRICE_PAGE_SIZE` (5) setiap kali `selectedDate`, `selectedBrand`, atau `selectedWeight` berubah.
- Reset `selectedBrand` dan `selectedWeight` jika opsi yang sedang dipilih tidak lagi tersedia ketika pengguna mengganti `selectedDate`.

## Review Focus

- `prices` kosong pada tanggal terpilih -> menampilkan empty state "Belum ada data harga tanggal ini", bukan empty state filter.
- `prices` ada pada tanggal terpilih tetapi kombinasi filter `brand` + `weight_gram` menghasilkan 0 item -> menampilkan pesan empty state filter disertai tombol "Reset Filter".
- Gramasi desimal (`0.5`, `1`, `2.5`, `10`) -> `getUniqueGoldWeights` mengurutkan secara numerik ascending (`a - b`), bukan alfabetis string.
- Perbedaan huruf besar/kecil pada nama brand -> `getUniqueGoldBrands` dan `filterGoldPrices` menormalisasi/membandingkan secara konsisten.
- Pergantian filter saat sudah klik "Tampilkan 5 Lainnya" -> `visibleCount` kembali ke `5`.

---

### Task 1: Helper Filter & Pagination Harga Emas (`src/lib/gold/actions.ts`)

**Files:**
- Modify: `src/lib/gold/actions.ts`
- Test: `tests/gold-prices-filter-pagination.test.ts`

**Interfaces:**
- Consumes: `paginateMotorServices`, `DEFAULT_MOTOR_PAGE_SIZE`, `PaginatedResult` from `@/lib/motor/actions`
- Produces:
  - `DEFAULT_GOLD_PRICE_PAGE_SIZE = 5`
  - `getUniqueGoldBrands(prices: { brand: string }[]): string[]`
  - `getUniqueGoldWeights(prices: { weight_gram: number }[], brand?: string): number[]`
  - `filterGoldPrices<T extends { brand: string; weight_gram: number }>(prices: T[], filter: { brand?: string; weightGram?: number | null }): T[]`
  - `paginateGoldPrices<T>(prices: T[], limit?: number): PaginatedResult<T>`

- [ ] **Step 1: Write the failing test in `tests/gold-prices-filter-pagination.test.ts`**

```typescript
import {
  DEFAULT_GOLD_PRICE_PAGE_SIZE,
  getUniqueGoldBrands,
  getUniqueGoldWeights,
  filterGoldPrices,
  paginateGoldPrices,
} from '@/lib/gold/actions';

describe('Gold Prices Filter & Pagination Helpers', () => {
  const samplePrices = [
    { id: '1', brand: 'GALERI 24', weight_gram: 1, sell_price: 1500000, buyback_price: 1400000 },
    { id: '2', brand: 'ANTAM', weight_gram: 0.5, sell_price: 800000, buyback_price: 700000 },
    { id: '3', brand: 'ANTAM', weight_gram: 10, sell_price: 14500000, buyback_price: 13500000 },
    { id: '4', brand: 'ANTAM', weight_gram: 2, sell_price: 2950000, buyback_price: 2750000 },
    { id: '5', brand: 'UBS', weight_gram: 1, sell_price: 1480000, buyback_price: 1380000 },
    { id: '6', brand: 'UBS', weight_gram: 5, sell_price: 7300000, buyback_price: 6800000 },
  ];

  it('extracts sorted unique brands', () => {
    expect(getUniqueGoldBrands(samplePrices)).toEqual(['ANTAM', 'GALERI 24', 'UBS']);
  });

  it('extracts numerically sorted unique weights (all and filtered by brand)', () => {
    expect(getUniqueGoldWeights(samplePrices)).toEqual([0.5, 1, 2, 5, 10]);
    expect(getUniqueGoldWeights(samplePrices, 'ANTAM')).toEqual([0.5, 2, 10]);
  });

  it('filters gold prices by brand and weightGram', () => {
    expect(filterGoldPrices(samplePrices, {})).toHaveLength(6);
    expect(filterGoldPrices(samplePrices, { brand: 'ANTAM' })).toHaveLength(3);
    expect(filterGoldPrices(samplePrices, { weightGram: 1 })).toHaveLength(2);
    expect(filterGoldPrices(samplePrices, { brand: 'ANTAM', weightGram: 2 })).toEqual([samplePrices[3]]);
    expect(filterGoldPrices(samplePrices, { brand: 'UBS', weightGram: 10 })).toEqual([]);
  });

  it('paginates gold prices with default page size of 5', () => {
    expect(DEFAULT_GOLD_PRICE_PAGE_SIZE).toBe(5);
    const page1 = paginateGoldPrices(samplePrices);
    expect(page1.items).toHaveLength(5);
    expect(page1.total).toBe(6);
    expect(page1.displayedCount).toBe(5);
    expect(page1.hasMore).toBe(true);

    const page2 = paginateGoldPrices(samplePrices, 10);
    expect(page2.items).toHaveLength(6);
    expect(page2.hasMore).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/gold-prices-filter-pagination.test.ts`
Expected: FAIL with functions not exported from `@/lib/gold/actions`

- [ ] **Step 3: Implement helper functions in `src/lib/gold/actions.ts`**

Tambahkan `DEFAULT_GOLD_PRICE_PAGE_SIZE`, `getUniqueGoldBrands`, `getUniqueGoldWeights`, `filterGoldPrices`, dan `paginateGoldPrices` di `src/lib/gold/actions.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx jest tests/gold-prices-filter-pagination.test.ts`
Expected: PASS

---

### Task 2: UI Filter Pill Buttons & Progressive Pagination di `/emas/prices` (`src/app/emas/prices/page.tsx`)

**Files:**
- Modify: `src/app/emas/prices/page.tsx`
- Modify: `tests/gold-prices-filter-pagination.test.ts`
- Modify: `PRD.md`
- Modify: `changelogs/CHANGELOG_30_10_2026.md`

**Interfaces:**
- Consumes: `DEFAULT_GOLD_PRICE_PAGE_SIZE`, `getUniqueGoldBrands`, `getUniqueGoldWeights`, `filterGoldPrices`, `paginateGoldPrices` from `@/lib/gold/actions`

- [ ] **Step 1: Add UI verification tests to `tests/gold-prices-filter-pagination.test.ts`**

Tambahkan pengujian untuk memastikan `src/app/emas/prices/page.tsx` memuat:
- Filter pill buttons untuk Jenis Emas ("Semua Jenis") dan Gramasi ("Semua Gramasi") dengan `minHeight: '44px'`.
- Tombol paginasi "Tampilkan 5 Lainnya" dengan `minHeight: '44px'` dan counter `"Menampilkan {paginatedPrices.displayedCount} dari {paginatedPrices.total} harga emas"`.
- Empty state ketika filter tidak menemukan kecocokan beserta tombol "Reset Filter".

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx jest tests/gold-prices-filter-pagination.test.ts`
Expected: FAIL on UI assertions

- [ ] **Step 3: Implement Filter Bar and Pagination in `src/app/emas/prices/page.tsx`**

Di `src/app/emas/prices/page.tsx`:
- Tambahkan state `selectedBrand` (`string`, default `''`), `selectedWeight` (`number | null`, default `null`), dan `visibleCount` (`number`, default `DEFAULT_GOLD_PRICE_PAGE_SIZE`).
- Reset `selectedBrand`, `selectedWeight`, dan `visibleCount` saat `selectedDate` berubah; reset `visibleCount` ke `DEFAULT_GOLD_PRICE_PAGE_SIZE` saat `selectedBrand` atau `selectedWeight` berubah.
- Tampilkan Filter Bar (hanya bila `prices.length > 0`) berisi:
  1. Baris pill buttons **Jenis Emas**: `"Semua Jenis"` + daftar `brands` unik (`minHeight: '44px'`, horizontal scroll).
  2. Baris pill buttons **Gramasi**: `"Semua Gramasi"` + daftar `weights` unik dalam format `{w} gr` (`minHeight: '44px'`, horizontal scroll).
- Render `paginatedPrices.items` dan kontrol pagination `"Tampilkan 5 Lainnya"` (identik dengan pola di `/emas/page.tsx`).
- Jika `prices.length > 0` namun `filteredPrices.length === 0`, tampilkan kartu empty state filter dengan tombol `"Reset Filter"`.

- [ ] **Step 4: Update `PRD.md` (F2.2) & `changelogs/CHANGELOG_30_10_2026.md`**

Perbarui spesifikasi F2.2 di `PRD.md` dan tambahkan entri ringkasan perubahan di `changelogs/CHANGELOG_30_10_2026.md`.

- [ ] **Step 5: Run full test suite**

Run: `rtk npx jest`
Expected: All test suites PASS

