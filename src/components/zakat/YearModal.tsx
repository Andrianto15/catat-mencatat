'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, RotateCcw } from 'lucide-react';
import { getHijriRamadhanDate } from '@/lib/zakat/hijri';
import { calculateZakat, getRoundingChips, formatZakatAccountMeta } from '@/lib/zakat/engine';
import { NumberInput } from '@/components/NumberInput';

export interface ZakatAccount {
  id: string;
  account_name: string;
  account_type?: string | null;
  institution?: string | null;
  account_number?: string | null;
}

export interface YearModalSaveData {
  hijri_year: number;
  masehi_year: number;
  reference_date: string;
  gold_price_per_gram: number;
  gold_value_snapshot: number;
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
  computeGoldHoldingValue?: (refDate: string, pricePerGram: number) => number;
  latestGoldPrice1g?: number;
  onSave: (data: YearModalSaveData) => Promise<void>;
}

function resolveInitialGoldValue(
  initialData: any | null | undefined,
  goldValueFromHoldings: number,
  computeGoldHoldingValue?: (refDate: string, pricePerGram: number) => number,
  defaultRefDate: string = '2026-02-18',
  defaultGoldPrice: number = 1450000
): number {
  if (initialData) {
    if (initialData.gold_value_snapshot !== undefined && initialData.gold_value_snapshot !== null) {
      return Number(initialData.gold_value_snapshot);
    }
    const cashSum = (initialData.balances || []).reduce((acc: number, b: any) => acc + Number(b.balance || 0), 0);
    const derived = Math.round((Number(initialData.total_assets || 0) - cashSum) * 100) / 100;
    return derived >= 0 ? derived : goldValueFromHoldings;
  }
  if (computeGoldHoldingValue) {
    return computeGoldHoldingValue(defaultRefDate, defaultGoldPrice);
  }
  return goldValueFromHoldings;
}

