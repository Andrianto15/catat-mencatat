'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Motor, MotorServiceItem } from '@/lib/motor/actions';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  motors: Motor[];
  initialData?: MotorServiceItem | null;
  onSave: (data: Omit<MotorServiceItem, 'id'>, keepOpen?: boolean) => Promise<void>;
}

export function ServiceModal({
  isOpen,
  onClose,
  motors,
  initialData,
  onSave,
}: ServiceModalProps) {
  const [motorId, setMotorId] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentKm, setCurrentKm] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [workshopName, setWorkshopName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMotorId(initialData.motor_id);
      setServiceDate(initialData.service_date);
      setCurrentKm(initialData.current_km);
      setCost(initialData.cost);
      setWorkshopName(initialData.workshop_name || '');
      setNotes(initialData.notes || '');
    } else {
      if (motors.length > 0 && !motorId) {
        setMotorId(motors[0].id);
      }
    }
  }, [initialData, motors]);

  if (!isOpen) return null;

  const handleSubmit = async (keepOpen = false) => {
    if (!motorId) {
      setError('Pilih motor terlebih dahulu.');
      return;
    }
    if (!serviceDate) {
      setError('Tanggal servis wajib diisi.');
      return;
    }
    if (currentKm === '' || Number(currentKm) < 0) {
      setError('Kilometer harus valid.');
      return;
    }
    if (cost === '' || Number(cost) < 0) {
      setError('Biaya harus valid.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave(
        {
          motor_id: motorId,
          service_date: serviceDate,
          current_km: Number(currentKm),
          cost: Number(cost),
          workshop_name: workshopName.trim() || null,
          notes: notes.trim() || null,
        },
        keepOpen
      );

      if (keepOpen) {
        // Sticky fields: keep motorId, serviceDate, workshopName intact. Clear item specifics.
        setCost('');
        setNotes('');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        backgroundColor: 'var(--bg-card)',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
        border: '1px solid var(--border-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {initialData ? 'Ubah Catatan Servis' : 'Tambah Catatan Servis'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.625rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Motor
            </label>
            <select
              value={motorId}
              onChange={(e) => setMotorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            >
              {motors.map((m) => (
                <option key={m.id} value={m.id} style={{ color: '#000' }}>
                  {m.name} {m.plate_number ? `(${m.plate_number})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Tanggal Servis
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
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
                Kilometer (km)
              </label>
              <input
                type="number"
                placeholder="12000"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value === '' ? '' : Number(e.target.value))}
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Biaya Servis (Rp)
            </label>
            <input
              type="number"
              placeholder="150000"
              value={cost}
              onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
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
              Nama Bengkel (Opsional)
            </label>
            <input
              type="text"
              placeholder="Bengkel Resmi / Ahass"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
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
              Keterangan / Item Servis
            </label>
            <textarea
              rows={2}
              placeholder="Ganti oli mesin, cek kampas rem..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {!initialData && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Simpan & Tambah Lagi
              </button>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
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
              {submitting ? 'Menyimpan...' : 'Simpan & Selesai'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
