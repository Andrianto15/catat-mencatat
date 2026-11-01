import React from 'react';
import { Wrench, Calendar, Gauge, Store, Edit2, Trash2 } from 'lucide-react';
import { MotorServiceItem } from '@/lib/motor/actions';

interface ServiceCardProps {
  service: MotorServiceItem;
  motorName?: string;
  onEdit?: (service: MotorServiceItem) => void;
  onDelete?: (id: string) => void;
}

export function ServiceCard({ service, motorName, onEdit, onDelete }: ServiceCardProps) {
  const formattedCost = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(service.cost);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            backgroundColor: 'rgba(70, 130, 180, 0.1)',
            padding: '0.2rem 0.5rem',
            borderRadius: '0.375rem',
            display: 'inline-block',
            marginBottom: '0.25rem',
          }}>
            {motorName || 'Motor'}
          </span>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {formattedCost}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(service)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)',
              }}
              aria-label="Edit"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(service.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--color-danger-text)',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)',
              }}
              aria-label="Hapus"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Calendar size={14} />
          <span>{service.service_date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Gauge size={14} />
          <span>{service.current_km != null ? `${service.current_km.toLocaleString('id-ID')} km` : '-'}</span>
        </div>
        {service.workshop_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', gridColumn: 'span 2' }}>
            <Store size={14} />
            <span>{service.workshop_name}</span>
          </div>
        )}
      </div>

      {service.notes && (
        <div style={{
          fontSize: '0.8125rem',
          color: 'var(--text-main)',
          backgroundColor: 'var(--bg-main)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          marginTop: '0.25rem',
        }}>
          {service.notes}
        </div>
      )}
    </div>
  );
}
