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
