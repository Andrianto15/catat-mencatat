import Link from 'next/link';
import { WifiOff, RotateCcw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      backgroundColor: 'var(--bg-main)',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        padding: '2rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-card)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <WifiOff size={32} />
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Anda Sedang Offline
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Koneksi internet tidak tersedia. Data catatan Anda aman dan akan tersinkronisasi saat kembali online.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <RotateCcw size={16} />
          <span>Muat Ulang Halaman</span>
        </Link>
      </div>
    </div>
  );
}
