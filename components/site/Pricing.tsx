const PLANS = [
  {
    name:     'Starter',
    price:    '£2.50',
    unit:     'per order',
    sub:      'Up to 200 orders/month',
    badge:    null,
    features: [
      'Same-day dispatch',
      'Real-time seller portal',
      'Standard packaging',
      'Email support',
      'Monthly invoicing',
      '1 carrier integration',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name:     'Growth',
    price:    '£2.00',
    unit:     'per order',
    sub:      '200–1,000 orders/month',
    badge:    'Most Popular',
    features: [
      'Everything in Starter',
      'Custom branded packaging',
      'Dedicated account manager',
      'WhatsApp & phone support',
      'Returns processing included',
      'All carrier integrations',
      'Monthly performance report',
    ],
    cta: 'Start with Growth',
    highlight: true,
  },
  {
    name:     'Enterprise',
    price:    'Custom',
    unit:     'pricing',
    sub:      '1,000+ orders/month',
    badge:    null,
    features: [
      'Everything in Growth',
      'Volume-based rate negotiation',
      'B2B & pallet dispatch',
      'SLA guarantees in writing',
      'Dedicated warehouse zone',
      'Priority onboarding',
      'Custom integrations',
    ],
    cta: 'Talk to Us',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{ background: 'linear-gradient(135deg,#060E1C 0%,#0A1628 60%,#0E2040 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(200,151,26,.12)', color: '#D4A520', border: '1px solid rgba(200,151,26,.25)' }}
          >
            Transparent Pricing
          </div>
          <h2
            className="text-4xl font-black mb-4 text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Simple, volume-based rates
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6A7D9A' }}>
            No hidden fees. No setup costs. Just straightforward fulfillment pricing that scales with your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col relative transition-all"
              style={{
                background: plan.highlight ? 'rgba(200,151,26,.1)' : 'rgba(255,255,255,.04)',
                border: plan.highlight ? '2px solid rgba(200,151,26,.5)' : '1px solid rgba(255,255,255,.1)',
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#7A8BA0' }}>{plan.name}</div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: 'Playfair Display, serif', color: plan.highlight ? '#D4A520' : '#fff' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: '#7A8BA0' }}>{plan.unit}</span>
                </div>
                <div className="text-xs" style={{ color: '#5A6A80' }}>{plan.sub}</div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#8A9BB8' }}>
                    <span className="mt-0.5 flex-shrink-0 text-[#C8971A]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="block text-center py-3 rounded-xl text-sm font-bold transition-all"
                style={
                  plan.highlight
                    ? { background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }
                    : { background: 'rgba(255,255,255,.08)', color: '#B8C4D4', border: '1px solid rgba(255,255,255,.15)' }
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: '#4A5A70' }}>
          Storage billed separately at market rates per pallet per week. All prices exclusive of VAT.
        </p>
      </div>
    </section>
  )
}
