const REASONS = [
  {
    icon: '⚡',
    title: 'Same-Day Dispatch',
    desc: 'Orders received before 2pm are picked, packed and dispatched the same day. Automatic tracking updates sent to your customers.',
    accent: '#D4A520',
  },
  {
    icon: '📊',
    title: 'Real-Time Inventory Portal',
    desc: 'Log in to your seller portal anytime to see live stock levels, pending orders, dispatched shipments and invoices — all in one place.',
    accent: '#2A6DC8',
  },
  {
    icon: '📦',
    title: 'Custom Branded Packaging',
    desc: 'Tissue paper, branded boxes, thank-you inserts, bubble wrap, ribbon — we build the unboxing experience your customers remember.',
    accent: '#1A7A48',
  },
  {
    icon: '🔄',
    title: 'Seamless Returns Management',
    desc: 'Returns are inspected, catalogued and restocked with full condition reporting. Damaged items documented for insurance and disputes.',
    accent: '#C0321E',
  },
  {
    icon: '🤝',
    title: 'Dedicated Account Manager',
    desc: 'Every seller gets a named account manager reachable by phone, email and WhatsApp. No call centres, no ticket queues.',
    accent: '#8B5CF6',
  },
  {
    icon: '🔗',
    title: 'Platform Integrations',
    desc: 'Shopify, Amazon FBA/FBM, TikTok Shop, WooCommerce and more. Orders pulled automatically. Tracking pushed back on fulfillment.',
    accent: '#C8971A',
  },
]

export default function WhyKlassical() {
  return (
    <section id="why" style={{ background: '#F4F6FA' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(200,151,26,.12)', color: '#9E7410', border: '1px solid rgba(200,151,26,.25)' }}
          >
            Why Klassical
          </div>
          <h2
            className="text-4xl font-black mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Built for growth-focused sellers
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#7A8BA0' }}>
            We don't just store boxes. We're your fulfillment partner — invested in your customer experience and your margins.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map(r => (
            <div
              key={r.title}
              className="bg-white rounded-2xl p-6 transition-all hover:-translate-y-1"
              style={{ border: '1px solid #E8ECF2', borderTop: `3px solid ${r.accent}`, boxShadow: '0 2px 8px rgba(14,32,64,.04)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${r.accent}18` }}
              >
                {r.icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: '#0E2040' }}>{r.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
