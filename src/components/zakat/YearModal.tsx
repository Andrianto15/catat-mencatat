'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { getHijriRamadhanDate } from '@/lib/zakat/hijri';
import { calculateZakat, getRoundingChips } from '@/lib/zakat/engine';

export interface ZakatAccount {
  id: string;
  account_name: string;
  institution?: string | null;
  account_number?: string | null;
}

export interface YearModalSaveData {
  hijri_year: number;
  masehi_year: number;
  reference_date: string;
  gold_price_per_gram: number;
  nisab_nominal: number;
  total_assets: number;
  zakat_due: number;
  is_locked: boolean;
  balances: Array<{ account_id: string; balance: number }>;
}

interface YearModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  accounts: ZakatAccount[];
  initialData?: any | null;
  goldValueFromHoldings?: number;
  latestGoldPrice1g?: number;
  onSave: (data: YearModalSaveData) => Promise<void>;
}

export function YearModal({
  isOpen,
  onClose,
  personId,
  personName,
  accounts,
  initialData,
  goldValueFromHoldings = 0,
  latestGoldPrice1g = 1450000,
  onSave,
}: YearModalProps) {
  const [hijriYear, setHijriYear] = useState<number>(1447);
  const [referenceDate, setReferenceDate] = useState<string>('2026-02-18');
  const [goldPrice, setGoldPrice] = useState<number>(latestGoldPrice1g);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setHijriYear(initialData.hijri_year);
      setReferenceDate(initialData.reference_date);
      setGoldPrice(initialData.gold_price_per_gram);
      setIsLocked(initialData.is_locked);
      const bMap: Record<string, number> = {};
      (initialData.balances || []).forEach((b: any) => {
        bMap[b.account_id] = Number(b.balance || 0);
      });
      setBalances(bMap);
    } else {
      const defaultHijri = 1447;
      setHijriYear(defaultHijri);
      setReferenceDate(getHijriRamadhanDate(defaultHijri));
      setGoldPrice(latestGoldPrice1g);
      setIsLocked(false);
      setBalances({});
    }
  }, [initialData, latestGoldPrice1g]);

  if (!isOpen) return null;

  const handleHijriChange = (year: number) => {
    setHijriYear(year);
    setReferenceDate(getHijriRamadhanDate(year));
  };

  const cashList = accounts.map((acc) => ({
    account_id: acc.id,
    balance: balances[acc.id] || 0,
  }));

  const calc = calculateZakat({
    goldPricePerGram: goldPrice,
    cashBalances: cashList,
    goldTotalValue: goldValueFromHoldings,
  });

  const chips = getRoundingChips(calc.zakatDue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hijriYear) {
      setError('Tahun Hijriah wajib diisi.');
      return;
    }
    if (!goldPrice || goldPrice <= 0) {
      setError('Harga emas per gram harus valid.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const masehiYear = new Date(referenceDate).getFullYear() || 2026;

      await onSave({
        hijri_year: Number(hijriYear),
        masehi_year: masehiYear,
        reference_date: referenceDate,
        gold_price_per_gram: goldPrice,
        nisab_nominal: calc.nisabNominal,
        total_assets: calc.totalAssets,
        zakat_due: calc.zakatDue,
        is_locked: isLocked,
        balances: cashList,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: 'var(--bg-card)',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
        border: '1px solid var(--border-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {initialData ? `Edit Saldo Zakat ${hijriYear} H` : `Input Zakat Tahun ${hijriYear} H`}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Untuk: {personName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.625rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header Params */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Tahun Hijriah
              </label>
              <input
                type="number"
                required
                value={hijriYear}
                onChange={(e) => handleHijriChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Ref: 1 Ramadhan
              </label>
              <input
                type="date"
                required
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Harga Emas Acuan (Rp / gram)
            </label>
            <input
              type="number"
              required
              value={goldPrice}
              onChange={(e) => setGoldPrice(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Nisab (85g) = Rp {calc.nisabNominal.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Account Balances Inputs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Saldo Rekening & Tabungan</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {accounts.length} rekening
              </span>
            </div>

            {accounts.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Belum ada rekening dibuat. Tambah di menu Pengaturan Rekening.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-main)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{acc.account_name}</div>
                      {acc.institution && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {acc.institution} {acc.account_number ? `(${acc.account_number})` : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ width: '160px' }}>
                      <input
                        type="number"
                        placeholder="0"
                        value={balances[acc.id] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setBalances((prev) => ({ ...prev, [acc.id]: val }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.5rem',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-card)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.8125rem',
                          textAlign: 'right',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gold Holding preview */}
          {goldValueFromHoldings > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}>
              <span>Nilai Emas Fisik Tertahan (1 Ramadhan):</span>
              <span>Rp {goldValueFromHoldings.toLocaleString('id-ID')}</span>
            </div>
          )}

          {/* Real-time Calculation Summary */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Harta (Uang + Emas):</span>
              <span style={{ fontWeight: 700 }}>Rp {calc.totalAssets.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status Nisab:</span>
              <span style={{
                fontWeight: 700,
                color: calc.isWajib ? '#10b981' : 'var(--text-muted)',
              }}>
                {calc.isWajib ? 'Wajib Zakat (≥ Nisab)' : 'Belum Wajib (< Nisab)'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 700,
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-card)',
            }}>
              <span>Kewajiban Zakat (2.5%):</span>
              <span style={{ color: 'var(--color-primary)' }}>
                Rp {calc.zakatDue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Chips */}
          {calc.isWajib && calc.zakatDue > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                Pilihan Pembulatan Pembayaran:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>+10rb</span>
                  <b>{chips.round10k.toLocaleString('id-ID')}</b>
                </div>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>+50rb</span>
                  <b>{chips.round50k.toLocaleString('id-ID')}</b>
                </div>
                <div style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>+100rb</span>
                  <b>{chips.round100k.toLocaleString('id-ID')}</b>
                </div>
              </div>
            </div>
          )}

          {/* Lock Snapshot Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={14} />
              Kunci data tahun ini (snapshot terkunci, aman dari perubahan di masa depan)
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Data Zakat'}
          </button>
        </form>
      </div>
    </div>
  );
}
