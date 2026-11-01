import {
  calculateZakat,
  resolveZakatGoldHoldings,
  getRoundingChips,
  compareTwoZakatYears,
  DEFAULT_SILVER_PRICE,
  SILVER_NISAB_GRAMS,
  GOLD_NISAB_GRAMS,
} from '../src/lib/zakat/engine';
import { getHijriRamadhanDate } from '../src/lib/zakat/hijri';

describe('Zakat Mal Calculation Engine', () => {
  it('should calculate nisab, total assets, and zakat due correctly', () => {
    // 85 gram * 1.400.000 = 119.000.000 nisab emas
    // 595 gram * 18.000 = 10.710.000 nisab perak
    const result = calculateZakat({
      goldPricePerGram: 1400000,
      silverPricePerGram: 18000,
      cashBalances: [
        { account_id: 'a1', balance: 70000000 },
        { account_id: 'a2', balance: 50000000 },
      ],
      goldTotalValue: 10000000, // total assets = 130.000.000
    });

    expect(result.nisabNominal).toBe(119000000);
    expect(result.nisabGoldNominal).toBe(119000000);
    expect(result.nisabSilverNominal).toBe(10710000);
    expect(result.totalCash).toBe(120000000);
    expect(result.totalAssets).toBe(130000000);
    expect(result.isWajib).toBe(true);
    expect(result.isWajibGold).toBe(true);
    expect(result.isWajibSilver).toBe(true);
    expect(result.zakatGoldDue).toBe(3250000); // 2.5% of 130.000.000
    expect(result.zakatSilverDue).toBe(3250000); // Equal when both are wajib
    expect(result.zakatDue).toBe(3250000);
    expect(result.defaultZakatPaid).toBe(3250000);
  });

  it('should calculate silver zakat when gold is not wajib but silver is wajib', () => {
    // Nisab emas = 85 * 1.400.000 = 119.000.000
    // Nisab perak = 595 * 20.000 = 11.900.000
    // Total harta = 50.000.000 (tidak wajib emas, tapi kena perak)
    const result = calculateZakat({
      goldPricePerGram: 1400000,
      silverPricePerGram: 20000,
      cashBalances: [{ account_id: 'a1', balance: 50000000 }],
      goldTotalValue: 0,
    });

    expect(result.nisabGoldNominal).toBe(119000000);
    expect(result.nisabSilverNominal).toBe(119000000 / 10); // 11.900.000
    expect(result.isWajibGold).toBe(false);
    expect(result.zakatGoldDue).toBe(0);
    expect(result.isWajibSilver).toBe(true);
    expect(result.zakatSilverDue).toBe(1250000); // 2.5% of 50.000.000
    expect(result.isWajib).toBe(true); // Wajib zakat by silver
    expect(result.zakatDue).toBe(1250000);
    expect(result.defaultZakatPaid).toBe(1250000);
  });

  it('should round up defaultZakatPaid to the nearest 10.000', () => {
    // Total harta 50.250.000 -> 2.5% = 1.256.250
    // Pembulatan ke atas kelipatan 10.000 = 1.260.000
    const result = calculateZakat({
      goldPricePerGram: 1400000,
      silverPricePerGram: 20000,
      cashBalances: [{ account_id: 'a1', balance: 50250000 }],
      goldTotalValue: 0,
    });

    expect(result.zakatSilverDue).toBe(1256250);
    expect(result.defaultZakatPaid).toBe(1260000);
  });

  it('should use DEFAULT_SILVER_PRICE when silverPricePerGram is omitted', () => {
    const result = calculateZakat({
      goldPricePerGram: 1400000,
      cashBalances: [{ account_id: 'a1', balance: 50000000 }],
      goldTotalValue: 0,
    });

    expect(result.nisabSilverNominal).toBe(SILVER_NISAB_GRAMS * DEFAULT_SILVER_PRICE);
    expect(result.isWajibSilver).toBe(true);
  });

  it('should return 0 for both zakat values when total assets is below both nisab', () => {
    const result = calculateZakat({
      goldPricePerGram: 1400000, // nisab emas 119.000.000
      silverPricePerGram: 20000, // nisab perak 11.900.000
      cashBalances: [{ account_id: 'a1', balance: 5000000 }], // 5.000.000 < 11.900.000
      goldTotalValue: 0,
    });

    expect(result.isWajibGold).toBe(false);
    expect(result.isWajibSilver).toBe(false);
    expect(result.isWajib).toBe(false);
    expect(result.zakatGoldDue).toBe(0);
    expect(result.zakatSilverDue).toBe(0);
    expect(result.zakatDue).toBe(0);
    expect(result.defaultZakatPaid).toBe(0);
  });

  it('should support decimal cash balances with 2 decimal digits precision', () => {
    const result = calculateZakat({
      goldPricePerGram: 1450000,
      cashBalances: [
        { account_id: 'a1', balance: 6951418.61 },
        { account_id: 'a2', balance: 120000000.39 },
      ],
      goldTotalValue: 0,
    });

    // 6951418.61 + 120000000.39 = 126951419.00
    expect(result.totalCash).toBe(126951419);
    expect(result.totalAssets).toBe(126951419);
  });

  it('should compare two zakat years including gold, silver, and zakat paid', () => {
    const prevYear = {
      hijri_year: 1446,
      masehi_year: 2025,
      gold_price_per_gram: 1300000,
      silver_price_per_gram: 16000,
      nisab_nominal: 110500000,
      nisab_silver_nominal: 9520000,
      total_assets: 100000000,
      zakat_due: 0, // not reaching gold nisab
      zakat_silver_due: 2500000,
      zakat_paid: 2500000,
      balances: [{ account_id: 'a1', account_name: 'BCA', balance: 100000000 }],
    };

    const currYear = {
      hijri_year: 1447,
      masehi_year: 2026,
      gold_price_per_gram: 1450000,
      silver_price_per_gram: 18000,
      nisab_nominal: 123250000,
      nisab_silver_nominal: 10710000,
      total_assets: 150000000,
      zakat_due: 3750000, // reaching gold nisab
      zakat_silver_due: 3750000,
      zakat_paid: 3800000,
      balances: [{ account_id: 'a1', account_name: 'BCA', balance: 150000000 }],
    };

    const comparison = compareTwoZakatYears(prevYear, currYear);
    expect(comparison.totalAssetsDelta).toBe(50000000);
    expect(comparison.totalAssetsDeltaPct).toBe(50);
    expect(comparison.zakatDueDelta).toBe(3750000);
    expect(comparison.zakatSilverDueDelta).toBe(1250000);
    expect(comparison.zakatPaidDelta).toBe(1300000);
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
