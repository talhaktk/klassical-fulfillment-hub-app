const COMING = [
  { icon: '🤖', label: 'AI Order Routing',         desc: 'Smart carrier selection based on weight, postcode and cost' },
  { icon: '📱', label: 'TikTok Shop Direct API',   desc: 'Auto-pull orders directly from TikTok Shop API' },
  { icon: '📲', label: 'WhatsApp Dispatch Alerts', desc: 'Automated dispatch notifications to your customers via WhatsApp' },
  { icon: '📷', label: 'Packing Photo Evidence',   desc: 'Photo of every packed order before dispatch — logged in your portal' },
]

const LAUNCHED = [
  { icon: '🏷️', label: 'Bulk Label Upload',        desc: 'Upload shipping labels in bulk — AI scans & creates orders automatically' },
  { icon: '📊', label: 'Seller Dashboard Portal',   desc: 'Real-time orders, inventory, invoices & stock levels — live now' },
  { icon: '🚀', label: 'Free 2-Month Storage',      desc: 'New sellers get 2 months free pallet storage on sign-up — limited spaces' },
  { icon: '💰', label: 'Up to 10% Commission Off',  desc: 'Introductory launch pricing — lock in rates before standard pricing begins' },
]

export default function ComingSoon() {
  return (
    <>
      {/* Launched section */}
      <section style={{ background: '#F0F7FF', borderTop: '1px solid #D0E0F0', borderBottom: '1px solid #D0E0F0' }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="md:max-w-xs">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ background: 'rgba(26,122,72,.12)', color: '#1A7A48', border: '1px solid rgba(26,122,72,.3)' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
                Now Live
              </div>
              <h3
                className="text-3xl font-black mb-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
              >
                We're open.<br />
                <span style={{ color: '#C8971A' }}>Get the launch deal.</span>
              </h3>
              <p className="text-sm" style={{ color: '#5A7090' }}>
                Klassical Fulfillment & Logistics UK is officially live. Early sellers get exclusive launch pricing — don't miss it.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 flex-1 md:max-w-xl">
              {LAUNCHED.map(f => (
                <div
                  key={f.label}
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'white', border: '1px solid #D0E0F0', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(200,151,26,.1)' }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{f.label}</div>
                    <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6A7D9A' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offer highlight */}
          <div
            className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between"
            style={{ background: 'linear-gradient(135deg,#0A1628,#1B3A6B)', border: '1px solid rgba(200,151,26,.4)' }}
          >
            <div className="text-center sm:text-left">
              <div className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Playfair Display,serif' }}>
                🎉 Launch Offer — Limited Time
              </div>
              <div className="text-sm" style={{ color: '#B8C4D4' }}>
                <span className="text-[#D4A520] font-bold">Free storage for 2 months</span> + save <span className="text-[#D4A520] font-bold">up to 10% on commission</span> for the first 6 months. For new sellers only.
              </div>
            </div>
            <a
              href="#contact"
              className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628', boxShadow: '0 6px 20px rgba(200,151,26,.3)', whiteSpace: 'nowrap' }}
            >
              Claim Your Offer →
            </a>
          </div>
        </div>
      </section>

      {/* Coming soon section */}
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
    </>
  )
}
