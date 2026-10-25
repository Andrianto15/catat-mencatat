'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, TrendingUp, TrendingDown, Coins, LineChart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person, GoldPurchase } from '@/lib/gold/actions';
import { calculateGoldAssetSummary } from '@/lib/gold/profit';
import { GoldCard } from '@/components/gold/GoldCard';
import { PurchaseModal } from '@/components/gold/PurchaseModal';
import { SellModal } from '@/components/gold/SellModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function GoldPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [purchases, setPurchases] = useState<GoldPurchase[]>([]);
  const [priceMap, setPriceMap] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [showSold, setShowSold] = useState(false);

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<GoldPurchase | null>(null);

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellingPurchase, setSellingPurchase] = useState<GoldPurchase | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .order('name');
      setPeople(peopleData || []);

      const { data: purchasesData } = await supabase
        .from('gold_purchases')
        .select('*, people(*)')
        .order('purchase_date', { ascending: false });
      setPurchases(purchasesData || []);

      // Fetch latest prices for buyback lookup
      const { data: pricesData } = await supabase
        .from('gold_prices')
        .select('*')
        .order('price_date', { ascending: false });

      const map: Record<string, number | null> = {};
      if (pricesData) {
        for (const p of pricesData) {
          const key = `${p.brand.toUpperCase()}-${p.weight_gram}`;
          if (map[key] === undefined) {
            map[key] = p.buyback_price;
          }
        }
      }
      setPriceMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    if (selectedPersonId && p.person_id !== selectedPersonId) return false;
    if (!showSold && p.sold_at) return false;
    return true;
  });

  const activePurchases = purchases.filter((p) => {
    if (selectedPersonId && p.person_id !== selectedPersonId) return false;
    return !p.sold_at;
  });

  const summary = calculateGoldAssetSummary(activePurchases, priceMap);

  const handleSavePurchase = async (
    data: Omit<GoldPurchase, 'id'>,
    keepOpen?: boolean
  ) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingPurchase) {
      const { error } = await supabase
        .from('gold_purchases')
        .update({
          ...data,
        })
        .eq('id', editingPurchase.id);

      if (error) throw error;
      setEditingPurchase(null);
    } else {
      const { error } = await supabase.from('gold_purchases').insert([
        {
          ...data,
          user_id: userData.user.id,
        },
      ]);
      if (error) throw error;
    }

    await fetchData();
  };

  const handleConfirmSell = async (id: string, soldAt: string, soldPricePerPiece: number) => {
    const { error } = await supabase
      .from('gold_purchases')
      .update({
        sold_at: soldAt,
        sold_price_per_piece: soldPricePerPiece,
      })
      .eq('id', id);

    if (error) throw error;
    await fetchData();
  };

  const handleDeletePurchase = async (id: string) => {
    if (!confirm('Hapus catatan keping emas ini?')) return;
    const { error } = await supabase.from('gold_purchases').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      await fetchData();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', paddingBottom: '5rem' }}>
      {/* Header */}
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
            href="/"
            style={{
              padding: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Emas Fisik</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activePurchases.length} keping aktif
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThemeToggle />
          <Link
            href="/emas/prices"
            style={{
              padding: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              color: '#d97706',
              borderRadius: 'var(--radius-lg)',
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
            }}
            title="Harga Emas Harian"
          >
            <LineChart size={20} />
          </Link>
          <Link
            href="/emas/settings"
            style={{
              padding: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
            }}
            title="Pengaturan Pemilik Emas"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Asset Portfolio Summary Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          border: '1px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Total Nilai Portofolio (Estimasi Buyback)
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                Rp {summary.currentValue.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: summary.totalProfitRp >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: summary.totalProfitRp >= 0 ? '#10b981' : '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}>
              {summary.totalProfitRp >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>
                {summary.totalProfitRp >= 0 ? '+' : ''}
                Rp {summary.totalProfitRp.toLocaleString('id-ID')} ({summary.totalProfitPct}%)
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Berat</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{summary.totalGrams} gr</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Jumlah Keping</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{summary.totalPieces} pcs</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Modal Beli</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                Rp {summary.totalCost.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setSelectedPersonId('')}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: selectedPersonId === '' ? 'var(--color-primary)' : 'var(--border-card)',
                backgroundColor: selectedPersonId === '' ? 'var(--color-primary)' : 'transparent',
                color: selectedPersonId === '' ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              Semua Orang
            </button>
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'var(--border-card)',
                  backgroundColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'transparent',
                  color: selectedPersonId === p.id ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showSold}
              onChange={(e) => setShowSold(e.target.checked)}
            />
            <span>Tampilkan emas yang sudah terjual</span>
          </label>
        </div>

        {/* List of Gold Purchases */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Memuat data keping emas...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
          }}>
            <Coins size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Belum ada keping emas</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Klik tombol (+) di bawah untuk mencatat keping emas pertama Anda.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredPurchases.map((purchase) => {
              const key = `${purchase.brand.toUpperCase()}-${purchase.weight_gram}`;
              const currentBuyback = priceMap[key] ?? null;

              return (
                <GoldCard
                  key={purchase.id}
                  purchase={purchase}
                  currentBuyback={currentBuyback}
                  onEdit={(p) => {
                    setEditingPurchase(p);
                    setIsPurchaseModalOpen(true);
                  }}
                  onDelete={handleDeletePurchase}
                  onSell={(p) => {
                    setSellingPurchase(p);
                    setIsSellModalOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingPurchase(null);
          setIsPurchaseModalOpen(true);
        }}
        style={{
          position: 'fixed',
          right: '1.25rem',
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#d97706',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Tambah Pembelian Emas"
      >
        <Plus size={28} />
      </button>

      {/* Modals */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setEditingPurchase(null);
        }}
        people={people}
        initialData={editingPurchase}
        onSave={handleSavePurchase}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSellingPurchase(null);
        }}
        purchase={sellingPurchase}
        onConfirmSell={handleConfirmSell}
      />
    </div>
  );
}
