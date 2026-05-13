'use client'
import { useState } from 'react'
import Link from 'next/link'

const BENEFITS = [
  {
    icon: '💸',
    title: 'Recurring Commission',
    desc: "Earn a percentage of every invoice we raise for clients you refer — for as long as they stay with us.",
    color: '#C8971A',
  },
  {
    icon: '🖥️',
    title: 'White-Label Portal',
    desc: "A dedicated agency portal so you can monitor every client's stock, dispatch and SLA in one screen.",
    color: '#2A4F8A',
  },
  {
    icon: '📋',
    title: 'Co-Branded Reports',
    desc: "Send beautiful monthly fulfilment reports to your clients under your agency's brand.",
    color: '#1A7A48',
  },
  {
    icon: '⚡',
    title: 'Priority Onboarding',
    desc: "Your clients skip the queue and get a dedicated account manager from day one.",
    color: '#8B5CF6',
  },
]

const TIERS = [
  {
    name:      'Referral Partner',
    rate:      '10% RECURRING',
    desc:      'Send us a client. Earn commission on every invoice for 12 months. No commitment.',
    highlight: false,
  },
  {
    name:      'Growth Partner',
    rate:      '15% RECURRING',
    desc:      '3+ active clients with us. Higher commission, white-label reports and a dedicated success manager.',
    highlight: true,
  },
  {
    name:      'Strategic Agency',
    rate:      'CUSTOM',
    desc:      '10+ active clients. Full white-label portal, co-marketing and bespoke per-client pricing.',
    highlight: false,
  },
]

