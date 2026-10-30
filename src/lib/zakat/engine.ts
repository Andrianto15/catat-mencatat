import { paginateMotorServices, DEFAULT_MOTOR_PAGE_SIZE, PaginatedResult } from '@/lib/motor/actions';

export const DEFAULT_ZAKAT_PAGE_SIZE = DEFAULT_MOTOR_PAGE_SIZE;

export function paginateZakatYears<T>(
  years: T[],
  limit: number = DEFAULT_ZAKAT_PAGE_SIZE
): PaginatedResult<T> {
  return paginateMotorServices(years, limit);
}

export interface CashBalanceItem {
  account_id: string;
  account_name?: string;
  balance: number;
}

export interface ZakatCalculationParams {
  goldPricePerGram: number;
  cashBalances: CashBalanceItem[];
  goldTotalValue: number;
}

export interface ZakatCalculationResult {
  nisabNominal: number;
  totalCash: number;
  goldTotalValue: number;
  totalAssets: number;
  isWajib: boolean;
  zakatDue: number;
}

export function calculateZakat(params: ZakatCalculationParams): ZakatCalculationResult {
  const nisabNominal = Math.round(Number(params.goldPricePerGram || 0) * 85);
  const totalCash = (params.cashBalances || []).reduce(
    (acc, b) => acc + Number(b.balance || 0),
    0
  );
  const goldTotalValue = Number(params.goldTotalValue || 0);
  const totalAssets = totalCash + goldTotalValue;
  const isWajib = totalAssets >= nisabNominal && nisabNominal > 0;
  const zakatDue = isWajib ? Math.round(totalAssets * 0.025) : 0;

  return {
    nisabNominal,
    totalCash,
    goldTotalValue,
    totalAssets,
    isWajib,
    zakatDue,
  };
}

export interface GoldPieceForZakat {
  id: string;
  purchase_date: string;
  brand: string;
  weight_gram: number;
  piece_count: number;
  sold_at?: string | null;
}

export function resolveZakatGoldHoldings(
  pieces: GoldPieceForZakat[],
  referenceDate: string
): GoldPieceForZakat[] {
  return pieces.filter((piece) => {
    // Must be bought on or before 1 Ramadhan
    if (piece.purchase_date > referenceDate) {
      return false;
    }
    // If not sold, it's held on 1 Ramadhan
    if (!piece.sold_at) {
      return true;
    }
    // If sold AFTER 1 Ramadhan, on 1 Ramadhan it was still held!
    if (piece.sold_at > referenceDate) {
      return true;
    }
    // Sold before or on 1 Ramadhan -> excluded
    return false;
  });
}

export interface RoundingChips {
  exact: number;
  round10k: number;
  round50k: number;
  round100k: number;
}

export function getRoundingChips(zakatDue: number): RoundingChips {
  return {
    exact: zakatDue,
    round10k: Math.ceil(zakatDue / 10000) * 10000,
    round50k: Math.ceil(zakatDue / 50000) * 50000,
    round100k: Math.ceil(zakatDue / 100000) * 100000,
  };
}

export interface ZakatYearData {
  hijri_year: number;
  masehi_year: number;
  gold_price_per_gram: number;
  nisab_nominal: number;
  total_assets: number;
  zakat_due: number;
  balances?: Array<{
    account_id: string;
    account_name?: string;
    balance: number;
  }>;
}

export interface AccountDiff {
  account_id: string;
  account_name: string;
  balancePrevious: number;
  balanceCurrent: number;
  deltaNominal: number;
  deltaPct: number;
}

export interface YearComparisonResult {
  totalAssetsDelta: number;
  totalAssetsDeltaPct: number;
  zakatDueDelta: number;
  zakatDueDeltaPct: number;
  accountDiffs: AccountDiff[];
}

export function compareTwoZakatYears(
  prevYear: ZakatYearData,
  currYear: ZakatYearData
): YearComparisonResult {
  const totalAssetsDelta = currYear.total_assets - prevYear.total_assets;
  const totalAssetsDeltaPct =
    prevYear.total_assets > 0
      ? Math.round(((totalAssetsDelta / prevYear.total_assets) * 100) * 100) / 100
      : 0;

  const zakatDueDelta = currYear.zakat_due - prevYear.zakat_due;
  const zakatDueDeltaPct =
    prevYear.zakat_due > 0
      ? Math.round(((zakatDueDelta / prevYear.zakat_due) * 100) * 100) / 100
      : 0;

  const prevMap = new Map<string, { name: string; balance: number }>();
  (prevYear.balances || []).forEach((b) => {
    prevMap.set(b.account_id, {
      name: b.account_name || 'Rekening',
      balance: Number(b.balance || 0),
    });
  });

  const currMap = new Map<string, { name: string; balance: number }>();
  (currYear.balances || []).forEach((b) => {
    currMap.set(b.account_id, {
      name: b.account_name || 'Rekening',
      balance: Number(b.balance || 0),
    });
  });

  // Unique list of all account IDs
  const allAccountIds = Array.from(
    new Set([...Array.from(prevMap.keys()), ...Array.from(currMap.keys())])
  );

  const accountDiffs: AccountDiff[] = allAccountIds.map((accId) => {
    const prev = prevMap.get(accId) || { name: '', balance: 0 };
    const curr = currMap.get(accId) || { name: '', balance: 0 };
    const account_name = curr.name || prev.name || 'Rekening';
    const deltaNominal = curr.balance - prev.balance;
    const deltaPct =
      prev.balance > 0
        ? Math.round(((deltaNominal / prev.balance) * 100) * 100) / 100
        : 0;

    return {
      account_id: accId,
      account_name,
      balancePrevious: prev.balance,
      balanceCurrent: curr.balance,
      deltaNominal,
      deltaPct,
    };
  });

  return {
    totalAssetsDelta,
    totalAssetsDeltaPct,
    zakatDueDelta,
    zakatDueDeltaPct,
    accountDiffs,
  };
}
