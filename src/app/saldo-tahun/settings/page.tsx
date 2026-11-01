'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit2, Check, Bell, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person } from '@/lib/gold/actions';
import { ZAKAT_ACCOUNT_TYPES, formatZakatAccountMeta } from '@/lib/zakat/engine';
import { DEFAULT_TELEGRAM_REMINDER_MESSAGE } from '@/lib/telegram/sender';

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

export default function SaldoTahunSettingsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Telegram Settings State
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [reminderMessage, setReminderMessage] = useState(DEFAULT_TELEGRAM_REMINDER_MESSAGE);
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Form State
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<string>('Bank');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch people
      const { data: pData } = await supabase.from('people').select('*').order('name');
      setPeople(pData || []);
      if (pData && pData.length > 0 && !selectedPersonId) {
        setSelectedPersonId(pData[0].id);
      }

      // Fetch Telegram settings
      const { data: tgData } = await supabase.from('telegram_settings').select('*').maybeSingle();
      if (tgData) {
        setBotToken(tgData.bot_token || '');
        setChatId(tgData.chat_id || '');
        setReminderMessage(tgData.reminder_message || DEFAULT_TELEGRAM_REMINDER_MESSAGE);
        setIsEnabled(tgData.is_enabled ?? true);
        setLastSentAt(tgData.last_sent_at || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async (personId: string) => {
    if (!personId) return;
    try {
      const { data } = await supabase
        .from('zakat_accounts')
        .select('*')
        .eq('person_id', personId)
        .order('display_order');
      setAccounts(data || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPersonId) {
      fetchAccounts(selectedPersonId);
    }
  }, [selectedPersonId]);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramStatusMsg(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
      setSavingTelegram(true);
      const { error } = await supabase.from('telegram_settings').upsert(
        {
          user_id: userData.user.id,
          bot_token: botToken.trim(),
          chat_id: chatId.trim(),
          reminder_message: reminderMessage.trim() || DEFAULT_TELEGRAM_REMINDER_MESSAGE,
          is_enabled: isEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;
      setTelegramStatusMsg({ type: 'success', text: 'Pengaturan Telegram berhasil disimpan.' });
    } catch (err: any) {
      setTelegramStatusMsg({ type: 'error', text: err?.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    setTelegramStatusMsg(null);
    if (!botToken.trim() || !chatId.trim()) {
      setTelegramStatusMsg({ type: 'error', text: 'Bot Token dan Chat ID harus diisi sebelum mengirim tes.' });
      return;
    }

    try {
      setTestingTelegram(true);
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: botToken.trim(),
          chat_id: chatId.trim(),
          reminder_message: reminderMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramStatusMsg({ type: 'success', text: 'Pesan tes berhasil dikirim ke Telegram!' });
      } else {
        setTelegramStatusMsg({ type: 'error', text: data.error || 'Gagal mengirim pesan tes.' });
      }
    } catch (err: any) {
      setTelegramStatusMsg({ type: 'error', text: err?.message || 'Gagal menghubungi server tes Telegram.' });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !selectedPersonId) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingAccountId) {
      await supabase
        .from('zakat_accounts')
        .update({
          account_name: accountName.trim(),
          account_type: accountType,
          institution: institution.trim() || null,
          account_number: accountNumber.trim() || null,
        })
        .eq('id', editingAccountId);
      setEditingAccountId(null);
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

  const handleEditAccount = (acc: AccountItem) => {
    setEditingAccountId(acc.id);
    setAccountName(acc.account_name);
    setAccountType(acc.account_type || 'Bank');
    setInstitution(acc.institution || '');
    setAccountNumber(acc.account_number || '');
  };

  const handleDeleteAccount = async (id: string) => {
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', paddingBottom: '3rem' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
          gap: '0.75rem',
        }}
      >
        <Link
          href="/saldo-tahun"
          aria-label="Kembali ke Saldo Akhir Tahun"
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
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pengaturan Saldo Akhir Tahun</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Reminder Telegram Tahunan &amp; Rekening
          </p>
        </div>
      </header>

      <main
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Section 1: Telegram Reminder Settings */}
        <section
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            border: '1px solid var(--border-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Bell size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Pengingat Telegram Tahunan (30 Desember)
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Aplikasi otomatis mengirimkan notifikasi ke akun Telegram Anda setiap tanggal 30 Desember pukul 09:00 WIB agar tidak lupa mencatat saldo akhir tahun.
          </p>

          {telegramStatusMsg && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
                backgroundColor:
                  telegramStatusMsg.type === 'success'
                    ? 'var(--color-success-bg)'
                    : 'var(--color-danger-bg)',
                color:
                  telegramStatusMsg.type === 'success'
                    ? 'var(--color-success-text)'
                    : 'var(--color-danger-text)',
              }}
            >
              {telegramStatusMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveTelegram} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label
                htmlFor="telegram-bot-token"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Telegram Bot Token
              </label>
              <input
                id="telegram-bot-token"
                type="text"
                className="form-input"
                placeholder="Contoh: 123456789:AAHxxxxx_xxxxxxxxxxxxx"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                style={{ minHeight: '44px' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Dapatkan dari @BotFather di aplikasi Telegram.
              </span>
            </div>

            <div>
              <label
                htmlFor="telegram-chat-id"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Telegram Chat ID
              </label>
              <input
                id="telegram-chat-id"
                type="text"
                className="form-input"
                placeholder="Contoh: 123456789 atau -100xxxxxxxxxx"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                style={{ minHeight: '44px' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Dapatkan ID chat Anda melalui bot @userinfobot di Telegram.
              </span>
            </div>

            <div>
              <label
                htmlFor="telegram-reminder-msg"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Pesan Pengingat
              </label>
              <textarea
                id="telegram-reminder-msg"
                className="form-textarea"
                rows={3}
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                style={{ minHeight: '70px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.25rem 0' }}>
              <input
                id="telegram-enabled-toggle"
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label
                htmlFor="telegram-enabled-toggle"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Aktifkan Pengingat Tahunan 30 Desember
              </label>
            </div>

            {lastSentAt && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Terakhir pengingat terkirim:{' '}
                <strong>{new Date(lastSentAt).toLocaleString('id-ID')}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={savingTelegram}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: savingTelegram ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                }}
              >
                {savingTelegram ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>

              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: testingTelegram ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                }}
              >
                <Send size={16} />
                <span>{testingTelegram ? 'Mengirim...' : 'Kirim Tes Sekarang'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Section 2: Manage Accounts (Shared with Zakat) */}
        <section
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            border: '1px solid var(--border-card)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Kelola Rekening &amp; Tabungan
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Master rekening ini dipakai bersama antara modul Saldo Akhir Tahun dan modul Zakat Mal.
          </p>

          {/* Person Selector */}
          {people.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Pilih Pemilik Rekening:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {people.map((p) => (
                  <button
                    key={p.id}
                    type="button"
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

          {/* Form Add / Edit Account */}
          <form
            onSubmit={handleSaveAccount}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-main)',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {editingAccountId ? 'Edit Rekening' : 'Tambah Rekening Baru'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="saldo-account-name"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Nama Rekening / Akun
                </label>
                <input
                  id="saldo-account-name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: BCA Utama, Mandiri, Gopay, Cash"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div>
                <label
                  htmlFor="saldo-account-type"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Jenis Rekening
                </label>
                <select
                  id="saldo-account-type"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="saldo-account-institution"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  Institusi / Penyedia (Opsional)
                </label>
                <input
                  id="saldo-account-institution"
                  type="text"
                  className="form-input"
                  placeholder="BCA / Mandiri / GoTo"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label
                  htmlFor="saldo-account-number"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
                >
                  No. Rekening (Opsional)
                </label>
                <input
                  id="saldo-account-number"
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
              {editingAccountId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAccountId(null);
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
                {editingAccountId ? 'Simpan Perubahan' : 'Tambah Rekening'}
              </button>
            </div>
          </form>

          {/* Account List */}
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Daftar Rekening {people.find((p) => p.id === selectedPersonId)?.name || ''}
            </h3>
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
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: acc.is_active ? 'var(--text-main)' : 'var(--text-muted)',
                        }}
                      >
                        {acc.account_name} {!acc.is_active && '(Nonaktif)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatZakatAccountMeta(acc)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
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
                        type="button"
                        onClick={() => handleEditAccount(acc)}
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
                        type="button"
                        onClick={() => handleDeleteAccount(acc.id)}
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
        </section>
      </main>
    </div>
  );
}

