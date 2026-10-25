'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { ZakatYearData, compareTwoZakatYears } from '@/lib/zakat/engine';

interface CompareTwoYearsProps {
  prevYear: ZakatYearData;
  currYear: ZakatYearData;
}

export function CompareTwoYears({ prevYear, currYear }: CompareTwoYearsProps) {
  const diff = compareTwoZakatYears(prevYear, currYear);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-card)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}>
      {/* Header comparison title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Komparasi {prevYear.hijri_year} H vs {currYear.hijri_year} H
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({prevYear.masehi_year} M vs {currYear.masehi_year} M)
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.625rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: diff.totalAssetsDelta >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: diff.totalAssetsDelta >= 0 ? '#10b981' : '#ef4444',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}>
          {diff.totalAssetsDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            {diff.totalAssetsDelta >= 0 ? '+' : ''}
            {diff.totalAssetsDeltaPct}%
          </span>
        </div>
      </div>

      {/* Summary comparison boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-lg)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Total Harta ({currYear.hijri_year} H)
          </span>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>
            Rp {currYear.total_assets.toLocaleString('id-ID')}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: diff.totalAssetsDelta >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.25rem',
          }}>
            {diff.totalAssetsDelta >= 0 ? '▲ Naik' : '▼ Turun'} Rp {Math.abs(diff.totalAssetsDelta).toLocaleString('id-ID')}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-lg)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Kewajiban Zakat (2.5%)
          </span>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            Rp {currYear.zakat_due.toLocaleString('id-ID')}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: diff.zakatDueDelta >= 0 ? '#10b981' : '#ef4444',
            marginTop: '0.25rem',
          }}>
            {diff.zakatDueDelta >= 0 ? '▲ Selisih' : '▼ Selisih'} Rp {Math.abs(diff.zakatDueDelta).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Account by account breakdown */}
      <div>
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Rincian Saldo Rekening
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {diff.accountDiffs.map((acc) => (
            <div
              key={acc.account_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.625rem 0.75rem',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{acc.account_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Rp {acc.balancePrevious.toLocaleString('id-ID')} → Rp {acc.balanceCurrent.toLocaleString('id-ID')}
                </div>
              </div>
              <div style={{
                textAlign: 'right',
                fontWeight: 600,
                color: acc.deltaNominal >= 0 ? '#10b981' : '#ef4444',
              }}>
                <div>
                  {acc.deltaNominal >= 0 ? '+' : ''}
                  Rp {acc.deltaNominal.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '0.75rem' }}>
                  {acc.deltaNominal >= 0 ? '▲' : '▼'} {acc.deltaPct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
