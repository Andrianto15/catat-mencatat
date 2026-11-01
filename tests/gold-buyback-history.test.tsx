import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GoldCard } from '@/components/gold/GoldCard';
import { PurchaseModal } from '@/components/gold/PurchaseModal';

describe('Gold Purchase Historical Buyback Price (buyback_price_per_piece)', () => {
  it('renders optional buyback price input field in PurchaseModal', () => {
    const html = renderToStaticMarkup(
      <PurchaseModal
        isOpen={true}
        onClose={() => {}}
        people={[{ id: 'p1', name: 'Andri', is_active: true }]}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('Harga Jual / Buyback saat Beli per Keping (Rp) (Opsional)');
    expect(html).toContain('id="gold-buyback-price"');
  });

  it('renders formatted buyback_price_per_piece in GoldCard when provided', () => {
    const html = renderToStaticMarkup(
      <GoldCard
        purchase={{
          id: 'g1',
          person_id: 'p1',
          purchase_date: '2026-10-30',
          brand: 'ANTAM',
          weight_gram: 1,
          piece_count: 1,
          price_per_piece: 1500000,
          buyback_price_per_piece: 1380000,
        }}
        currentBuyback={1420000}
      />
    );

    expect(html).toContain('Buyback saat beli:');
    expect(html).toMatch(/Rp\s*1\.380\.000/);
  });

  it('renders "-" in GoldCard when buyback_price_per_piece is null or undefined', () => {
    const htmlWithNull = renderToStaticMarkup(
      <GoldCard
        purchase={{
          id: 'g2',
          person_id: 'p1',
          purchase_date: '2026-10-30',
          brand: 'ANTAM',
          weight_gram: 1,
          piece_count: 1,
          price_per_piece: 1500000,
          buyback_price_per_piece: null,
        }}
        currentBuyback={1420000}
      />
    );

    expect(htmlWithNull).toContain('Buyback saat beli: -');
  });
});

