'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, TrendingUp, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person } from '@/lib/gold/actions';
import { ZakatAccount } from '@/lib/zakat/engine';
import {
  computeAnnualBalanceDeltas,
  paginateAnnualBalances,
  suggestNextMasehiYear,
  DEFAULT_ANNUAL_BALANCE_PAGE_SIZE,
  AnnualBalanceWithDelta,
} from '@/lib/saldo-tahun/engine';
import { AnnualBalanceTrendChart } from '@/components/saldo-tahun/AnnualBalanceTrendChart';
import { AnnualBalanceAccordionList } from '@/components/saldo-tahun/AnnualBalanceAccordionList';
import { AnnualBalanceModal, AnnualBalanceModalSaveData } from '@/components/saldo-tahun/AnnualBalanceModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function SaldoTahunPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [accounts, setAccounts] = useState<ZakatAccount[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(DEFAULT_ANNUAL_BALANCE_PAGE_SIZE);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any | null>(null);

  const supabase = createClient();

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('people').select('*').order('name');
      setPeople(data || []);
      if (data && data.length > 0 && !selectedPersonId) {
        setSelectedPersonId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPersonData = async (personId: string) => {
    if (!personId) return;
    try {
      setLoading(true);

      // Fetch accounts (shared with zakat module, including inactive for history preservation)
      const { data: accData } = await supabase
        .from('zakat_accounts')
        .select('*')
        .eq('person_id', personId)
        .order('display_order');
      setAccounts(accData || []);

      // Fetch annual balances
      const { data: yearsData } = await supabase
        .from('annual_balances')
        .select('*, annual_balance_items(*, zakat_accounts(*))')
        .eq('person_id', personId)
        .order('masehi_year', { ascending: false });

      const mappedYears = (yearsData || []).map((y) => ({
        ...y,
        total_accounts: Number(y.total_accounts || 0),
        expense_amount: Number(y.expense_amount || 0),
        net_balance: Number(y.net_balance || 0),
        balances: (y.annual_balance_items || []).map((bi: any) => ({
          account_id: bi.account_id,
          account_name: bi.zakat_accounts?.account_name || 'Rekening',
          balance: Number(bi.balance || 0),
        })),
      }));

      setYears(mappedYears);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleCount(DEFAULT_ANNUAL_BALANCE_PAGE_SIZE);
    if (selectedPersonId) {
      fetchPersonData(selectedPersonId);
    }
  }, [selectedPersonId]);

  const yearsWithDeltas = computeAnnualBalanceDeltas(years);
  const paginatedYears = paginateAnnualBalances(yearsWithDeltas, visibleCount);
  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  const handleSaveYear = async (data: AnnualBalanceModalSaveData) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingYear) {
      // Update annual_balances
      const { error: yErr } = await supabase
        .from('annual_balances')
        .update({
          masehi_year: data.masehi_year,
          total_accounts: data.total_accounts,
          expense_amount: data.expense_amount,
          net_balance: data.net_balance,
          notes: data.notes,
        })
        .eq('id', editingYear.id);

      if (yErr) throw yErr;

      // Re-insert annual_balance_items
      await supabase.from('annual_balance_items').delete().eq('annual_balance_id', editingYear.id);

      const itemRows = data.balances.map((b) => ({
        annual_balance_id: editingYear.id,
        account_id: b.account_id,
        balance: b.balance,
      }));

      if (itemRows.length > 0) {
        const { error: bErr } = await supabase.from('annual_balance_items').insert(itemRows);
        if (bErr) throw bErr;
      }
      setEditingYear(null);
    } else {
      // Insert new annual_balance
      const { data: newYear, error: yErr } = await supabase
        .from('annual_balances')
        .insert([
          {
            user_id: userData.user.id,
            person_id: selectedPersonId,
            masehi_year: data.masehi_year,
            total_accounts: data.total_accounts,
            expense_amount: data.expense_amount,
            net_balance: data.net_balance,
            notes: data.notes,
          },
        ])
        .select()
        .single();

      if (yErr) throw yErr;

      const itemRows = data.balances.map((b) => ({
        annual_balance_id: newYear.id,
        account_id: b.account_id,
        balance: b.balance,
      }));

      if (itemRows.length > 0) {
        const { error: bErr } = await supabase.from('annual_balance_items').insert(itemRows);
        if (bErr) throw bErr;
      }
    }

    if (selectedPersonId) {
      await fetchPersonData(selectedPersonId);
    }
  };

  const handleDeleteYear = async (item: AnnualBalanceWithDelta) => {
    if (!item.id) return;
    if (!confirm(`Hapus catatan Saldo Akhir Tahun ${item.masehi_year}?`)) {
      return;
    }

    const { error } = await supabase.from('annual_balances').delete().eq('id', item.id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }

    if (selectedPersonId) {
      await fetchPersonData(selectedPersonId);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', paddingBottom: '5rem' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/"
            aria-label="Kembali ke Beranda"
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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Saldo Akhir Tahun</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Rekap Tahunan &amp; Pengeluaran
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThemeToggle />
          <Link
            href="/saldo-tahun/settings"
            aria-label="Pengaturan Modul &amp; Reminder Telegram"
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
            title="Pengaturan Modul & Telegram"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Person Selector Tabs */}
        {people.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)',
            }}
          >
            {people.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPersonId(p.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'var(--border-card)',
                  backgroundColor: selectedPersonId === p.id ? 'var(--color-primary)' : 'transparent',
                  color: selectedPersonId === p.id ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Memuat data saldo akhir tahun...
          </div>
        ) : years.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-card)',
            }}
          >
            <TrendingUp size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Belum ada data Saldo Akhir Tahun</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Mulai input saldo rekening per tahun untuk {selectedPerson?.name || 'pemilik'}.
            </p>
          </div>
        ) : (
          <>
            {/* SVG Trend Line Chart */}
            <AnnualBalanceTrendChart years={years} />

            {/* Accordion List (Opsi A) */}
            <div>
              <h4
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Riwayat Rekap Tahunan
              </h4>

              <AnnualBalanceAccordionList
                items={paginatedYears.items}
                onEdit={(item) => {
                  setEditingYear(item);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteYear}
              />

              {/* Pagination Controls */}
              {paginatedYears.hasMore && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + DEFAULT_ANNUAL_BALANCE_PAGE_SIZE)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      minHeight: '44px',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    }}
                    aria-label="Tampilkan 5 riwayat saldo akhir tahun lainnya"
                  >
                    <span>Tampilkan 5 Lainnya</span>
                    <ChevronDown size={18} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Menampilkan {paginatedYears.displayedCount} dari {paginatedYears.total} riwayat tahun
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        type="button"
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
          borderRadius: '9999px',
          backgroundColor: '#0ea5e9',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Tambah Saldo Akhir Tahun"
      >
        <Plus size={28} />
      </button>

      {/* Modal Input */}
      <AnnualBalanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingYear(null);
        }}
        personId={selectedPersonId}
        personName={selectedPerson?.name || 'Pemilik'}
        accounts={
          editingYear
            ? accounts.filter(
                (a) => a.is_active || editingYear.balances.some((b: any) => b.account_id === a.id)
              )
            : accounts.filter((a) => a.is_active)
        }
        suggestedYear={suggestNextMasehiYear(years)}
        initialData={editingYear}
        onSave={handleSaveYear}
      />
    </div>
  );
}

