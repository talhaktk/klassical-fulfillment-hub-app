import Link from 'next/link'

const FEATURES = [
  { icon: '📦', title: 'Live Inventory',     desc: 'Track every SKU, weight and stock level in real-time.' },
  { icon: '🏷️', title: 'Bulk Label Upload',  desc: 'Upload shipping labels in bulk — review, confirm, create.' },
  { icon: '📊', title: 'Order Dashboard',    desc: 'All orders, statuses and dispatch confirmations in one view.' },
  { icon: '💷', title: 'Auto Invoicing',     desc: 'Handling, prep and storage charges invoiced automatically.' },
  { icon: '💬', title: 'Message Warehouse',  desc: 'Direct line to the team — no email chains, no delays.' },
  { icon: '🤖', title: 'AI Automation',      desc: 'Smart restock alerts, demand forecasting — launching soon.' },
]

const LAUNCHED = [
  { icon: '🏷️', label: 'Bulk Label Upload',        desc: 'Upload labels in bulk — AI scans & creates orders automatically' },
  { icon: '📊', label: 'Seller Dashboard Portal',   desc: 'Real-time orders, inventory, invoices & stock levels — live now' },
  { icon: '🚀', label: 'Free 2-Month Storage',      desc: 'New sellers get 2 months free pallet storage — limited spaces' },
  { icon: '💰', label: 'Up to 10% Commission Off',  desc: 'Introductory launch pricing — lock in rates before standard begins' },
]

export default function HubSection() {
  return (
    <>
      {/* Digital Hub section */}
      <section id="digital-hub" style={{ background: '#FAF8F4' }}>
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <div className="text-xs font-bold uppercase tracking-[3px] mb-5" style={{ color: '#C8971A' }}>
                Digital Hub
              </div>
              <h2
                className="text-5xl font-black mb-5 leading-[1.05]"
                style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
              >
                Your warehouse,<br />
                <span style={{ color: '#C8971A' }}>at your fingertips.</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
                Every order, every SKU, every invoice — visible in real time. Upload shipping labels, monitor stock, and message the warehouse team directly from your seller portal.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 6px 20px rgba(200,151,26,.3)' }}
                >
                  🔐 Access Seller Portal
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border"
                  style={{ color: '#4A5A70', borderColor: '#E8E4DC', background: '#fff' }}
                >
                  Request Access →
                </a>
              </div>
            </div>

            {/* Right: portal mock */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E4DC', boxShadow: '0 20px 60px rgba(10,22,40,.1)' }}>
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#F0EDE8', borderBottom: '1px solid #E8E4DC' }}>
                  <div className="flex gap-1.5">
                    {['#F87171','#FBBF24','#34D399'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                  </div>
                  <div className="flex-1 mx-3 rounded-lg px-3 py-1 text-[11px]" style={{ background: '#fff', border: '1px solid #E8E4DC', color: '#7A8BA0' }}>
                    hub.klassicalholdings.co.uk/dashboard
                  </div>
                </div>
                {/* Dashboard body */}
                <div className="p-5 bg-white">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#fff', fontFamily: 'Georgia,serif' }}>KH</div>
                      <span className="text-sm font-bold" style={{ color: '#0A1628' }}>Your Brand Store</span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#EEF8F3', color: '#1A7A48' }}>● Live</span>
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}>💬 Message</span>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[{ l: 'Orders', v: '1,284', c: '#C8971A' }, { l: 'Dispatched', v: '1,271', c: '#1A7A48' }, { l: 'Active SKUs', v: '34', c: '#2A4F8A' }].map(s => (
                      <div key={s.l} className="rounded-xl p-3" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                        <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#B8C4D4' }}>{s.l}</div>
                        <div className="text-lg font-black" style={{ color: s.c, fontFamily: 'Playfair Display, serif' }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Mini order list */}
                  {[
                    { id: 'ORD-1847', name: 'Sarah Mitchell', carrier: 'Royal Mail', ok: true },
                    { id: 'ORD-1846', name: 'James Okafor',  carrier: 'DPD',        ok: false },
                    { id: 'ORD-1845', name: 'Priya Sharma',  carrier: 'Evri',       ok: true },
                  ].map(o => (
                    <div key={o.id} className="flex items-center gap-3 py-2 border-b text-xs" style={{ borderColor: '#F0EDE8' }}>
                      <span className="font-mono font-semibold w-20" style={{ color: '#C8971A' }}>{o.id}</span>
                      <span className="flex-1" style={{ color: '#6A7D9A' }}>{o.name} · {o.carrier}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: o.ok ? '#EEF8F3' : '#FFF8EE', color: o.ok ? '#1A7A48' : '#C8971A' }}>
                        {o.ok ? 'dispatched' : 'processing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white transition-all hover:-translate-y-0.5" style={{ border: '1px solid #E8E4DC' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(200,151,26,.1)' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: '#0A1628' }}>{f.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch deal — Now Live */}
      <section id="partner-program" style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC' }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="md:max-w-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(26,122,72,.1)', color: '#1A7A48', border: '1px solid rgba(26,122,72,.25)' }}>
                <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
                Now Live
              </div>
              <h3 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
                We're open.<br />
                <span style={{ color: '#C8971A' }}>Get the launch deal.</span>
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6A7D9A' }}>
                Klassical Fulfillment &amp; Logistics UK is officially live. Early sellers get exclusive launch pricing — don't miss it.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 flex-1 md:max-w-xl">
              {LAUNCHED.map(f => (
                <div key={f.label} className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(200,151,26,.1)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: '#0A1628' }}>{f.label}</div>
                    <div className="text-xs leading-relaxed" style={{ color: '#6A7D9A' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offer banner */}
          <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-between" style={{ background: 'linear-gradient(135deg,#0A1628,#1B3A6B)', border: '1px solid rgba(200,151,26,.35)' }}>
            <div className="text-center sm:text-left">
              <div className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Playfair Display,serif' }}>🎉 Launch Offer — Limited Time</div>
              <div className="text-sm" style={{ color: '#B8C4D4' }}>
                <span className="font-bold" style={{ color: '#D4A520' }}>Free storage for 2 months</span> + save <span className="font-bold" style={{ color: '#D4A520' }}>up to 10% on commission</span> for the first 6 months.
              </div>
            </div>
            <a href="#contact" className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', whiteSpace: 'nowrap' }}>
              Claim Your Offer →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
