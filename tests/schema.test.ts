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
    expect(sql).toContain('buyback_price_per_piece');
    expect(sql).toContain('account_type');
    expect(sql).toContain('gold_value_snapshot');
    expect(sql).toContain('silver_price_per_gram');
    expect(sql).toContain('nisab_silver_nominal');
    expect(sql).toContain('zakat_silver_due');
    expect(sql).toContain('zakat_paid');
    expect(sql).toContain('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
    expect(sql).toContain('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;');
  });

  it('should define annual_balances, annual_balance_items, telegram_settings tables with RLS and vercel.json cron', () => {
    const migrationSql = fs.readFileSync(
      'supabase/migrations/20261031000000_add_annual_balances_and_telegram.sql',
      'utf8'
    );
    for (const table of ['annual_balances', 'annual_balance_items', 'telegram_settings']) {
      expect(migrationSql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(migrationSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
    expect(migrationSql).toContain('expense_amount');
    expect(migrationSql).toContain('net_balance');
    expect(migrationSql).toContain('reminder_message');

    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    expect(vercelConfig.crons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/api/cron/telegram-reminder',
          schedule: '0 2 30 12 *',
        }),
      ])
    );
  });
});
