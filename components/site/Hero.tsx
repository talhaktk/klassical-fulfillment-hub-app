import Link from 'next/link'
import PWAInstall from '@/components/site/PWAInstall'

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#060E1C 0%,#0A1628 50%,#0E2040 100%)', minHeight: '92vh' }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#C8971A 1px,transparent 1px),linear-gradient(90deg,#C8971A 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gold accent blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle,#C8971A,transparent 70%)' }} />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle,#1B3A6B,transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(200,151,26,.12)', border: '1px solid rgba(200,151,26,.3)', color: '#D4A520' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
            UK-Based 3PL Fulfillment · Luton
          </div>

          <h1
            className="text-5xl lg:text-6xl font-black leading-[1.05] mb-6"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#fff' }}
          >
            Smart Storage.<br />
            <span style={{ color: '#D4A520' }}>Seamless Delivery.</span>
          </h1>

          <p className="text-base lg:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#8A9BB8' }}>
            Premium UK 3PL fulfillment for Shopify, Amazon &amp; TikTok Shop sellers.
            Same-day dispatch, real-time inventory portal, custom branded unboxing — all managed from our Luton warehouse.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href="#contact"
              className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628', boxShadow: '0 8px 24px rgba(200,151,26,.35)' }}
            >
              Start Fulfilling Today →
            </a>
            <a
              href="#pricing"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all inline-flex items-center gap-2"
              style={{ color: '#B8C4D4', borderColor: 'rgba(184,196,212,.3)' }}
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
                background: 'rgba(255,255,255,.09)',
                border: '1px solid rgba(200,151,26,.45)',
                color: '#D4A520',
              }}
            >
              🔐 Staff Login — Fulfillment Hub
            </Link>
            <PWAInstall variant="hero" />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {['Same-Day Dispatch', 'Real-Time Stock Portal', 'No Setup Fee', 'Dedicated Account Manager'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs" style={{ color: '#5A7A9A' }}>
                <span className="text-[#1A7A48]">✓</span>
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
            style={{ background: 'rgba(20,45,86,.8)', border: '1px solid rgba(200,151,26,.3)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-white font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Live Operations</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8BA0' }}>Luton Warehouse · Real-time</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
                <span className="text-xs text-[#1A7A48] font-semibold">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Orders Today',  val: '142',   color: '#D4A520' },
                { label: 'Dispatched',    val: '138',   color: '#1A7A48' },
                { label: 'Active SKUs',   val: '2,841', color: '#fff' },
                { label: 'On-Time Rate',  val: '99.2%', color: '#1A7A48' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,.05)' }}>
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
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: 'linear-gradient(90deg,#9E7410,#E8B830)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Floating notification */}
          <div
            className="absolute -bottom-4 -left-6 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
            style={{ background: '#142D56', border: '1px solid rgba(200,151,26,.3)', minWidth: 220 }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'rgba(26,122,72,.2)' }}>
              ✅
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Order #ORD-1847 dispatched</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#7A8BA0' }}>Royal Mail · 2 mins ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="text-[10px] uppercase tracking-[2px]" style={{ color: '#4A5A70' }}>Scroll</div>
        <div className="w-px h-8 animate-bounce" style={{ background: 'linear-gradient(#C8971A,transparent)' }} />
      </div>
    </section>
  )
}
