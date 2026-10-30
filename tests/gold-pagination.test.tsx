import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { paginateGoldPurchases, DEFAULT_GOLD_PAGE_SIZE, GoldPurchase } from '@/lib/gold/actions';
import { GoldCard } from '@/components/gold/GoldCard';

describe('Gold Purchase Pagination', () => {
  const dummyPurchases: GoldPurchase[] = Array.from({ length: 12 }, (_, i) => ({
    id: `gold-${i + 1}`,
    person_id: 'p1',
    purchase_date: `2026-05-${String(i + 1).padStart(2, '0')}`,
    brand: 'ANTAM',
    weight_gram: 5,
    piece_count: 1,
    price_per_piece: 7000000 + i * 10000,
    buyback_price_per_piece: 6500000,
    notes: `Keping ke-${i + 1}`,
  }));

  it('paginates gold purchases with default page size of 5', () => {
    const firstPage = paginateGoldPurchases(dummyPurchases);
    expect(DEFAULT_GOLD_PAGE_SIZE).toBe(5);
    expect(firstPage.items.length).toBe(5);
    expect(firstPage.total).toBe(12);
    expect(firstPage.displayedCount).toBe(5);
    expect(firstPage.hasMore).toBe(true);

    const secondPage = paginateGoldPurchases(dummyPurchases, 10);
    expect(secondPage.items.length).toBe(10);
    expect(secondPage.hasMore).toBe(true);

    const allPages = paginateGoldPurchases(dummyPurchases, 15);
    expect(allPages.items.length).toBe(12);
    expect(allPages.hasMore).toBe(false);
  });

  it('renders only 5 GoldCards initially when purchases exceed DEFAULT_GOLD_PAGE_SIZE', () => {
    const paginated = paginateGoldPurchases(dummyPurchases, DEFAULT_GOLD_PAGE_SIZE);
    const html = renderToStaticMarkup(
      <div>
        <div className="gold-list">
          {paginated.items.map((p) => (
            <GoldCard
              key={p.id}
              purchase={p}
              currentBuyback={7200000}
              onEdit={() => {}}
              onDelete={() => {}}
              onSell={() => {}}
            />
          ))}
        </div>
        {paginated.hasMore && (
          <button type="button" aria-label="Tampilkan 5 keping emas lainnya">
            Tampilkan 5 Lainnya
          </button>
        )}
        <p>Menampilkan {paginated.displayedCount} dari {paginated.total} keping emas</p>
      </div>
    );

    expect(html).toContain('Tampilkan 5 Lainnya');
    expect(html).toContain('Menampilkan 5 dari 12 keping emas');
    expect(html).toContain('Keping ke-1');
    expect(html).toContain('Keping ke-5');
    expect(html).not.toContain('Keping ke-6');
  });

  it('does not render load more button when purchases count is <= 5', () => {
    const fewPurchases = dummyPurchases.slice(0, 4);
    const paginated = paginateGoldPurchases(fewPurchases, DEFAULT_GOLD_PAGE_SIZE);

    expect(paginated.items.length).toBe(4);
    expect(paginated.hasMore).toBe(false);
  });
});

