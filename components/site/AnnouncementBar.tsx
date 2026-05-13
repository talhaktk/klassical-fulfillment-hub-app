'use client'
import { useState, useEffect } from 'react'

const HEADLINES = [
  { text: '🚀 Now Launched — Free storage for first 2 months + save up to 10% on commission!', cta: 'Claim Offer →', href: '#contact' },
  { text: '🏭 UK 3PL · Same-day dispatch from Luton · Shopify, Amazon & TikTok Shop ready', cta: 'Book a free call →', href: '#contact' },
  { text: '📲 Seller Portal is LIVE — Track orders, upload labels & manage inventory in real-time', cta: 'Get started →', href: '#contact' },
  { text: '✅ No setup fee · Dedicated account manager · Royal Mail, DPD & Evri supported', cta: 'See pricing →', href: '#pricing' },
]

export default function AnnouncementBar() {
  const [visible,  setVisible]  = useState(true)
  const [idx,      setIdx]      = useState(0)
  const [fading,   setFading]   = useState(false)

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % HEADLINES.length)
        setFading(false)
      }, 300)
    }, 5000)
    return () => clearInterval(id)
  }, [visible])

  if (!visible) return null

  const h = HEADLINES[idx]

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-10 py-2.5 text-xs font-medium overflow-hidden"
      style={{ background: 'linear-gradient(90deg,#7A5810,#C8971A,#E8B830,#C8971A,#7A5810)', color: '#0A1628' }}
    >
      {/* Launch badge */}
      <span
        className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide flex-shrink-0"
        style={{ background: '#0A1628', color: '#E8B830' }}
      >
        🎉 LAUNCH
      </span>

      <span
        className="transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <span className="hidden sm:inline">{h.text}</span>
        <span className="sm:hidden">
          {idx === 0 ? '🚀 Free 2 months storage + 10% off commission!' : idx === 1 ? '🏭 UK 3PL · Same-day dispatch' : idx === 2 ? '📲 Seller Portal is LIVE' : '✅ No setup fee'}
        </span>
        {' '}
        <a href={h.href} className="underline font-black hover:opacity-70">{h.cta}</a>
      </span>

      {/* Dot nav */}
      <div className="hidden sm:flex items-center gap-1 ml-2">
        {HEADLINES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="rounded-full transition-all"
            style={{
              width:   i === idx ? 16 : 6,
              height:  6,
              background: i === idx ? '#0A1628' : 'rgba(10,22,40,.35)',
            }}
          />
        ))}
      </div>

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
