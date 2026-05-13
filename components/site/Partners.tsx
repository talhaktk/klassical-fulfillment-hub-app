'use client'

const PLATFORMS = [
  { name: 'Shopify',       logo: '/images/logos/shopify.svg',      bg: '#f6f6f6',  h: 44 },
  { name: 'Amazon',        logo: '/images/logos/amazon.svg',       bg: '#ffffff',  h: 36 },
  { name: 'TikTok Shop',   logo: '/images/logos/tiktok.svg',       bg: '#f6f6f6',  h: 44 },
  { name: 'WooCommerce',   logo: '/images/logos/woocommerce.svg',  bg: '#f6f6f6',  h: 38 },
  { name: 'eBay',          logo: '/images/logos/ebay.svg',         bg: '#ffffff',  h: 44 },
]

const CARRIERS = [
  { name: 'Royal Mail',    logo: '/images/logos/royalmail.svg',    bg: '#fff0f0',  h: 36 },
  { name: 'DPD',           logo: '/images/logos/dpd.svg',          bg: '#DC0032',  h: 42 },
  { name: 'Evri',          logo: '/images/logos/evri.svg',         bg: '#9B59B6',  h: 42 },
  { name: 'Parcelforce',   logo: '/images/logos/parcelforce.svg',  bg: '#fff5f0',  h: 36 },
  { name: 'UPS',           logo: '/images/logos/ups.svg',          bg: '#f8f4f2',  h: 40 },
  { name: 'FedEx',         logo: '/images/logos/fedex.svg',        bg: '#4D148C',  h: 42 },
]

function LogoRow({ items }: { items: typeof PLATFORMS }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {items.map(p => (
        <div
          key={p.name}
          className="flex items-center justify-center px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            background: p.bg,
            border: '1px solid rgba(0,0,0,.08)',
            minWidth: 130,
            height: 64,
            boxShadow: '0 2px 8px rgba(0,0,0,.07)',
          }}
        >
          <img
            src={p.logo}
            alt={p.name}
            style={{ height: p.h, maxWidth: 160, objectFit: 'contain' }}
          />
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
          <div className="text-[10px] uppercase tracking-[2px] font-bold mb-5" style={{ color: '#B8C4D4' }}>Sales Platforms</div>
          <LogoRow items={PLATFORMS} />
        </div>

        <div className="w-full h-px my-8" style={{ background: '#E8ECF2' }} />

        <div>
          <div className="text-[10px] uppercase tracking-[2px] font-bold mb-5" style={{ color: '#B8C4D4' }}>Carriers &amp; Couriers</div>
          <LogoRow items={CARRIERS} />
        </div>

        <p className="text-xs mt-8" style={{ color: '#B8C4D4' }}>
          Don't see your platform? We build custom integrations — just ask.
        </p>
      </div>
    </section>
  )
}
