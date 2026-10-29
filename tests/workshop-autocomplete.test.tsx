import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getUniqueWorkshops,
  filterWorkshopSuggestions,
  MotorServiceItem,
} from '@/lib/motor/actions';
import { WorkshopAutocomplete } from '@/components/motor/WorkshopAutocomplete';
import { ServiceModal } from '@/components/motor/ServiceModal';

describe('Workshop Autocomplete Logic & Helpers', () => {
  const dummyServices: Partial<MotorServiceItem>[] = [
    { workshop_name: 'Ahass 001' },
    { workshop_name: 'Yamaha SIP' },
    { workshop_name: 'Ahass 001' },
    { workshop_name: '  Bengkel Berkah  ' },
    { workshop_name: null },
    { workshop_name: '' },
    { workshop_name: undefined },
  ];

  it('getUniqueWorkshops extracts unique trimmed non-empty workshop names sorted', () => {
    const result = getUniqueWorkshops(dummyServices as MotorServiceItem[]);
    expect(result).toEqual(['Ahass 001', 'Bengkel Berkah', 'Yamaha SIP']);
  });

  it('filterWorkshopSuggestions filters case-insensitively', () => {
    const list = ['Ahass 001', 'Bengkel Berkah', 'Yamaha SIP', 'Bengkel Motor Jaya'];
    expect(filterWorkshopSuggestions(list, 'bengkel')).toEqual([
      'Bengkel Berkah',
      'Bengkel Motor Jaya',
    ]);
    expect(filterWorkshopSuggestions(list, 'AHASS')).toEqual(['Ahass 001']);
    expect(filterWorkshopSuggestions(list, '')).toEqual(list);
  });
});

describe('WorkshopAutocomplete Component', () => {
  it('renders input with provided value, id, and placeholder', () => {
    const html = renderToStaticMarkup(
      <WorkshopAutocomplete
        id="service-workshop"
        value="Ahass Motor"
        onChange={() => {}}
        workshops={['Ahass Motor', 'Bengkel Berkah']}
        placeholder="Pilih atau cari bengkel"
      />
    );

    expect(html).toContain('id="service-workshop"');
    expect(html).toContain('value="Ahass Motor"');
    expect(html).toContain('placeholder="Pilih atau cari bengkel"');
  });

  it('renders options and "+ Tambah" option when isOpen and query does not match exactly', () => {
    const html = renderToStaticMarkup(
      <WorkshopAutocomplete
        id="service-workshop"
        value="Bengkel Baru"
        onChange={() => {}}
        workshops={['Ahass 001', 'Yamaha SIP']}
        initialOpen={true}
      />
    );

    expect(html).toContain('Tambah &quot;Bengkel Baru&quot;');
    expect(html).toContain('role="listbox"');
  });

  it('ensures each dropdown option satisfies mobile touch target minimum height of 44px', () => {
    const html = renderToStaticMarkup(
      <WorkshopAutocomplete
        id="service-workshop"
        value=""
        onChange={() => {}}
        workshops={['Ahass 001']}
        initialOpen={true}
      />
    );

    expect(html).toContain('min-height:44px');
  });

  it('renders "Belum ada riwayat bengkel" when options list is empty and input value is empty', () => {
    const html = renderToStaticMarkup(
      <WorkshopAutocomplete
        id="service-workshop"
        value=""
        onChange={() => {}}
        workshops={[]}
        initialOpen={true}
      />
    );

    expect(html).toContain('Belum ada riwayat bengkel');
  });

  it('renders correctly inside ServiceModal with combobox role and placeholder', () => {
    const html = renderToStaticMarkup(
      <ServiceModal
        isOpen={true}
        onClose={() => {}}
        motors={[{ id: 'm1', name: 'Vario', plate_number: 'B 1234 CD', is_active: true }]}
        onSave={async () => {}}
        existingWorkshops={['Ahass Jaya', 'Yamaha SIP']}
      />
    );

    expect(html).toContain('Nama Bengkel (Opsional)');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('placeholder="Pilih atau ketik bengkel baru"');
  });
});

