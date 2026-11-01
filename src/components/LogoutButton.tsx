'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  'aria-label'?: string;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handleClick = async () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        await caches.delete('catat-mencatat-v1');
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        }
      }
    } catch (err) {
      console.error('Error clearing cache on logout:', err);
    }
  };

  return (
    <form action={onLogout}>
      <button
        type="submit"
        onClick={handleClick}
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
  );
}
