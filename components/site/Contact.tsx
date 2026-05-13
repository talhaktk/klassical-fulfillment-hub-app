'use client'
import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({
    name:   '',
    brand:  '',
    email:  '',
    phone:  '',
    volume: '',
    needs:  '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
  }

  return (
    <section id="contact" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-5 py-20">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: info */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-[3px] mb-5"
              style={{ color: '#C8971A' }}
            >
              Get in Touch
            </div>
            <h2
              className="text-5xl lg:text-6xl font-black mb-6 leading-[1.05]"
              style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
            >
              Let's talk<br />fulfilment.
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: '#5A6A80' }}>
              Tell us about your store, your monthly volume and where you want to grow. We'll send back a tailored quote within one business day.
            </p>

            {/* Contact cards */}
            <div className="space-y-3">
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl"
                style={{ background: '#FAFAF8', border: '1px solid #E8E4DC' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,151,26,.12)' }}
                >
                  📞
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold mb-0.5" style={{ color: '#B8C4D4' }}>Call</div>
                  <a href="tel:+447572944461" className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                    +44 7572 944461
                  </a>
                </div>
              </div>

              <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl"
                style={{ background: '#FAFAF8', border: '1px solid #E8E4DC' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,151,26,.12)' }}
                >
                  💬
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold mb-0.5" style={{ color: '#B8C4D4' }}>WhatsApp Only</div>
                  <a href="https://wa.me/447776387877" className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                    +44 7776 387877
                  </a>
                </div>
              </div>

              <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl"
                style={{ background: '#FAFAF8', border: '1px solid #E8E4DC' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,151,26,.12)' }}
                >
                  📍
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold mb-0.5" style={{ color: '#B8C4D4' }}>Warehouse</div>
                  <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                    25 Waleys Close, Luton, LU3 3RZ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {status === 'sent' ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ background: '#FAFAF8', border: '1px solid #E8E4DC' }}
              >
                <div className="text-5xl mb-4">✅</div>
                <div className="text-2xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}>
                  Message received!
                </div>
                <p className="text-sm" style={{ color: '#7A8BA0' }}>
                  We'll be in touch within one working day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Your Name</label>
                    <input
                      required
                      className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                      style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')}
                      onBlur={e => (e.target.style.borderColor = '#E8E4DC')}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Brand / Store</label>
                    <input
                      className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                      style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#C8971A')}
                      onBlur={e => (e.target.style.borderColor = '#E8E4DC')}
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Email</label>
                  <input
                    required type="email"
                    className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                    style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                    onFocus={e => (e.target.style.borderColor = '#C8971A')}
                    onBlur={e => (e.target.style.borderColor = '#E8E4DC')}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Phone (Optional)</label>
                  <input
                    type="tel"
                    className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all"
                    style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                    onFocus={e => (e.target.style.borderColor = '#C8971A')}
                    onBlur={e => (e.target.style.borderColor = '#E8E4DC')}
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>

                {/* Monthly orders */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Monthly Orders</label>
                  <select
                    className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none"
                    style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                    value={form.volume}
                    onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                  >
                    <option value="Under 100">Under 100</option>
                    <option>100–500</option>
                    <option>500–1,000</option>
                    <option>1,000–5,000</option>
                    <option>5,000+</option>
                  </select>
                </div>

                {/* Fulfilment needs */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[2px] block mb-2" style={{ color: '#7A8BA0' }}>Tell Us About Your Fulfilment Needs</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-all resize-none"
                    style={{ borderColor: '#E8E4DC', color: '#0E2040', background: '#fff' }}
                    onFocus={e => (e.target.style.borderColor = '#C8971A')}
                    onBlur={e => (e.target.style.borderColor = '#E8E4DC')}
                    placeholder="What you sell, where you sell, where you want to grow..."
                    value={form.needs}
                    onChange={e => setForm(f => ({ ...f, needs: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: 'linear-gradient(135deg,#9E7410,#D4A520)',
                    color: '#fff',
                    opacity: status === 'sending' ? 0.7 : 1,
                    boxShadow: '0 6px 20px rgba(200,151,26,.3)',
                  }}
                >
                  {status === 'sending' ? 'Sending…' : 'Request a quote'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
