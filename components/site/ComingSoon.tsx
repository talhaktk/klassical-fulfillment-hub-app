const COMING = [
  { icon: '🤖', label: 'AI Order Routing',         desc: 'Smart carrier selection based on weight, postcode and cost' },
  { icon: '📱', label: 'TikTok Shop Integration',  desc: 'Auto-pull orders directly from TikTok Shop API' },
  { icon: '📲', label: 'WhatsApp Dispatch Alerts', desc: 'Automated dispatch notifications to your customers via WhatsApp' },
  { icon: '📷', label: 'Packing Photo Evidence',   desc: 'Photo of every packed order before dispatch — logged in your portal' },
]

export default function ComingSoon() {
  return (
    <section style={{ background: '#0A1628', borderTop: '1px solid rgba(200,151,26,.15)', borderBottom: '1px solid rgba(200,151,26,.15)' }}>
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="md:max-w-xs">
            <div
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ background: 'rgba(200,151,26,.12)', color: '#D4A520', border: '1px solid rgba(200,151,26,.25)' }}
            >
              Coming Soon
            </div>
            <h3
              className="text-3xl font-black text-white mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              More power,<br />on the way.
            </h3>
            <p className="text-sm" style={{ color: '#5A6A80' }}>
              We're constantly building. These features are in development and will be available to all sellers when released.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 flex-1 md:max-w-xl">
            {COMING.map(f => (
              <div
                key={f.label}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'rgba(200,151,26,.1)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.label}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#5A6A80' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
