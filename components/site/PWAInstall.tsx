'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall({ variant = 'hero' }: { variant?: 'hero' | 'banner' }) {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showTip,   setShowTip]   = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleClick() {
    if (prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setPrompt(null)
    } else {
      setShowTip(v => !v)
    }
  }

  if (installed) {
    if (variant === 'banner') return null
    return (
      <div
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'rgba(26,122,72,.15)', color: '#1A7A48', border: '1px solid rgba(26,122,72,.3)' }}
      >
        <span>✓</span> App installed
      </div>
    )
  }

  if (variant === 'banner' && !prompt) return null

  if (variant === 'banner') {
    return (
      <div
        className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl"
        style={{ background: 'rgba(200,151,26,.1)', border: '1px solid rgba(200,151,26,.3)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📲</span>
          <div>
            <div className="text-sm font-bold" style={{ color: '#0A1628' }}>Install the app</div>
            <div className="text-xs" style={{ color: '#7A8BA0' }}>Works offline · Available on Android &amp; desktop</div>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}
        >
          Install
        </button>
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
        style={{
          color: '#4A5A70',
          borderColor: '#D0D8E8',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        <span className="text-base">📲</span>
        {prompt ? 'Install App' : 'How to Install'}
      </button>

      {/* Instruction tooltip (shown when no native prompt) */}
      {showTip && !prompt && (
        <div
          className="absolute left-0 top-full mt-2 rounded-xl shadow-xl text-left z-50"
          style={{ background: '#fff', border: '1px solid #D0D8E8', minWidth: 260, boxShadow: '0 8px 32px rgba(10,22,40,.14)' }}
        >
          <div className="px-4 py-3 text-xs font-bold border-b" style={{ color: '#0A1628', borderColor: '#F0F4FA' }}>
            Install Klassical HUB
          </div>
          <div className="px-4 py-3 space-y-2">
            {[
              { icon: '🤖', label: 'Android / Chrome', tip: 'Tap ⋮ menu → Add to Home Screen' },
              { icon: '🍎', label: 'iPhone / iPad',    tip: 'Tap Share → Add to Home Screen' },
              { icon: '💻', label: 'Desktop Chrome',   tip: 'Click ⊕ in address bar → Install' },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-2">
                <span className="text-base">{p.icon}</span>
                <div>
                  <div className="font-semibold text-xs" style={{ color: '#0A1628' }}>{p.label}</div>
                  <div className="text-[11px]" style={{ color: '#7A8BA0' }}>{p.tip}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t" style={{ borderColor: '#F0F4FA' }}>
            <button
              onClick={() => setShowTip(false)}
              className="text-[11px] font-semibold"
              style={{ color: '#C8971A' }}
            >
              Got it ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
