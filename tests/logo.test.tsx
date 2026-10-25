import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import Logo from '@/components/Logo';
import LoginPage from '@/app/login/page';

// Mock Supabase client for LoginPage
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

describe('Logo Component & Assets', () => {
  it('renders Logo SVG component with default size and accessible label', () => {
    const html = renderToStaticMarkup(<Logo />);
    expect(html).toContain('<svg');
    expect(html).toContain('aria-label="Logo Catat-Mencatat"');
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
  });

  it('renders Logo SVG component with custom size', () => {
    const html = renderToStaticMarkup(<Logo size={64} />);
    expect(html).toContain('<svg');
    expect(html).toContain('width="64"');
    expect(html).toContain('height="64"');
  });

  it('has all required logo and favicon asset files in public directory', () => {
    const publicDir = path.join(process.cwd(), 'public');
    
    expect(fs.existsSync(path.join(publicDir, 'logo.svg'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'favicon.svg'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'favicon.ico'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'apple-touch-icon.png'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'icons/icon-192x192.png'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'icons/icon-512x512.png'))).toBe(true);
  });

  it('renders Logo in LoginPage', () => {
    const html = renderToStaticMarkup(<LoginPage />);
    expect(html).toContain('aria-label="Logo Catat-Mencatat"');
  });
});
