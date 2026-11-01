-- Catat-Mencatat: Security RLS Hardening Migration
-- 1. Restrict gold_prices modification (revoke unconditional DELETE, allow SELECT, INSERT, UPDATE)
-- 2. Enforce cross-tenant foreign key ownership across dependent tables

-- 1. gold_prices: disallow DELETE from authenticated (read-only history protection)
DROP POLICY IF EXISTS "Authenticated users can modify gold prices" ON public.gold_prices;

CREATE POLICY "Authenticated users can insert gold prices" ON public.gold_prices
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update gold prices" ON public.gold_prices
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 2. motor_services: verify motor_id belongs to authenticated user
DROP POLICY IF EXISTS "Users can manage their own motor services" ON public.motor_services;
CREATE POLICY "Users can manage their own motor services" ON public.motor_services
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.motors m
            WHERE m.id = motor_id AND m.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.motors m
            WHERE m.id = motor_id AND m.user_id = auth.uid()
        )
    );

-- 3. gold_purchases: verify person_id belongs to authenticated user
DROP POLICY IF EXISTS "Users can manage their own gold purchases" ON public.gold_purchases;
CREATE POLICY "Users can manage their own gold purchases" ON public.gold_purchases
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    );

-- 4. zakat_accounts: verify person_id belongs to authenticated user
DROP POLICY IF EXISTS "Users can manage their own zakat accounts" ON public.zakat_accounts;
CREATE POLICY "Users can manage their own zakat accounts" ON public.zakat_accounts
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    );

-- 5. zakat_years: verify person_id belongs to authenticated user
DROP POLICY IF EXISTS "Users can manage their own zakat years" ON public.zakat_years;
CREATE POLICY "Users can manage their own zakat years" ON public.zakat_years
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    );

-- 6. zakat_balances: verify zakat_year_id AND account_id belong to authenticated user
DROP POLICY IF EXISTS "Users can manage their own zakat balances" ON public.zakat_balances;
CREATE POLICY "Users can manage their own zakat balances" ON public.zakat_balances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.zakat_years y
            WHERE y.id = zakat_year_id AND y.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.zakat_accounts a
            WHERE a.id = account_id AND a.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.zakat_years y
            WHERE y.id = zakat_year_id AND y.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.zakat_accounts a
            WHERE a.id = account_id AND a.user_id = auth.uid()
        )
    );

-- 7. annual_balances: verify person_id belongs to authenticated user
DROP POLICY IF EXISTS "Users can manage their own annual balances" ON public.annual_balances;
CREATE POLICY "Users can manage their own annual balances" ON public.annual_balances
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.people p
            WHERE p.id = person_id AND p.user_id = auth.uid()
        )
    );

-- 8. annual_balance_items: verify annual_balance_id AND account_id belong to authenticated user
DROP POLICY IF EXISTS "Users can manage their own annual balance items" ON public.annual_balance_items;
CREATE POLICY "Users can manage their own annual balance items" ON public.annual_balance_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.annual_balances ab
            WHERE ab.id = annual_balance_id AND ab.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.zakat_accounts a
            WHERE a.id = account_id AND a.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.annual_balances ab
            WHERE ab.id = annual_balance_id AND ab.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.zakat_accounts a
            WHERE a.id = account_id AND a.user_id = auth.uid()
        )
    );
