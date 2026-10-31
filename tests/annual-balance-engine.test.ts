import {
  calculateAnnualBalance,
  computeAnnualBalanceDeltas,
  paginateAnnualBalances,
  suggestNextMasehiYear,
  DEFAULT_ANNUAL_BALANCE_PAGE_SIZE,
} from '../src/lib/saldo-tahun/engine';

describe('Annual Balance Engine', () => {
  it('calculates totalAccounts, expenseAmount, and netBalance matching Excel 2018 example', () => {
    const res = calculateAnnualBalance({
      balances: [
        { account_id: 'bni', balance: 4222841 },
        { account_id: 'mandiri', balance: 2198692 },
      ],
      expenseAmount: 812854,
    });
    expect(res.totalAccounts).toBe(6421533);
    expect(res.expenseAmount).toBe(812854);
    expect(res.netBalance).toBe(5608679);
  });

  it('maintains 2 decimal digits precision without floating-point artifacts', () => {
    const res = calculateAnnualBalance({
      balances: [
        { account_id: 'a1', balance: 6951418.61 },
        { account_id: 'a2', balance: 120000000.39 },
      ],
      expenseAmount: 500000.25,
    });
    expect(res.totalAccounts).toBe(126951419);
    expect(res.expenseAmount).toBe(500000.25);
    expect(res.netBalance).toBe(126451418.75);
  });

  it('computes year-over-year deltas sorted descending and handles first year or 0 base safely', () => {
    const records = [
      { masehi_year: 2018, total_accounts: 6421533, expense_amount: 812854, net_balance: 5608679 },
      { masehi_year: 2019, total_accounts: 11566529, expense_amount: 0, net_balance: 11566529 },
      { masehi_year: 2017, total_accounts: 0, expense_amount: 0, net_balance: 0 },
    ];
    const withDeltas = computeAnnualBalanceDeltas(records);
    expect(withDeltas.map((r) => r.masehi_year)).toEqual([2019, 2018, 2017]);

    // 2019 vs 2018: 11566529 - 5608679 = +5957850 (+106.23%)
    expect(withDeltas[0].prevYear).toBe(2018);
    expect(withDeltas[0].deltaNominal).toBe(5957850);
    expect(withDeltas[0].deltaPct).toBe(106.23);

    // 2018 vs 2017 (0 base): deltaNominal = 5608679, deltaPct = 0 (no Infinity/NaN)
    expect(withDeltas[1].prevYear).toBe(2017);
    expect(withDeltas[1].deltaNominal).toBe(5608679);
    expect(withDeltas[1].deltaPct).toBe(0);

    // 2017 (oldest): no previous year
    expect(withDeltas[2].prevYear).toBeNull();
    expect(withDeltas[2].deltaNominal).toBeNull();
    expect(withDeltas[2].deltaPct).toBeNull();
  });

  it('paginates annual balances with default page size 5 and suggests next year', () => {
    expect(DEFAULT_ANNUAL_BALANCE_PAGE_SIZE).toBe(5);
    const items = [1, 2, 3, 4, 5, 6];
    const page = paginateAnnualBalances(items);
    expect(page.items).toHaveLength(5);
    expect(page.hasMore).toBe(true);
    expect(suggestNextMasehiYear([{ masehi_year: 2024 }, { masehi_year: 2025 }])).toBe(2026);
    expect(suggestNextMasehiYear([], 2026)).toBe(2026);
  });
});

