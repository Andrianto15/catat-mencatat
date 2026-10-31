'use client';

import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { GoldPurchase, validateSellInput, calculateRealizedProfit } from '@/lib/gold/actions';
import { NumberInput } from '@/components/NumberInput';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: GoldPurchase | null;
  onConfirmSell: (id: string, soldAt: string, soldPricePerPiece: number) => Promise<void>;
}

export function SellModal({
  isOpen,
  onClose,
  purchase,
  onConfirmSell,
}: SellModalProps) {
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split('T')[0]);
  const [soldPricePerPiece, setSoldPricePerPiece] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isBackdropClickRef = React.useRef(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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

  if (!isOpen || !purchase) return null;

  const count = purchase.piece_count || 1;
  const numPrice = Number(soldPricePerPiece) || 0;
  const realized =
    numPrice > 0
      ? calculateRealizedProfit({
          piece_count: count,
          price_per_piece: purchase.price_per_piece,
          sold_price_per_piece: numPrice,
        })
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSellInput({
      purchase_date: purchase.purchase_date,
      sold_at: soldAt,
      sold_price_per_piece: Number(soldPricePerPiece),
    });

    if (!validation.isValid) {
      setError(validation.error || 'Data penjualan tidak valid.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirmSell(purchase.id, soldAt, Number(soldPricePerPiece));
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan penjualan.');
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
        aria-labelledby="sell-modal-title"
        className="modal-content"
        style={{ maxWidth: '480px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 id="sell-modal-title" style={{ fontSize: '1.125rem', fontWeight: 600 }}>Catat Penjualan Emas</h3>
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

        {/* Piece info card */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          fontSize: '0.8125rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {purchase.brand} • {purchase.weight_gram} gr ({count} pcs)
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Beli: {purchase.purchase_date} @ Rp {purchase.price_per_piece.toLocaleString('id-ID')}
          </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label
              htmlFor="sell-date"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Tanggal Penjualan
            </label>
            <input
              id="sell-date"
              type="date"
              required
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
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
              htmlFor="sell-price"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Harga Jual per Keping (Rp)
            </label>
            <NumberInput
              id="sell-price"
              required
              placeholder="1500000"
              value={soldPricePerPiece}
              onChange={setSoldPricePerPiece}
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



          {realized && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: realized.realizedProfitRp >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              color: realized.realizedProfitRp >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {realized.realizedProfitRp >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>Profit Terealisasi:</span>
              </div>
              <span>
                {realized.realizedProfitRp >= 0 ? '+' : ''}
                Rp {realized.realizedProfitRp.toLocaleString('id-ID')} ({realized.realizedProfitPct}%)
              </span>
            </div>
          )}

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
            {submitting ? 'Menyimpan...' : 'Konfirmasi Penjualan'}
          </button>
        </form>
      </div>
    </div>
  );
}
