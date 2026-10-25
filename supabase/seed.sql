-- Seed initial data for local development
-- Insert demo gold prices
INSERT INTO public.gold_prices (price_date, brand, weight_gram, sell_price, buyback_price, status)
VALUES
    (CURRENT_DATE, 'ANTAM', 1, 1450000, 1320000, 'auto'),
    (CURRENT_DATE, 'ANTAM', 5, 7025000, 6600000, 'auto'),
    (CURRENT_DATE, 'ANTAM', 10, 13995000, 13200000, 'auto')
ON CONFLICT (price_date, brand, weight_gram) DO NOTHING;
