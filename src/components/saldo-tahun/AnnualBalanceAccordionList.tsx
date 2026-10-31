'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { AnnualBalanceWithDelta } from '@/lib/saldo-tahun/engine';

interface AnnualBalanceAccordionListProps {
  items: AnnualBalanceWithDelta[];
  defaultExpandedYear?: number | null;
  onEdit: (item: AnnualBalanceWithDelta) => void;
  onDelete: (item: AnnualBalanceWithDelta) => void;
}

export function AnnualBalanceAccordionList({
  items,
  defaultExpandedYear = null,
  onEdit,
  onDelete,
}: AnnualBalanceAccordionListProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(defaultExpandedYear);

  if (!items || items.length === 0) {
    return null;
  }

  const toggleExpand = (year: number) => {
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item) => {
        const isExpanded = expandedYear === item.masehi_year;
        const hasDelta = item.deltaNominal !== null && item.deltaPct !== null;
        const isPositive = (item.deltaNominal || 0) >= 0;

        return (
          <div
            key={item.masehi_year}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: `1px solid ${isExpanded ? 'var(--color-primary)' : 'var(--border-card)'}`,
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            {/* Accordion Header Button */}
            <button
              type="button"
              onClick={() => toggleExpand(item.masehi_year)}
              aria-expanded={isExpanded}
              aria-controls={`annual-detail-${item.masehi_year}`}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                minHeight: '44px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Tahun {item.masehi_year}
                  </span>
                  {hasDelta && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: isPositive
                          ? 'var(--color-success-bg)'
                          : 'var(--color-danger-bg)',
                        color: isPositive
                          ? 'var(--color-success-text)'
                          : 'var(--color-danger-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.125rem',
                      }}
                    >
                      {isPositive ? '▲' : '▼'}{' '}
                      {isPositive ? '+' : ''}
                      {item.deltaPct?.toFixed(2).replace('.', ',')}%
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    marginTop: '0.25rem',
                  }}
                >
                  {formatRupiah(item.net_balance)}
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.125rem',
                  }}
                >
                  Total Rekening: {formatRupiah(item.total_accounts)} &bull; Pengeluaran:{' '}
                  {formatRupiah(item.expense_amount)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  minWidth: '24px',
                  justifyContent: 'center',
                }}
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Accordion Expandable Detail */}
            {isExpanded && (
              <div
                id={`annual-detail-${item.masehi_year}`}
                style={{
                  padding: '0 1rem 1rem 1rem',
                  borderTop: '1px dashed var(--border-card)',
                  paddingTop: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Rincian Saldo Rekening
                  </h4>
                  {(!item.balances || item.balances.length === 0) ? (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Tidak ada data rekening tercatat.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {item.balances.map((b) => (
                        <div
                          key={b.account_id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8125rem',
                            padding: '0.375rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-main)',
                          }}
                        >
                          <span style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>
                            {b.account_name || 'Rekening'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatRupiah(b.balance)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtotals & Net summary */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.75rem',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Saldo Rekening:</span>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(item.total_accounts)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pengeluaran:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-danger-text)' }}>
                      -{formatRupiah(item.expense_amount)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-card)',
                      paddingTop: '0.375rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Saldo Akhir Tahun:</span>
                    <span style={{ color: 'var(--color-primary)' }}>
                      {formatRupiah(item.net_balance)}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Catatan: {item.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                    aria-label={`Edit Tahun ${item.masehi_year}`}
                  >
                    <Edit2 size={15} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--color-danger-bg)',
                      color: 'var(--color-danger-text)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                    aria-label={`Hapus Tahun ${item.masehi_year}`}
                  >
                    <Trash2 size={15} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

