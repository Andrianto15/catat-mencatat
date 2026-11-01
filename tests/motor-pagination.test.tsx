import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { paginateMotorServices, DEFAULT_MOTOR_PAGE_SIZE } from '@/lib/motor/actions';
import { ServiceCard } from '@/components/motor/ServiceCard';

describe('Motor Service Pagination Rendering', () => {
  const dummyServices = Array.from({ length: 12 }, (_, i) => ({
    id: `srv-${i + 1}`,
    motor_id: 'm1',
    service_date: `2026-05-${String(i + 1).padStart(2, '0')}`,
    cost: 50000 * (i + 1),
    current_km: 10000 + i * 500,
    workshop_name: 'Bengkel Resmi',
    notes: `Servis ke-${i + 1}`,
  }));

  it('renders only 5 cards initially when services exceed DEFAULT_MOTOR_PAGE_SIZE', () => {
    const paginated = paginateMotorServices(dummyServices, DEFAULT_MOTOR_PAGE_SIZE);
    expect(paginated.items.length).toBe(5);
    expect(paginated.hasMore).toBe(true);

    const html = renderToStaticMarkup(
      <div>
        <div className="service-list">
          {paginated.items.map((s) => (
            <ServiceCard key={s.id} service={s} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </div>
        {paginated.hasMore && (
          <button type="button" aria-label="Tampilkan 5 catatan servis lainnya">
            Tampilkan 5 Lainnya
          </button>
        )}
        <p>Menampilkan {paginated.displayedCount} dari {paginated.total} catatan servis</p>
      </div>
    );

    expect(html).toContain('Tampilkan 5 Lainnya');
    expect(html).toContain('Menampilkan 5 dari 12 catatan servis');
    expect(html).toContain('Servis ke-1');
    expect(html).toContain('Servis ke-5');
    expect(html).not.toContain('Servis ke-6');
  });

  it('does not render load more button when services count is less than or equal to page size', () => {
    const fewServices = dummyServices.slice(0, 3);
    const paginated = paginateMotorServices(fewServices, DEFAULT_MOTOR_PAGE_SIZE);

    expect(paginated.items.length).toBe(3);
    expect(paginated.hasMore).toBe(false);

    const html = renderToStaticMarkup(
      <div>
        <div className="service-list">
          {paginated.items.map((s) => (
            <ServiceCard key={s.id} service={s} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </div>
        {paginated.hasMore && (
          <button type="button">Tampilkan 5 Lainnya</button>
        )}
      </div>
    );

    expect(html).not.toContain('Tampilkan 5 Lainnya');
    expect(html).toContain('Servis ke-3');
  });
});

