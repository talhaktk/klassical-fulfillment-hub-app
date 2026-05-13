import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Warehouse & Storage | Klassical Fulfillment UK',
  description: 'Secure UK warehousing built for ecommerce velocity. Pallet, shelf and bin storage with 24/7 CCTV, real-time stock visibility and same-day receiving in Luton.',
}

export default function WarehouseStoragePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      {/* Minimal nav */}
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
            <a href="#contact-cta" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}>Get a Quote</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg,#FAFBFD 0%,#F0F4FA 60%,#EAF0F8 100%)', padding: '80px 0 60px' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}>
            Service 01
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
            Warehouse &amp; Storage
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
            Secure UK warehousing built for ecommerce velocity. Pallet, shelf and bin storage with 24/7 CCTV and real-time stock visibility — all from our Luton facility.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#contact-cta" className="px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
              Start Storing with Us →
            </a>
            <Link href="/#pricing" className="px-7 py-3.5 rounded-xl text-sm font-semibold border" style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Details */}
      <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📦', title: 'Pallet, Shelf & Bin Storage', desc: 'Flexible storage options to suit your product types — from bulk pallets to individual bin locations for small items.' },
              { icon: '📹', title: '24/7 CCTV & Secure Facility', desc: 'Access-controlled facility with round-the-clock CCTV monitoring. Your stock is safe with us.' },
              { icon: '📊', title: 'Real-Time Stock Visibility', desc: 'Log in to your seller portal anytime to see live stock levels, location data and cycle count history.' },
              { icon: '✅', title: 'Same-Day GRN Processing', desc: 'Every inbound shipment is logged, barcoded and condition-reported on the same day it arrives.' },
              { icon: '🌡️', title: 'Climate-Controlled Zones', desc: 'Available on request for temperature-sensitive products, cosmetics, supplements and premium goods.' },
              { icon: '🔔', title: 'Low-Stock Alerts', desc: 'Automated alerts sent to your portal and by WhatsApp when any SKU drops below your set reorder threshold.' },
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

      {/* Pricing callout */}
      <section style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Storage Pricing</h2>
          <p className="text-base mb-8" style={{ color: '#7A8BA0' }}>Storage is billed weekly per pallet at market rates. Receiving & handling charged per box by weight.</p>
          <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid #E8ECF2' }}>
            {[
              { label: 'Receiving & Forwarding', rate: '£3.40 per box' },
              { label: 'Box under 12 kg',        rate: '£3.40 per box' },
              { label: 'Box 12–25 kg',            rate: '£4.40 per box' },
              { label: 'Box over 25 kg',          rate: '£5.40 per box' },
              { label: 'Pallet in / out',         rate: '£12.00 per pallet' },
              { label: 'Weekly storage',          rate: 'from £8 / pallet' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between px-6 py-3.5" style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFD', borderBottom: i < 5 ? '1px solid #F0F4FA' : 'none' }}>
                <span className="text-sm" style={{ color: '#4A5A70' }}>{r.label}</span>
                <span className="text-sm font-semibold" style={{ color: '#C8971A' }}>{r.rate}</span>
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 text-sm" style={{ color: '#7A8BA0' }}>
            🎉 <span><strong style={{ color: '#C8971A' }}>New sellers get 2 months free storage.</strong> Ask us when you apply.</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact-cta" style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Ready to store with us?</h2>
          <p className="text-base mb-8" style={{ color: '#7A8BA0' }}>Get a tailored storage quote within one working day.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/#contact" className="px-8 py-4 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
              Get a Quote →
            </Link>
            <a href="https://wa.me/447776387877" className="px-8 py-4 rounded-xl text-sm font-semibold border" style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff' }}>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
