'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { NumberInput } from '@/components/NumberInput';

interface GoldPriceRow {
  id: string;
  price_date: string;
  brand: string;
  weight_gram: number;
  sell_price: number | null;
  buyback_price: number | null;
  status: 'auto' | 'manual' | 'gagal';
}

export default function GoldPricesPage() {
  const [prices, setPrices] = useState<GoldPriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncing, setSyncing] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSellPrice, setEditSellPrice] = useState<number | ''>('');
  const [editBuybackPrice, setEditBuybackPrice] = useState<number | ''>('');

  const supabase = createClient();

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('price_date', selectedDate)
        .order('brand')
        .order('weight_gram');

      setPrices(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedDate]);

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/cron/sync-gold');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal sinkronisasi');
      alert(`Sinkronisasi selesai: ${data.syncedCount || 0} harga diperbarui.`);
      await fetchPrices();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const startEdit = (row: GoldPriceRow) => {
    setEditingId(row.id);
    setEditSellPrice(row.sell_price ?? '');
    setEditBuybackPrice(row.buyback_price ?? '');
  };

  const saveEdit = async (row: GoldPriceRow) => {
    const { error } = await supabase
      .from('gold_prices')
      .update({
        sell_price: editSellPrice === '' ? null : Number(editSellPrice),
        buyback_price: editBuybackPrice === '' ? null : Number(editBuybackPrice),
        status: 'manual',
      })
      .eq('id', row.id);

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      setEditingId(null);
      await fetchPrices();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/emas"
            style={{
              padding: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-main)',
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Harga Emas Galeri24</h1>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={syncing}
          style={{
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: syncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            minHeight: '44px',
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Sinkron...' : 'Tarik Live'}</span>
        </button>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Date Selector */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tanggal Harga:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.4rem 0.625rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)',
              backgroundColor: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Price Table / Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Memuat harga emas...
          </div>
        ) : prices.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
          }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Belum ada data harga tanggal ini</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Klik tombol &quot;Tarik Live&quot; untuk mengunduh harga terbaru Galeri24.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prices.map((p) => {
              const isEditing = editingId === p.id;
              const isFailed = p.status === 'gagal';

              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{p.brand}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-main)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontWeight: 600,
                      }}>
                        {p.weight_gram} gr
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        backgroundColor: isFailed ? '#fee2e2' : p.status === 'manual' ? '#fef3c7' : '#dcfce7',
                        color: isFailed ? '#b91c1c' : p.status === 'manual' ? '#b45309' : '#15803d',
                      }}>
                        {p.status}
                      </span>

                      {!isEditing && (
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '0.375rem',
                            minHeight: '44px',
                            minWidth: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Edit Harga"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                            Harga Jual (Rp)
                          </label>
                          <NumberInput
                            value={editSellPrice}
                            onChange={setEditSellPrice}
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              borderRadius: 'var(--radius-lg)',
                              border: '1px solid var(--border-card)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-main)',
                              fontSize: '0.8125rem',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                            Harga Buyback (Rp)
                          </label>
                          <NumberInput
                            value={editBuybackPrice}
                            onChange={setEditBuybackPrice}
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              borderRadius: 'var(--radius-lg)',
                              border: '1px solid var(--border-card)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-main)',
                              fontSize: '0.8125rem',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-card)',
                            background: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => saveEdit(p)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Simpan Manual
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Harga Jual
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {p.sell_price ? `Rp ${p.sell_price.toLocaleString('id-ID')}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                          Harga Buyback
                        </span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>
                          {p.buyback_price ? `Rp ${p.buyback_price.toLocaleString('id-ID')}` : '-'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
