const PLATFORMS = [
  { name: 'Shopify',       bg: '#96BF48', color: '#fff',    letter: 'S'  },
  { name: 'Amazon',        bg: '#232F3E', color: '#FF9900', letter: 'a'  },
  { name: 'TikTok Shop',   bg: '#010101', color: '#fff',    letter: 'tt' },
  { name: 'WooCommerce',   bg: '#7F54B3', color: '#fff',    letter: 'W'  },
  { name: 'eBay',          bg: '#fff',    color: '#E53238', letter: 'e'  },
  { name: 'Etsy',          bg: '#F56400', color: '#fff',    letter: 'e'  },
]

const CARRIERS = [
  { name: 'Royal Mail',    bg: '#E22222', color: '#fff',    letter: 'RM' },
  { name: 'DPD',           bg: '#DC0032', color: '#fff',    letter: 'DPD'},
  { name: 'Evri',          bg: '#9B59B6', color: '#fff',    letter: 'ev' },
  { name: 'Parcelforce',   bg: '#E85100', color: '#fff',    letter: 'P'  },
  { name: 'UPS',           bg: '#5B3427', color: '#FFB500', letter: 'UPS'},
  { name: 'FedEx',         bg: '#4D148C', color: '#FF6600', letter: 'FX' },
]

function BadgeRow({ items }: { items: typeof PLATFORMS }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(p => (
        <div
          key={p.name}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{
            background: p.bg,
            color: p.color,
            border: p.bg === '#fff' ? '2px solid #E53238' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          }}
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.2)', letterSpacing: -0.5, fontFamily: 'Arial, sans-serif' }}
          >
            {p.letter.toUpperCase().slice(0, 2)}
          </span>
          <span style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '.2px' }}>{p.name}</span>
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
