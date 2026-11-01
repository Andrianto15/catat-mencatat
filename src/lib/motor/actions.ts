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

export function getUniqueWorkshops(services: MotorServiceItem[]): string[] {
  const map = new Map<string, string>();
  for (const s of services) {
    const raw = s.workshop_name;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, trimmed);
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

export function filterWorkshopSuggestions(workshops: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return workshops;
  return workshops.filter((w) => w.toLowerCase().includes(q));
}

export type ServiceReminderStatus = 'UPCOMING' | 'DUE' | 'OVERDUE' | 'NO_SERVICE';

export interface MotorServiceReminder {
  motorId: string;
  motorName: string;
  plateNumber?: string | null;
  lastServiceDate: string | null;
  lastKm: number | null;
  nextServiceMinDate: string | null;
  nextServiceMaxDate: string | null;
  status: ServiceReminderStatus;
  daysUntilMinDue?: number;
  daysOverdue?: number;
}

export function addMonthsClamped(dateStr: string, months: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return '';
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetMonthIndex = m - 1 + months;
  const targetYear = y + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const daysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(d, daysInMonth);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${targetYear}-${pad(normalizedMonth + 1)}-${pad(clampedDay)}`;
}

export function calculateMotorReminder(
  services: MotorServiceItem[],
  motor: Motor,
  currentDate?: string
): MotorServiceReminder {
  const todayStr = currentDate || new Date().toISOString().split('T')[0];
  const motorServices = services.filter((s) => s.motor_id === motor.id);

  if (motorServices.length === 0) {
    return {
      motorId: motor.id,
      motorName: motor.name,
      plateNumber: motor.plate_number,
      lastServiceDate: null,
      lastKm: null,
      nextServiceMinDate: null,
      nextServiceMaxDate: null,
      status: 'NO_SERVICE',
    };
  }

  const sorted = [...motorServices].sort((a, b) => {
    if (b.service_date !== a.service_date) {
      return b.service_date.localeCompare(a.service_date);
    }
    return (b.current_km ?? 0) - (a.current_km ?? 0);
  });

  const latest = sorted[0];
  const lastDate = latest.service_date;
  const lastKm = latest.current_km ?? null;

  const minNext = addMonthsClamped(lastDate, 2);
  const maxNext = addMonthsClamped(lastDate, 3);

  const todayTime = new Date(`${todayStr}T00:00:00Z`).getTime();
  const minTime = new Date(`${minNext}T00:00:00Z`).getTime();
  const maxTime = new Date(`${maxNext}T00:00:00Z`).getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  let status: ServiceReminderStatus;
  let daysUntilMinDue: number | undefined;
  let daysOverdue: number | undefined;

  if (todayStr < minNext) {
    status = 'UPCOMING';
    daysUntilMinDue = Math.round((minTime - todayTime) / oneDay);
  } else if (todayStr <= maxNext) {
    status = 'DUE';
  } else {
    status = 'OVERDUE';
    daysOverdue = Math.round((todayTime - maxTime) / oneDay);
  }

  return {
    motorId: motor.id,
    motorName: motor.name,
    plateNumber: motor.plate_number,
    lastServiceDate: lastDate,
    lastKm,
    nextServiceMinDate: minNext,
    nextServiceMaxDate: maxNext,
    status,
    daysUntilMinDue,
    daysOverdue,
  };
}

export function getAllMotorReminders(
  services: MotorServiceItem[],
  motors: Motor[],
  currentDate?: string
): MotorServiceReminder[] {
  const activeMotors = motors.filter((m) => m.is_active);
  return activeMotors.map((m) => calculateMotorReminder(services, m, currentDate));
}
