const PREP_SERVICES = [
  { label: 'FNSKU Labelling',          rate: '£0.70 per unit' },
  { label: 'Poly Bagging',             rate: '£0.60 per unit' },
  { label: 'Bubble Wrap',              rate: '£0.75 per unit' },
  { label: 'Shipping Label Application', rate: '£0.75 per box' },
]

const BUNDLING_SERVICES = [
  { label: 'Bundle (2 units)',          rate: '£1.00 per unit' },
  { label: 'Bundle (3 units)',          rate: '£1.10 per unit' },
  { label: 'Additional Unit (over 3)',  rate: '+ £0.60 per unit' },
]

const RECEIVING_HANDLING = [
  { label: 'Receiving & Forwarding', rate: '£3.40 per box' },
  { label: 'Box under 12 kg',        rate: '£3.40 per box' },
  { label: 'Box 12–25 kg',           rate: '£4.40 per box' },
  { label: 'Box over 25 kg',         rate: '£5.40 per box' },
]

function RateTable({ title, rows }: { title: string; rows: { label: string; rate: string }[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E4DC' }}>
      {/* Gold header matching reference */}
      <div
        className="px-5 py-4"
        style={{ background: 'linear-gradient(135deg,#C8971A,#D4A520)' }}
      >
        <div className="font-bold text-sm text-white">{title}</div>
      </div>
      <div style={{ background: '#FAFAF8' }}>
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid #F0EDE8' : 'none',
              background: i % 2 === 0 ? '#fff' : '#FAFAF8',
            }}
          >
            <span className="text-sm" style={{ color: '#4A5A70' }}>{row.label}</span>
            <span className="text-sm font-semibold" style={{ color: '#C8971A' }}>{row.rate}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="mb-14">
          <div
            className="text-xs font-bold uppercase tracking-[3px] mb-5"
            style={{ color: '#C8971A' }}
          >
            Transparent Pricing
          </div>
          <h2
            className="text-5xl lg:text-6xl font-black mb-6 leading-[1.05]"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Simple per-unit rates.<br />
            No surprises.
          </h2>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: '#5A6A80' }}>
            Pay for exactly what you use. No minimum order quantity for your first three months — scale with us at your own pace.
          </p>
        </div>

        {/* Three rate tables */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <RateTable title="Prep Services"          rows={PREP_SERVICES} />
          <RateTable title="Bundling Services"      rows={BUNDLING_SERVICES} />
          <RateTable title="Receiving & Box Handling" rows={RECEIVING_HANDLING} />
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-sm" style={{ color: '#7A8BA0' }}>
            Need a custom quote for high volumes or bespoke kitting?{' '}
            <a href="#contact" className="font-semibold transition-colors" style={{ color: '#C8971A' }}>
              Talk to our team →
            </a>
          </p>
          <p className="text-xs mt-2" style={{ color: '#B8C4D4' }}>
            All prices exclusive of VAT. Storage billed separately. Free 2-month storage for new sellers.
          </p>
        </div>
      </div>
    </section>
  )
}
