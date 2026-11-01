import { paginateMotorServices, DEFAULT_MOTOR_PAGE_SIZE, PaginatedResult } from '@/lib/motor/actions';

export const DEFAULT_GOLD_PAGE_SIZE = DEFAULT_MOTOR_PAGE_SIZE;
export const DEFAULT_GOLD_PRICE_PAGE_SIZE = DEFAULT_MOTOR_PAGE_SIZE;

export function paginateGoldPurchases<T>(
  purchases: T[],
  limit: number = DEFAULT_GOLD_PAGE_SIZE
): PaginatedResult<T> {
  return paginateMotorServices(purchases, limit);
}

export function paginateGoldPrices<T>(
  prices: T[],
  limit: number = DEFAULT_GOLD_PRICE_PAGE_SIZE
): PaginatedResult<T> {
  return paginateMotorServices(prices, limit);
}

export function getUniqueGoldBrands(prices: { brand: string }[]): string[] {
  const unique = new Set<string>();
  for (const p of prices) {
    const trimmed = p.brand?.trim().toUpperCase();
    if (trimmed) unique.add(trimmed);
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function getUniqueGoldWeights(
  prices: { brand?: string; weight_gram: number }[],
  brand?: string
): number[] {
  const targetBrand = brand?.trim().toUpperCase();
  const unique = new Set<number>();
  for (const p of prices) {
    if (targetBrand && p.brand?.trim().toUpperCase() !== targetBrand) continue;
    const w = Number(p.weight_gram);
    if (!isNaN(w) && w > 0) unique.add(w);
  }
  return Array.from(unique).sort((a, b) => a - b);
}

export function filterGoldPrices<T extends { brand: string; weight_gram: number }>(
  prices: T[],
  filter: { brand?: string; weightGram?: number | null }
): T[] {
  const targetBrand = filter.brand?.trim().toUpperCase();
  const targetWeight =
    filter.weightGram !== undefined && filter.weightGram !== null
      ? Number(filter.weightGram)
      : null;

  return prices.filter((p) => {
    if (targetBrand && p.brand.trim().toUpperCase() !== targetBrand) return false;
    if (targetWeight !== null && Number(p.weight_gram) !== targetWeight) return false;
    return true;
  });
}

export interface Person {
  id: string;
  user_id?: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface GoldPurchase {
  id: string;
  user_id?: string;
  person_id: string;
  purchase_date: string;
  brand: string;
  weight_gram: number;
  piece_count: number;
  price_per_piece: number;
  buyback_price_per_piece?: number | null;
  sold_at?: string | null;
  sold_price_per_piece?: number | null;
  notes?: string | null;
  created_at?: string;
  people?: Person;
}

export interface GoldPriceItem {
  id: string;
  price_date: string;
  brand: string;
  weight_gram: number;
  sell_price: number | null;
  buyback_price: number | null;
  status: string;
}

export interface SellInput {
  purchase_date: string;
  sold_at: string;
  sold_price_per_piece: number;
}

export function validateSellInput(input: SellInput): { isValid: boolean; error?: string } {
  if (!input.sold_at) {
    return { isValid: false, error: 'Tanggal penjualan wajib diisi.' };
  }
  if (input.sold_at < input.purchase_date) {
    return { isValid: false, error: 'Tanggal jual tidak boleh sebelum tanggal beli.' };
  }
  if (!input.sold_price_per_piece || input.sold_price_per_piece <= 0) {
    return { isValid: false, error: 'Harga jual per keping harus lebih dari 0.' };
  }
  return { isValid: true };
}

export function calculateRealizedProfit(params: {
  piece_count?: number;
  price_per_piece: number;
  sold_price_per_piece: number;
}) {
  const count = params.piece_count && params.piece_count > 0 ? params.piece_count : 1;
  const totalCost = count * params.price_per_piece;
  const totalSold = count * params.sold_price_per_piece;
  const realizedProfitRp = totalSold - totalCost;
  const realizedProfitPct = totalCost > 0 ? Math.round(((realizedProfitRp / totalCost) * 100) * 100) / 100 : 0;

  return {
    realizedProfitRp,
    realizedProfitPct,
  };
}