export default function PartnerProgramPage() {
  const [form, setForm] = useState({ name: '', agency: '', email: '', phone: '', clients: 'Just me / 1 brand', about: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      {/* Announcement bar */}
      <div className="text-center text-xs font-medium px-4 py-2.5" style={{ background: 'linear-gradient(90deg,#7A5810,#C8971A,#E8B830,#C8971A,#7A5810)', color: '#0A1628' }}>
        📋 Now offering <strong>custom physical notes</strong> with every order · Seller Dashboard launching soon
      </div>

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.98)', borderBottom: '1px solid #E8ECF2', boxShadow: '0 2px 16px rgba(10,22,40,.08)' }}>
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif' }}>KH</div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Klassical</div>
              <div className="text-[9px] uppercase tracking-[2px]" style={{ color: '#C8971A' }}>Logistics &amp; Fulfillment UK</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-0.5">
            {([['About', '/#why'], ['Services', '/#services'], ['Platforms', '/#partners'], ['Digital Hub', '/#digital-hub'], ['Partner Program', '/partner-program'], ['Pricing', '/#pricing'], ['Contact', '/#contact']] as [string, string][]).map(([label, href]) => (
              <Link key={label} href={href} className="px-3 py-2 rounded-lg text-[13px] transition-colors"
                style={{ color: label === 'Partner Program' ? '#C8971A' : '#4A5A70', fontWeight: label === 'Partner Program' ? 700 : 500 }}>
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold" style={{ background: '#F0F4FA', border: '1px solid #D0D8E8', color: '#2A4F8A' }}>🔐 Hub Login</Link>
            <Link href="/#contact" className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 4px 12px rgba(200,151,26,.3)' }}>Get a Quote</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg,#FAFBFD 0%,#F0F4FA 60%,#EAF0F8 100%)', minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(10,22,40,.07)', border: '1px solid rgba(10,22,40,.12)', color: '#2A4F8A' }}>
            🤝 For Agencies, VAs &amp; Consultants
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.02]"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
            Grow your agency on top of{' '}
            <span style={{ color: '#C8971A' }}>Klassical fulfilment.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: '#5A6A80' }}>
            Add a premium UK 3PL to your service stack. Earn recurring commission, manage every client from one portal, and ship beautifully under your own brand.
          </p>
          <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold"
            style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', boxShadow: '0 8px 24px rgba(200,151,26,.35)' }}>
            Apply to the Program →
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                style={{ background: '#F8F9FC', border: '1px solid #E8ECF2', borderTop: `3px solid ${b.color}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: `${b.color}18` }}>
                  {b.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0A1628' }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A8BA0' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Tiers */}
      <section style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="mb-10 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(200,151,26,.12)', color: '#9E7410', border: '1px solid rgba(200,151,26,.25)' }}>
              Partner Tiers
            </div>
            <h2 className="text-4xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
              Pick the lane that fits your agency.
            </h2>
            <p className="text-base" style={{ color: '#7A8BA0' }}>Move up automatically as your client base grows with us.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map(t => (
              <div key={t.name} className="rounded-2xl overflow-hidden"
                style={{ border: t.highlight ? '2px solid #C8971A' : '1px solid #E8ECF2', boxShadow: t.highlight ? '0 8px 32px rgba(200,151,26,.15)' : '0 2px 8px rgba(10,22,40,.04)' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)' }}>
                  <span className="font-bold text-sm text-white">{t.name}</span>
                  <span className="text-xs font-black text-white opacity-90">{t.rate}</span>
                </div>
                <div className="p-5 bg-white">
                  <p className="text-sm leading-relaxed" style={{ color: '#5A6A80' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" style={{ background: '#fff', borderTop: '1px solid #E8ECF2' }}>
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left info */}
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ background: 'rgba(200,151,26,.12)', color: '#9E7410', border: '1px solid rgba(200,151,26,.25)' }}>
                Apply
              </div>
              <h2 className="text-5xl font-black mb-5 leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
                Become a Klassical partner.
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#5A6A80' }}>
                Tell us about your agency and the kind of brands you work with. We'll set up an intro call within two business days and walk you through the portal.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#F0F4FA', border: '1px solid #D0D8E8' }}>
                <span className="text-base mt-0.5">🛡️</span>
                <p className="text-sm" style={{ color: '#5A6A80' }}>
                  Operated by <strong style={{ color: '#0A1628' }}>KLASSICAL HOLDINGS LTD</strong> · Companies House <strong style={{ color: '#0A1628' }}>#16964688</strong>
                </p>
              </div>
            </div>

            {/* Right form */}
            <div>
              {status === 'sent' ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: '#F0F4FA', border: '1px solid #D0D8E8' }}>
                  <div className="text-5xl mb-4">🎉</div>
                  <div className="text-2xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>Application received!</div>
                  <p className="text-sm" style={{ color: '#7A8BA0' }}>We'll be in touch within two business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-7 bg-white" style={{ border: '1px solid #E8ECF2', boxShadow: '0 4px 24px rgba(14,32,64,.06)' }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[['YOUR NAME', 'name', true], ['AGENCY NAME', 'agency', false]].map(([label, key, req]) => (
                      <div key={key as string}>
                        <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>{label as string}</label>
                        <input required={req as boolean} type="text" className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                          style={{ borderColor: '#D0D8E8', color: '#0E2040', background: '#fff' }}
                          onFocus={e => (e.target.style.borderColor = '#C8971A')} onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                          value={(form as Record<string, string>)[key as string]}
                          onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>EMAIL</label>
                    <input required type="email" className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                      style={{ borderColor: '#D0D8E8', color: '#0E2040', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')} onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>PHONE / WHATSAPP</label>
                    <input type="tel" className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                      style={{ borderColor: '#D0D8E8', color: '#0E2040', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')} onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>HOW MANY CLIENTS COULD BENEFIT?</label>
                    <select className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none"
                      style={{ borderColor: '#D0D8E8', color: '#0E2040', background: '#fff' }}
                      value={form.clients} onChange={e => setForm(f => ({ ...f, clients: e.target.value }))}>
                      <option>Just me / 1 brand</option>
                      <option>2–5 clients</option>
                      <option>6–10 clients</option>
                      <option>10+ clients</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>TELL US ABOUT YOUR AGENCY</label>
                    <textarea rows={4} className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all resize-none"
                      style={{ borderColor: '#D0D8E8', color: '#0E2040', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')} onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                      placeholder="Niche, services, current fulfilment partners..."
                      value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
                  </div>
                  <button type="submit" disabled={status === 'sending'} className="w-full py-4 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff', opacity: status === 'sending' ? 0.7 : 1, boxShadow: '0 6px 20px rgba(200,151,26,.3)' }}>
                    {status === 'sending' ? 'Sending…' : 'Apply to the program'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="py-6 text-center text-xs" style={{ background: '#F4F6FA', borderTop: '1px solid #E8ECF2', color: '#B8C4D4' }}>
        © {new Date().getFullYear()} Klassical Holdings Ltd · 25 Waleys Close, Luton, LU3 3RZ ·{' '}
        <Link href="/" className="font-semibold" style={{ color: '#C8971A' }}>← Back to main site</Link>
      </div>
    </div>
  )
}
