'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV = [
  { label: 'Services', href: '#services' },
  { label: 'Pricing',  href: '#pricing'  },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact',  href: '#contact'  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,22,40,.97)' : 'rgba(10,22,40,.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(200,151,26,.25)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -1 }}
          >
            KH
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Klassical
            </div>
            <div className="text-[9px] uppercase tracking-[2px]" style={{ color: '#C8971A' }}>
              Logistics &amp; Fulfillment
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#B8C4D4' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B8C4D4')}
            >
              {n.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5"
            style={{ background: 'rgba(200,151,26,.15)', border: '1px solid rgba(200,151,26,.4)', color: '#D4A520' }}
          >
            🔐 Login to Hub
          </Link>
          <a
            href="#contact"
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-5 h-0.5 transition-all"
              style={{ background: '#C8971A', transformOrigin: 'center' }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-5 py-4 flex flex-col gap-2"
          style={{ background: '#0A1628', borderColor: 'rgba(200,151,26,.2)' }}
        >
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              className="py-2.5 text-sm font-medium border-b"
              style={{ color: '#B8C4D4', borderColor: 'rgba(255,255,255,.06)' }}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <div className="flex gap-2 mt-2">
            <Link href="/auth/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold border" style={{ color: '#B8C4D4', borderColor: 'rgba(184,196,212,.3)' }}>
              Login
            </Link>
            <a href="#contact" className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }} onClick={() => setOpen(false)}>
              Get Quote
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
