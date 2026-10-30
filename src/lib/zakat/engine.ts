import { paginateMotorServices, DEFAULT_MOTOR_PAGE_SIZE, PaginatedResult } from '@/lib/motor/actions';

export const DEFAULT_ZAKAT_PAGE_SIZE = DEFAULT_MOTOR_PAGE_SIZE;

export const ZAKAT_ACCOUNT_TYPES = [
  'Bank',
  'e-Wallet',
  'Reksadana / Investasi',
  'Tunai / Cash',
  'Lainnya',
] as const;

export type ZakatAccountType = (typeof ZAKAT_ACCOUNT_TYPES)[number];

export function formatZakatAccountMeta(account: {
  account_type?: string | null;
  institution?: string | null;
  account_number?: string | null;
}): string {
  const typeLabel = account.account_type?.trim() || 'Bank';
  const parts = [typeLabel];
  if (account.institution?.trim()) {
    parts.push(account.institution.trim());
  }
  if (account.account_number?.trim()) {
    parts.push(account.account_number.trim());
  }
  return parts.join(' • ');
}

export function paginateZakatYears<T>(
  years: T[],
  limit: number = DEFAULT_ZAKAT_PAGE_SIZE
): PaginatedResult<T> {
  return paginateMotorServices(years, limit);
}

export const GOLD_NISAB_GRAMS = 85;
export const SILVER_NISAB_GRAMS = 595;
export const DEFAULT_SILVER_PRICE = 18000;

export interface CashBalanceItem {
  account_id: string;
  account_name?: string;
  balance: number;
}

export interface ZakatCalculationParams {
  goldPricePerGram: number;
  silverPricePerGram?: number;
  cashBalances: CashBalanceItem[];
  goldTotalValue: number;
}

export interface ZakatCalculationResult {
  nisabNominal: number;
  nisabGoldNominal: number;
  nisabSilverNominal: number;
  totalCash: number;
  goldTotalValue: number;
  totalAssets: number;
  isWajib: boolean;
  isWajibGold: boolean;
  isWajibSilver: boolean;
  zakatDue: number;
  zakatGoldDue: number;
  zakatSilverDue: number;
  defaultZakatPaid: number;
}

export function calculateZakat(params: ZakatCalculationParams): ZakatCalculationResult {
  const goldPrice = Number(params.goldPricePerGram || 0);
  const silverPrice =
    params.silverPricePerGram !== undefined && params.silverPricePerGram !== null
      ? Number(params.silverPricePerGram)
      : DEFAULT_SILVER_PRICE;

  const nisabGoldNominal = Math.round(goldPrice * GOLD_NISAB_GRAMS);
  const nisabSilverNominal = Math.round(silverPrice * SILVER_NISAB_GRAMS);
  const nisabNominal = nisabGoldNominal;

  const rawCash = (params.cashBalances || []).reduce(
    (acc, b) => acc + Number(b.balance || 0),
    0
  );
  const totalCash = Math.round(rawCash * 100) / 100;
  const goldTotalValue = Math.round(Number(params.goldTotalValue || 0) * 100) / 100;
  const totalAssets = Math.round((totalCash + goldTotalValue) * 100) / 100;

  const isWajibGold = totalAssets >= nisabGoldNominal && nisabGoldNominal > 0;
  const isWajibSilver = totalAssets >= nisabSilverNominal && nisabSilverNominal > 0;
  const isWajib = isWajibGold || isWajibSilver;

  const zakatGoldDue = isWajibGold ? Math.round(totalAssets * 0.025) : 0;
  const zakatSilverDue = isWajibSilver ? Math.round(totalAssets * 0.025) : 0;
  const zakatDue = isWajib ? Math.round(totalAssets * 0.025) : 0;

  const defaultZakatPaid = zakatDue > 0 ? Math.ceil(zakatDue / 10000) * 10000 : 0;

  return {
    nisabNominal,
    nisabGoldNominal,
    nisabSilverNominal,
    totalCash,
    goldTotalValue,
    totalAssets,
    isWajib,
    isWajibGold,
    isWajibSilver,
    zakatDue,
    zakatGoldDue,
    zakatSilverDue,
    defaultZakatPaid,
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
  id?: string;
  hijri_year: number;
  masehi_year: number;
  gold_price_per_gram: number;
  silver_price_per_gram?: number;
  gold_value_snapshot?: number;
  nisab_nominal: number;
  nisab_silver_nominal?: number;
  total_assets: number;
  zakat_due: number;
  zakat_silver_due?: number;
  zakat_paid?: number;
  is_locked?: boolean;
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
  zakatSilverDueDelta: number;
  zakatPaidDelta: number;
  zakatPaidDeltaPct: number;
  accountDiffs: AccountDiff[];
}

export function compareTwoZakatYears(
  prevYear: ZakatYearData,
  currYear: ZakatYearData
): YearComparisonResult {
  const totalAssetsDelta = Math.round((currYear.total_assets - prevYear.total_assets) * 100) / 100;
  const totalAssetsDeltaPct =
    prevYear.total_assets > 0
      ? Math.round(((totalAssetsDelta / prevYear.total_assets) * 100) * 100) / 100
      : 0;

  const zakatDueDelta = Math.round((currYear.zakat_due - prevYear.zakat_due) * 100) / 100;
  const zakatDueDeltaPct =
    prevYear.zakat_due > 0
      ? Math.round(((zakatDueDelta / prevYear.zakat_due) * 100) * 100) / 100
      : 0;

  const prevSilver = Number(prevYear.zakat_silver_due || 0);
  const currSilver = Number(currYear.zakat_silver_due || 0);
  const zakatSilverDueDelta = Math.round((currSilver - prevSilver) * 100) / 100;

  const prevPaid = Number(prevYear.zakat_paid ?? prevYear.zakat_due ?? 0);
  const currPaid = Number(currYear.zakat_paid ?? currYear.zakat_due ?? 0);
  const zakatPaidDelta = Math.round((currPaid - prevPaid) * 100) / 100;
  const zakatPaidDeltaPct =
    prevPaid > 0
      ? Math.round(((zakatPaidDelta / prevPaid) * 100) * 100) / 100
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
    const deltaNominal = Math.round((curr.balance - prev.balance) * 100) / 100;
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
    zakatSilverDueDelta,
    zakatPaidDelta,
    zakatPaidDeltaPct,
    accountDiffs,
  };
}
