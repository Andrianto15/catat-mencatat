import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { ServiceModal } from '@/components/motor/ServiceModal';
import { YearModal } from '@/components/zakat/YearModal';
import { PurchaseModal } from '@/components/gold/PurchaseModal';
import { SellModal } from '@/components/gold/SellModal';

describe('Modal Accessibility, Responsive Layout, and Select Styling', () => {
  it('ServiceModal renders with accessible dialog role, labelledby, responsive classes, and form-select', () => {
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
    expect(html).toContain('class="modal-overlay"');
    expect(html).toContain('class="modal-content"');
    expect(html).toContain('class="form-select"');
    expect(html).toContain('class="form-textarea"');
  });

  it('YearModal renders with accessible dialog role, labelledby, and responsive classes', () => {
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
    expect(html).toContain('class="modal-overlay"');
    expect(html).toContain('class="modal-content"');
  });

  it('PurchaseModal renders with responsive classes and form-select dropdowns', () => {
    const html = renderToStaticMarkup(
      <PurchaseModal
        isOpen={true}
        onClose={() => {}}
        people={[{ id: 'p1', name: 'Andrian', is_active: true }]}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('class="modal-overlay"');
    expect(html).toContain('class="modal-content"');
    expect(html).toContain('class="form-select"');
    expect(html).toContain('class="form-textarea"');
  });

  it('SellModal renders with responsive classes', () => {
    const html = renderToStaticMarkup(
      <SellModal
        isOpen={true}
        onClose={() => {}}
        purchase={{
          id: 'pur-1',
          user_id: 'u1',
          person_id: 'p1',
          purchase_date: '2026-01-01',
          brand: 'ANTAM',
          weight_gram: 5,
          piece_count: 1,
          price_per_piece: 5000000,
          notes: null,
          created_at: '2026-01-01',
          sold_at: null,
          sold_price_per_piece: null,
        }}
        onConfirmSell={async () => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('class="modal-overlay"');
    expect(html).toContain('class="modal-content"');
  });

  it('defines desktop centering, custom dropdown arrow, and textarea boundary styles in globals.css', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');

    expect(css).toContain('.modal-overlay');
    expect(css).toContain('.modal-content');
    expect(css).toContain('@media (min-width: 640px)');
    expect(css).toContain('align-items: center');
    expect(css).toContain('.form-select');
    expect(css).toContain('appearance: none');
    expect(css).toContain('background-position: right 1rem center');
    expect(css).toContain('.form-textarea');
    expect(css).toContain('resize: vertical');
    expect(css).toContain('max-height: 160px');
  });
});
