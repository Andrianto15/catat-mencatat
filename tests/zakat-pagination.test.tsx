import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { paginateZakatYears, DEFAULT_ZAKAT_PAGE_SIZE } from '@/lib/zakat/engine';

describe('Zakat Year History Pagination', () => {
  const dummyYears = Array.from({ length: 8 }, (_, i) => ({
    id: `zy-${i + 1}`,
    hijri_year: 1447 - i,
    masehi_year: 2026 - i,
    gold_price_per_gram: 1450000,
    nisab_nominal: 123250000,
    total_assets: 150000000 + i * 1000000,
    zakat_due: 3750000,
  }));

  it('paginates zakat years with default page size of 5', () => {
    const firstPage = paginateZakatYears(dummyYears);
    expect(DEFAULT_ZAKAT_PAGE_SIZE).toBe(5);
    expect(firstPage.items.length).toBe(5);
    expect(firstPage.total).toBe(8);
    expect(firstPage.displayedCount).toBe(5);
    expect(firstPage.hasMore).toBe(true);

    const allPages = paginateZakatYears(dummyYears, 10);
    expect(allPages.items.length).toBe(8);
    expect(allPages.hasMore).toBe(false);
  });

  it('renders only 5 year cards initially when years exceed DEFAULT_ZAKAT_PAGE_SIZE', () => {
    const paginated = paginateZakatYears(dummyYears, DEFAULT_ZAKAT_PAGE_SIZE);
    const html = renderToStaticMarkup(
      <div>
        {paginated.items.map((y) => (
          <div key={y.id}>
            {y.hijri_year} H ({y.masehi_year} M)
          </div>
        ))}
        {paginated.hasMore && (
          <button type="button" aria-label="Tampilkan 5 riwayat zakat lainnya">
            Tampilkan 5 Lainnya
          </button>
        )}
        <span>Menampilkan {paginated.displayedCount} dari {paginated.total} riwayat zakat</span>
      </div>
    );

    expect(html).toContain('Tampilkan 5 Lainnya');
    expect(html).toContain('Menampilkan 5 dari 8 riwayat zakat');
    expect(html).toContain('1447 H');
    expect(html).toContain('1443 H');
    expect(html).not.toContain('1442 H');
  });

  it('does not render load more button when years count is <= 5', () => {
    const fewYears = dummyYears.slice(0, 3);
    const paginated = paginateZakatYears(fewYears, DEFAULT_ZAKAT_PAGE_SIZE);
    expect(paginated.items.length).toBe(3);
    expect(paginated.hasMore).toBe(false);
  });
});

