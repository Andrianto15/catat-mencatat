'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Bike } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Motor,
  MotorServiceItem,
  filterMotorServices,
  calculateMotorStats,
} from '@/lib/motor/actions';
import { ServiceCard } from '@/components/motor/ServiceCard';
import { ServiceFilter } from '@/components/motor/ServiceFilter';
import { ServiceModal } from '@/components/motor/ServiceModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function MotorPage() {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [services, setServices] = useState<MotorServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMotorId, setSelectedMotorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MotorServiceItem | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: motorsData } = await supabase
        .from('motors')
        .select('*')
        .order('name');

      setMotors(motorsData || []);

      const { data: servicesData } = await supabase
        .from('motor_services')
        .select('*, motors(*)')
        .order('service_date', { ascending: false });

      setServices(servicesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredServices = filterMotorServices(services, {
    motor_id: selectedMotorId,
    startDate,
    endDate,
  });

  const stats = calculateMotorStats(filteredServices);

  const handleSaveService = async (
    data: Omit<MotorServiceItem, 'id'>,
    keepOpen?: boolean
  ) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (editingService) {
      const { error } = await supabase
        .from('motor_services')
        .update({
          ...data,
        })
        .eq('id', editingService.id);

      if (error) throw error;
      setEditingService(null);
    } else {
      const { error } = await supabase.from('motor_services').insert([
        {
          ...data,
          user_id: userData.user.id,
        },
      ]);
      if (error) throw error;
    }

    await fetchData();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan servis ini?')) return;
    const { error } = await supabase.from('motor_services').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      await fetchData();
    }
  };

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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Servis Motor</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {motors.length} motor terdaftar
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThemeToggle />
          <Link
            href="/motor/settings"
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
            title="Pengaturan Motor"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Biaya</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
              {new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(stats.totalCost)}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frekuensi</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {stats.totalServices}x
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KM Terakhir</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {stats.latestKm > 0 ? `${stats.latestKm.toLocaleString('id-ID')}` : '-'}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <ServiceFilter
          motors={motors}
          selectedMotorId={selectedMotorId}
          onMotorChange={setSelectedMotorId}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {/* List of Services */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Memuat catatan servis...
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
          }}>
            <Bike size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Belum ada catatan servis</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Klik tombol (+) di kanan bawah untuk menambah catatan servis baru.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredServices.map((service) => {
              const motor = motors.find((m) => m.id === service.motor_id);
              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  motorName={motor?.name}
                  onEdit={(s) => {
                    setEditingService(s);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteService}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingService(null);
          setIsModalOpen(true);
        }}
        style={{
          position: 'fixed',
          right: '1.25rem',
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(70, 130, 180, 0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Tambah Servis"
      >
        <Plus size={28} />
      </button>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        motors={motors}
        initialData={editingService}
        onSave={handleSaveService}
      />
    </div>
  );
}
