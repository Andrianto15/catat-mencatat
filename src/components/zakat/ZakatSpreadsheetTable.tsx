import React from 'react';
import { ZakatYearData } from '@/lib/zakat/engine';

interface ZakatSpreadsheetProps {
  years: ZakatYearData[];
}

export function ZakatSpreadsheetTable({ years }: ZakatSpreadsheetProps) {
  if (years.length === 0) return null;

  // Sorted ascending by Hijri year
  const sortedYears = [...years].sort((a, b) => a.hijri_year - b.hijri_year);

  // Extract all distinct accounts across all years
  const accountsMap = new Map<string, string>();
  sortedYears.forEach((y) => {
    (y.balances || []).forEach((b) => {
      if (!accountsMap.has(b.account_id)) {
        accountsMap.set(b.account_id, b.account_name || 'Rekening');
      }
    });
  });

  const accountList = Array.from(accountsMap.entries());

  return (
    <div style={{
      overflowX: 'auto',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-card)',
      padding: '1rem',
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Matriks Zakat Antar-Tahun (Spreadsheet)
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-card)', textAlign: 'left' }}>
            <th style={{ padding: '0.625rem', color: 'var(--text-muted)' }}>Komponen / Akun</th>
            {sortedYears.map((y) => (
              <th key={y.hijri_year} style={{ padding: '0.625rem', textAlign: 'right' }}>
                <div>{y.hijri_year} H</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({y.masehi_year} M)</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Accounts Rows */}
          {accountList.map(([accId, accName]) => (
            <tr key={accId} style={{ borderBottom: '1px solid var(--border-card)' }}>
              <td style={{ padding: '0.5rem 0.625rem' }}>{accName}</td>
              {sortedYears.map((y) => {
                const bal = (y.balances || []).find((b) => b.account_id === accId)?.balance || 0;
                return (
                  <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                    {bal > 0 ? bal.toLocaleString('id-ID') : '-'}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Total Assets Row */}
          <tr style={{ borderTop: '2px solid var(--border-card)', fontWeight: 700, backgroundColor: 'var(--bg-main)' }}>
            <td style={{ padding: '0.625rem' }}>Total Harta</td>
            {sortedYears.map((y) => (
              <td key={y.hijri_year} style={{ padding: '0.625rem', textAlign: 'right' }}>
                Rp {y.total_assets.toLocaleString('id-ID')}
              </td>
            ))}
          </tr>

          {/* Nisab Emas Row */}
          <tr style={{ color: 'var(--text-muted)' }}>
            <td style={{ padding: '0.5rem 0.625rem' }}>Nisab (85g Emas)</td>
            {sortedYears.map((y) => (
              <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                Rp {y.nisab_nominal.toLocaleString('id-ID')}
              </td>
            ))}
          </tr>

          {/* Zakat Emas Row */}
          <tr style={{ fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-card)' }}>
            <td style={{ padding: '0.5rem 0.625rem' }}>Zakat Emas (2.5%)</td>
            {sortedYears.map((y) => {
              const due = y.zakat_due || 0;
              return (
                <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                  {due > 0 ? `Rp ${due.toLocaleString('id-ID')}` : 'Rp 0 (Belum Wajib)'}
                </td>
              );
            })}
          </tr>

          {/* Nisab Perak Row */}
          <tr style={{ color: 'var(--text-muted)' }}>
            <td style={{ padding: '0.5rem 0.625rem' }}>Nisab (595g Perak)</td>
            {sortedYears.map((y) => {
              const nisabSilver = y.nisab_silver_nominal || (y.silver_price_per_gram ? Math.round(y.silver_price_per_gram * 595) : 0);
              return (
                <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                  {nisabSilver > 0 ? `Rp ${nisabSilver.toLocaleString('id-ID')}` : '-'}
                </td>
              );
            })}
          </tr>

          {/* Zakat Perak Row */}
          <tr style={{ fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-card)' }}>
            <td style={{ padding: '0.5rem 0.625rem' }}>Zakat Perak (2.5%)</td>
            {sortedYears.map((y) => {
              const silverDue = y.zakat_silver_due !== undefined ? y.zakat_silver_due : 0;
              return (
                <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                  {silverDue > 0 ? `Rp ${silverDue.toLocaleString('id-ID')}` : 'Rp 0 (Belum Wajib)'}
                </td>
              );
            })}
          </tr>

          {/* Yang Dibayarkan Row */}
          <tr style={{ fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'var(--bg-main)' }}>
            <td style={{ padding: '0.625rem' }}>Yang Dibayarkan</td>
            {sortedYears.map((y) => {
              const effectiveDue = Math.max(y.zakat_due || 0, y.zakat_silver_due || 0);
              const paid = y.zakat_paid !== undefined && y.zakat_paid !== null
                ? y.zakat_paid
                : (effectiveDue > 0 ? Math.ceil(effectiveDue / 10000) * 10000 : 0);
              return (
                <td key={y.hijri_year} style={{ padding: '0.625rem', textAlign: 'right', fontSize: '0.875rem' }}>
                  Rp {paid.toLocaleString('id-ID')}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
