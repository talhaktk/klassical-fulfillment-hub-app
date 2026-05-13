import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prep & Fulfillment | Klassical Fulfillment UK',
  description: 'Same-day pick, pack and dispatch from Luton. FBA prep, custom branded packaging, tracked dispatch on every order.',
}

export default function PrepFulfillmentPage() {
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
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}>Service 02</div>
          <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Prep &amp; Fulfillment</h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
            Pick, pack and dispatch — done your way. Same-day dispatch with a 3 PM cut-off. FBA prep, custom inserts, branded tissue, tracked on every single order.
          </p>
          <a href="/#contact" className="inline-block px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
            Start Fulfilling Today →
          </a>
        </div>
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '⚡', title: 'Same-Day Dispatch (3 PM cutoff)', desc: 'Orders received before 3 PM are picked, packed and dispatched the same day. Tracking uploaded automatically.' },
              { icon: '🏷️', title: 'FBA Prep & FNSKU Labelling', desc: 'Full Amazon FBA preparation — FNSKU labels, poly bags, bubble wrap, suffocation stickers and compliance packaging.' },
              { icon: '🎁', title: 'Custom Branded Packaging', desc: 'Branded tissue paper, ribbon, thank-you inserts, custom outer and inner boxes — we build the unboxing experience.' },
              { icon: '📦', title: 'Multi-SKU & Multi-Item Orders', desc: 'Complex orders, subscription boxes, kits and bundles handled accurately every time.' },
              { icon: '🔄', title: 'Returns Processing', desc: 'Returns inspected, condition-graded, restocked or quarantined with photo documentation in your portal.' },
              { icon: '🚛', title: 'All Major Carriers', desc: 'Royal Mail, DPD, Evri, Parcelforce, UPS, FedEx — we select the best carrier for every shipment.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', borderTop: '3px solid #C8971A' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(200,151,26,.12)' }}>{f.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0E2040' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Prep Service Rates</h2>
          <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid #E8ECF2' }}>
            {[
              { label: 'FNSKU Labelling',           rate: '£0.70 per unit' },
              { label: 'Poly Bagging',              rate: '£0.60 per unit' },
              { label: 'Bubble Wrap',               rate: '£0.75 per unit' },
              { label: 'Shipping Label Application', rate: '£0.75 per box' },
              { label: 'Bundle (2 units)',           rate: '£1.00 per unit' },
              { label: 'Bundle (3 units)',           rate: '£1.10 per unit' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between px-6 py-3.5" style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFD', borderBottom: i < 5 ? '1px solid #F0F4FA' : 'none' }}>
                <span className="text-sm" style={{ color: '#4A5A70' }}>{r.label}</span>
                <span className="text-sm font-semibold" style={{ color: '#C8971A' }}>{r.rate}</span>
              </div>
            ))}
          </div>
          <Link href="/#contact" className="inline-block px-8 py-4 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
            Get a Tailored Quote →
          </Link>
        </div>
      </section>
    </div>
  )
}
