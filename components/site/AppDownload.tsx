import Link from 'next/link'
import PWAInstall from '@/components/site/PWAInstall'

export default function AppDownload() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
      <div className="max-w-5xl mx-auto px-5 py-20">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#F0F4FA,#E8EEF8)', border: '1px solid #D0D8E8' }}
        >
          {/* Subtle gold glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right,rgba(200,151,26,.06) 0%,transparent 60%)' }} />

          <div className="relative">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -2, boxShadow: '0 12px 32px rgba(200,151,26,.3)' }}
            >
              KH
            </div>

            <h2
              className="text-4xl font-black mb-3"
              style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
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
                style={{ background: '#fff', border: '1px solid #D0D8E8', boxShadow: '0 2px 12px rgba(10,22,40,.06)' }}
              >
                <div className="text-2xl mb-3">📲</div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0A1628' }}>Install as App</div>
                <div className="text-xs mb-4" style={{ color: '#7A8BA0' }}>
                  Android &amp; Desktop: Chrome install prompt.<br />
                  iPhone: Safari → Share → Add to Home Screen.
                </div>
                <PWAInstall variant="hero" />
              </div>

              <div
                className="rounded-2xl p-5 text-left"
                style={{ background: '#FDF8EE', border: '1px solid rgba(200,151,26,.3)', boxShadow: '0 2px 12px rgba(200,151,26,.08)' }}
              >
                <div className="text-2xl mb-3">🔐</div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0A1628' }}>Staff &amp; Seller Login</div>
                <div className="text-xs mb-4" style={{ color: '#7A8BA0' }}>
                  Access the warehouse management hub with your credentials provided by your administrator.
                </div>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 4px 12px rgba(200,151,26,.3)' }}
                >
                  Login to Hub →
                </Link>
              </div>
            </div>

            {/* Platform badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '🤖', label: 'Android',        sub: 'Chrome → Install' },
                { icon: '🍎', label: 'iPhone / iPad',  sub: 'Safari → Share → Add to Home' },
                { icon: '💻', label: 'Windows / Mac',  sub: 'Chrome / Edge → Install' },
              ].map(p => (
                <div
                  key={p.label}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{ background: '#fff', border: '1px solid #D0D8E8' }}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold" style={{ color: '#0A1628' }}>{p.label}</div>
                    <div className="text-[10px]" style={{ color: '#7A8BA0' }}>{p.sub}</div>
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
