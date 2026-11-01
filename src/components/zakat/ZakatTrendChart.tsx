import React from 'react';
import { ZakatYearData } from '@/lib/zakat/engine';

interface ZakatTrendChartProps {
  years: ZakatYearData[];
}

export function ZakatTrendChart({ years }: ZakatTrendChartProps) {
  if (years.length < 2) return null;

  const sorted = [...years].sort((a, b) => a.hijri_year - b.hijri_year);
  const maxAssets = Math.max(...sorted.map((y) => y.total_assets), 1);

  return (
    <div
      role="img"
      aria-label="Grafik tren total harta zakat antar-tahun"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-card)',
        padding: '1.25rem',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Tren Total Harta & Zakat
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '140px', paddingTop: '1rem' }}>
        {sorted.map((y) => {
          const heightPct = Math.max(15, Math.round((y.total_assets / maxAssets) * 100));
          return (
            <div
              key={y.hijri_year}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '0.375rem',
              }}
            >
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(y.total_assets)}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: `${heightPct}%`,
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '0.375rem 0.375rem 0 0',
                  opacity: 0.85,
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {y.hijri_year} H
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
