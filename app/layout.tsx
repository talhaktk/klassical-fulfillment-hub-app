import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWABanner from '@/components/site/PWABanner'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'Klassical Fulfillment HUB',
    template: '%s | Klassical HUB',
  },
  description: 'Professional 3PL warehouse management — Klassical Holdings Ltd, Luton UK',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Klassical Prep',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Klassical Fulfillment HUB',
    title: 'Klassical Logistics & Fulfillment UK',
    description: 'Smart Storage. Seamless Delivery. Premium UK 3PL for Shopify, Amazon & TikTok Shop sellers.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <PWABanner />
        <Toaster position="bottom-center" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      reg.addEventListener('updatefound', function() {
                        var nw = reg.installing;
                        nw.addEventListener('statechange', function() {
                          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                            if (confirm('New version available! Reload to update?')) {
                              nw.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      });
                    });
                  navigator.serviceWorker.addEventListener('message', function(e) {
                    if (e.data && e.data.type === 'SYNC_TRIGGERED') {
                      window.dispatchEvent(new CustomEvent('kf-sync'));
                    }
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
