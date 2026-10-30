-- Add silver nisab fields and zakat_paid to zakat_years table
ALTER TABLE public.zakat_years
ADD COLUMN IF NOT EXISTS silver_price_per_gram NUMERIC(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS nisab_silver_nominal NUMERIC(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS zakat_silver_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS zakat_paid NUMERIC(15, 2) NOT NULL DEFAULT 0;

