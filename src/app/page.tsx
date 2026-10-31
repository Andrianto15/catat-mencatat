import Link from 'next/link';
import { Bike, Coins, Scale, TrendingUp, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleLogout = async () => {
    'use server';
    const s = await createClient();
    await s.auth.signOut();
    redirect('/login');
  };

  const modules = [
    {
      title: 'Servis Motor',
      desc: 'Riwayat perawatan, kilometer, dan pengeluaran berkala.',
      href: '/motor',
      icon: Bike,
      color: '#4682b4',
    },
    {
      title: 'Emas Fisik',
      desc: 'Portofolio keping, harga harian Galeri24, dan profit berjalan.',
      href: '/emas',
      icon: Coins,
      color: '#f59e0b',
    },
    {
      title: 'Zakat Mal',
      desc: 'Kalkulasi nisab 1 Ramadhan, saldo rekening, dan komparasi tahunan.',
      href: '/zakat',
      icon: Scale,
      color: '#10b981',
    },
    {
      title: 'Saldo Akhir Tahun',
      desc: 'Rekap saldo rekening, pengeluaran, dan grafik perkembangan tahunan.',
      href: '/saldo-tahun',
      icon: TrendingUp,
      color: '#0ea5e9',
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-card)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Catat-Mencatat
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email || 'Dashboard Pribadi'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThemeToggle />
          <form action={handleLogout}>
            <button
              type="submit"
              title="Keluar"
              aria-label="Keluar"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-lg)',
                minHeight: '44px',
                minWidth: '44px',
                justifyContent: 'center',
              }}
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      {/* Main Clean 3-Module Launcher */}
      <main style={{
        flex: 1,
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-card)',
                padding: '1.25rem',
                transition: 'border-color 0.15s ease, transform 0.1s ease',
                textDecoration: 'none',
                minHeight: '84px',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: `${m.color}18`,
                color: m.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {m.title}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {m.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
