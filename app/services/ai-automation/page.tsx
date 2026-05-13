import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Automation | Klassical Fulfillment UK',
  description: 'Automate your fulfillment operations. AI-powered inventory replenishment, automated order routing, smart courier selection and the Klassical Seller Portal.',
}

export default function AIAutomationPage() {
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
            <Link href="/auth/login" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}>Access Hub</Link>
          </div>
        </div>
      </nav>

      <section style={{ background: 'linear-gradient(150deg,#FAFBFD 0%,#F0F4FA 60%,#EAF0F8 100%)', padding: '80px 0 60px' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(139,92,246,.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,.25)' }}>
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" /> Service 04 · Live & Growing
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>AI Automation</h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
            Automate your operations worldwide. Our seller portal is live now — AI-powered features like inventory replenishment forecasting and smart courier selection are actively being built.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/login" className="px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
              🔐 Access Seller Portal
            </Link>
            <a href="/#contact" className="px-7 py-3.5 rounded-xl text-sm font-semibold border" style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff' }}>
              Get Early Access
            </a>
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          {/* Live now */}
          <div className="mb-10">
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(26,122,72,.1)', color: '#1A7A48', border: '1px solid rgba(26,122,72,.25)' }}>
              ● Live Now
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '📊', title: 'Real-Time Seller Dashboard', desc: 'Log in to see all your orders, stock levels, dispatches and invoices in one place — updated live.' },
                { icon: '🏷️', title: 'Bulk Label Upload', desc: 'Upload shipping labels in bulk. Review every order before confirming — no accidental label creation.' },
                { icon: '💷', title: 'Auto Invoicing', desc: 'Handling, prep and branding fees calculated and invoiced automatically on every inbound shipment.' },
                { icon: '🔗', title: 'Multi-Platform Order Pull', desc: 'Orders pulled automatically from Shopify, Amazon FBM, TikTok Shop, WooCommerce and eBay.' },
                { icon: '💬', title: 'Direct Warehouse Messaging', desc: 'Message the team directly from your portal — no email chains, no waiting for a reply to a ticket.' },
                { icon: '📈', title: 'Stock Level Alerts', desc: 'Automated low-stock notifications when any SKU drops below your set reorder threshold.' },
              ].map(f => (
                <div key={f.title} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', borderTop: '3px solid #1A7A48' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(26,122,72,.1)' }}>{f.icon}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#0E2040' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coming soon */}
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(139,92,246,.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,.25)' }}>
              🛠 In Development
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '🤖', title: 'AI Inventory Replenishment', desc: 'Automatic reorder suggestions based on velocity, lead time and sales forecasts — powered by your own data.' },
                { icon: '🚚', title: 'Smart Courier Selection', desc: 'AI selects the best carrier for every shipment based on cost, speed, SLA and historical performance.' },
                { icon: '📲', title: 'WhatsApp Dispatch Alerts', desc: 'Automated dispatch confirmations sent directly to your customers via WhatsApp Business.' },
                { icon: '📷', title: 'Packing Photo Evidence', desc: 'Photo of every packed order before dispatch — logged in your portal and shared on demand.' },
              ].map(f => (
                <div key={f.title} className="rounded-2xl p-6" style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', borderTop: '3px solid #8B5CF6', opacity: 0.85 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(139,92,246,.1)' }}>{f.icon}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#0E2040' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Access the Hub today</h2>
          <p className="text-base mb-8" style={{ color: '#7A8BA0' }}>The seller portal is live. Staff and seller logins available — ask us for your credentials.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className="px-8 py-4 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.3)' }}>
              🔐 Login to Hub →
            </Link>
            <a href="/#contact" className="px-8 py-4 rounded-xl text-sm font-semibold border" style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff' }}>
              Request Seller Access
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
