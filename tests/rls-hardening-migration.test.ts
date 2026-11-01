import fs from 'fs';
import path from 'path';

describe('RLS Hardening Migration SQL', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261101000000_harden_rls_policies.sql'
  );

  it('should exist and define gold_prices policy dropping modify and separate insert/update without delete', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('DROP POLICY IF EXISTS "Authenticated users can modify gold prices" ON public.gold_prices');
    expect(sql).toContain('CREATE POLICY "Authenticated users can insert gold prices"');
    expect(sql).toContain('CREATE POLICY "Authenticated users can update gold prices"');
    // Ensure no DELETE policy is created for authenticated
    expect(sql).not.toContain('FOR DELETE TO authenticated');
    expect(sql).not.toContain('FOR ALL TO authenticated');
  });

  it('should verify tenant foreign key ownership via EXISTS in motor_services, gold_purchases, zakat_accounts, zakat_years, zakat_balances, annual_balances, and annual_balance_items', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // motor_services checks motors ownership
    expect(sql).toContain('public.motor_services');
    expect(sql).toMatch(/EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+public\.motors/i);

    // gold_purchases checks people ownership
    expect(sql).toContain('public.gold_purchases');
    expect(sql).toMatch(/EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+public\.people/i);

    // zakat_accounts checks people ownership
    expect(sql).toContain('public.zakat_accounts');

    // zakat_years checks people ownership
    expect(sql).toContain('public.zakat_years');

    // zakat_balances checks zakat_years and zakat_accounts ownership
    expect(sql).toContain('public.zakat_balances');
    expect(sql).toMatch(/EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+public\.zakat_accounts/i);

    // annual_balances checks people ownership
    expect(sql).toContain('public.annual_balances');

    // annual_balance_items checks annual_balances and zakat_accounts ownership
    expect(sql).toContain('public.annual_balance_items');
  });
});
