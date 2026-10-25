export interface CashBalanceItem {
  account_id: string;
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
