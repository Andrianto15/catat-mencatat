import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceCard } from '@/components/motor/ServiceCard';
import { ServiceModal } from '@/components/motor/ServiceModal';

describe('Service Kilometer Optional & Dash Fallback', () => {
  it('renders "-" when current_km is null or undefined in ServiceCard', () => {
    const htmlWithNull = renderToStaticMarkup(
      <ServiceCard
        service={{
          id: 's1',
          motor_id: 'm1',
          service_date: '2026-10-25',
          current_km: null,
          cost: 150000,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Should display '-' instead of 'null km' or '0 km'
    expect(htmlWithNull).toContain('<span>-</span>');

    const htmlWithNumber = renderToStaticMarkup(
      <ServiceCard
        service={{
          id: 's2',
          motor_id: 'm1',
          service_date: '2026-10-25',
          current_km: 15000,
          cost: 150000,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(htmlWithNumber).toContain('15.000 km');
  });

  it('renders "Kilometer (km) (Opsional)" label in ServiceModal', () => {
    const html = renderToStaticMarkup(
      <ServiceModal
        isOpen={true}
        onClose={() => {}}
        motors={[{ id: 'm1', name: 'Vario', plate_number: 'B 1234 CD', is_active: true }]}
        onSave={async () => {}}
      />
    );

    expect(html).toContain('Kilometer (km) (Opsional)');
  });
});

