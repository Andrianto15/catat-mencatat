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

  it('should calculate deltas with 2 decimal digits precision without floating-point artifacts', () => {
    const yearA = {
      hijri_year: 1446,
      masehi_year: 2025,
      gold_price_per_gram: 1400000,
      nisab_nominal: 119000000,
      total_assets: 5000000,
      zakat_due: 0,
      balances: [
        { account_id: 'acc1', account_name: 'BCA', balance: 5000000.00 },
      ],
    };

    const yearB = {
      hijri_year: 1447,
      masehi_year: 2026,
      gold_price_per_gram: 1500000,
      nisab_nominal: 127500000,
      total_assets: 6951418.61,
      zakat_due: 0,
      balances: [
        { account_id: 'acc1', account_name: 'BCA', balance: 6951418.61 },
      ],
    };

    const diff = compareTwoZakatYears(yearA, yearB);
    const bcaDiff = diff.accountDiffs.find((a) => a.account_id === 'acc1');
    expect(bcaDiff?.deltaNominal).toBe(1951418.61);
    expect(diff.totalAssetsDelta).toBe(1951418.61);
  });

  it('verifies YearModal configures separate decimal text input with default 00', () => {
    const fs = require('fs');
    const modalSrc = fs.readFileSync('src/components/zakat/YearModal.tsx', 'utf8');
    expect(modalSrc).toContain('zakat-acc-dec-');
    expect(modalSrc).toContain('maxLength={2}');
    expect(modalSrc).toContain('placeholder="00"');
    expect(modalSrc).toContain("minHeight: '44px'");
  });

  it('renders YearModal with split integer and decimal inputs', () => {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const { YearModal } = require('../src/components/zakat/YearModal');

    const html = renderToStaticMarkup(
      React.createElement(YearModal, {
        isOpen: true,
        onClose: () => {},
        personId: 'p1',
        personName: 'Budi',
        accounts: [{ id: 'acc1', account_name: 'BCA Utama' }],
        initialData: {
          hijri_year: 1447,
          reference_date: '2026-02-18',
          gold_price_per_gram: 1450000,
          is_locked: false,
          balances: [{ account_id: 'acc1', balance: 6951418.61 }],
        },
        onSave: async () => {},
      })
    );

    expect(html).toContain('id="zakat-acc-acc1"');
    expect(html).toContain('value="6.951.418"');
    expect(html).toContain('id="zakat-acc-dec-acc1"');
    expect(html).toContain('value="61"');
    expect(html).toContain('maxLength="2"');
  });

  it('renders editable gold holding value input in YearModal defaulted from goldValueFromHoldings', () => {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const { YearModal } = require('../src/components/zakat/YearModal');

    const html = renderToStaticMarkup(
      React.createElement(YearModal, {
        isOpen: true,
        onClose: () => {},
        personId: 'p1',
        personName: 'Budi',
        accounts: [{ id: 'acc1', account_name: 'BCA Utama' }],
        goldValueFromHoldings: 14500000,
        latestGoldPrice1g: 1450000,
        onSave: async () => {},
      })
    );

    expect(html).toContain('id="zakat-gold-holdings"');
    expect(html).toContain('value="14.500.000"');
    // Total assets should be 0 cash + 14.500.000 gold = 14.500.000
    expect(html).toContain('Rp 14.500.000');
  });

  it('renders saved gold_value_snapshot when editing an existing zakat year in YearModal', () => {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const { YearModal } = require('../src/components/zakat/YearModal');

    const html = renderToStaticMarkup(
      React.createElement(YearModal, {
        isOpen: true,
        onClose: () => {},
        personId: 'p1',
        personName: 'Budi',
        accounts: [{ id: 'acc1', account_name: 'BCA Utama' }],
        goldValueFromHoldings: 14500000,
        initialData: {
          hijri_year: 1445,
          reference_date: '2024-03-11',
          gold_price_per_gram: 1200000,
          gold_value_snapshot: 12000000,
          is_locked: false,
          balances: [{ account_id: 'acc1', balance: 50000000 }],
        },
        onSave: async () => {},
      })
    );

    expect(html).toContain('id="zakat-gold-holdings"');
    expect(html).toContain('value="12.000.000"');
    // Total assets = 50.000.000 + 12.000.000 = 62.000.000
    expect(html).toContain('Rp 62.000.000');
  });

  it('derives initial gold value from total_assets minus cash balances if gold_value_snapshot is absent', () => {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const { YearModal } = require('../src/components/zakat/YearModal');

    const html = renderToStaticMarkup(
      React.createElement(YearModal, {
        isOpen: true,
        onClose: () => {},
        personId: 'p1',
        personName: 'Budi',
        accounts: [{ id: 'acc1', account_name: 'BCA Utama' }],
        goldValueFromHoldings: 99000000,
        initialData: {
          hijri_year: 1444,
          reference_date: '2023-03-23',
          gold_price_per_gram: 1000000,
          total_assets: 55000000,
          is_locked: false,
          balances: [{ account_id: 'acc1', balance: 50000000 }],
        },
        onSave: async () => {},
      })
    );

    expect(html).toContain('id="zakat-gold-holdings"');
    // 55.000.000 - 50.000.000 = 5.000.000
    expect(html).toContain('value="5.000.000"');
    expect(html).toContain('Rp 55.000.000');
  });
});
