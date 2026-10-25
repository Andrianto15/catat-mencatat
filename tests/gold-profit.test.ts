import { calculateGoldProfit, calculateGoldAssetSummary } from '../src/lib/gold/profit';

describe('Gold Profit & Asset Calculations', () => {
  it('should calculate profit Rp and profit % correctly', () => {
    // beli 1 pcs 1g harga 1.000.000, buyback kini 1.200.000 -> profit 200.000 (20%)
    const profit = calculateGoldProfit(
      { weight_gram: 1, piece_count: 1, price_per_piece: 1000000 },
      1200000
    );
    expect(profit.current_value).toBe(1200000);
    expect(profit.profit_rp).toBe(200000);
    expect(profit.profit_pct).toBe(20);
  });

  it('should handle multiple pieces in profit calculation', () => {
    // beli 2 pcs 5g harga 6.000.000/pcs (total 12.000.000), buyback kini 6.500.000/pcs -> profit 1.000.000 (8.33%)
    const profit = calculateGoldProfit(
      { weight_gram: 5, piece_count: 2, price_per_piece: 6000000 },
      6500000
    );
    expect(profit.current_value).toBe(13000000);
    expect(profit.profit_rp).toBe(1000000);
    expect(profit.profit_pct).toBeCloseTo(8.33, 2);
  });

  it('should return nulls gracefully if buyback is unavailable', () => {
    const profit = calculateGoldProfit(
      { weight_gram: 1, piece_count: 1, price_per_piece: 1000000 },
      null
    );
    expect(profit.current_value).toBeNull();
    expect(profit.profit_rp).toBeNull();
    expect(profit.profit_pct).toBeNull();
  });

  it('should aggregate portfolio assets correctly for active purchases', () => {
    const purchases = [
      {
        id: 'p1',
        person_id: 'person1',
        brand: 'ANTAM',
        weight_gram: 1,
        piece_count: 2,
        price_per_piece: 1400000,
        sold_at: null,
      },
      {
        id: 'p2',
        person_id: 'person1',
        brand: 'ANTAM',
        weight_gram: 5,
        piece_count: 1,
        price_per_piece: 6800000,
        sold_at: null,
      },
      {
        id: 'p3',
        person_id: 'person1',
        brand: 'ANTAM',
        weight_gram: 10,
        piece_count: 1,
        price_per_piece: 13000000,
        sold_at: '2026-03-01', // sold piece should NOT be in active summary
      },
    ];

    const priceMap = {
      'ANTAM-1': 1450000,
      'ANTAM-5': 7000000,
    };

    const summary = calculateGoldAssetSummary(purchases, priceMap);
    expect(summary.totalGrams).toBe(7); // 2*1g + 1*5g = 7g
    expect(summary.totalPieces).toBe(3); // 2 + 1 = 3
    expect(summary.totalCost).toBe(9600000); // 2*1.4m + 6.8m = 9.6m
    expect(summary.currentValue).toBe(9900000); // 2*1.45m + 7m = 9.9m
    expect(summary.totalProfitRp).toBe(300000);
  });
});
