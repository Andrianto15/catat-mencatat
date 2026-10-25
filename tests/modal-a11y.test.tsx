import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceModal } from '@/components/motor/ServiceModal';
import { YearModal } from '@/components/zakat/YearModal';

describe('Modal Accessibility and Touch Targets', () => {
  it('ServiceModal renders with accessible dialog role, labelledby, and 44px close target', () => {
    const html = renderToStaticMarkup(
      <ServiceModal
        isOpen={true}
        onClose={() => {}}
        motors={[{ id: 'm1', name: 'Vario', plate_number: 'B 1234 CD', is_active: true }]}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Tutup"');
    expect(html).toContain('min-height:44px');
    expect(html).toContain('min-width:44px');
    expect(html).toContain('for="service-motor"');
    expect(html).toContain('id="service-motor"');
  });

  it('YearModal renders with accessible dialog role, labelledby, and 44px close target', () => {
    const html = renderToStaticMarkup(
      <YearModal
        isOpen={true}
        onClose={() => {}}
        personId="p1"
        personName="Andrian"
        accounts={[{ id: 'a1', account_name: 'BCA' }]}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Tutup"');
    expect(html).toContain('min-height:44px');
    expect(html).toContain('min-width:44px');
    expect(html).toContain('for="zakat-hijri-year"');
    expect(html).toContain('id="zakat-hijri-year"');
  });
});
