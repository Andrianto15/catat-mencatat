import React from 'react';
import { Motor } from '@/lib/motor/actions';

interface ServiceFilterProps {
  motors: Motor[];
  selectedMotorId: string;
  onMotorChange: (id: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
}

export function ServiceFilter({
  motors,
  selectedMotorId,
  onMotorChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ServiceFilterProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      backgroundColor: 'var(--bg-card)',
      padding: '0.875rem 1rem',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => onMotorChange('')}
          style={{
            padding: '0.4rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            border: '1px solid',
            borderColor: selectedMotorId === '' ? 'var(--color-primary)' : 'var(--border-card)',
            backgroundColor: selectedMotorId === '' ? 'var(--color-primary)' : 'transparent',
            color: selectedMotorId === '' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Semua Motor
        </button>
        {motors.map((m) => (
          <button
            key={m.id}
            onClick={() => onMotorChange(m.id)}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              border: '1px solid',
              borderColor: selectedMotorId === m.id ? 'var(--color-primary)' : 'var(--border-card)',
              backgroundColor: selectedMotorId === m.id ? 'var(--color-primary)' : 'transparent',
              color: selectedMotorId === m.id ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label htmlFor="filter-start-date" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Dari Tanggal
          </label>
          <input
            id="filter-start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)',
              backgroundColor: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              minHeight: '44px',
            }}
          />
        </div>
        <div>
          <label htmlFor="filter-end-date" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Sampai Tanggal
          </label>
          <input
            id="filter-end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)',
              backgroundColor: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              minHeight: '44px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