export function YearModal({
  isOpen,
  onClose,
  personId,
  personName,
  accounts,
  initialData,
  goldValueFromHoldings = 0,
  computeGoldHoldingValue,
  latestGoldPrice1g = 1450000,
  onSave,
}: YearModalProps) {
  const [hijriYear, setHijriYear] = useState<number>(() => initialData?.hijri_year ?? 1447);
  const [referenceDate, setReferenceDate] = useState<string>(() => initialData?.reference_date ?? '2026-02-18');
  const [goldPrice, setGoldPrice] = useState<number>(() => initialData?.gold_price_per_gram ?? latestGoldPrice1g);
  const [goldHoldingValue, setGoldHoldingValue] = useState<number>(() =>
    resolveInitialGoldValue(initialData, goldValueFromHoldings, computeGoldHoldingValue, '2026-02-18', latestGoldPrice1g)
  );
  const [isGoldHoldingManual, setIsGoldHoldingManual] = useState<boolean>(() => !!initialData);
  const [isLocked, setIsLocked] = useState<boolean>(() => !!initialData?.is_locked);
  const [balances, setBalances] = useState<Record<string, number>>(() => {
    if (!initialData) return {};
    const bMap: Record<string, number> = {};
    (initialData.balances || []).forEach((b: any) => {
      bMap[b.account_id] = Number(b.balance || 0);
    });
    return bMap;
  });
  const [intBalances, setIntBalances] = useState<Record<string, number | ''>>(() => {
    if (!initialData) return {};
    const intMap: Record<string, number | ''> = {};
    (initialData.balances || []).forEach((b: any) => {
      const total = Number(b.balance || 0);
      const intPart = Math.floor(total);
      intMap[b.account_id] = intPart > 0 ? intPart : (total === 0 ? '' : intPart);
    });
    return intMap;
  });
  const [decimalInputs, setDecimalInputs] = useState<Record<string, string>>(() => {
    if (!initialData) return {};
    const decMap: Record<string, string> = {};
    (initialData.balances || []).forEach((b: any) => {
      const total = Number(b.balance || 0);
      const intPart = Math.floor(total);
      const frac = Math.round((total - intPart) * 100);
      decMap[b.account_id] = frac === 0 ? '00' : String(frac).padStart(2, '0');
    });
    return decMap;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isBackdropClickRef = React.useRef(false);

  useEffect(() => {
    if (initialData) {
      setHijriYear(initialData.hijri_year);
      setReferenceDate(initialData.reference_date);
      setGoldPrice(initialData.gold_price_per_gram);
      setGoldHoldingValue(
        resolveInitialGoldValue(
          initialData,
          goldValueFromHoldings,
          computeGoldHoldingValue,
          initialData.reference_date,
          initialData.gold_price_per_gram
        )
      );
      setIsGoldHoldingManual(true);
      setIsLocked(initialData.is_locked);
      const bMap: Record<string, number> = {};
      const intMap: Record<string, number | ''> = {};
      const decMap: Record<string, string> = {};

      (initialData.balances || []).forEach((b: any) => {
        const total = Number(b.balance || 0);
        bMap[b.account_id] = total;

        const intPart = Math.floor(total);
        intMap[b.account_id] = intPart > 0 ? intPart : (total === 0 ? '' : intPart);

        const frac = Math.round((total - intPart) * 100);
        decMap[b.account_id] = frac === 0 ? '00' : String(frac).padStart(2, '0');
      });

      setBalances(bMap);
      setIntBalances(intMap);
      setDecimalInputs(decMap);
    } else {
      const defaultHijri = 1447;
      const defaultRefDate = getHijriRamadhanDate(defaultHijri);
      setHijriYear(defaultHijri);
      setReferenceDate(defaultRefDate);
      setGoldPrice(latestGoldPrice1g);
      setGoldHoldingValue(
        computeGoldHoldingValue
          ? computeGoldHoldingValue(defaultRefDate, latestGoldPrice1g)
          : goldValueFromHoldings
      );
      setIsGoldHoldingManual(false);
      setIsLocked(false);
      setBalances({});
      setIntBalances({});
      setDecimalInputs({});
    }
  }, [initialData, latestGoldPrice1g, goldValueFromHoldings]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const autoGoldValue = computeGoldHoldingValue
    ? computeGoldHoldingValue(referenceDate, goldPrice)
    : goldValueFromHoldings;

  const handleHijriChange = (year: number) => {
    const newRefDate = getHijriRamadhanDate(year);
    setHijriYear(year);
    setReferenceDate(newRefDate);
    if (!isGoldHoldingManual) {
      setGoldHoldingValue(
        computeGoldHoldingValue
          ? computeGoldHoldingValue(newRefDate, goldPrice)
          : goldValueFromHoldings
      );
    }
  };

  const handleReferenceDateChange = (newRefDate: string) => {
    setReferenceDate(newRefDate);
    if (!isGoldHoldingManual) {
      setGoldHoldingValue(
        computeGoldHoldingValue
          ? computeGoldHoldingValue(newRefDate, goldPrice)
          : goldValueFromHoldings
      );
    }
  };

  const handleGoldPriceChange = (val: number | '') => {
    const newPrice = val === '' ? 0 : val;
    setGoldPrice(newPrice);
    if (!isGoldHoldingManual) {
      setGoldHoldingValue(
        computeGoldHoldingValue
          ? computeGoldHoldingValue(referenceDate, newPrice)
          : goldValueFromHoldings
      );
    }
  };

  const handleGoldHoldingChange = (val: number | '') => {
    setIsGoldHoldingManual(true);
    setGoldHoldingValue(val === '' ? 0 : val);
  };

  const handleResetGoldHolding = () => {
    setIsGoldHoldingManual(false);
    setGoldHoldingValue(autoGoldValue);
  };

  const handleIntChange = (accountId: string, intVal: number | '') => {
    setIntBalances((prev) => ({ ...prev, [accountId]: intVal }));
    const intNum = intVal === '' ? 0 : Number(intVal);
    const decStr = decimalInputs[accountId] || '00';
    const decFrac = decStr ? Number(decStr) / Math.pow(10, decStr.length) : 0;
    const total = Math.round((intNum + decFrac) * 100) / 100;
    setBalances((prev) => ({ ...prev, [accountId]: total }));
  };

  const handleDecChange = (accountId: string, decVal: string) => {
    setDecimalInputs((prev) => ({ ...prev, [accountId]: decVal }));
    const currentInt = intBalances[accountId];
    const intNum = currentInt === '' || currentInt === undefined ? 0 : Number(currentInt);
    const decFrac = decVal ? Number(decVal) / Math.pow(10, decVal.length) : 0;
    const total = Math.round((intNum + decFrac) * 100) / 100;
    setBalances((prev) => ({ ...prev, [accountId]: total }));
  };

  const handleDecBlur = (accountId: string) => {
    const currentDec = decimalInputs[accountId];
    if (!currentDec || currentDec === '') {
      setDecimalInputs((prev) => ({ ...prev, [accountId]: '00' }));
    } else if (currentDec.length === 1) {
      setDecimalInputs((prev) => ({ ...prev, [accountId]: currentDec.padEnd(2, '0') }));
    }
  };

  const cashList = accounts.map((acc) => ({
    account_id: acc.id,
    balance: balances[acc.id] || 0,
  }));

  const calc = calculateZakat({
    goldPricePerGram: goldPrice,
    cashBalances: cashList,
    goldTotalValue: goldHoldingValue,
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
        gold_value_snapshot: goldHoldingValue,
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
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        isBackdropClickRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (isBackdropClickRef.current && e.target === e.currentTarget) {
          onClose();
        }
        isBackdropClickRef.current = false;
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="year-modal-title"
        className="modal-content"
        style={{ maxWidth: '560px', maxHeight: '92vh' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 id="year-modal-title" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {initialData ? `Edit Saldo Zakat ${hijriYear} H` : `Input Zakat Tahun ${hijriYear} H`}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Untuk: {personName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.5rem',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.625rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
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
              <label
                htmlFor="zakat-hijri-year"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Tahun Hijriah
              </label>
              <input
                id="zakat-hijri-year"
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
              <label
                htmlFor="zakat-ref-date"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Ref: 1 Ramadhan
              </label>
              <input
                id="zakat-ref-date"
                type="date"
                required
                value={referenceDate}
                onChange={(e) => handleReferenceDateChange(e.target.value)}
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
            <label
              htmlFor="zakat-gold-price"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Harga Emas Acuan (Rp / gram)
            </label>
            <NumberInput
              id="zakat-gold-price"
              required
              value={goldPrice}
              onChange={handleGoldPriceChange}
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
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-main)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, wordBreak: 'break-word' }}>{acc.account_name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {formatZakatAccountMeta(acc)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      <div style={{ width: '135px' }}>
                        <NumberInput
                          id={`zakat-acc-${acc.id}`}
                          aria-label={`Saldo ${acc.account_name}`}
                          placeholder="0"
                          value={intBalances[acc.id] ?? ''}
                          onChange={(val) => handleIntChange(acc.id, val)}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.5rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-card)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '0.8125rem',
                            textAlign: 'right',
                            minHeight: '44px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1 }}>,</span>
                      <input
                        id={`zakat-acc-dec-${acc.id}`}
                        aria-label={`Desimal sen ${acc.account_name}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        placeholder="00"
                        value={decimalInputs[acc.id] ?? '00'}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/\D/g, '').slice(0, 2);
                          handleDecChange(acc.id, sanitized);
                        }}
                        onBlur={() => handleDecBlur(acc.id)}
                        style={{
                          width: '44px',
                          minHeight: '44px',
                          padding: '0.4rem 0.25rem',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-card)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.8125rem',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editable Gold Holding Value from Modul Emas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label
                htmlFor="zakat-gold-holdings"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500 }}
              >
                Nilai Emas Fisik Tertahan (1 Ramadhan) (Rp)
              </label>
              {isGoldHoldingManual && (
                <button
                  type="button"
                  onClick={handleResetGoldHolding}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--radius-lg)',
                  }}
                  title="Kembalikan ke nilai otomatis dari modul Emas"
                >
                  <RotateCcw size={13} />
                  <span>Ambil dari Modul Emas</span>
                </button>
              )}
            </div>
            <NumberInput
              id="zakat-gold-holdings"
              placeholder="0"
              value={goldHoldingValue === 0 ? '' : goldHoldingValue}
              onChange={handleGoldHoldingChange}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                minHeight: '44px',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Otomatis dari modul Emas (Rp {autoGoldValue.toLocaleString('id-ID')}), bisa diedit untuk data tahun lalu.
            </span>
          </div>

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
