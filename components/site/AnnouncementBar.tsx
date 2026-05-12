'use client'
import { useState } from 'react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div
      className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-medium"
      style={{ background: 'linear-gradient(90deg,#9E7410,#C8971A,#9E7410)', color: '#0A1628' }}
    >
      <span className="text-sm">🚚</span>
      <span className="hidden sm:inline">
        Same-day dispatch from Luton · UK 3PL for Shopify, Amazon &amp; TikTok Shop sellers ·{' '}
        <a href="#contact" className="underline font-bold hover:text-[#0A1628]/70">Book a free consultation →</a>
      </span>
      <span className="sm:hidden">
        UK 3PL · Same-day dispatch ·{' '}
        <a href="#contact" className="underline font-bold">Book now →</a>
      </span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 text-base leading-none"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}
