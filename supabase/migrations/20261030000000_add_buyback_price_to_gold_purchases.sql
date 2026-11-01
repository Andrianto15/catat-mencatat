-- Add historical buyback price at time of purchase (optional/nullable)
ALTER TABLE public.gold_purchases ADD COLUMN IF NOT EXISTS buyback_price_per_piece NUMERIC(15, 2) DEFAULT NULL;

