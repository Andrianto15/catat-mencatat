import React from 'react';
import fs from 'fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnnualBalanceTrendChart } from '../src/components/saldo-tahun/AnnualBalanceTrendChart';
import { AnnualBalanceAccordionList } from '../src/components/saldo-tahun/AnnualBalanceAccordionList';
import { AnnualBalanceModal } from '../src/components/saldo-tahun/AnnualBalanceModal';

describe('Annual Balance UI Components', () => {
  it('renders AnnualBalanceTrendChart with accessible SVG line chart elements', () => {
    const years = [
      { masehi_year: 2018, total_accounts: 6421533, expense_amount: 812854, net_balance: 5608679 },
      { masehi_year: 2019, total_accounts: 11566529, expense_amount: 0, net_balance: 11566529 },
      { masehi_year: 2020, total_accounts: 17886557, expense_amount: 0, net_balance: 17886557 },
      { masehi_year: 2025, total_accounts: 49730206, expense_amount: 0, net_balance: 49730206 },
    ];

    const html = renderToStaticMarkup(<AnnualBalanceTrendChart years={years} />);

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Grafik perkembangan saldo akhir tahun"');
    expect(html).toContain('<svg');
    expect(html).toContain('<polyline');
    expect(html).toContain('2018');
    expect(html).toContain('2025');
  });

  it('renders AnnualBalanceTrendChart subtitle appropriately for single year vs multiple years', () => {
    const singleYear = [
      { masehi_year: 2025, total_accounts: 49730206, expense_amount: 0, net_balance: 49730206 },
    ];
    const htmlSingle = renderToStaticMarkup(<AnnualBalanceTrendChart years={singleYear} />);
    expect(htmlSingle).toContain('Tahun 2025 M');
    expect(htmlSingle).not.toContain('Rentang 2025 – 2025 M');
  });

  it('renders AnnualBalanceTrendChart interactive dots with title, hit-area, and accessibility', () => {
    const years = [
      { masehi_year: 2018, total_accounts: 6421533, expense_amount: 812854, net_balance: 5608679 },
      { masehi_year: 2025, total_accounts: 49730206, expense_amount: 0, net_balance: 49730206 },
    ];

    const html = renderToStaticMarkup(<AnnualBalanceTrendChart years={years} />);

    // Native SVG title inside dot for tooltip
    expect(html).toContain('<title>Tahun 2018: Rp 5.608.679</title>');
    expect(html).toContain('<title>Tahun 2025: Rp 49.730.206</title>');

    // Accessible button role and aria-label
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Tahun 2018: Rp 5.608.679"');
    expect(html).toContain('tabindex="0"');

    // Touch-friendly hit target radius r="18"
    expect(html).toContain('r="18"');

    // Chart component source verification for hover and tap tooltip support
    const chartSrc = fs.readFileSync('src/components/saldo-tahun/AnnualBalanceTrendChart.tsx', 'utf8');
    expect(chartSrc).toContain("'use client'");
    expect(chartSrc).toContain('activePoint');
    expect(chartSrc).toContain('onMouseEnter');
    expect(chartSrc).toContain('onMouseLeave');
    expect(chartSrc).toContain('onClick');
  });

  it('renders AnnualBalanceAccordionList with expandable card and account breakdown', () => {
    const items = [
      {
        id: 'y2025',
        masehi_year: 2025,
        total_accounts: 49730206,
        expense_amount: 0,
        net_balance: 49730206,
        prevYear: 2024,
        deltaNominal: 18913392,
        deltaPct: 61.37,
        balances: [
          { account_id: 'a1', account_name: 'Jago Syariah', balance: 30340830 },
          { account_id: 'a2', account_name: 'Saldo BNI/BSI', balance: 11303005 },
        ],
      },
    ];

    const html = renderToStaticMarkup(
      <AnnualBalanceAccordionList
        items={items}
        defaultExpandedYear={2025}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(html).toContain('Tahun 2025');
    expect(html).toContain('Rp 49.730.206');
    expect(html).toContain('+61,37%');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('Jago Syariah');
    expect(html).toContain('30.340.830');
    expect(html).toContain('Saldo BNI/BSI');
    expect(html).toContain('11.303.005');
    expect(html).toContain('Edit');
    expect(html).toContain('Hapus');
  });

  it('renders AnnualBalanceModal with WAI-ARIA and split integer and decimal inputs', () => {
    const accounts = [
      { id: 'acc1', account_name: 'Mandiri Utama' },
      { id: 'acc2', account_name: 'Gopay' },
    ];

    const html = renderToStaticMarkup(
      <AnnualBalanceModal
        isOpen={true}
        onClose={() => {}}
        personId="p1"
        personName="Andrian"
        accounts={accounts}
        suggestedYear={2026}
        initialData={{
          id: 'y2026',
          masehi_year: 2026,
          total_accounts: 10500000.5,
          expense_amount: 500000,
          net_balance: 10000000.5,
          notes: 'Catatan tahun',
          balances: [
            { account_id: 'acc1', balance: 10000000.5 },
            { account_id: 'acc2', balance: 500000 },
          ],
        }}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('id="annual-balance-year"');
    expect(html).toContain('value="2026"');
    expect(html).toContain('id="annual-acc-acc1"');
    expect(html).toContain('value="10.000.000"');
    expect(html).toContain('id="annual-acc-dec-acc1"');
    expect(html).toContain('value="50"');
    expect(html).toContain('id="annual-balance-expense"');
    expect(html).toContain('value="500.000"');
    expect(html).toContain('Rp 10.000.000,5');
  });

  it('verifies HomePage includes 4th module Saldo Akhir Tahun', () => {
    const pageSrc = fs.readFileSync('src/app/page.tsx', 'utf8');
    expect(pageSrc).toContain('/saldo-tahun');
    expect(pageSrc).toContain('Saldo Akhir Tahun');
  });
});

