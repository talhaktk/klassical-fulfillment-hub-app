import Link from 'next/link'

const FEATURES = [
  {
    icon: '📊',
    title: 'Live Dashboard',
    desc: 'See orders, stock levels, dispatches and invoices in real-time from any device.',
    color: '#2A4F8A',
  },
  {
    icon: '📦',
    title: 'Inventory Management',
    desc: 'Upload stock arrivals, set reorder alerts and track every SKU by weight and condition.',
    color: '#C8971A',
  },
  {
    icon: '🏷️',
    title: 'Label Upload',
    desc: 'Bulk-upload shipping labels with a two-step confirm flow — review before you create.',
    color: '#1A7A48',
  },
  {
    icon: '💷',
    title: 'Auto Invoicing',
    desc: 'Handling charges and branding fees are calculated and invoiced automatically on every GRN.',
    color: '#8B5CF6',
  },
  {
    icon: '📈',
    title: 'Rate Card',
    desc: 'Per-seller rate cards drive every calculation — weight-based handling, prep and storage.',
    color: '#C0321E',
  },
  {
    icon: '🔗',
    title: 'Platform Integrations',
    desc: 'Orders pulled from Shopify, Amazon FBM and TikTok Shop. Tracking pushed back automatically.',
    color: '#0891B2',
  },
]

export default function DigitalHub() {
  return (
    <section id="digital-hub" style={{ background: '#F4F6FA' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(42,79,138,.1)', color: '#2A4F8A', border: '1px solid rgba(42,79,138,.2)' }}
            >
              Digital Hub
            </div>
            <h2
              className="text-4xl lg:text-5xl font-black mb-5 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
            >
              Your fulfillment,<br />
              <span style={{ color: '#C8971A' }}>fully digital.</span>
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: '#5A6A80' }}>
              The Klassical Fulfillment HUB is your command centre — a seller portal where you manage inventory, track orders, generate reports and communicate with our warehouse team, all in one place.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#7A8BA0' }}>
              Staff and sellers log in to separate views. Warehouse staff manage receiving, labels and dispatch. Sellers see their own stock, orders and invoices — nothing more, nothing less.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 6px 20px rgba(200,151,26,.3)' }}
              >
                🔐 Access the Hub
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ color: '#2A4F8A', borderColor: '#D0D8E8', background: '#fff' }}
              >
                Request Seller Access →
              </a>
            </div>
          </div>

          {/* Right: portal screenshot mock */}
          <div className="hidden lg:block">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #E8ECF2', boxShadow: '0 24px 64px rgba(10,22,40,.1)' }}
            >
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#F0F4FA', borderBottom: '1px solid #E8ECF2' }}>
                <div className="flex gap-1.5">
                  {['#F87171','#FBBF24','#34D399'].map(c => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div
                  className="flex-1 mx-3 rounded-lg px-3 py-1 text-[11px]"
                  style={{ background: '#fff', border: '1px solid #E8ECF2', color: '#7A8BA0' }}
                >
                  hub.klassicalholdings.co.uk/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-5" style={{ background: '#fff' }}>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Orders',    val: '1,284', color: '#2A4F8A' },
                    { label: 'Active SKUs',     val: '342',   color: '#C8971A' },
                    { label: 'Pending Labels',  val: '18',    color: '#1A7A48' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3" style={{ background: '#F4F6FA', border: '1px solid #E8ECF2' }}>
                      <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#7A8BA0' }}>{s.label}</div>
                      <div className="text-xl font-black" style={{ color: s.color, fontFamily: 'Playfair Display, serif' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Recent orders mock table */}
                <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid #E8ECF2' }}>
                  <div className="px-4 py-2.5 text-xs font-bold" style={{ background: '#F0F4FA', color: '#0A1628', borderBottom: '1px solid #E8ECF2' }}>
                    Recent Orders
                  </div>
                  {[
                    { id: '#1847', item: 'Blue Widget ×2',  carrier: 'Royal Mail', status: 'Dispatched', ok: true },
                    { id: '#1846', item: 'Red Gadget ×1',   carrier: 'DPD',        status: 'Packing',    ok: false },
                    { id: '#1845', item: 'Gift Box Set ×3', carrier: 'Evri',       status: 'Dispatched', ok: true },
                  ].map(o => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-2.5 text-xs border-b last:border-0" style={{ borderColor: '#F0F4FA' }}>
                      <span className="font-mono font-semibold" style={{ color: '#2A4F8A' }}>{o.id}</span>
                      <span style={{ color: '#6A7D9A' }}>{o.item}</span>
                      <span style={{ color: '#B8C4D4' }}>{o.carrier}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: o.ok ? '#EEF8F3' : '#FFF8EE', color: o.ok ? '#1A7A48' : '#C8971A' }}
                      >
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stock bar */}
                <div className="text-[10px] mb-2 font-semibold uppercase tracking-wide" style={{ color: '#B8C4D4' }}>Stock Levels</div>
                {[
                  { sku: 'SKU-001 Blue Widget',    pct: 82 },
                  { sku: 'SKU-042 Red Gadget',     pct: 24 },
                  { sku: 'SKU-107 Gift Box Set',   pct: 60 },
                ].map(s => (
                  <div key={s.sku} className="mb-2">
                    <div className="flex justify-between text-[11px] mb-1" style={{ color: '#7A8BA0' }}>
                      <span>{s.sku}</span>
                      <span className={s.pct < 30 ? 'text-red-400 font-bold' : ''}>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F4FA' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.pct}%`, background: s.pct < 30 ? '#EF4444' : 'linear-gradient(90deg,#9E7410,#E8B830)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              style={{ border: '1px solid #E8ECF2', borderTop: `3px solid ${f.color}`, boxShadow: '0 2px 8px rgba(14,32,64,.04)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${f.color}18` }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: '#0E2040' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
