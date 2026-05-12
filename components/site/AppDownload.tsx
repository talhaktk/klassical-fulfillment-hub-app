import Link from 'next/link'
import PWAInstall from '@/components/site/PWAInstall'

export default function AppDownload() {
  return (
    <section style={{ background: 'linear-gradient(135deg,#060E1C 0%,#0A1628 60%,#0E2040 100%)' }}>
      <div className="max-w-5xl mx-auto px-5 py-20">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(200,151,26,.25)' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center,rgba(200,151,26,.07) 0%,transparent 70%)' }} />

          <div className="relative">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -2, boxShadow: '0 12px 32px rgba(200,151,26,.35)' }}
            >
              KH
            </div>

            <h2
              className="text-4xl font-black text-white mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Take the HUB everywhere
            </h2>
            <p className="text-base max-w-lg mx-auto mb-10" style={{ color: '#6A7D9A' }}>
              Install the Klassical Fulfillment HUB as an app on your phone or desktop. Works offline, loads instantly, no App Store needed.
            </p>

            {/* Two columns: Install + Login */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
              <div
                className="rounded-2xl p-5 text-left"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}
              >
                <div className="text-2xl mb-3">📲</div>
                <div className="font-bold text-white text-sm mb-1">Install as App</div>
                <div className="text-xs mb-4" style={{ color: '#5A6A80' }}>
                  Android &amp; Desktop: Chrome install prompt.<br />
                  iPhone: Safari → Share → Add to Home Screen.
                </div>
                <PWAInstall variant="hero" />
              </div>

              <div
                className="rounded-2xl p-5 text-left"
                style={{ background: 'rgba(200,151,26,.07)', border: '1px solid rgba(200,151,26,.25)' }}
              >
                <div className="text-2xl mb-3">🔐</div>
                <div className="font-bold text-white text-sm mb-1">Staff & Seller Login</div>
                <div className="text-xs mb-4" style={{ color: '#5A6A80' }}>
                  Access the warehouse management hub with your credentials provided by your administrator.
                </div>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
                >
                  Login to Hub →
                </Link>
              </div>
            </div>

            {/* Platform badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '🤖', label: 'Android', sub: 'Chrome → Install' },
                { icon: '🍎', label: 'iPhone / iPad', sub: 'Safari → Share → Add to Home' },
                { icon: '💻', label: 'Windows / Mac', sub: 'Chrome / Edge → Install' },
              ].map(p => (
                <div
                  key={p.label}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">{p.label}</div>
                    <div className="text-[10px]" style={{ color: '#4A5A70' }}>{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
