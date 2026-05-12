'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Setup failed')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/auth/login'), 2500)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0E2040 60%, #1B3A6B 100%)' }}
    >
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg width="52" height="58" viewBox="0 0 38 44" fill="none" className="mb-4">
            <path d="M19 1L37 9V23C37 34 28 41 19 43C10 41 1 34 1 23V9L19 1Z" fill="#C8971A"/>
            <path d="M19 3.5L35 11V23C35 32.5 27 39 19 41C11 39 3 32.5 3 23V11L19 3.5Z" fill="#1B3A6B"/>
            <text x="6.5" y="30" fontSize="19" fontWeight="900" fill="#C8971A" fontFamily="Georgia,serif">KH</text>
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            KLASSICAL HOLDINGS
          </h1>
          <p className="text-xs tracking-[2px] uppercase mt-1" style={{ color: '#D4A520' }}>
            First-Time Setup
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(200,151,26,.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-white mb-2">Admin account created!</h2>
              <p className="text-sm" style={{ color: '#B8C4D4' }}>Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-1">Create Admin Account</h2>
              <p className="text-xs mb-6" style={{ color: '#7A8BA0' }}>
                This page is only available once — when no admin exists yet.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Dr Talha Idrees"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.3)', color: 'white' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.3)', color: 'white' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.3)', color: 'white' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat password"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.3)', color: 'white' }}
                  />
                </div>

                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(192,50,30,.15)', border: '1px solid rgba(192,50,30,.4)', color: '#FF7A6B' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-3 text-sm font-bold tracking-wide mt-1 transition-all"
                  style={{
                    background: loading ? 'rgba(200,151,26,.4)' : 'linear-gradient(135deg,#9E7410,#D4A520)',
                    color: '#0E2040',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Creating account…' : 'Create Admin Account'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#4A5A70' }}>
          After setup, this page will be locked and unavailable.
        </p>
      </div>
    </div>
  )
}
