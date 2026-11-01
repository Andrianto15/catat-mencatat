import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceReminderCard } from '@/components/motor/ServiceReminderCard';
import { MotorServiceReminder } from '@/lib/motor/actions';

describe('ServiceReminderCard Component Rendering', () => {
  const sampleReminderDue: MotorServiceReminder = {
    motorId: 'm1',
    motorName: 'Honda Vario 160',
    plateNumber: 'B 1234 CD',
    lastServiceDate: '2026-08-15',
    lastKm: 12000,
    nextServiceMinDate: '2026-10-15',
    nextServiceMaxDate: '2026-11-15',
    status: 'DUE',
  };

  const sampleReminderOverdue: MotorServiceReminder = {
    motorId: 'm2',
    motorName: 'Yamaha NMax',
    plateNumber: 'B 5678 EF',
    lastServiceDate: '2026-06-01',
    lastKm: 25000,
    nextServiceMinDate: '2026-08-01',
    nextServiceMaxDate: '2026-09-01',
    status: 'OVERDUE',
    daysOverdue: 60,
  };

  const sampleReminderUpcoming: MotorServiceReminder = {
    motorId: 'm3',
    motorName: 'Honda Scoopy',
    plateNumber: 'B 9999 GH',
    lastServiceDate: '2026-10-20',
    lastKm: 3000,
    nextServiceMinDate: '2026-12-20',
    nextServiceMaxDate: '2027-01-20',
    status: 'UPCOMING',
    daysUntilMinDue: 49,
  };

  const sampleReminderNoService: MotorServiceReminder = {
    motorId: 'm4',
    motorName: 'Vespa Sprint',
    plateNumber: null,
    lastServiceDate: null,
    lastKm: null,
    nextServiceMinDate: null,
    nextServiceMaxDate: null,
    status: 'NO_SERVICE',
  };

  it('menampilkan detail pengingat berstatus DUE dengan benar', () => {
    const html = renderToStaticMarkup(
      <ServiceReminderCard reminders={[sampleReminderDue]} />
    );

    expect(html).toContain('Pengingat Servis Berikutnya');
    expect(html).toContain('Honda Vario 160');
    expect(html).toContain('Waktunya Servis');
    expect(html).toContain('2026-10-15');
    expect(html).toContain('2026-11-15');
    expect(html).toContain('aria-label="Kirim pengingat ke Telegram"');
    expect(html).toContain('min-height:44px');
  });

  it('menampilkan badge Lewat Jadwal untuk status OVERDUE', () => {
    const html = renderToStaticMarkup(
      <ServiceReminderCard reminders={[sampleReminderOverdue]} />
    );

    expect(html).toContain('Yamaha NMax');
    expect(html).toContain('Lewat Jadwal');
    expect(html).toContain('2026-08-01');
    expect(html).toContain('2026-09-01');
  });

  it('menampilkan badge Belum Waktunya untuk status UPCOMING', () => {
    const html = renderToStaticMarkup(
      <ServiceReminderCard reminders={[sampleReminderUpcoming]} />
    );

    expect(html).toContain('Honda Scoopy');
    expect(html).toContain('Belum Waktunya');
    expect(html).toContain('2026-12-20');
  });

  it('menampilkan keterangan Belum Ada Riwayat untuk status NO_SERVICE', () => {
    const html = renderToStaticMarkup(
      <ServiceReminderCard reminders={[sampleReminderNoService]} />
    );

    expect(html).toContain('Vespa Sprint');
    expect(html).toContain('Belum Ada Riwayat');
    expect(html).toContain('disabled');
  });
});
