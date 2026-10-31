import fs from 'fs';
import path from 'path';

describe('Audit Polish Heading Hierarchy (Task 4)', () => {
  const saldoPage = fs.readFileSync(path.resolve(__dirname, '../src/app/saldo-tahun/page.tsx'), 'utf-8');
  const chartSrc = fs.readFileSync(
    path.resolve(__dirname, '../src/components/saldo-tahun/AnnualBalanceTrendChart.tsx'),
    'utf-8'
  );

  it('saldo-tahun page does not skip h2 for main section headings', () => {
    // Empty state heading should be h2
    expect(saldoPage).toContain('<h2 style={{ fontSize: \'1rem\', fontWeight: 600 }}>Belum ada data Saldo Akhir Tahun</h2>');
    // History heading should be h2
    expect(saldoPage).toMatch(/<h2[^>]*>\s*Riwayat Rekap Tahunan\s*<\/h2>/);
    expect(saldoPage).not.toContain('<h4\n                style={{\n                  fontSize: \'0.875rem\',\n                  fontWeight: 600,\n                  color: \'var(--text-muted)\',\n                  marginBottom: \'0.5rem\',\n                }}\n              >\n                Riwayat Rekap Tahunan\n              </h4>');
  });

  it('AnnualBalanceTrendChart uses h2 for chart section title', () => {
    expect(chartSrc).toMatch(/<h2[^>]*>\s*Grafik Perkembangan Saldo Akhir Tahun\s*<\/h2>/);
    expect(chartSrc).not.toContain('<h3 style={{ fontSize: \'0.9375rem\', fontWeight: 700, color: \'var(--text-main)\' }}>\n            Grafik Perkembangan Saldo Akhir Tahun\n          </h3>');
  });
});

