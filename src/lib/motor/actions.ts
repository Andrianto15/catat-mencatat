export interface Motor {
  id: string;
  user_id?: string;
  name: string;
  plate_number?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface MotorServiceItem {
  id: string;
  user_id?: string;
  motor_id: string;
  service_date: string;
  current_km: number | null;
  cost: number;
  workshop_name?: string | null;
  notes?: string | null;
  created_at?: string;
  motors?: Motor;
}

export interface ServiceFilterOptions {
  motor_id?: string;
  startDate?: string;
  endDate?: string;
}

export function filterMotorServices(
  services: MotorServiceItem[],
  options: ServiceFilterOptions
): MotorServiceItem[] {
  return services.filter((s) => {
    if (options.motor_id && s.motor_id !== options.motor_id) {
      return false;
    }
    if (options.startDate && s.service_date < options.startDate) {
      return false;
    }
    if (options.endDate && s.service_date > options.endDate) {
      return false;
    }
    return true;
  });
}

export function calculateMotorStats(services: MotorServiceItem[]) {
  const totalServices = services.length;
  const totalCost = services.reduce((acc, s) => acc + Number(s.cost || 0), 0);

  let latestKm = 0;
  let latestDate: string | null = null;

  if (services.length > 0) {
    const sorted = [...services].sort((a, b) => {
      if (b.service_date !== a.service_date) {
        return b.service_date.localeCompare(a.service_date);
      }
      return (b.current_km ?? 0) - (a.current_km ?? 0);
    });
    latestDate = sorted[0].service_date;
    const serviceWithKm = sorted.find((s) => s.current_km != null && s.current_km > 0);
    latestKm = serviceWithKm?.current_km ?? 0;
  }

  return {
    totalServices,
    totalCost,
    latestKm,
    latestDate,
  };
}

export function validateServiceInput(input: Partial<MotorServiceItem>) {
  const errors: string[] = [];

  if (!input.motor_id) {
    errors.push('Pilih motor terlebih dahulu.');
  }
  if (!input.service_date) {
    errors.push('Tanggal servis wajib diisi.');
  }
  if (input.current_km !== undefined && input.current_km !== null && input.current_km < 0) {
    errors.push('Kilometer servis tidak boleh negatif.');
  }
  if (input.cost === undefined || input.cost < 0) {
    errors.push('Biaya servis tidak boleh negatif.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const DEFAULT_MOTOR_PAGE_SIZE = 5;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  displayedCount: number;
  hasMore: boolean;
}

export function paginateMotorServices<T>(
  services: T[],
  limit: number = DEFAULT_MOTOR_PAGE_SIZE
): PaginatedResult<T> {
  const safeLimit = Math.max(0, limit);
  const items = services.slice(0, safeLimit);
  return {
    items,
    total: services.length,
    displayedCount: items.length,
    hasMore: items.length < services.length,
  };
}
