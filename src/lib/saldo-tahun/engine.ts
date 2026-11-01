import { paginateMotorServices, DEFAULT_MOTOR_PAGE_SIZE, PaginatedResult } from '@/lib/motor/actions';

export const DEFAULT_ANNUAL_BALANCE_PAGE_SIZE = DEFAULT_MOTOR_PAGE_SIZE;

export interface AnnualAccountBalanceItem {
  account_id: string;
  account_name?: string;
  balance: number;
}

export interface AnnualBalanceCalculationInput {
  balances: AnnualAccountBalanceItem[];
  expenseAmount?: number;
}

export interface AnnualBalanceCalculationResult {
  totalAccounts: number;
  expenseAmount: number;
  netBalance: number;
}

export function calculateAnnualBalance(
  input: AnnualBalanceCalculationInput
): AnnualBalanceCalculationResult {
  const rawSum = (input.balances || []).reduce(
    (acc, b) => acc + Number(b.balance || 0),
    0
  );
  const totalAccounts = Math.round(rawSum * 100) / 100;
  const expenseAmount = Math.round(Number(input.expenseAmount || 0) * 100) / 100;
  const netBalance = Math.round((totalAccounts - expenseAmount) * 100) / 100;

  return {
    totalAccounts,
    expenseAmount,
    netBalance,
  };
}

export interface AnnualBalanceYearRecord {
  id?: string;
  masehi_year: number;
  total_accounts: number;
  expense_amount: number;
  net_balance: number;
  notes?: string | null;
  balances?: AnnualAccountBalanceItem[];
  created_at?: string;
}

export interface AnnualBalanceWithDelta extends AnnualBalanceYearRecord {
  prevYear: number | null;
  deltaNominal: number | null;
  deltaPct: number | null;
}

export function computeAnnualBalanceDeltas(
  years: AnnualBalanceYearRecord[]
): AnnualBalanceWithDelta[] {
  if (!years || years.length === 0) return [];

  // Sort descending by Masehi year (newest first)
  const sorted = [...years].sort((a, b) => b.masehi_year - a.masehi_year);

  return sorted.map((curr, idx) => {
    const prev = idx + 1 < sorted.length ? sorted[idx + 1] : null;

    if (!prev) {
      return {
        ...curr,
        prevYear: null,
        deltaNominal: null,
        deltaPct: null,
      };
    }

    const deltaNominal = Math.round((curr.net_balance - prev.net_balance) * 100) / 100;
    const deltaPct =
      prev.net_balance > 0
        ? Math.round(((deltaNominal / prev.net_balance) * 100) * 100) / 100
        : 0;

    return {
      ...curr,
      prevYear: prev.masehi_year,
      deltaNominal,
      deltaPct,
    };
  });
}

export function paginateAnnualBalances<T>(
  years: T[],
  limit: number = DEFAULT_ANNUAL_BALANCE_PAGE_SIZE
): PaginatedResult<T> {
  return paginateMotorServices(years, limit);
}

export function suggestNextMasehiYear(
  years: Array<{ masehi_year: number }>,
  fallbackYear: number = new Date().getFullYear()
): number {
  if (!years || years.length === 0) {
    return fallbackYear;
  }
  const maxYear = Math.max(...years.map((y) => Number(y.masehi_year) || 0));
  return maxYear > 0 ? maxYear + 1 : fallbackYear;
}

