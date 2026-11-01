-- Add account_type column to zakat_accounts
ALTER TABLE public.zakat_accounts ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'Bank';

