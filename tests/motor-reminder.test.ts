import {
  addMonthsClamped,
  calculateMotorReminder,
  getAllMotorReminders,
  Motor,
  MotorServiceItem,
} from '@/lib/motor/actions';

describe('Motor Service Reminder Engine', () => {
  describe('addMonthsClamped', () => {
    it('menambahkan bulan secara standar', () => {
      expect(addMonthsClamped('2026-01-15', 2)).toBe('2026-03-15');
      expect(addMonthsClamped('2026-01-15', 3)).toBe('2026-04-15');
    });

    it('menangani pergantian tahun', () => {
      expect(addMonthsClamped('2026-11-15', 2)).toBe('2027-01-15');
      expect(addMonthsClamped('2026-11-15', 3)).toBe('2027-02-15');
    });

    it('meng-clamp tanggal jika bulan tujuan memiliki hari lebih sedikit', () => {
      // 31 Januari + 1 bulan pada tahun non-kabisat -> 28 Februari
      expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
      // 31 Mei + 1 bulan -> 30 Juni
      expect(addMonthsClamped('2026-05-31', 1)).toBe('2026-06-30');
      // 31 Maret + 1 bulan -> 30 April
      expect(addMonthsClamped('2026-03-31', 1)).toBe('2026-04-30');
    });

    it('menangani tahun kabisat saat clamp Februari', () => {
      expect(addMonthsClamped('2024-01-31', 1)).toBe('2024-02-29');
    });
  });

  describe('calculateMotorReminder', () => {
    const sampleMotor: Motor = {
      id: 'motor-1',
      name: 'Honda Beat',
      plate_number: 'B 1234 ABC',
      is_active: true,
    };

    it('mengembalikan status NO_SERVICE jika belum ada riwayat servis', () => {
      const reminder = calculateMotorReminder([], sampleMotor, '2026-11-01');
      expect(reminder.status).toBe('NO_SERVICE');
      expect(reminder.motorId).toBe('motor-1');
      expect(reminder.motorName).toBe('Honda Beat');
      expect(reminder.lastServiceDate).toBeNull();
      expect(reminder.nextServiceMinDate).toBeNull();
      expect(reminder.nextServiceMaxDate).toBeNull();
    });

    it('mengembalikan status UPCOMING jika belum genap 2 bulan dari servis terakhir', () => {
      const services: MotorServiceItem[] = [
        {
          id: 's1',
          motor_id: 'motor-1',
          service_date: '2026-10-01',
          current_km: 10000,
          cost: 150000,
        },
      ];

      // Hari ini: 2026-11-01 (baru 1 bulan)
      // Min: 2026-12-01 (2 bulan), Max: 2027-01-01 (3 bulan)
      const reminder = calculateMotorReminder(services, sampleMotor, '2026-11-01');
      expect(reminder.status).toBe('UPCOMING');
      expect(reminder.lastServiceDate).toBe('2026-10-01');
      expect(reminder.lastKm).toBe(10000);
      expect(reminder.nextServiceMinDate).toBe('2026-12-01');
      expect(reminder.nextServiceMaxDate).toBe('2027-01-01');
      expect(reminder.daysUntilMinDue).toBe(30);
    });

    it('mengembalikan status DUE jika berada di rentang 2 - 3 bulan dari servis terakhir', () => {
      const services: MotorServiceItem[] = [
        {
          id: 's1',
          motor_id: 'motor-1',
          service_date: '2026-08-15',
          current_km: 12000,
          cost: 175000,
        },
      ];

      // Min: 2026-10-15 (2 bulan), Max: 2026-11-15 (3 bulan)
      // Hari ini: 2026-11-01 (antara 2 dan 3 bulan)
      const reminder = calculateMotorReminder(services, sampleMotor, '2026-11-01');
      expect(reminder.status).toBe('DUE');
      expect(reminder.nextServiceMinDate).toBe('2026-10-15');
      expect(reminder.nextServiceMaxDate).toBe('2026-11-15');
    });

    it('mengembalikan status OVERDUE jika sudah lewat lebih dari 3 bulan', () => {
      const services: MotorServiceItem[] = [
        {
          id: 's1',
          motor_id: 'motor-1',
          service_date: '2026-07-01',
          current_km: 15000,
          cost: 200000,
        },
      ];

      // Min: 2026-09-01, Max: 2026-10-01
      // Hari ini: 2026-11-01 (> 3 bulan)
      const reminder = calculateMotorReminder(services, sampleMotor, '2026-11-01');
      expect(reminder.status).toBe('OVERDUE');
      expect(reminder.nextServiceMinDate).toBe('2026-09-01');
      expect(reminder.nextServiceMaxDate).toBe('2026-10-01');
      expect(reminder.daysOverdue).toBe(31);
    });

    it('mengambil catatan servis terbaru jika terdapat beberapa riwayat', () => {
      const services: MotorServiceItem[] = [
        {
          id: 's1',
          motor_id: 'motor-1',
          service_date: '2026-05-10',
          current_km: 8000,
          cost: 100000,
        },
        {
          id: 's2',
          motor_id: 'motor-1',
          service_date: '2026-08-20',
          current_km: 11000,
          cost: 120000,
        },
        {
          id: 's3',
          motor_id: 'motor-1',
          service_date: '2026-03-01',
          current_km: 5000,
          cost: 90000,
        },
      ];

      const reminder = calculateMotorReminder(services, sampleMotor, '2026-11-01');
      expect(reminder.lastServiceDate).toBe('2026-08-20');
      expect(reminder.lastKm).toBe(11000);
      expect(reminder.status).toBe('DUE');
    });
  });

  describe('getAllMotorReminders', () => {
    it('menghitung reminder untuk seluruh motor aktif', () => {
      const motors: Motor[] = [
        { id: 'm1', name: 'Vario', is_active: true },
        { id: 'm2', name: 'PCX', is_active: true },
        { id: 'm3', name: 'Mio Lama', is_active: false },
      ];

      const services: MotorServiceItem[] = [
        {
          id: 's1',
          motor_id: 'm1',
          service_date: '2026-08-15',
          current_km: 14000,
          cost: 150000,
        },
      ];

      const reminders = getAllMotorReminders(services, motors, '2026-11-01');
      expect(reminders).toHaveLength(2);
      expect(reminders[0].motorName).toBe('Vario');
      expect(reminders[0].status).toBe('DUE');
      expect(reminders[1].motorName).toBe('PCX');
      expect(reminders[1].status).toBe('NO_SERVICE');
    });
  });
});

