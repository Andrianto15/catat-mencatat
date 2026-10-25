import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { ServiceCard } from '@/components/motor/ServiceCard';
import { GoldCard } from '@/components/gold/GoldCard';

describe('UI Polish: Focus Visible, Touch Targets & Semantic Badges', () => {
  it('globals.css defines global :focus-visible outline', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf-8');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('var(--color-primary)');
  });

  it('ServiceCard action buttons provide 44px touch targets', () => {
    const html = renderToStaticMarkup(
      <ServiceCard
        service={{
          id: 's1',
          motor_id: 'm1',
          service_date: '2026-10-25',
          current_km: 15000,
          cost: 150000,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(html).toContain('min-height:44px');
    expect(html).toContain('min-width:44px');
  });

  it('GoldCard action buttons provide 44px touch targets and semantic danger token', () => {
    const html = renderToStaticMarkup(
      <GoldCard
        purchase={{
          id: 'g1',
          person_id: 'p1',
          purchase_date: '2026-10-25',
          brand: 'ANTAM',
          weight_gram: 1,
          piece_count: 1,
          price_per_piece: 1400000,
          sold_at: '2026-10-25',
          sold_price_per_piece: 1500000,
        }}
        currentBuyback={1500000}
        onEdit={() => {}}
        onDelete={() => {}}
        onSell={() => {}}
      />
    );
    expect(html).toContain('min-height:44px');
    expect(html).toContain('min-width:44px');
    expect(html).toContain('var(--color-danger-bg)');
    expect(html).toContain('var(--color-danger-text)');
  });
});
