import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders semantic <footer> element', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('<footer');
    expect(html).toContain('</footer>');
  });

  it('contains application brand and description', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('Catat-Mencatat');
    expect(html).toContain('Aplikasi Pencatatan Pribadi');
  });

  it('displays current year and MIT license notice', () => {
    const html = renderToStaticMarkup(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(html).toContain(currentYear);
    expect(html).toContain('Andrianto Nur Iskandar');
    expect(html).toContain('MIT');
  });

  it('displays application version from package.json', () => {
    const packageJson = require('../package.json');
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain(`v${packageJson.version}`);
  });
});
