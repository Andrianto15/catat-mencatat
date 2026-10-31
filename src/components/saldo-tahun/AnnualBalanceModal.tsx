'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { NumberInput } from '@/components/NumberInput';
import { calculateAnnualBalance, AnnualAccountBalanceItem } from '@/lib/saldo-tahun/engine';
import { ZakatAccount, formatZakatAccountMeta } from '@/lib/zakat/engine';

export interface AnnualBalanceModalSaveData {
  masehi_year: number;
  total_accounts: number;
  expense_amount: number;
  net_balance: number;
  notes?: string | null;
  balances: AnnualAccountBalanceItem[];
}

interface AnnualBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  accounts: ZakatAccount[];
  suggestedYear?: number;
  initialData?: any | null;
  onSave: (data: AnnualBalanceModalSaveData) => Promise<void>;
}

export function AnnualBalanceModal({
  isOpen,
  onClose,
  personId,
  personName,
  accounts,
  suggestedYear = new Date().getFullYear(),
  initialData,
  onSave,
}: AnnualBalanceModalProps) {
  const [masehiYear, setMasehiYear] = useState<number>(() => initialData?.masehi_year ?? suggestedYear);
  const [expenseAmount, setExpenseAmount] = useState<number | ''>(() => {
    if (initialData?.expense_amount !== undefined && initialData?.expense_amount !== null) {
      return Number(initialData.expense_amount);
    }
    return '';
  });
  const [notes, setNotes] = useState<string>(() => initialData?.notes ?? '');

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
  const isBackdropClickRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setMasehiYear(initialData.masehi_year);
      setExpenseAmount(
        initialData.expense_amount !== undefined && initialData.expense_amount !== null
          ? Number(initialData.expense_amount)
          : ''
      );
      setNotes(initialData.notes || '');

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
      setMasehiYear(suggestedYear);
      setExpenseAmount('');
      setNotes('');
      setBalances({});
      setIntBalances({});
      setDecimalInputs({});
    }
  }, [initialData, suggestedYear]);

  // Focus trap and Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  const balanceList: AnnualAccountBalanceItem[] = accounts.map((acc) => ({
    account_id: acc.id,
    account_name: acc.account_name,
    balance: balances[acc.id] || 0,
  }));

  const calc = calculateAnnualBalance({
    balances: balanceList,
    expenseAmount: expenseAmount === '' ? 0 : Number(expenseAmount),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masehiYear || masehiYear < 1900 || masehiYear > 2100) {
      setError('Tahun Masehi harus valid.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        masehi_year: Number(masehiYear),
        total_accounts: calc.totalAccounts,
        expense_amount: calc.expenseAmount,
        net_balance: calc.netBalance,
        notes: notes.trim() || null,
        balances: balanceList,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan saldo akhir tahun.');
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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="annual-modal-title"
        className="modal-content"
        style={{ maxWidth: '560px', maxHeight: '92vh' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3 id="annual-modal-title" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {initialData ? `Edit Saldo Akhir Tahun ${masehiYear}` : `Input Saldo Akhir Tahun ${masehiYear}`}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pemilik: {personName}
            </p>
          </div>
          <button
            type="button"
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
          <div
            style={{
              padding: '0.625rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="annual-balance-year"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Tahun Masehi
            </label>
            <input
              id="annual-balance-year"
              type="number"
              required
              min={1900}
              max={2100}
              value={masehiYear}
              onChange={(e) => setMasehiYear(Number(e.target.value))}
              className="form-input"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Account Balances List */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
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
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, wordBreak: 'break-word' }}>
                        {acc.account_name}{' '}
                        {!acc.is_active && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                            (Nonaktif)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {formatZakatAccountMeta(acc)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      <div style={{ width: '135px' }}>
                        <NumberInput
                          id={`annual-acc-${acc.id}`}
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
                      <span
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          lineHeight: 1,
                        }}
                      >
                        ,
                      </span>
                      <input
                        id={`annual-acc-dec-${acc.id}`}
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

          {/* Pengeluaran Input */}
          <div>
            <label
              htmlFor="annual-balance-expense"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Pengeluaran Akhir Tahun (Rp)
            </label>
            <NumberInput
              id="annual-balance-expense"
              placeholder="0"
              value={expenseAmount}
              onChange={(val) => setExpenseAmount(val === '' ? '' : Number(val))}
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
          </div>

          {/* Notes Input */}
          <div>
            <label
              htmlFor="annual-balance-notes"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Catatan (Opsional)
            </label>
            <textarea
              id="annual-balance-notes"
              className="form-textarea"
              maxLength={500}
              placeholder="Catatan tambahan mengenai saldo atau pengeluaran..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: '60px' }}
            />
          </div>

          {/* Real-time Summary Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Saldo Rekening:</span>
              <span style={{ fontWeight: 600 }}>Rp {calc.totalAccounts.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pengeluaran:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-danger-text)' }}>
                -Rp {calc.expenseAmount.toLocaleString('id-ID')}
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
                Rp {calc.netBalance.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
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
              {submitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Simpan Tahun Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

