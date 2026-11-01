import fs from 'fs';
import path from 'path';

describe('Impeccable Audit Fixes (P1, P2, P3)', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');
  const layout = fs.readFileSync(path.resolve(__dirname, '../src/app/layout.tsx'), 'utf-8');
  const homePage = fs.readFileSync(path.resolve(__dirname, '../src/app/page.tsx'), 'utf-8');
  const motorPage = fs.readFileSync(path.resolve(__dirname, '../src/app/motor/page.tsx'), 'utf-8');
  const emasPage = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/page.tsx'), 'utf-8');
  const zakatPage = fs.readFileSync(path.resolve(__dirname, '../src/app/zakat/page.tsx'), 'utf-8');
  const emasPricesPage = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/prices/page.tsx'), 'utf-8');
  const motorSettingsPage = fs.readFileSync(path.resolve(__dirname, '../src/app/motor/settings/page.tsx'), 'utf-8');
  const emasSettingsPage = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/settings/page.tsx'), 'utf-8');
  const zakatSettingsPage = fs.readFileSync(path.resolve(__dirname, '../src/app/zakat/settings/page.tsx'), 'utf-8');
  const serviceFilter = fs.readFileSync(path.resolve(__dirname, '../src/components/motor/ServiceFilter.tsx'), 'utf-8');
  const goldCard = fs.readFileSync(path.resolve(__dirname, '../src/components/gold/GoldCard.tsx'), 'utf-8');
  const zakatChart = fs.readFileSync(path.resolve(__dirname, '../src/components/zakat/ZakatTrendChart.tsx'), 'utf-8');
  const zakatSpreadsheet = fs.readFileSync(path.resolve(__dirname, '../src/components/zakat/ZakatSpreadsheetTable.tsx'), 'utf-8');
  const designMd = fs.readFileSync(path.resolve(__dirname, '../DESIGN.md'), 'utf-8');

  // P1: Landmarks & Accessibility
  it('P1: layout.tsx uses div for app-content to avoid nested main landmarks', () => {
    expect(layout).not.toContain('<main className="app-content">');
    expect(layout).toContain('<div className="app-content">');
  });

  it('P1: header back links and logout button have aria-labels', () => {
    expect(homePage).toMatch(/aria-label=["']Keluar["']/);
    expect(motorPage).toMatch(/aria-label=["']Kembali/);
    expect(emasPage).toMatch(/aria-label=["']Kembali/);
    expect(zakatPage).toMatch(/aria-label=["']Kembali/);
    expect(emasPricesPage).toMatch(/aria-label=["']Kembali/);
    expect(motorSettingsPage).toMatch(/aria-label=["']Kembali/);
    expect(emasSettingsPage).toMatch(/aria-label=["']Kembali/);
    expect(zakatSettingsPage).toMatch(/aria-label=["']Kembali/);
  });

  it('P1: form inputs in settings and filters have matching label htmlFor and id', () => {
    expect(emasSettingsPage).toContain('htmlFor="person-name"');
    expect(emasSettingsPage).toContain('id="person-name"');
    expect(motorSettingsPage).toContain('htmlFor="motor-name"');
    expect(motorSettingsPage).toContain('id="motor-name"');
    expect(serviceFilter).toContain('htmlFor="filter-start-date"');
    expect(serviceFilter).toContain('id="filter-start-date"');
  });

  it('P1: GoldCard uses semantic success tokens instead of hardcoded #10b981', () => {
    expect(goldCard).not.toContain("color: '#10b981'");
    expect(goldCard).toContain('var(--color-success-text)');
  });

  // P2: Touch Targets & Theming
  it('P2: ServiceFilter pill buttons and date inputs have minHeight 44px', () => {
    expect(serviceFilter).toContain("minHeight: '44px'");
  });

  it('P2: zakat settings person selector buttons have minHeight 44px', () => {
    expect(zakatSettingsPage).toContain("minHeight: '44px'");
  });

  it('P2: globals.css defines warning tokens for light and dark modes', () => {
    expect(css).toContain('--color-warning-bg');
    expect(css).toContain('--color-warning-text');
  });

  it('P2: GoldCard uses warning tokens instead of hardcoded yellow/amber hex', () => {
    expect(goldCard).toContain('var(--color-warning-bg)');
    expect(goldCard).toContain('var(--color-warning-text)');
    expect(goldCard).not.toContain("backgroundColor: '#fef3c7'");
  });

  it('P2: ZakatTrendChart has accessible img role and aria-label', () => {
    expect(zakatChart).toContain('role="img"');
    expect(zakatChart).toContain('aria-label=');
  });

  it('P2: ZakatSpreadsheetTable uses proper table header scopes', () => {
    expect(zakatSpreadsheet).toContain('scope="col"');
    expect(zakatSpreadsheet).toContain('scope="row"');
  });

  it('P2: DESIGN.md documents sub-body typography token (0.8125rem)', () => {
    expect(designMd).toContain('0.8125rem');
  });

  // P3: Animations & Motion Accessibility
  it('P3: globals.css defines animate-spin keyframes and class', () => {
    expect(css).toContain('@keyframes spin');
    expect(css).toContain('.animate-spin');
  });

  it('P3: globals.css defines prefers-reduced-motion media query', () => {
    expect(css).toContain('prefers-reduced-motion');
  });
});

