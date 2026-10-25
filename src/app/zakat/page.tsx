'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Scale, Lock, Edit2, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person, GoldPurchase } from '@/lib/gold/actions';
import { ZakatAccount, YearModal, YearModalSaveData } from '@/components/zakat/YearModal';
import { CompareTwoYears } from '@/components/zakat/CompareTwoYears';
import { ZakatSpreadsheetTable } from '@/components/zakat/ZakatSpreadsheetTable';
import { ZakatTrendChart } from '@/components/zakat/ZakatTrendChart';
import { resolveZakatGoldHoldings } from '@/lib/zakat/engine';
import ThemeToggle from '@/components/ThemeToggle';

export default function ZakatPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [accounts, setAccounts] = useState<ZakatAccount[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [goldPurchases, setGoldPurchases] = useState<GoldPurchase[]>([]);
  const [latestGoldPrice, setLatestGoldPrice] = useState<number>(1450000);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any | null>(null);

  const supabase = createClient();

  const fetchBase = async () => {
    try {
      setLoading(true);
      const { data: peopleData } = await supabase.from('people').select('*').order('name');
      setPeople(peopleData || []);
      if (peopleData && peopleData.length > 0 && !selectedPersonId) {
        setSelectedPersonId(peopleData[0].id);
      }

      // Latest gold price
      const { data: priceData } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('brand', 'ANTAM')
        .eq('weight_gram', 1)
        .order('price_date', { ascending: false })
        .limit(1);

      if (priceData && priceData.length > 0 && priceData[0].sell_price) {
        setLatestGoldPrice(priceData[0].sell_price);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBase();
  }, []);

  const fetchPersonData = async (personId: string) => {
    if (!personId) return;
    try {
      setLoading(true);
      // Accounts for person
      const { data: accData } = await supabase
        .from('zakat_accounts')
        .select('*')
        .eq('person_id', personId)
        .eq('is_active', true)
        .order('display_order');
      setAccounts(accData || []);

      // Years for person
      const { data: yearsData } = await supabase
        .from('zakat_years')
        .select('*, zakat_balances(*, zakat_accounts(*))')
        .eq('person_id', personId)
        .order('hijri_year', { ascending: false });

      const mappedYears = (yearsData || []).map((y) => ({
        ...y,
        balances: (y.zakat_balances || []).map((zb: any) => ({
          account_id: zb.account_id,
          account_name: zb.zakat_accounts?.account_name || 'Rekening',
          balance: Number(zb.balance || 0),
        })),
      }));
      setYears(mappedYears);

      // Gold purchases for person
      const { data: goldData } = await supabase
        .from('gold_purchases')
        .select('*')
        .eq('person_id', personId);
      setGoldPurchases(goldData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPersonId) {
      fetchPersonData(selectedPersonId);
    }
  }, [selectedPersonId]);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  // Compute gold holdings for the modal reference date
  const computeGoldHoldingValue = (refDate: string, pricePerGram: number) => {
    const holdings = resolveZakatGoldHoldings(
      goldPurchases.map((g) => ({
        id: g.id,
        purchase_date: g.purchase_date,
        brand: g.brand,
        weight_gram: g.weight_gram,
        piece_count: g.piece_count,
        sold_at: g.sold_at,
      })),
      refDate
    );
    const totalGrams = holdings.reduce((sum, h) => sum + h.weight_gram * h.piece_count, 0);
    return totalGrams * pricePerGram;
  };

  const handleSaveYear = async (data: YearModalSaveData) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingYear) {
      // Update zakat_years
      const { error: yErr } = await supabase
        .from('zakat_years')
        .update({
          hijri_year: data.hijri_year,
          masehi_year: data.masehi_year,
          reference_date: data.reference_date,
          gold_price_per_gram: data.gold_price_per_gram,
          nisab_nominal: data.nisab_nominal,
          total_assets: data.total_assets,
          zakat_due: data.zakat_due,
          is_locked: data.is_locked,
        })
        .eq('id', editingYear.id);

      if (yErr) throw yErr;

      // Delete and re-insert balances
      await supabase.from('zakat_balances').delete().eq('zakat_year_id', editingYear.id);

      const balRows = data.balances.map((b) => ({
        zakat_year_id: editingYear.id,
        account_id: b.account_id,
        balance: b.balance,
      }));

      const { error: bErr } = await supabase.from('zakat_balances').insert(balRows);
      if (bErr) throw bErr;
      setEditingYear(null);
    } else {
      // Insert new year
      const { data: newYear, error: yErr } = await supabase
        .from('zakat_years')
        .insert([
          {
            user_id: userData.user.id,
            person_id: selectedPersonId,
            hijri_year: data.hijri_year,
            masehi_year: data.masehi_year,
            reference_date: data.reference_date,
            gold_price_per_gram: data.gold_price_per_gram,
            nisab_nominal: data.nisab_nominal,
            total_assets: data.total_assets,
            zakat_due: data.zakat_due,
            is_locked: data.is_locked,
          },
        ])
        .select()
        .single();

      if (yErr) throw yErr;

      const balRows = data.balances.map((b) => ({
        zakat_year_id: newYear.id,
        account_id: b.account_id,
        balance: b.balance,
      }));

      const { error: bErr } = await supabase.from('zakat_balances').insert(balRows);
      if (bErr) throw bErr;
    }

    if (selectedPersonId) {
      await fetchPersonData(selectedPersonId);
    }
  };

  const currYear = years.length > 0 ? years[0] : null;
  const prevYear = years.length > 1 ? years[1] : null;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', paddingBottom: '5rem' }}>
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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Zakat Mal</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Perhitungan Haul 1 Ramadhan
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThemeToggle />
          <Link
            href="/zakat/settings"
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
            title="Pengaturan Rekening"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Person Selector Tabs */}
        {people.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
          }}>
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'var(--border-card)',
                  backgroundColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'transparent',
                  color: selectedPersonId === p.id ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  minHeight: '38px',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Memuat data zakat...
          </div>
        ) : years.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
          }}>
            <Scale size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Belum ada data zakat</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Mulai input data saldo rekening dan hitung zakat untuk {selectedPerson?.name || 'pemilik'}.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile-first Option B comparison view */}
            {currYear && prevYear && (
              <CompareTwoYears prevYear={prevYear} currYear={currYear} />
            )}

            {/* Current Active Year Card if only 1 year exists */}
            {currYear && !prevYear && (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    Tahun {currYear.hijri_year} H ({currYear.masehi_year} M)
                  </h3>
                  {currYear.is_locked && (
                    <span style={{
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: 'var(--text-muted)',
                    }}>
                      <Lock size={14} /> Terkunci
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Total Harta: Rp {currYear.total_assets.toLocaleString('id-ID')} | Nisab: Rp {currYear.nisab_nominal.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Zakat Wajib: Rp {currYear.zakat_due.toLocaleString('id-ID')}
                </div>
              </div>
            )}

            {/* Desktop Spreadsheet & Trend Chart */}
            <ZakatSpreadsheetTable years={years} />
            <ZakatTrendChart years={years} />

            {/* Year History Cards with Edit Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Riwayat Rekap Tahunan
              </h4>
              {years.map((y) => (
                <div
                  key={y.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      {y.hijri_year} H ({y.masehi_year} M)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total: Rp {y.total_assets.toLocaleString('id-ID')} • Zakat: Rp {y.zakat_due.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingYear(y);
                      setIsModalOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.375rem',
                      minHeight: '44px',
                      minWidth: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Edit Tahun Zakat"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingYear(null);
          setIsModalOpen(true);
        }}
        style={{
          position: 'fixed',
          right: '1.25rem',
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Input Zakat Tahun Baru"
      >
        <Plus size={28} />
      </button>

      {/* Year Modal */}
      <YearModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingYear(null);
        }}
        personId={selectedPersonId}
        personName={selectedPerson?.name || 'Pemilik'}
        accounts={accounts}
        initialData={editingYear}
        latestGoldPrice1g={latestGoldPrice}
        goldValueFromHoldings={computeGoldHoldingValue('2026-02-18', latestGoldPrice)}
        onSave={handleSaveYear}
      />
    </div>
  );
}
