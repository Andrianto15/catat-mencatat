import { filterMotorServices, calculateMotorStats, validateServiceInput } from '../src/lib/motor/actions';

describe('Motor Service Logic', () => {
  const sampleServices = [
    {
      id: '1',
      motor_id: 'm1',
      service_date: '2026-01-10',
      current_km: 12000,
      cost: 150000,
      workshop_name: 'Ahass',
      notes: 'Ganti oli',
    },
    {
      id: '2',
      motor_id: 'm1',
      service_date: '2026-03-15',
      current_km: 14000,
      cost: 350000,
      workshop_name: 'Ahass',
      notes: 'Ganti ban dan kampas rem',
    },
    {
      id: '3',
      motor_id: 'm2',
      service_date: '2026-02-01',
      current_km: 5000,
      cost: 100000,
      workshop_name: 'Bengkel Umum',
      notes: 'Cek busi',
    },
  ];

  it('should filter services by motor_id', () => {
    const result = filterMotorServices(sampleServices, { motor_id: 'm1' });
    expect(result.length).toBe(2);
    expect(result.every((s) => s.motor_id === 'm1')).toBe(true);
  });

  it('should filter services by date range', () => {
    const result = filterMotorServices(sampleServices, {
      startDate: '2026-02-01',
      endDate: '2026-03-31',
    });
    expect(result.length).toBe(2);
  });

  it('should calculate total cost and latest km correctly', () => {
    const m1Services = filterMotorServices(sampleServices, { motor_id: 'm1' });
    const stats = calculateMotorStats(m1Services);
    expect(stats.totalCost).toBe(500000);
    expect(stats.totalServices).toBe(2);
    expect(stats.latestKm).toBe(14000);
    expect(stats.latestDate).toBe('2026-03-15');
  });

  it('should validate service input fields', () => {
    const valid = validateServiceInput({
      motor_id: 'm1',
      service_date: '2026-04-01',
      current_km: 15000,
      cost: 100000,
    });
    expect(valid.isValid).toBe(true);

    const validWithoutKm = validateServiceInput({
      motor_id: 'm1',
      service_date: '2026-04-01',
      cost: 100000,
    });
    expect(validWithoutKm.isValid).toBe(true);

    const validWithNullKm = validateServiceInput({
      motor_id: 'm1',
      service_date: '2026-04-01',
      current_km: null,
      cost: 100000,
    });
    expect(validWithNullKm.isValid).toBe(true);

    const invalid = validateServiceInput({
      motor_id: '',
      service_date: '',
      current_km: -10,
      cost: -500,
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should calculate stats correctly when some services have null or missing current_km', () => {
    const servicesWithEmptyKm = [
      {
        id: '1',
        motor_id: 'm1',
        service_date: '2026-01-10',
        current_km: 12000,
        cost: 150000,
      },
      {
        id: '2',
        motor_id: 'm1',
        service_date: '2026-03-15',
        current_km: null,
        cost: 350000,
      },
    ];

    const stats = calculateMotorStats(servicesWithEmptyKm);
    expect(stats.totalCost).toBe(500000);
    expect(stats.totalServices).toBe(2);
    expect(stats.latestKm).toBe(12000);
    expect(stats.latestDate).toBe('2026-03-15');
  });
});
