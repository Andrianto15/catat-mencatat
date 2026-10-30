import fs from 'fs';
import { ZAKAT_ACCOUNT_TYPES, formatZakatAccountMeta } from '@/lib/zakat/engine';

describe('Zakat Account Type Constants & Formatting', () => {
  it('exposes the standard account types with Bank as default first option', () => {
    expect(ZAKAT_ACCOUNT_TYPES).toEqual([
      'Bank',
      'e-Wallet',
      'Reksadana / Investasi',
      'Tunai / Cash',
      'Lainnya',
    ]);
  });

  it('formats account metadata combining type, institution, and account number', () => {
    expect(
      formatZakatAccountMeta({
        account_type: 'e-Wallet',
        institution: 'GoPay',
        account_number: '08123456',
      })
    ).toBe('e-Wallet • GoPay • 08123456');

    expect(
      formatZakatAccountMeta({
        account_type: 'Tunai / Cash',
        institution: null,
        account_number: null,
      })
    ).toBe('Tunai / Cash');

    expect(
      formatZakatAccountMeta({
        account_type: null,
        institution: 'BCA',
        account_number: null,
      })
    ).toBe('Bank • BCA');
  });

  it('has migration file for account_type column on zakat_accounts', () => {
    const migration = fs.readFileSync(
      'supabase/migrations/20261030000001_add_account_type_to_zakat_accounts.sql',
      'utf8'
    );
    expect(migration).toContain('ALTER TABLE public.zakat_accounts');
    expect(migration).toContain("account_type TEXT NOT NULL DEFAULT 'Bank'");
  });

  it('renders accessible account_type dropdown and persists account_type in ZakatSettingsPage and YearModal', () => {
    const settingsSrc = fs.readFileSync('src/app/zakat/settings/page.tsx', 'utf8');
    expect(settingsSrc).toContain('htmlFor="zakat-account-type"');
    expect(settingsSrc).toContain('id="zakat-account-type"');
    expect(settingsSrc).toContain('className="form-select"');
    expect(settingsSrc).toContain('ZAKAT_ACCOUNT_TYPES.map');
    expect(settingsSrc).toContain('account_type: accountType');
    expect(settingsSrc).toContain('formatZakatAccountMeta(acc)');

    const modalSrc = fs.readFileSync('src/components/zakat/YearModal.tsx', 'utf8');
    expect(modalSrc).toContain('formatZakatAccountMeta(acc)');
  });
});
