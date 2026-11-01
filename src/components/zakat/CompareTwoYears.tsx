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

  const effectiveCurrDue = Math.max(currYear.zakat_due || 0, currYear.zakat_silver_due || 0);
  const currPaid = currYear.zakat_paid !== undefined && currYear.zakat_paid !== null
    ? currYear.zakat_paid
    : (effectiveCurrDue > 0 ? Math.ceil(effectiveCurrDue / 10000) * 10000 : 0);

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
          backgroundColor: diff.totalAssetsDelta >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
          color: diff.totalAssetsDelta >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
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
            color: diff.totalAssetsDelta >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
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
            Yang Dibayarkan ({currYear.hijri_year} H)
          </span>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            Rp {currPaid.toLocaleString('id-ID')}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: diff.zakatPaidDelta >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
            marginTop: '0.25rem',
          }}>
            {diff.zakatPaidDelta >= 0 ? '▲ Selisih' : '▼ Selisih'} Rp {Math.abs(diff.zakatPaidDelta).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Dual Nisab Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.8125rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Zakat Acuan Emas (85g)
          </span>
          <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
            Rp {Number(currYear.zakat_due || 0).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {Number(currYear.zakat_due || 0) > 0 ? 'Wajib Zakat' : 'Belum Wajib'}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.8125rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Zakat Acuan Perak (595g)
          </span>
          <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
            Rp {Number(currYear.zakat_silver_due || 0).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {Number(currYear.zakat_silver_due || 0) > 0 ? 'Wajib Zakat' : 'Belum Wajib'}
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
                color: acc.deltaNominal >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
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
