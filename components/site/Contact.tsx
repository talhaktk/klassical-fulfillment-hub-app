'use client'
import { useState } from 'react'

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', company: '', volume: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Submit to a form service or your own API
    // For now, we simulate success after 1s
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
  }

  return (
    <section id="contact" style={{ background: '#F4F6FA' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(200,151,26,.12)', color: '#9E7410', border: '1px solid rgba(200,151,26,.25)' }}
          >
            Get in Touch
          </div>
          <h2
            className="text-4xl font-black mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Ready to start fulfilling?
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#7A8BA0' }}>
            Tell us about your business and we'll get back to you within one working day with a tailored quote.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Info panel */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg,#0A1628,#142D56)', border: '1px solid rgba(200,151,26,.2)' }}
            >
              <div className="text-sm font-bold mb-4" style={{ color: '#D4A520', fontFamily: 'Playfair Display, serif' }}>
                Klassical Holdings Ltd
              </div>
              {[
                { icon: '📍', label: 'Address',   val: 'Luton, Bedfordshire, UK' },
                { icon: '✉️', label: 'Email',     val: 'hello@klassicalholdings.co.uk' },
                { icon: '📱', label: 'WhatsApp',  val: '+44 7000 000000' },
                { icon: '🕑', label: 'Dispatch',  val: 'Mon–Fri, cut-off 2pm' },
              ].map(c => (
                <div key={c.label} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-base mt-0.5">{c.icon}</span>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#5A6A80' }}>{c.label}</div>
                    <div className="text-sm font-medium text-white">{c.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #E8ECF2' }}>
              <div className="font-bold text-sm text-[#0E2040] mb-3">What happens next?</div>
              {['We review your requirements', 'We prepare a tailored quote', 'You approve and we onboard', 'Stock arrives within days'].map((s, i) => (
                <div key={s} className="flex items-center gap-3 mb-2.5 last:mb-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm" style={{ color: '#6A7D9A' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-7 bg-white" style={{ border: '1px solid #E8ECF2', boxShadow: '0 4px 24px rgba(14,32,64,.06)' }}>
              {status === 'sent' ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <div className="text-xl font-bold text-[#0E2040] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Message received!
                  </div>
                  <p className="text-sm text-[#7A8BA0]">We'll be in touch within one working day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#7A8BA0' }}>Your Name *</label>
                      <input
                        required className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all"
                        style={{ borderColor: '#D0D8E8', color: '#0E2040' }}
                        onFocus={e => (e.target.style.borderColor = '#C8971A')}
                        onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#7A8BA0' }}>Email *</label>
                      <input
                        required type="email" className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all"
                        style={{ borderColor: '#D0D8E8', color: '#0E2040' }}
                        onFocus={e => (e.target.style.borderColor = '#C8971A')}
                        onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#7A8BA0' }}>Company</label>
                      <input
                        className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all"
                        style={{ borderColor: '#D0D8E8', color: '#0E2040' }}
                        onFocus={e => (e.target.style.borderColor = '#C8971A')}
                        onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                        value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Your Brand Ltd"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#7A8BA0' }}>Monthly Orders</label>
                      <select
                        className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                        style={{ borderColor: '#D0D8E8', color: '#0E2040' }}
                        value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                      >
                        <option value="">Select range…</option>
                        <option>Under 100</option>
                        <option>100–500</option>
                        <option>500–1,000</option>
                        <option>1,000–5,000</option>
                        <option>5,000+</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: '#7A8BA0' }}>Tell us about your needs</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all resize-none"
                      style={{ borderColor: '#D0D8E8', color: '#0E2040' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')}
                      onBlur={e => (e.target.style.borderColor = '#D0D8E8')}
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="What platforms do you sell on? What products? Any specific requirements?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628', opacity: status === 'sending' ? 0.7 : 1 }}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Enquiry →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
