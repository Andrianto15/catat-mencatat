'use client';

import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { GoldPurchase, validateSellInput, calculateRealizedProfit } from '@/lib/gold/actions';

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

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sell-modal-title"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
          border: '1px solid var(--border-card)',
        }}
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
            <input
              id="sell-price"
              type="number"
              required
              placeholder="1500000"
              value={soldPricePerPiece}
              onChange={(e) => setSoldPricePerPiece(e.target.value === '' ? '' : Number(e.target.value))}
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
              backgroundColor: realized.realizedProfitRp >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: realized.realizedProfitRp >= 0 ? '#10b981' : '#ef4444',
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
              backgroundColor: '#10b981',
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
