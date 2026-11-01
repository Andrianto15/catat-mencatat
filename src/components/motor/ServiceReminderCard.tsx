'use client';

import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Wrench, Calendar, Gauge } from 'lucide-react';
import { MotorServiceReminder } from '@/lib/motor/actions';

interface ServiceReminderCardProps {
  reminders: MotorServiceReminder[];
}

export const ServiceReminderCard: React.FC<ServiceReminderCardProps> = ({ reminders }) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ motorId: string; type: 'success' | 'error'; message: string } | null>(null);

  if (!reminders || reminders.length === 0) {
    return null;
  }

  const handleSendTelegram = async (motorId: string, motorName: string) => {
    try {
      setSendingId(motorId);
      setNotice(null);

      const res = await fetch('/api/motor/reminder/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motor_id: motorId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotice({
          motorId,
          type: 'success',
          message: data.message || `Notifikasi reminder ${motorName} berhasil dikirim ke Telegram.`,
        });
      } else {
        setNotice({
          motorId,
          type: 'error',
          message: data.error || 'Gagal mengirim notifikasi ke Telegram.',
        });
      }
    } catch (err: any) {
      setNotice({
        motorId,
        type: 'error',
        message: err?.message || 'Terjadi kesalahan jaringan saat mengirim ke Telegram.',
      });
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (status: MotorServiceReminder['status']) => {
    switch (status) {
      case 'DUE':
        return {
          label: 'Waktunya Servis',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#d97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'OVERDUE':
        return {
          label: 'Lewat Jadwal',
          bg: 'var(--color-danger-bg, rgba(239, 68, 68, 0.15))',
          color: 'var(--color-danger-text, #ef4444)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'UPCOMING':
        return {
          label: 'Belum Waktunya (Aman)',
          bg: 'var(--color-success-bg, rgba(16, 185, 129, 0.15))',
          color: 'var(--color-success-text, #10b981)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'NO_SERVICE':
      default:
        return {
          label: 'Belum Ada Riwayat',
          bg: 'var(--bg-main)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-card)',
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(70, 130, 180, 0.12)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bell size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Pengingat Servis Berikutnya
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Estimasi 2-3 bulan dari tanggal servis terakhir
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reminders.map((rem) => {
          const badge = getStatusBadge(rem.status);
          const isSending = sendingId === rem.motorId;
          const motorNotice = notice && notice.motorId === rem.motorId ? notice : null;

          return (
            <div
              key={rem.motorId}
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {rem.motorName}
                  </span>
                  {rem.plateNumber && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '0.125rem 0.375rem', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
                      {rem.plateNumber}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: badge.border,
                  }}
                >
                  {badge.label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} style={{ flexShrink: 0 }} />
                  <span>Servis Terakhir: <strong style={{ color: 'var(--text-main)' }}>{rem.lastServiceDate || '-'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
                  <Gauge size={14} style={{ flexShrink: 0 }} />
                  <span>KM: <strong style={{ color: 'var(--text-main)' }}>{rem.lastKm != null && rem.lastKm > 0 ? `${rem.lastKm.toLocaleString('id-ID')} km` : '-'}</strong></span>
                </div>
              </div>

              {rem.nextServiceMinDate && rem.nextServiceMaxDate ? (
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Wrench size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)' }}>
                    Jadwal Servis: <strong style={{ color: 'var(--color-primary)' }}>{rem.nextServiceMinDate}</strong> s.d. <strong style={{ color: 'var(--color-primary)' }}>{rem.nextServiceMaxDate}</strong>
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Belum ada riwayat servis untuk menghitung jadwal berikutnya.
                </div>
              )}

              {motorNotice && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    backgroundColor: motorNotice.type === 'success' ? 'var(--color-success-bg, rgba(16, 185, 129, 0.15))' : 'var(--color-danger-bg, rgba(239, 68, 68, 0.15))',
                    color: motorNotice.type === 'success' ? 'var(--color-success-text, #10b981)' : 'var(--color-danger-text, #ef4444)',
                    border: `1px solid ${motorNotice.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {motorNotice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{motorNotice.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSendTelegram(rem.motorId, rem.motorName)}
                disabled={isSending || rem.status === 'NO_SERVICE'}
                aria-label="Kirim pengingat ke Telegram"
                style={{
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  backgroundColor: rem.status === 'NO_SERVICE' ? 'var(--border-card)' : 'var(--bg-card)',
                  color: rem.status === 'NO_SERVICE' ? 'var(--text-muted)' : 'var(--color-primary)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: rem.status === 'NO_SERVICE' || isSending ? 'not-allowed' : 'pointer',
                  opacity: rem.status === 'NO_SERVICE' ? 0.6 : 1,
                  transition: 'background-color 0.15s ease, opacity 0.15s ease',
                  width: '100%',
                }}
              >
                <Send size={15} />
                <span>{isSending ? 'Mengirim...' : 'Kirim Pengingat Telegram'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

