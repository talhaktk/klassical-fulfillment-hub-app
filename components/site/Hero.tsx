import Link from 'next/link'
import PWAInstall from '@/components/site/PWAInstall'

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #FAFBFD 0%, #F0F4FA 60%, #EAF0F8 100%)', minHeight: '90vh' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#0A1628 1px,transparent 1px),linear-gradient(90deg,#0A1628 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gold accent blob top-right */}
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle,#C8971A,transparent 70%)' }} />
      {/* Navy blob bottom-left */}
      <div className="absolute bottom-0 -left-20 w-[380px] h-[380px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle,#0A1628,transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(10,22,40,.07)', border: '1px solid rgba(10,22,40,.12)', color: '#2A4F8A' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
            UK-Based 3PL Fulfillment · Luton
          </div>

          <h1
            className="text-5xl lg:text-6xl font-black leading-[1.05] mb-6"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#0A1628' }}
          >
            Smart Storage.<br />
            <span style={{ color: '#C8971A' }}>Seamless Delivery.</span>
          </h1>

          <p className="text-base lg:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#5A6A80' }}>
            Premium UK 3PL fulfillment for Shopify, Amazon &amp; TikTok Shop sellers.
            Same-day dispatch, real-time inventory portal, custom branded unboxing — all managed from our Luton warehouse.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href="#contact"
              className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.35)' }}
            >
              Start Fulfilling Today →
            </a>
            <a
              href="#pricing"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all inline-flex items-center gap-2"
              style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff' }}
            >
              View Pricing
            </a>
          </div>

          {/* Login + Install row */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: '#F0F4FA',
                border: '1px solid #D0D8E8',
                color: '#2A4F8A',
              }}
            >
              🔐 Staff Login — Fulfillment Hub
            </Link>
            <PWAInstall variant="hero" />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {['Same-Day Dispatch', 'Real-Time Stock Portal', 'No Setup Fee', 'Dedicated Account Manager'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs" style={{ color: '#7A8BA0' }}>
                <span style={{ color: '#1A7A48' }}>✓</span>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right: floating dashboard preview */}
        <div className="hidden lg:block relative">
          {/* Main card */}
          <div
            className="rounded-2xl p-6 shadow-2xl"
            style={{ background: '#fff', border: '1px solid #E8ECF2', boxShadow: '0 24px 64px rgba(10,22,40,.12)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Live Operations</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8BA0' }}>Luton Warehouse · Real-time</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
                <span className="text-xs text-[#1A7A48] font-semibold">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Orders Today',  val: '142',   color: '#C8971A', bg: '#FDF8EE' },
                { label: 'Dispatched',    val: '138',   color: '#1A7A48', bg: '#EEF8F3' },
                { label: 'Active SKUs',   val: '2,841', color: '#0A1628', bg: '#F4F6FA' },
                { label: 'On-Time Rate',  val: '99.2%', color: '#1A7A48', bg: '#EEF8F3' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3.5" style={{ background: s.bg, border: '1px solid #E8ECF2' }}>
                  <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#7A8BA0' }}>{s.label}</div>
                  <div className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Playfair Display, serif' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Mini progress bars */}
            {[
              { label: 'Packing Zone A', pct: 78 },
              { label: 'Dispatch Bay',   pct: 92 },
              { label: 'Returns Queue',  pct: 12 },
            ].map(b => (
              <div key={b.label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#7A8BA0' }}>
                  <span>{b.label}</span>
                  <span>{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F4FA' }}>
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: 'linear-gradient(90deg,#9E7410,#E8B830)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Floating notification */}
          <div
            className="absolute -bottom-4 -left-6 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
            style={{ background: '#fff', border: '1px solid #E8ECF2', minWidth: 220, boxShadow: '0 8px 32px rgba(10,22,40,.12)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#EEF8F3' }}>
              ✅
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: '#0A1628' }}>Order #ORD-1847 dispatched</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#7A8BA0' }}>Royal Mail · 2 mins ago</div>
            </div>
          </div>

          {/* Floating stats bubble top-right */}
          <div
            className="absolute -top-4 -right-4 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
            style={{ background: '#fff', border: '1px solid #E8ECF2', boxShadow: '0 8px 32px rgba(10,22,40,.1)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#FDF8EE' }}>
              📦
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: '#0A1628' }}>Stock Alert</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#C8971A' }}>SKU-442 low — restock soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="text-[10px] uppercase tracking-[2px]" style={{ color: '#B8C4D4' }}>Scroll</div>
        <div className="w-px h-8 animate-bounce" style={{ background: 'linear-gradient(#C8971A,transparent)' }} />
      </div>
    </section>
  )
}
