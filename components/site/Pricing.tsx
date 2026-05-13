const PREP_SERVICES = [
  { service: 'Poly-bagging (per unit)',           price: '£0.25' },
  { service: 'Labelling — FNSKU / barcode',       price: '£0.10' },
  { service: 'Bubble wrap (per item)',             price: '£0.15' },
  { service: 'Tissue paper + ribbon (per order)', price: '£0.40' },
  { service: 'Thank-you insert / flyer',          price: '£0.10' },
  { service: 'Custom outer box branding',         price: 'from £0.60' },
  { service: 'Returns inspection & restock',      price: '£1.50' },
  { service: 'Quality control check (per unit)',  price: '£0.20' },
]

const BUNDLING_SERVICES = [
  { service: '2-item bundle kit',          price: '£0.50' },
  { service: '3–5 item bundle kit',        price: '£0.85' },
  { service: '6–10 item bundle kit',       price: '£1.20' },
  { service: 'Subscription box (per box)', price: 'from £1.50' },
  { service: 'Kitting & assembly',         price: 'POA' },
]

const HANDLING_RATES = [
  { weight: 'Box under 12 kg',  rate: '£3.40 / box' },
  { weight: 'Box 12–25 kg',     rate: '£5.00 / box' },
  { weight: 'Box over 25 kg',   rate: '£7.50 / box' },
  { weight: 'Receiving & forwarding', rate: '£2.50 / box' },
  { weight: 'Pallet in / out',  rate: '£12.00 / pallet' },
  { weight: 'Storage (weekly)', rate: 'from £8 / pallet' },
]

const PLANS = [
  {
    name:      'Starter',
    price:     '£2.50',
    unit:      'per order',
    sub:       'Up to 200 orders/month',
    badge:     null,
    features: [
      'Same-day dispatch',
      'Real-time seller portal access',
      'Standard packaging',
      'Email support',
      'Monthly invoicing',
      '1 carrier integration',
    ],
    cta:       'Get Started',
    highlight: false,
  },
  {
    name:      'Growth',
    price:     '£2.00',
    unit:      'per order',
    sub:       '200–1,000 orders/month',
    badge:     'Most Popular',
    features: [
      'Everything in Starter',
      'Custom branded packaging',
      'Dedicated account manager',
      'WhatsApp & phone support',
      'Returns processing included',
      'All carrier integrations',
      'Monthly performance report',
    ],
    cta:       'Start with Growth',
    highlight: true,
  },
  {
    name:      'Enterprise',
    price:     'Custom',
    unit:      'pricing',
    sub:       '1,000+ orders/month',
    badge:     null,
    features: [
      'Everything in Growth',
      'Volume-based rate negotiation',
      'B2B & pallet dispatch',
      'SLA guarantees in writing',
      'Dedicated warehouse zone',
      'Priority onboarding',
      'Custom integrations',
    ],
    cta:       'Talk to Us',
    highlight: false,
  },
]

function RateTable({ title, rows, col1, col2 }: {
  title: string
  rows: { [k: string]: string }[]
  col1: string
  col2: string
}) {
  const keys = Object.keys(rows[0])
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8ECF2' }}>
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ background: '#F0F4FA', borderBottom: '1px solid #E8ECF2' }}
      >
        <div className="font-bold text-sm" style={{ color: '#0A1628' }}>{title}</div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#FAFBFD', borderBottom: '1px solid #E8ECF2' }}>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide font-bold" style={{ color: '#7A8BA0' }}>{col1}</th>
            <th className="text-right px-5 py-2.5 text-[11px] uppercase tracking-wide font-bold" style={{ color: '#7A8BA0' }}>{col2}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid #F0F4FA' : 'none', background: i % 2 === 0 ? '#fff' : '#FAFBFD' }}
            >
              <td className="px-5 py-3" style={{ color: '#4A5A70' }}>{row[keys[0]]}</td>
              <td className="px-5 py-3 text-right font-semibold" style={{ color: '#0A1628' }}>{row[keys[1]]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" style={{ background: '#F4F6FA' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(200,151,26,.12)', color: '#9E7410', border: '1px solid rgba(200,151,26,.25)' }}
          >
            Transparent Pricing
          </div>
          <h2
            className="text-4xl font-black mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Simple, volume-based rates
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#7A8BA0' }}>
            No hidden fees. No setup costs. Straightforward fulfillment pricing that scales with your business.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col relative transition-all hover:-translate-y-0.5"
              style={{
                background: plan.highlight ? '#fff' : '#fff',
                border: plan.highlight ? '2px solid #C8971A' : '1px solid #E8ECF2',
                boxShadow: plan.highlight ? '0 8px 32px rgba(200,151,26,.18)' : '0 2px 8px rgba(10,22,40,.04)',
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#7A8BA0' }}>{plan.name}</div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: 'Playfair Display, serif', color: plan.highlight ? '#C8971A' : '#0A1628' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: '#7A8BA0' }}>{plan.unit}</span>
                </div>
                <div className="text-xs" style={{ color: '#B8C4D4' }}>{plan.sub}</div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#6A7D9A' }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: '#C8971A' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="block text-center py-3 rounded-xl text-sm font-bold transition-all"
                style={
                  plan.highlight
                    ? { background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }
                    : { background: '#F0F4FA', color: '#0A1628', border: '1px solid #D0D8E8' }
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Detailed Rate Tables */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}
          >
            Full Rate Card
          </div>
          <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
            Itemised service rates
          </h3>
          <p className="text-sm" style={{ color: '#7A8BA0' }}>All prices exclusive of VAT. Custom rates available for high volumes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <RateTable
            title="Prep Services"
            col1="Service"
            col2="Rate"
            rows={PREP_SERVICES.map(r => ({ service: r.service, price: r.price }))}
          />
          <RateTable
            title="Bundling Services"
            col1="Bundle Type"
            col2="Rate"
            rows={BUNDLING_SERVICES.map(r => ({ service: r.service, price: r.price }))}
          />
          <RateTable
            title="Receiving & Box Handling"
            col1="Weight Category"
            col2="Rate"
            rows={HANDLING_RATES.map(r => ({ weight: r.weight, rate: r.rate }))}
          />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#B8C4D4' }}>
          Storage billed at market rates per pallet per week. Carrier charges passed through at cost. Free 2-month storage for new sellers — ask us.
        </p>
      </div>
    </section>
  )
}
