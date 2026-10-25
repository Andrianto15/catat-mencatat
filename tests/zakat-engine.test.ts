import {
  calculateZakat,
  resolveZakatGoldHoldings,
  getRoundingChips,
} from '../src/lib/zakat/engine';
import { getHijriRamadhanDate } from '../src/lib/zakat/hijri';

describe('Zakat Mal Calculation Engine', () => {
  it('should calculate nisab, total assets, and zakat due correctly', () => {
    // 85 gram * 1.400.000 = 119.000.000 nisab
    const result = calculateZakat({
      goldPricePerGram: 1400000,
      cashBalances: [
        { account_id: 'a1', balance: 70000000 },
        { account_id: 'a2', balance: 50000000 },
      ],
      goldTotalValue: 10000000, // total assets = 130.000.000
    });

    expect(result.nisabNominal).toBe(119000000);
    expect(result.totalCash).toBe(120000000);
    expect(result.totalAssets).toBe(130000000);
    expect(result.isWajib).toBe(true);
    expect(result.zakatDue).toBe(3250000); // 2.5% of 130.000.000
  });

  it('should mark as not wajib if total assets is below nisab', () => {
    const result = calculateZakat({
      goldPricePerGram: 1400000, // nisab 119.000.000
      cashBalances: [{ account_id: 'a1', balance: 50000000 }],
      goldTotalValue: 0,
    });

    expect(result.isWajib).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  it('should correctly filter gold holdings based on reference date (1 Ramadhan)', () => {
    const referenceDate = '2026-02-18'; // 1 Ramadhan 1447 H

    const goldPieces = [
      {
        id: 'g1',
        purchase_date: '2025-10-01',
        brand: 'ANTAM',
        weight_gram: 5,
        piece_count: 1,
        sold_at: null, // Active -> include
      },
      {
        id: 'g2',
        purchase_date: '2025-05-01',
        brand: 'ANTAM',
        weight_gram: 10,
        piece_count: 1,
        sold_at: '2026-01-15', // Sold BEFORE 1 Ramadhan -> EXCLUDE
      },
      {
        id: 'g3',
        purchase_date: '2025-08-01',
        brand: 'ANTAM',
        weight_gram: 2,
        piece_count: 1,
        sold_at: '2026-03-01', // Sold AFTER 1 Ramadhan -> MUST INCLUDE
      },
      {
        id: 'g4',
        purchase_date: '2026-03-10', // Bought AFTER 1 Ramadhan -> EXCLUDE
        brand: 'ANTAM',
        weight_gram: 5,
        piece_count: 1,
        sold_at: null,
      },
    ];

    const eligible = resolveZakatGoldHoldings(goldPieces, referenceDate);
    expect(eligible.length).toBe(2);
    expect(eligible.map((e) => e.id)).toEqual(['g1', 'g3']);
    const totalGrams = eligible.reduce((acc, e) => acc + e.weight_gram * e.piece_count, 0);
    expect(totalGrams).toBe(7); // 5g + 2g = 7g
  });

  it('should provide payment rounding chips for 10k, 50k, 100k', () => {
    const zakatDue = 2637054;
    const chips = getRoundingChips(zakatDue);

    expect(chips.exact).toBe(2637054);
    expect(chips.round10k).toBe(2640000);
    expect(chips.round50k).toBe(2650000);
    expect(chips.round100k).toBe(2700000);
  });

  it('should return approximate Gregorian reference date for Hijri years', () => {
    const ramadhan1446 = getHijriRamadhanDate(1446);
    expect(ramadhan1446).toBe('2025-03-01');

    const ramadhan1447 = getHijriRamadhanDate(1447);
    expect(ramadhan1447).toBe('2026-02-18');
  });
});
