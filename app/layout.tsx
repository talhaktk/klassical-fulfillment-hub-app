import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Klassical Fulfillment HUB',
  description: 'Professional 3PL warehouse management — Klassical Holdings Ltd, Luton UK',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
