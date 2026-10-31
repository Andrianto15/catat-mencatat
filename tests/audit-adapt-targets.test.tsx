import fs from 'fs';
import path from 'path';

describe('Audit Adapt Targets (Task 2)', () => {
  const serviceModal = fs.readFileSync(path.resolve(__dirname, '../src/components/motor/ServiceModal.tsx'), 'utf-8');
  const purchaseModal = fs.readFileSync(path.resolve(__dirname, '../src/components/gold/PurchaseModal.tsx'), 'utf-8');
  const yearModal = fs.readFileSync(path.resolve(__dirname, '../src/components/zakat/YearModal.tsx'), 'utf-8');
  const autocomplete = fs.readFileSync(path.resolve(__dirname, '../src/components/motor/WorkshopAutocomplete.tsx'), 'utf-8');
  const saldoSettings = fs.readFileSync(path.resolve(__dirname, '../src/app/saldo-tahun/settings/page.tsx'), 'utf-8');
  const emasPrices = fs.readFileSync(path.resolve(__dirname, '../src/app/emas/prices/page.tsx'), 'utf-8');

  it('ServiceModal inputs and selects have minHeight: 44px', () => {
    // service-date input
    expect(serviceModal).toMatch(/id="service-date"[\s\S]*?minHeight:\s*['"]44px['"]/);
    // service-km input
    expect(serviceModal).toMatch(/id="service-km"[\s\S]*?minHeight:\s*['"]44px['"]/);
    // service-cost input
    expect(serviceModal).toMatch(/id="service-cost"[\s\S]*?minHeight:\s*['"]44px['"]/);
    // service-motor select
    expect(serviceModal).toMatch(/id="service-motor"[\s\S]*?minHeight:\s*['"]44px['"]/);
  });

  it('PurchaseModal inputs and selects have minHeight: 44px', () => {
    expect(purchaseModal).toMatch(/id="gold-person"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-date"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-brand"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-weight"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-pieces"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-price"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(purchaseModal).toMatch(/id="gold-buyback-price"[\s\S]*?minHeight:\s*['"]44px['"]/);
  });

  it('YearModal header inputs have minHeight: 44px', () => {
    expect(yearModal).toMatch(/id="zakat-hijri-year"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(yearModal).toMatch(/id="zakat-ref-date"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(yearModal).toMatch(/id="zakat-gold-price"[\s\S]*?minHeight:\s*['"]44px['"]/);
    expect(yearModal).toMatch(/id="zakat-silver-price"[\s\S]*?minHeight:\s*['"]44px['"]/);
  });

  it('WorkshopAutocomplete chevron button has at least 44px touch target dimensions', () => {
    expect(autocomplete).not.toContain("width: '32px'");
    expect(autocomplete).not.toContain("height: '32px'");
    expect(autocomplete).toMatch(/(width|minWidth):\s*['"]44px['"]/);
    expect(autocomplete).toMatch(/(height|minHeight):\s*['"]44px['"]/);
  });

  it('saldo-tahun settings telegram enabled checkbox has 44px minimum target height', () => {
    expect(saldoSettings).toMatch(/htmlFor="telegram-enabled-toggle"[^>]*style=\{\{[^}]*minHeight:\s*['"]44px['"]/s);
  });

  it('emas prices reset filter button has minHeight: 44px', () => {
    expect(emasPrices).toMatch(/onClick=\{resetFilters\}[^>]*style=\{\{[^}]*minHeight:\s*['"]44px['"]/s);
  });
});
