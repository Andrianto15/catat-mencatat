-- Catat-Mencatat Initial Schema Migration
-- 8 required tables with RLS and foreign keys

-- 1. people
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own people" ON public.people
    FOR ALL USING (auth.uid() = user_id);

-- 2. motors
CREATE TABLE IF NOT EXISTS public.motors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plate_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.motors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own motors" ON public.motors
    FOR ALL USING (auth.uid() = user_id);

-- 3. motor_services
CREATE TABLE IF NOT EXISTS public.motor_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motor_id UUID NOT NULL REFERENCES public.motors(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    current_km INTEGER NOT NULL DEFAULT 0,
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    workshop_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.motor_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own motor services" ON public.motor_services
    FOR ALL USING (auth.uid() = user_id);

-- 4. gold_prices
CREATE TABLE IF NOT EXISTS public.gold_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_date DATE NOT NULL,
    brand TEXT NOT NULL DEFAULT 'ANTAM',
    weight_gram NUMERIC(10, 4) NOT NULL,
    sell_price NUMERIC(15, 2),
    buyback_price NUMERIC(15, 2),
    status TEXT NOT NULL DEFAULT 'auto' CHECK (status IN ('auto', 'manual', 'gagal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_gold_price_date_brand_weight UNIQUE (price_date, brand, weight_gram)
);
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read gold prices" ON public.gold_prices
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can modify gold prices" ON public.gold_prices
    FOR ALL TO authenticated USING (true);

-- 5. gold_purchases
CREATE TABLE IF NOT EXISTS public.gold_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    purchase_date DATE NOT NULL,
    brand TEXT NOT NULL DEFAULT 'ANTAM',
    weight_gram NUMERIC(10, 4) NOT NULL,
    piece_count INTEGER NOT NULL DEFAULT 1,
    price_per_piece NUMERIC(15, 2) NOT NULL,
    sold_at DATE,
    sold_price_per_piece NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gold_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gold purchases" ON public.gold_purchases
    FOR ALL USING (auth.uid() = user_id);

-- 6. zakat_accounts
CREATE TABLE IF NOT EXISTS public.zakat_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    institution TEXT,
    account_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zakat_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own zakat accounts" ON public.zakat_accounts
    FOR ALL USING (auth.uid() = user_id);

-- 7. zakat_years
CREATE TABLE IF NOT EXISTS public.zakat_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    hijri_year INTEGER NOT NULL,
    masehi_year INTEGER NOT NULL,
    reference_date DATE NOT NULL,
    gold_price_per_gram NUMERIC(15, 2) NOT NULL,
    nisab_nominal NUMERIC(15, 2) NOT NULL,
    total_assets NUMERIC(15, 2) NOT NULL DEFAULT 0,
    zakat_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_person_hijri_year UNIQUE (person_id, hijri_year)
);
ALTER TABLE public.zakat_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own zakat years" ON public.zakat_years
    FOR ALL USING (auth.uid() = user_id);

-- 8. zakat_balances
CREATE TABLE IF NOT EXISTS public.zakat_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zakat_year_id UUID NOT NULL REFERENCES public.zakat_years(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.zakat_accounts(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_year_account UNIQUE (zakat_year_id, account_id)
);
ALTER TABLE public.zakat_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own zakat balances" ON public.zakat_balances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.zakat_years y
            WHERE y.id = zakat_year_id AND y.user_id = auth.uid()
        )
    );
