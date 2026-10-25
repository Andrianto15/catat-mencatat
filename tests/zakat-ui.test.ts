import { compareTwoZakatYears } from '../src/lib/zakat/engine';

describe('Zakat Year Comparison Logic', () => {
  const year1446 = {
    hijri_year: 1446,
    masehi_year: 2025,
    gold_price_per_gram: 1400000,
    nisab_nominal: 119000000,
    total_assets: 150000000,
    zakat_due: 3750000,
    balances: [
      { account_id: 'acc1', account_name: 'BCA Utama', balance: 100000000 },
      { account_id: 'acc2', account_name: 'Bank Jago', balance: 50000000 },
    ],
  };

  const year1447 = {
    hijri_year: 1447,
    masehi_year: 2026,
    gold_price_per_gram: 1500000,
    nisab_nominal: 127500000,
    total_assets: 180000000,
    zakat_due: 4500000,
    balances: [
      { account_id: 'acc1', account_name: 'BCA Utama', balance: 120000000 },
      { account_id: 'acc2', account_name: 'Bank Jago', balance: 60000000 },
    ],
  };

  it('should compute account deltas and percentages correctly', () => {
    const diff = compareTwoZakatYears(year1446, year1447);

    expect(diff.totalAssetsDelta).toBe(30000000);
    expect(diff.totalAssetsDeltaPct).toBe(20);

    expect(diff.zakatDueDelta).toBe(750000);
    expect(diff.zakatDueDeltaPct).toBe(20);

    const bcaDiff = diff.accountDiffs.find((a) => a.account_id === 'acc1');
    expect(bcaDiff).toBeDefined();
    expect(bcaDiff?.deltaNominal).toBe(20000000);
    expect(bcaDiff?.deltaPct).toBe(20);
  });

  it('should handle accounts that exist in one year but not the other', () => {
    const year1448 = {
      ...year1447,
      hijri_year: 1448,
      balances: [
        { account_id: 'acc1', account_name: 'BCA Utama', balance: 130000000 },
        { account_id: 'acc3', account_name: 'Bibit Reksadana', balance: 20000000 },
      ],
    };

    const diff = compareTwoZakatYears(year1447, year1448);
    const newAcc = diff.accountDiffs.find((a) => a.account_id === 'acc3');
    expect(newAcc).toBeDefined();
    expect(newAcc?.balancePrevious).toBe(0);
    expect(newAcc?.balanceCurrent).toBe(20000000);
    expect(newAcc?.deltaNominal).toBe(20000000);
  });
});
