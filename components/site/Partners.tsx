const PLATFORMS = [
  { name: 'Shopify',          bg: '#96BF48', color: '#fff',     icon: '🛍️' },
  { name: 'Amazon',           bg: '#FF9900', color: '#232F3E',  icon: '📦' },
  { name: 'TikTok Shop',      bg: '#010101', color: '#FF0050',  icon: '🎵' },
  { name: 'WooCommerce',      bg: '#7F54B3', color: '#fff',     icon: '🔌' },
  { name: 'eBay',             bg: '#E53238', color: '#fff',     icon: '🏷️' },
  { name: 'Etsy',             bg: '#F56400', color: '#fff',     icon: '🎨' },
]

const CARRIERS = [
  { name: 'Royal Mail',       bg: '#E22222', color: '#fff',     icon: '✉️' },
  { name: 'DPD',              bg: '#DC0032', color: '#fff',     icon: '🚐' },
  { name: 'Evri',             bg: '#9B59B6', color: '#fff',     icon: '📬' },
  { name: 'Parcelforce',      bg: '#E85100', color: '#fff',     icon: '📮' },
  { name: 'UPS',              bg: '#5B3427', color: '#FFB500',  icon: '🟤' },
  { name: 'FedEx',            bg: '#4D148C', color: '#FF6600',  icon: '✈️' },
]

function BadgeRow({ items }: { items: typeof PLATFORMS }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(p => (
        <div
          key={p.name}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', color: '#0E2040' }}
        >
          <span>{p.icon}</span>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function Partners() {
  return (
    <section id="partners" className="bg-white">
      <div className="max-w-5xl mx-auto px-5 py-20 text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}
        >
          Integrations
        </div>
        <h2
          className="text-4xl font-black mb-4"
          style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
        >
          Works with your platforms
        </h2>
        <p className="text-base max-w-xl mx-auto mb-10" style={{ color: '#7A8BA0' }}>
          Sell anywhere. Fulfill from one place. We connect to your sales channels and carrier accounts automatically.
        </p>

        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[2px] font-bold mb-4" style={{ color: '#B8C4D4' }}>Sales Platforms</div>
          <BadgeRow items={PLATFORMS} />
        </div>

        <div className="w-full h-px my-7" style={{ background: '#E8ECF2' }} />

        <div>
          <div className="text-[10px] uppercase tracking-[2px] font-bold mb-4" style={{ color: '#B8C4D4' }}>Carriers &amp; Couriers</div>
          <BadgeRow items={CARRIERS} />
        </div>

        <p className="text-xs mt-8" style={{ color: '#B8C4D4' }}>
          Don't see your platform? We build custom integrations — just ask.
        </p>
      </div>
    </section>
  )
}
