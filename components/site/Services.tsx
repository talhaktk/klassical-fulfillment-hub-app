'use client'

const SERVICES = [
  {
    num: '01',
    icon: '🏭',
    title: 'Warehouse & Storage',
    desc: 'Flexible pallet and shelving storage in our Luton facility. Every inbound shipment is logged, barcoded and condition-reported on the same day it arrives.',
    items: ['Pallet & shelving storage', 'Same-day GRN with condition reports', 'Barcode labelling on receipt', 'Real-time stock visibility'],
    image: '/images/warehouse-storage.jpg',
    accent: '#2A4F8A',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Prep & Fulfillment',
    desc: 'Orders received before 2pm are picked, packed and dispatched the same day. Multi-item, multi-SKU — we handle fragile, oversized and everything in between.',
    items: ['Same-day dispatch (2pm cutoff)', 'Multi-item & multi-SKU orders', 'Custom branded packaging', 'Tracked dispatch on every order'],
    image: '/images/warehouse-prep.jpg',
    accent: '#C8971A',
  },
  {
    num: '03',
    icon: '🌐',
    title: 'Sourcing, Inspection & Logistics',
    desc: 'We work with trusted suppliers to source products, carry out quality inspections, and manage inbound logistics — so your inventory arrives ready to sell.',
    items: ['Supplier sourcing & negotiation', 'Pre-shipment quality inspection', 'Customs & freight coordination', 'Amazon FBA prep & labelling'],
    image: '/images/warehouse-dispatch.jpg',
    accent: '#1A7A48',
  },
  {
    num: '04',
    icon: '🤖',
    title: 'AI Automation & Digital Hub',
    desc: 'Our seller portal gives you a live view of stock, orders and invoices. Upcoming AI features will auto-reorder stock, predict demand and flag anomalies.',
    items: ['Real-time seller dashboard', 'Automated order import from Shopify / Amazon / TikTok', 'AI-powered restock alerts', 'Monthly reports & invoicing'],
    image: null,
    accent: '#8B5CF6',
  },
]

export default function Services() {
  return (
    <section id="services" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}
          >
            Our Services
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Four services.<br />
            <span style={{ color: '#C8971A' }}>One trusted partner.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#7A8BA0' }}>
            From receiving your stock to putting it in your customer's hands — we handle the entire fulfillment lifecycle.
          </p>
        </div>

        {/* Service cards — alternating layout */}
        <div className="space-y-6">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all hover:-translate-y-0.5"
              style={{
                background: '#F8F9FC',
                border: '1px solid #E8ECF2',
                boxShadow: '0 2px 12px rgba(10,22,40,.05)',
                flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
              }}
            >
              {/* Image / accent panel */}
              <div
                className="md:w-64 lg:w-72 flex-shrink-0 flex items-center justify-center relative overflow-hidden min-h-[200px]"
                style={{ background: `linear-gradient(135deg,${s.accent}22,${s.accent}11)`, borderRight: i % 2 === 0 ? '1px solid #E8ECF2' : 'none', borderLeft: i % 2 === 1 ? '1px solid #E8ECF2' : 'none' }}
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover absolute inset-0 opacity-80"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : null}
                {/* Number watermark */}
                <div
                  className="relative z-10 font-black select-none"
                  style={{ fontSize: 96, lineHeight: 1, color: s.accent, opacity: s.image ? 0.15 : 0.12, fontFamily: 'Playfair Display, serif' }}
                >
                  {s.num}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${s.accent}18` }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[2px] font-bold mb-0.5" style={{ color: s.accent }}>
                      Service {s.num}
                    </div>
                    <h3 className="font-bold text-lg leading-tight" style={{ color: '#0E2040' }}>{s.title}</h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: '#6A7D9A' }}>{s.desc}</p>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {s.items.map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm" style={{ color: '#6A7D9A' }}>
                      <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: s.accent }}>→</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}
          >
            Get a Tailored Quote →
          </a>
        </div>
      </div>
    </section>
  )
}
