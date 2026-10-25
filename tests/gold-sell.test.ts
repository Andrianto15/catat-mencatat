import { validateSellInput, calculateRealizedProfit } from '../src/lib/gold/actions';

describe('Gold Sell & Soft Delete Logic', () => {
  it('should validate sold_at and sold_price_per_piece', () => {
    const valid = validateSellInput({
      purchase_date: '2026-01-01',
      sold_at: '2026-02-15',
      sold_price_per_piece: 1500000,
    });
    expect(valid.isValid).toBe(true);

    const soldBeforeBuy = validateSellInput({
      purchase_date: '2026-03-01',
      sold_at: '2026-02-01',
      sold_price_per_piece: 1500000,
    });
    expect(soldBeforeBuy.isValid).toBe(false);
    expect(soldBeforeBuy.error).toContain('sebelum');

    const negativePrice = validateSellInput({
      purchase_date: '2026-01-01',
      sold_at: '2026-02-01',
      sold_price_per_piece: -1000,
    });
    expect(negativePrice.isValid).toBe(false);
  });

  it('should calculate realized profit correctly for sold piece', () => {
    // beli 2 keping harga 1.000.000, jual 1.300.000 -> realized profit 600.000 (30%)
    const realized = calculateRealizedProfit({
      piece_count: 2,
      price_per_piece: 1000000,
      sold_price_per_piece: 1300000,
    });
    expect(realized.realizedProfitRp).toBe(600000);
    expect(realized.realizedProfitPct).toBe(30);
  });
});
