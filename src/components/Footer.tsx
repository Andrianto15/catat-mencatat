import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-card)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-muted)',
        fontSize: '0.8125rem',
        textAlign: 'center',
        padding: '1.25rem 1rem calc(1.25rem + env(safe-area-inset-bottom))',
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
          Catat-Mencatat
        </p>
        <p>Aplikasi Pencatatan Pribadi</p>
        <p style={{ fontSize: '0.75rem' }}>
          © {currentYear} Andrianto Nur Iskandar. Lisensi MIT.
        </p>
      </div>
    </footer>
  );
}
