'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Person } from '@/lib/gold/actions';

export default function PeopleSettingsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('people').select('*').order('created_at');
      setPeople(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingId) {
      await supabase
        .from('people')
        .update({
          name: name.trim(),
        })
        .eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('people').insert([
        {
          user_id: userData.user.id,
          name: name.trim(),
          is_active: true,
        },
      ]);
    }

    setName('');
    await fetchPeople();
  };

  const handleEdit = (p: Person) => {
    setEditingId(p.id);
    setName(p.name);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus nama ini beserta seluruh riwayat emas & zakatnya?')) return;
    await supabase.from('people').delete().eq('id', id);
    await fetchPeople();
  };

  const handleToggleActive = async (p: Person) => {
    await supabase.from('people').update({ is_active: !p.is_active }).eq('id', p.id);
    await fetchPeople();
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
          href="/emas"
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
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Master Pemilik (Orang)</h1>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          border: '1px solid var(--border-card)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.875rem' }}>
            {editingId ? 'Edit Nama Pemilik' : 'Tambah Pemilik Baru'}
          </h2>
          <form onSubmit={handleSavePerson} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="person-name" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
              Nama Pemilik
            </label>
            <input
              id="person-name"
              type="text"
              required
              placeholder="Contoh: Suami, Istri, Anak 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            />
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                }}
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: '0.625rem 1.25rem',
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
              {editingId ? 'Simpan' : 'Tambah'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Daftar Pemilik
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat data pemilik...</p>
          ) : people.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada pemilik terdaftar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {people.map((p) => (
                <div
                  key={p.id}
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
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: p.is_active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {p.name} {!p.is_active && '(Nonaktif)'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleToggleActive(p)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: p.is_active ? 'var(--color-success-text)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      aria-label={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
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
                      onClick={() => handleDelete(p.id)}
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
