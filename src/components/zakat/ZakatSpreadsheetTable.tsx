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

          {/* Nisab Row */}
          <tr style={{ color: 'var(--text-muted)' }}>
            <td style={{ padding: '0.5rem 0.625rem' }}>Nisab (85g Emas)</td>
            {sortedYears.map((y) => (
              <td key={y.hijri_year} style={{ padding: '0.5rem 0.625rem', textAlign: 'right' }}>
                Rp {y.nisab_nominal.toLocaleString('id-ID')}
              </td>
            ))}
          </tr>

          {/* Zakat Due Row */}
          <tr style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            <td style={{ padding: '0.625rem' }}>Zakat Wajib (2.5%)</td>
            {sortedYears.map((y) => (
              <td key={y.hijri_year} style={{ padding: '0.625rem', textAlign: 'right' }}>
                Rp {y.zakat_due.toLocaleString('id-ID')}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
