import fs from 'fs';
import path from 'path';

describe('Audit Optimize (Task 3)', () => {
  const footerSrc = fs.readFileSync(path.resolve(__dirname, '../src/components/Footer.tsx'), 'utf-8');
  const saldoSrc = fs.readFileSync(path.resolve(__dirname, '../src/app/saldo-tahun/page.tsx'), 'utf-8');
  const emasSrc = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/page.tsx'), 'utf-8');

  it('Footer.tsx decouples package.json and imports APP_VERSION from lib/version', () => {
    expect(footerSrc).not.toContain("from '../../package.json'");
    expect(footerSrc).not.toContain("from '../package.json'");
    expect(footerSrc).toMatch(/import\s*\{\s*APP_VERSION\s*\}\s*from\s*['"]@\/lib\/version['"]/);
  });

  it('lib/version exports APP_VERSION matching package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
    );
    const { APP_VERSION } = require('../src/lib/version');
    expect(APP_VERSION).toBe(packageJson.version);
  });

  it('saldo-tahun page wraps yearsWithDeltas and paginatedYears in useMemo', () => {
    expect(saldoSrc).toMatch(/useMemo\(\s*\(\)\s*=>\s*computeAnnualBalanceDeltas/);
    expect(saldoSrc).toMatch(/useMemo\(\s*\(\)\s*=>\s*paginateAnnualBalances/);
  });

  it('emas page wraps summary and paginatedPurchases in useMemo', () => {
    expect(emasSrc).toMatch(/useMemo\(\s*\(\)\s*=>\s*calculateGoldAssetSummary/);
    expect(emasSrc).toMatch(/useMemo\(\s*\(\)\s*=>\s*paginateGoldPurchases/);
  });
});

