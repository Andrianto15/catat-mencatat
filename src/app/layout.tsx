import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';
import { getThemeScript } from '@/lib/theme';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Catat-Mencatat',
  description: 'Aplikasi pencatatan pribadi: Servis Motor, Emas, dan Zakat Mal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Catat',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4682b4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
      </head>
      <body>
        <div className="app-layout">
          <main className="app-content">{children}</main>
          <Footer />
        </div>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
