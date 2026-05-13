import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Klassical Prep',
    short_name: 'Klassical Prep',
    description: 'Professional 3PL warehouse management — Klassical Holdings Ltd, Luton UK',
    start_url: '/auth/login',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0A1628',
    theme_color: '#0A1628',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    screenshots: [],
    shortcuts: [
      { name: 'Dashboard',  short_name: 'Dashboard', url: '/dashboard',  icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }] },
      { name: 'Orders',     short_name: 'Orders',    url: '/orders',      icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }] },
      { name: 'Inventory',  short_name: 'Inventory', url: '/inventory',   icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }] },
    ],
  }
}
