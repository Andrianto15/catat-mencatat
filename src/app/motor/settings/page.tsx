'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Motor } from '@/lib/motor/actions';

export default function MotorSettingsPage() {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMotors = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('motors').select('*').order('created_at');
      setMotors(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotors();
  }, []);

  const handleSaveMotor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingId) {
      await supabase
        .from('motors')
        .update({
          name: name.trim(),
          plate_number: plateNumber.trim() || null,
        })
        .eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('motors').insert([
        {
          user_id: userData.user.id,
          name: name.trim(),
          plate_number: plateNumber.trim() || null,
          is_active: true,
        },
      ]);
    }

    setName('');
    setPlateNumber('');
    await fetchMotors();
  };

  const handleEdit = (m: Motor) => {
    setEditingId(m.id);
    setName(m.name);
    setPlateNumber(m.plate_number || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus motor ini beserta semua riwayat servisnya?')) return;
    await supabase.from('motors').delete().eq('id', id);
    await fetchMotors();
  };

  const handleToggleActive = async (m: Motor) => {
    await supabase.from('motors').update({ is_active: !m.is_active }).eq('id', m.id);
    await fetchMotors();
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
          href="/motor"
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
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Kelola Data Motor</h1>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Form Add / Edit */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          border: '1px solid var(--border-card)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.875rem' }}>
            {editingId ? 'Edit Motor' : 'Tambah Motor Baru'}
          </h2>
          <form onSubmit={handleSaveMotor} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Nama / Merk Motor
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Honda Vario 160"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Nomor Polisi (Opsional)
              </label>
              <input
                type="text"
                placeholder="B 1234 XYZ"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setPlateNumber('');
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
                {editingId ? 'Simpan Perubahan' : 'Tambah Motor'}
              </button>
            </div>
          </form>
        </div>

        {/* List of Motors */}
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Daftar Motor
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat data motor...</p>
          ) : motors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada motor terdaftar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {motors.map((m) => (
                <div
                  key={m.id}
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
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: m.is_active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {m.name} {!m.is_active && '(Nonaktif)'}
                    </div>
                    {m.plate_number && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {m.plate_number}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleToggleActive(m)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: m.is_active ? '#10b981' : 'var(--text-muted)',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={m.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
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
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{
                        padding: '0.375rem',
                        border: 'none',
                        background: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        minHeight: '44px',
                        minWidth: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Hapus"
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
