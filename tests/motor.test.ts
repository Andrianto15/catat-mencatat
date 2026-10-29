import {
  filterMotorServices,
  calculateMotorStats,
  validateServiceInput,
  DEFAULT_MOTOR_PAGE_SIZE,
  paginateMotorServices,
} from '../src/lib/motor/actions';

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

  describe('Pagination Logic', () => {
    const generateServices = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `s-${i + 1}`,
        motor_id: 'm1',
        service_date: `2026-01-${String(i + 1).padStart(2, '0')}`,
        cost: 100000,
        current_km: 1000 * (i + 1),
      }));

    it('has DEFAULT_MOTOR_PAGE_SIZE equal to 5', () => {
      expect(DEFAULT_MOTOR_PAGE_SIZE).toBe(5);
    });

    it('slices default 5 latest services when limit is 5', () => {
      const allServices = generateServices(12);
      const result = paginateMotorServices(allServices, DEFAULT_MOTOR_PAGE_SIZE);

      expect(result.items.length).toBe(5);
      expect(result.items[0].id).toBe('s-1');
      expect(result.items[4].id).toBe('s-5');
      expect(result.total).toBe(12);
      expect(result.hasMore).toBe(true);
      expect(result.displayedCount).toBe(5);
    });

    it('loads 5 more services when limit increases to 10', () => {
      const allServices = generateServices(12);
      const result = paginateMotorServices(allServices, 10);

      expect(result.items.length).toBe(10);
      expect(result.items[9].id).toBe('s-10');
      expect(result.total).toBe(12);
      expect(result.hasMore).toBe(true);
      expect(result.displayedCount).toBe(10);
    });

    it('handles reaching end of list when limit exceeds total', () => {
      const allServices = generateServices(12);
      const result = paginateMotorServices(allServices, 15);

      expect(result.items.length).toBe(12);
      expect(result.total).toBe(12);
      expect(result.hasMore).toBe(false);
      expect(result.displayedCount).toBe(12);
    });

    it('handles empty services array gracefully', () => {
      const result = paginateMotorServices([], 5);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
      expect(result.displayedCount).toBe(0);
    });
  });
});
