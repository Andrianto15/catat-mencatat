'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person } from '@/lib/gold/actions';
import { ZAKAT_ACCOUNT_TYPES, formatZakatAccountMeta } from '@/lib/zakat/engine';

interface AccountItem {
  id: string;
  person_id: string;
  account_name: string;
  account_type?: string | null;
  institution?: string | null;
  account_number?: string | null;
  is_active: boolean;
  display_order: number;
}

export default function ZakatSettingsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<string>('Bank');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const fetchAccounts = async (personId: string) => {
    if (!personId) return;
    try {
      setLoading(true);
      const { data } = await supabase
        .from('zakat_accounts')
        .select('*')
        .eq('person_id', personId)
        .order('display_order');
      setAccounts(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    if (selectedPersonId) {
      fetchAccounts(selectedPersonId);
    }
  }, [selectedPersonId]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !selectedPersonId) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingId) {
      await supabase
        .from('zakat_accounts')
        .update({
          account_name: accountName.trim(),
          account_type: accountType,
          institution: institution.trim() || null,
          account_number: accountNumber.trim() || null,
        })
        .eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('zakat_accounts').insert([
        {
          user_id: userData.user.id,
          person_id: selectedPersonId,
          account_name: accountName.trim(),
          account_type: accountType,
          institution: institution.trim() || null,
          account_number: accountNumber.trim() || null,
          is_active: true,
          display_order: accounts.length + 1,
        },
      ]);
    }

    setAccountName('');
    setAccountType('Bank');
    setInstitution('');
    setAccountNumber('');
    await fetchAccounts(selectedPersonId);
  };

  const handleEdit = (acc: AccountItem) => {
    setEditingId(acc.id);
    setAccountName(acc.account_name);
    setAccountType(acc.account_type || 'Bank');
    setInstitution(acc.institution || '');
    setAccountNumber(acc.account_number || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus rekening ini? Saldo terkait di tahun lampau mungkin terpengaruh.')) return;
    await supabase.from('zakat_accounts').delete().eq('id', id);
    await fetchAccounts(selectedPersonId);
  };

  const handleToggleActive = async (acc: AccountItem) => {
    await supabase
      .from('zakat_accounts')
      .update({ is_active: !acc.is_active })
      .eq('id', acc.id);
    await fetchAccounts(selectedPersonId);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-card)',
        gap: '0.75rem',
      }}>
        <Link
          href="/zakat"
          aria-label="Kembali"
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
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Kelola Rekening & Tabungan</h1>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Person Selector */}
        {people.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Pilih Pemilik Rekening:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
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
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Add / Edit */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          border: '1px solid var(--border-card)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.875rem' }}>
            {editingId ? 'Edit Rekening' : 'Tambah Rekening Baru'}
          </h2>
          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="zakat-account-name"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Nama Rekening / Akun
                </label>
                <input
                  id="zakat-account-name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: BCA Utama, Tabungan Haji, Bibit Reksadana"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label
                  htmlFor="zakat-account-type"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Jenis Rekening / Tabungan
                </label>
                <select
                  id="zakat-account-type"
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  style={{ minHeight: '44px' }}
                >
                  {ZAKAT_ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="zakat-account-institution"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Institusi / Penyedia (Opsional)
                </label>
                <input
                  id="zakat-account-institution"
                  type="text"
                  className="form-input"
                  placeholder="BCA / Mandiri / GoPay / Bibit"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label
                  htmlFor="zakat-account-number"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  No. Rekening (Opsional)
                </label>
                <input
                  id="zakat-account-number"
                  type="text"
                  className="form-input"
                  placeholder="123-456-789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setAccountName('');
                    setAccountType('Bank');
                    setInstitution('');
                    setAccountNumber('');
                  }}
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
              )}
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Rekening'}
              </button>
            </div>
          </form>
        </div>

        {/* List of Accounts */}
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Daftar Rekening
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat rekening...</p>
          ) : accounts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada rekening untuk orang ini.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
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
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: acc.is_active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {acc.account_name} {!acc.is_active && '(Nonaktif)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatZakatAccountMeta(acc)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleToggleActive(acc)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: acc.is_active ? 'var(--color-success-text)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      aria-label={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(acc)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: 'var(--color-danger-text)',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Hapus"
                      aria-label="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
