-- Catat-Mencatat: Modul Saldo Akhir Tahun & Telegram Reminder
-- Tables: annual_balances, annual_balance_items, telegram_settings

-- 1. annual_balances
CREATE TABLE IF NOT EXISTS public.annual_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    masehi_year INTEGER NOT NULL,
    total_accounts NUMERIC(15, 2) NOT NULL DEFAULT 0,
    expense_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_annual_balance_person_year UNIQUE (person_id, masehi_year)
);
ALTER TABLE public.annual_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own annual balances" ON public.annual_balances
    FOR ALL USING (auth.uid() = user_id);

-- 2. annual_balance_items
CREATE TABLE IF NOT EXISTS public.annual_balance_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annual_balance_id UUID NOT NULL REFERENCES public.annual_balances(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.zakat_accounts(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_annual_balance_item_account UNIQUE (annual_balance_id, account_id)
);
ALTER TABLE public.annual_balance_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own annual balance items" ON public.annual_balance_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.annual_balances ab
            WHERE ab.id = annual_balance_id AND ab.user_id = auth.uid()
        )
    );

-- 3. telegram_settings
CREATE TABLE IF NOT EXISTS public.telegram_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bot_token TEXT NOT NULL DEFAULT '',
    chat_id TEXT NOT NULL DEFAULT '',
    reminder_message TEXT NOT NULL DEFAULT 'Halo! Hari ini 30 Desember, waktunya mencatat Saldo Akhir Tahun di aplikasi Catat-Mencatat.',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_telegram_settings_user UNIQUE (user_id)
);
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own telegram settings" ON public.telegram_settings
    FOR ALL USING (auth.uid() = user_id);

-- Privileges
GRANT ALL ON TABLE public.annual_balances TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.annual_balance_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.telegram_settings TO anon, authenticated, service_role;

