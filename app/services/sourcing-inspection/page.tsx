import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sourcing, Inspection & Logistics | Klassical Fulfillment UK',
  description: 'China to your UK warehouse — branded and non-branded product sourcing, pre-shipment quality inspection, freight coordination and customs handling.',
}

export default function SourcingInspectionPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      <nav style={{ background: 'rgba(255,255,255,0.98)', borderBottom: '1px solid #E8ECF2', boxShadow: '0 2px 16px rgba(10,22,40,.08)' }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif' }}>KH</div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Klassical</div>
              <div className="text-[9px] uppercase tracking-[2px]" style={{ color: '#C8971A' }}>Logistics &amp; Fulfillment UK</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/#services" className="text-sm font-medium" style={{ color: '#4A5A70' }}>← All Services</Link>
            <a href="/#contact" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}>Get a Quote</a>
          </div>
        </div>
      </nav>

      <section style={{ background: 'linear-gradient(150deg,#FAFBFD 0%,#F0F4FA 60%,#EAF0F8 100%)', padding: '80px 0 60px' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}>Service 03</div>
          <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
            Sourcing, Inspection<br />&amp; Logistics
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
            China to your warehouse — sourced, inspected, shipped. We work with verified factories, carry out quality checks on the ground, and manage inbound freight end-to-end.
          </p>
          <a href="/#contact" className="inline-block px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
            Enquire About Sourcing →
          </a>
        </div>
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🏭', title: 'Branded & Non-Branded Sourcing', desc: 'We source both branded products and white-label goods from verified Chinese manufacturers, matching your specifications.' },
              { icon: '🔍', title: 'Pre-Shipment Inspection', desc: 'Our physical team in China inspects your goods before they ship — quality, quantity, labelling and packaging checked at source.' },
              { icon: '🤝', title: 'Verified Factory Network', desc: 'Access to our network of vetted, trusted factories across clothing, electronics, homewares, cosmetics and more.' },
              { icon: '🚢', title: 'Freight & Customs Coordination', desc: 'Sea freight, air freight and express shipping. We handle customs documentation, duty payments and port clearance.' },
              { icon: '📦', title: 'Direct to Warehouse', desc: 'Goods land directly in our Luton facility, received same-day and available in your portal immediately.' },
              { icon: '📊', title: 'Landed Cost Breakdown', desc: 'Full transparency on factory cost, shipping, duties and our fees — so you know your exact unit economics before you order.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', borderTop: '3px solid #1A7A48' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(26,122,72,.12)' }}>{f.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0E2040' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Ready to source from China?</h2>
          <p className="text-base mb-8" style={{ color: '#7A8BA0' }}>Sourcing and inspection pricing is quoted per project. Tell us what you need and we'll get back within one working day.</p>
          <Link href="/#contact" className="inline-block px-8 py-4 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
            Get a Sourcing Quote →
          </Link>
        </div>
      </section>
    </div>
  )
}
