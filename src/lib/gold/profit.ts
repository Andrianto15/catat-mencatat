export interface GoldPurchaseCalculationInput {
  weight_gram: number;
  piece_count?: number;
  price_per_piece: number;
}

export interface GoldProfitResult {
  total_cost: number;
  current_value: number | null;
  profit_rp: number | null;
  profit_pct: number | null;
}

export function calculateGoldProfit(
  purchase: GoldPurchaseCalculationInput,
  currentBuybackPerPiece: number | null
): GoldProfitResult {
  const count = purchase.piece_count && purchase.piece_count > 0 ? purchase.piece_count : 1;
  const totalCost = count * purchase.price_per_piece;

  if (currentBuybackPerPiece === null || currentBuybackPerPiece === undefined) {
    return {
      total_cost: totalCost,
      current_value: null,
      profit_rp: null,
      profit_pct: null,
    };
  }

  const currentValue = count * currentBuybackPerPiece;
  const profitRp = currentValue - totalCost;
  const profitPct = totalCost > 0 ? (profitRp / totalCost) * 100 : 0;

  return {
    total_cost: totalCost,
    current_value: currentValue,
    profit_rp: profitRp,
    profit_pct: Math.round(profitPct * 100) / 100,
  };
}

export interface PurchaseItemForSummary {
  id: string;
  person_id: string;
  brand: string;
  weight_gram: number;
  piece_count: number;
  price_per_piece: number;
  sold_at?: string | null;
}

export interface GoldAssetSummary {
  totalPieces: number;
  totalGrams: number;
  totalCost: number;
  currentValue: number;
  totalProfitRp: number;
  totalProfitPct: number;
}

export function calculateGoldAssetSummary(
  purchases: PurchaseItemForSummary[],
  priceMap: Record<string, number | null>
): GoldAssetSummary {
  let totalPieces = 0;
  let totalGrams = 0;
  let totalCost = 0;
  let currentValue = 0;

  // Only active purchases (not sold)
  const active = purchases.filter((p) => !p.sold_at);

  for (const item of active) {
    const count = item.piece_count || 1;
    const cost = count * item.price_per_piece;
    totalPieces += count;
    totalGrams += count * item.weight_gram;
    totalCost += cost;

    const key = `${item.brand.toUpperCase()}-${item.weight_gram}`;
    const buyback = priceMap[key];
    if (buyback !== undefined && buyback !== null) {
      currentValue += count * buyback;
    } else {
      // Fallback if price missing: use cost basis
      currentValue += cost;
    }
  }

  const totalProfitRp = currentValue - totalCost;
  const totalProfitPct = totalCost > 0 ? Math.round(((totalProfitRp / totalCost) * 100) * 100) / 100 : 0;

  return {
    totalPieces,
    totalGrams,
    totalCost,
    currentValue,
    totalProfitRp,
    totalProfitPct,
  };
}
