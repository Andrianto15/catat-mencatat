import React from 'react';
import packageJson from '../../package.json';

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
        <p
          style={{
            fontWeight: 600,
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>Catat-Mencatat</span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              padding: '0.075rem 0.4rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-input, rgba(148, 163, 184, 0.15))',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-card)',
            }}
          >
            v{packageJson.version}
          </span>
        </p>
        <p>Aplikasi Pencatatan Pribadi</p>
        <p style={{ fontSize: '0.75rem' }}>
          © {currentYear} Andrianto Nur Iskandar. Lisensi MIT.
        </p>
      </div>
    </footer>
  );
}
