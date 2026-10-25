import fs from 'fs';

describe('Supabase Schema Migration', () => {
  it('should define all 8 required tables and RLS policies', () => {
    const sql = fs.readFileSync('supabase/migrations/20261025000000_init_schema.sql', 'utf8');
    const requiredTables = [
      'people', 'motors', 'motor_services', 'gold_prices',
      'gold_purchases', 'zakat_accounts', 'zakat_years', 'zakat_balances'
    ];
    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
    expect(sql).toContain('sold_at');
    expect(sql).toContain('sold_price_per_piece');
    expect(sql).toContain('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
    expect(sql).toContain('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;');
  });
});
