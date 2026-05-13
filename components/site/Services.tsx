'use client'

const SERVICES = [
  {
    num: '01',
    icon: '🏭',
    title: 'Warehouse & Storage',
    tagline: 'Secure UK warehousing built for ecommerce velocity.',
    items: [
      'Pallet, shelf and bin storage options',
      '24/7 CCTV and access-controlled facility',
      'Real-time stock visibility & cycle counts',
    ],
    accent: '#C8971A',
    href: '/services/warehouse-storage',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Prep & Fulfillment',
    tagline: 'Pick, pack and dispatch — done your way.',
    items: [
      'Same-day dispatch with 3 PM cut-off',
      'FBA prep: FNSKU labels, poly bags, bundles',
      'Custom inserts, thank-you notes & branded tissue',
    ],
    accent: '#C8971A',
    href: '/services/prep-fulfillment',
  },
  {
    num: '03',
    icon: '🌐',
    title: 'Sourcing, Inspection & Logistics',
    tagline: 'China to your warehouse — sourced, inspected, shipped.',
    items: [
      'Branded & non-branded product sourcing in China',
      'Verified factory & supplier network',
      'Physical pre-shipment inspection team in China',
    ],
    accent: '#C8971A',
    href: '/services/sourcing-inspection',
  },
  {
    num: '04',
    icon: '🤖',
    title: 'AI Automation',
    tagline: 'Automate your operations worldwide.',
    items: [
      'AI-powered inventory replenishment & forecasting',
      'Automated order routing across marketplaces',
      'Smart courier selection by cost, speed & SLA',
    ],
    accent: '#C8971A',
    href: '/services/ai-automation',
  },
]

export default function Services() {
  return (
    <section id="services" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="mb-14">
          <div
            className="text-xs font-bold uppercase tracking-[3px] mb-5"
            style={{ color: '#C8971A' }}
          >
            What We Do
          </div>
          <h2
            className="text-5xl lg:text-6xl font-black mb-6 leading-[1.05]"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Four services.<br />
            <span style={{ color: '#C8971A' }}>One trusted partner.</span>
          </h2>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: '#5A6A80' }}>
            From sourcing in China to AI-powered automation worldwide — Klassical handles every step of your supply chain so you can focus on growing your brand.
          </p>
        </div>

        {/* Service cards — 4-column grid matching reference */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map(s => (
            <div
              key={s.title}
              className="rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 group"
              style={{
                background: '#FAFAF8',
                border: '1px solid #E8E4DC',
                boxShadow: '0 2px 12px rgba(10,22,40,.04)',
              }}
            >
              {/* Icon + number row */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(200,151,26,.12)', border: '1px solid rgba(200,151,26,.2)' }}
                >
                  {s.icon}
                </div>
                <div
                  className="text-2xl font-black leading-none"
                  style={{ color: '#E8E4DC', fontFamily: 'Playfair Display, serif', letterSpacing: -1 }}
                >
                  {s.num}
                </div>
              </div>

              {/* Content */}
              <h3
                className="font-black text-lg mb-2 leading-tight"
                style={{ color: '#0A1628', fontFamily: 'Playfair Display, serif' }}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: '#7A8BA0' }}>
                {s.tagline}
              </p>

              <ul className="space-y-1.5 mb-6">
                {s.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs" style={{ color: '#6A7D9A' }}>
                    <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#C8971A' }} />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={s.href}
                className="text-sm font-semibold flex items-center gap-1 transition-all group-hover:gap-2"
                style={{ color: '#C8971A' }}
              >
                Explore service <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
