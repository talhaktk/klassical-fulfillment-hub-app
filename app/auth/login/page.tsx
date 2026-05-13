'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type LoginTab = 'staff' | 'seller'

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [tab,      setTab]      = useState<LoginTab>('staff')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(tab === 'seller' ? '/seller-portal' : '/dashboard')
      router.refresh()
    }
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
          <h1
            className="text-2xl font-bold text-white tracking-wide"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            KLASSICAL HOLDINGS
          </h1>
          <p className="text-xs tracking-[2px] uppercase mt-1" style={{ color: '#D4A520' }}>
            Fulfillment Hub · UK
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl mb-5 p-1" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.2)' }}>
          {(['staff', 'seller'] as LoginTab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0E2040' }
                : { color: '#7A8BA0' }
              }
            >
              {t === 'staff' ? '🏭 Staff Login' : '🛒 Seller Login'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(200,151,26,.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-1">
            {tab === 'staff' ? 'Warehouse Team Sign In' : 'Seller Portal Sign In'}
          </h2>
          <p className="text-xs mb-6" style={{ color: '#7A8BA0' }}>
            {tab === 'staff'
              ? 'Use your warehouse credentials. Contact your manager if locked out.'
              : 'Access your orders, inventory & invoices. Credentials provided by Klassical team.'}
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tab === 'staff' ? 'staff@klassicalholdings.co.uk' : 'you@yourstore.com'}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(200,151,26,.3)',
                  color: 'white',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#B8C4D4' }}>
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(200,151,26,.3)',
                  color: 'white',
                }}
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
              className="w-full rounded-lg py-3 text-sm font-bold tracking-wide transition-all mt-1"
              style={{
                background: loading ? 'rgba(200,151,26,.4)' : 'linear-gradient(135deg,#9E7410,#D4A520)',
                color: '#0E2040',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : tab === 'staff' ? 'Sign In to Warehouse Hub' : 'Sign In to Seller Portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#4A5A70' }}>
          Klassical Holdings Ltd · Luton, UK · Internal system
        </p>
      </div>
    </div>
  )
}
