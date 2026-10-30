-- Add gold_value_snapshot column to zakat_years
ALTER TABLE public.zakat_years ADD COLUMN IF NOT EXISTS gold_value_snapshot NUMERIC(15, 2) NOT NULL DEFAULT 0;

