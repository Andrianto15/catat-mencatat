import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnnualBalanceTrendChart } from '../src/components/saldo-tahun/AnnualBalanceTrendChart';

describe('Audit Harden Fixes (Task 1)', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');
  const emasPrices = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/prices/page.tsx'), 'utf-8');
  const serviceCard = fs.readFileSync(path.resolve(__dirname, '../src/components/motor/ServiceCard.tsx'), 'utf-8');
  const sellModal = fs.readFileSync(path.resolve(__dirname, '../src/components/gold/SellModal.tsx'), 'utf-8');
  const chartSrc = fs.readFileSync(
    path.resolve(__dirname, '../src/components/saldo-tahun/AnnualBalanceTrendChart.tsx'),
    'utf-8'
  );

  it('globals.css replaces destructive 0.01ms motion wipe with non-destructive reduction', () => {
    expect(css).not.toContain('animation-duration: 0.01ms !important');
    expect(css).not.toContain('transition-duration: 0.01ms !important');
    expect(css).toContain('prefers-reduced-motion');
  });

  it('emas/prices/page.tsx uses semantic CSS tokens for status badges instead of hardcoded hexes', () => {
    expect(emasPrices).not.toContain("backgroundColor: isFailed ? '#fee2e2'");
    expect(emasPrices).toContain('var(--color-danger-bg)');
    expect(emasPrices).toContain('var(--color-warning-bg)');
    expect(emasPrices).toContain('var(--color-success-bg)');
    expect(emasPrices).toContain('var(--color-danger-text)');
    expect(emasPrices).toContain('var(--color-warning-text)');
    expect(emasPrices).toContain('var(--color-success-text)');
  });

  it('AnnualBalanceTrendChart does not nest interactive role="button" inside container role="img"', () => {
    // Root container must not have role="img" wrapping buttons
    expect(chartSrc).not.toContain('<div\n      role="img"');
    expect(chartSrc).not.toContain('<div role="img"');

    // Chart must still render role="img" on SVG graphic group and retain buttons
    const dummyYears = [
      { masehi_year: 2024, total_accounts: 10000000, expense_amount: 1000000, net_balance: 9000000 },
      { masehi_year: 2025, total_accounts: 15000000, expense_amount: 2000000, net_balance: 13000000 },
    ];
    const html = renderToStaticMarkup(<AnnualBalanceTrendChart years={dummyYears} />);
    expect(html).toContain('role="img"');
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Grafik perkembangan saldo akhir tahun"');
  });

  it('ServiceCard uses semantic danger text token instead of hardcoded #ef4444', () => {
    expect(serviceCard).not.toContain("color: '#ef4444'");
    expect(serviceCard).toContain('var(--color-danger-text)');
  });

  it('SellModal submit button uses theme token instead of hardcoded #10b981', () => {
    expect(sellModal).not.toContain("backgroundColor: '#10b981'");
    expect(sellModal).toContain('var(--color-primary)');
  });
});

