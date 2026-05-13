import Link from 'next/link'

const STATS = [
  { label: 'Total Orders',   val: '1,284',  sub: '+12% this week',   color: '#D4A520', icon: '📦' },
  { label: 'Dispatched',     val: '1,271',  sub: '99.0% on time',    color: '#1A7A48', icon: '✅' },
  { label: 'In Stock SKUs',  val: '34',     sub: '2 low stock',      color: '#fff',    icon: '🗄️' },
  { label: 'Outstanding',    val: '£0',     sub: 'All paid up',      color: '#1A7A48', icon: '💰' },
]

const RECENT_ORDERS = [
  { id: 'ORD-1847', customer: 'Sarah Mitchell',  carrier: 'Royal Mail', status: 'dispatched', date: 'Today 14:22' },
  { id: 'ORD-1846', customer: 'James Okafor',    carrier: 'DPD',        status: 'processing', date: 'Today 13:45' },
  { id: 'ORD-1845', customer: 'Priya Sharma',    carrier: 'Evri',       status: 'dispatched', date: 'Today 12:10' },
  { id: 'ORD-1844', customer: 'Tom Williams',    carrier: 'Royal Mail', status: 'dispatched', date: 'Today 11:38' },
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  dispatched: { bg: 'rgba(26,122,72,.15)', color: '#1A7A48' },
  processing: { bg: 'rgba(200,151,26,.15)', color: '#C8971A' },
  pending:    { bg: 'rgba(200,90,0,.15)',  color: '#C85A00' },
}

const STOCK = [
  { sku: 'SK-TSHIRT-BLK-M',  product: 'Classic Tee — Black/M',  avail: 42, total: 50, pct: 84 },
  { sku: 'SK-HOODIE-GRY-L',  product: 'Hoodie — Grey/L',        avail: 8,  total: 30, pct: 27 },
  { sku: 'SK-TRAINERS-WHT',  product: 'Trainers — White',       avail: 3,  total: 20, pct: 15 },
  { sku: 'SK-CAP-NAVY',      product: 'Cap — Navy',             avail: 26, total: 30, pct: 87 },
]

const ACTIONS = [
  { icon: '🏷️', label: 'Upload Labels', sub: 'Bulk CSV or image', href: '/seller-portal', color: '#C8971A' },
  { icon: '📦', label: 'Track Orders',  sub: 'Real-time status',   href: '/seller-portal', color: '#1A7A48' },
  { icon: '🧾', label: 'View Invoices', sub: 'Download & pay',     href: '/seller-portal', color: '#2A6DC8' },
  { icon: '📈', label: 'Analytics',     sub: 'Sales & stock trends',href: '/seller-portal', color: '#8B2ADA' },
]

export default function SellerDashboardSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg,#060E1C 0%,#0A1628 60%,#0E2040 100%)' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Heading */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(26,122,72,.15)', border: '1px solid rgba(26,122,72,.4)', color: '#4ADE80' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#1A7A48] animate-pulse" />
            Seller Portal — Now Live
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your warehouse,<br />
            <span style={{ color: '#D4A520' }}>at your fingertips.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto mb-8" style={{ color: '#6A7D9A' }}>
            Every order, every SKU, every invoice — visible in real time. Upload shipping labels, monitor stock, and message the warehouse team directly.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}
          >
            Access Seller Portal →
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(200,151,26,.25)', background: 'rgba(20,45,86,.5)', backdropFilter: 'blur(12px)' }}>
          {/* Portal topbar mock */}
          <div className="flex items-center justify-between px-5 py-3" style={{ background: '#0A1628', borderBottom: '1px solid rgba(200,151,26,.2)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
                style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif' }}
              >
                KH
              </div>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'Playfair Display,serif' }}>Klassical Fulfillment HUB</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(26,122,72,.2)', color: '#4ADE80', border: '1px solid rgba(26,122,72,.4)' }}>● Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md font-mono" style={{ background: 'rgba(255,255,255,.05)', color: '#B8C4D4' }}>14:38</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}>S</div>
            </div>
          </div>

          <div className="flex" style={{ minHeight: 420 }}>
            {/* Sidebar mock */}
            <div className="hidden md:flex flex-col py-3" style={{ width: 168, background: '#142D56', borderRight: '1px solid rgba(200,151,26,.15)', flexShrink: 0 }}>
              {[
                { icon: '📊', label: 'Dashboard',    active: true  },
                { icon: '📋', label: 'My Orders',    active: false },
                { icon: '📦', label: 'Inventory',    active: false },
                { icon: '🧾', label: 'Invoices',     active: false },
                { icon: '🏷️', label: 'Upload Labels', active: false },
                { icon: '💬', label: 'Messages',     active: false },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 mx-2 my-px px-3 py-2 rounded-lg text-xs font-medium"
                  style={item.active
                    ? { background: 'linear-gradient(90deg,rgba(200,151,26,.2),rgba(200,151,26,.05))', color: '#E8B830', borderLeft: '3px solid #D4A520' }
                    : { color: '#B8C4D4', borderLeft: '3px solid transparent' }
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 overflow-hidden">
              {/* Seller banner */}
              <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(200,151,26,.08)', border: '1px solid rgba(200,151,26,.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <div className="text-white font-bold text-sm" style={{ fontFamily: 'Playfair Display,serif' }}>Your Brand Store</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>Partner since Jan 2025 · active</div>
                  </div>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}>💬 Message Warehouse</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#7A8BA0' }}>{s.label}</span>
                      <span className="text-sm">{s.icon}</span>
                    </div>
                    <div className="text-xl font-bold mb-0.5" style={{ color: s.color, fontFamily: 'Playfair Display,serif' }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: '#5A6A80' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Two columns: orders + stock */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Recent orders */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <span className="text-xs font-bold text-white">Recent Orders</span>
                    <span className="text-[10px]" style={{ color: '#D4A520' }}>View all →</span>
                  </div>
                  <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
                    {RECENT_ORDERS.map(o => (
                      <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono font-bold" style={{ color: '#D4A520' }}>{o.id}</div>
                          <div className="text-[10px] truncate" style={{ color: '#7A8BA0' }}>{o.customer} · {o.carrier}</div>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}
                        >
                          {o.status}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: '#5A6A80' }}>{o.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock levels */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <span className="text-xs font-bold text-white">Stock Levels</span>
                    <span className="text-[10px]" style={{ color: '#D4A520' }}>View inventory →</span>
                  </div>
                  <div className="px-4 py-2 space-y-2.5">
                    {STOCK.map(s => (
                      <div key={s.sku}>
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <div className="text-[10px] font-mono" style={{ color: '#D4A520' }}>{s.sku}</div>
                            <div className="text-[10px]" style={{ color: '#7A8BA0' }}>{s.product}</div>
                          </div>
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: s.pct < 20 ? '#C0321E' : s.pct < 40 ? '#C8971A' : '#1A7A48' }}
                          >
                            {s.avail}/{s.total}
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.pct}%`,
                              background: s.pct < 20 ? 'linear-gradient(90deg,#C0321E,#E55342)' : s.pct < 40 ? 'linear-gradient(90deg,#9E7410,#D4A520)' : 'linear-gradient(90deg,#1A7A48,#27AE60)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick action cards below */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {ACTIONS.map(a => (
            <Link
              key={a.label}
              href="/auth/login"
              className="rounded-2xl p-5 flex items-start gap-3 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${a.color}22` }}
              >
                {a.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{a.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#5A6A80' }}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
