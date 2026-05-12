const STATS = [
  { val: '25,000+', label: 'Orders Fulfilled',       icon: '📦' },
  { val: '200+',    label: 'Sellers Served',          icon: '🤝' },
  { val: '99.2%',   label: 'On-Time Dispatch Rate',   icon: '⚡' },
  { val: '2pm',     label: 'Same-Day Cutoff',         icon: '🕑' },
]

export default function StatsBar() {
  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #E8ECF2' }}>
      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map(s => (
          <div key={s.label} className="text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div
              className="text-3xl font-black mb-1"
              style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
            >
              {s.val}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7A8BA0' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
