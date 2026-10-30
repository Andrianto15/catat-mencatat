import fs from 'fs';
import path from 'path';
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

  it('extracts sorted unique brands with normalized case', () => {
    expect(
      getUniqueGoldBrands([
        ...samplePrices,
        { id: '7', brand: 'antam', weight_gram: 1, sell_price: 1550000, buyback_price: 1450000 },
      ])
    ).toEqual(['ANTAM', 'GALERI 24', 'UBS']);
  });

  it('extracts numerically sorted unique weights (all and filtered by brand)', () => {
    expect(getUniqueGoldWeights(samplePrices)).toEqual([0.5, 1, 2, 5, 10]);
    expect(getUniqueGoldWeights(samplePrices, 'ANTAM')).toEqual([0.5, 2, 10]);
    expect(getUniqueGoldWeights(samplePrices, 'antam')).toEqual([0.5, 2, 10]);
  });

  it('filters gold prices by brand and weightGram', () => {
    expect(filterGoldPrices(samplePrices, {})).toHaveLength(6);
    expect(filterGoldPrices(samplePrices, { brand: 'ANTAM' })).toHaveLength(3);
    expect(filterGoldPrices(samplePrices, { brand: 'antam' })).toHaveLength(3);
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

describe('Gold Prices Page UI Filter & Pagination Integration', () => {
  const pricesPagePath = path.resolve(__dirname, '../src/app/emas/prices/page.tsx');
  const pricesPageSource = fs.readFileSync(pricesPagePath, 'utf-8');

  it('integrates brand and weight select dropdown filters with accessible labels and mobile tap targets', () => {
    expect(pricesPageSource).toContain('getUniqueGoldBrands');
    expect(pricesPageSource).toContain('getUniqueGoldWeights');
    expect(pricesPageSource).toContain('filterGoldPrices');
    expect(pricesPageSource).toContain('htmlFor="filter-gold-brand"');
    expect(pricesPageSource).toContain('id="filter-gold-brand"');
    expect(pricesPageSource).toContain('htmlFor="filter-gold-weight"');
    expect(pricesPageSource).toContain('id="filter-gold-weight"');
    expect(pricesPageSource).toContain('className="form-select"');
    expect(pricesPageSource).toContain('Semua Jenis');
    expect(pricesPageSource).toContain('Semua Gramasi');
    expect(pricesPageSource).toContain('Reset Filter');
  });

  it('integrates progressive pagination with Tampilkan 5 Lainnya button', () => {
    expect(pricesPageSource).toContain('paginateGoldPrices');
    expect(pricesPageSource).toContain('DEFAULT_GOLD_PRICE_PAGE_SIZE');
    expect(pricesPageSource).toContain('Tampilkan 5 Lainnya');
    expect(pricesPageSource).toContain('Tampilkan 5 harga emas lainnya');
    expect(pricesPageSource).toContain('Semua harga emas telah ditampilkan');
  });
});
