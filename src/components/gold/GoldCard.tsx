import React from 'react';
import { Calendar, Tag, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { GoldPurchase } from '@/lib/gold/actions';
import { calculateGoldProfit } from '@/lib/gold/profit';

interface GoldCardProps {
  purchase: GoldPurchase;
  currentBuyback: number | null;
  onEdit?: (purchase: GoldPurchase) => void;
  onDelete?: (id: string) => void;
  onSell?: (purchase: GoldPurchase) => void;
}

export function GoldCard({
  purchase,
  currentBuyback,
  onEdit,
  onDelete,
  onSell,
}: GoldCardProps) {
  const isSold = !!purchase.sold_at;
  const count = purchase.piece_count || 1;
  const totalCost = count * purchase.price_per_piece;

  const profit = !isSold
    ? calculateGoldProfit(
        {
          weight_gram: purchase.weight_gram,
          piece_count: count,
          price_per_piece: purchase.price_per_piece,
        },
        currentBuyback
      )
    : null;

  const formattedCost = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalCost);

  const formattedPerPiece = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(purchase.price_per_piece);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      opacity: isSold ? 0.75 : 1,
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#d97706',
              backgroundColor: '#fef3c7',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.375rem',
            }}>
              {purchase.brand} • {purchase.weight_gram} gr
            </span>
            {count > 1 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {count} keping
              </span>
            )}
            {isSold && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ef4444',
                backgroundColor: '#fee2e2',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.375rem',
              }}>
                Terjual
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {formattedCost}
            {count > 1 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>
                (@ {formattedPerPiece})
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {!isSold && onSell && (
            <button
              onClick={() => onSell(purchase)}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.25rem 0.625rem',
                cursor: 'pointer',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: 600,
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              aria-label="Jual"
            >
              <DollarSign size={14} />
              <span>Jual</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(purchase)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.375rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              aria-label="Edit"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(purchase.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.375rem',
                cursor: 'pointer',
                color: '#ef4444',
              }}
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Profit or Sold Info */}
      {!isSold && profit && profit.profit_rp !== null && profit.profit_pct !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: profit.profit_rp >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: profit.profit_rp >= 0 ? '#10b981' : '#ef4444',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {profit.profit_rp >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>
              Estimasi Kini: Rp {profit.current_value?.toLocaleString('id-ID')}
            </span>
          </div>
          <span>
            {profit.profit_rp >= 0 ? '+' : ''}
            Rp {profit.profit_rp.toLocaleString('id-ID')} ({profit.profit_pct}%)
          </span>
        </div>
      )}

      {isSold && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--bg-main)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Terjual: {purchase.sold_at}</span>
          <span>
            @ Rp {Number(purchase.sold_price_per_piece || 0).toLocaleString('id-ID')}
          </span>
        </div>
      )}

      {/* Details Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Calendar size={13} />
          <span>Beli: {purchase.purchase_date}</span>
        </div>
        {purchase.people?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Tag size={13} />
            <span>Milik: {purchase.people.name}</span>
          </div>
        )}
      </div>

      {purchase.notes && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-main)',
          padding: '0.375rem 0.5rem',
          borderRadius: '0.375rem',
        }}>
          {purchase.notes}
        </div>
      )}
    </div>
  );
}
