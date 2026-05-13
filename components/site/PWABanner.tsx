'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function getPlatform() {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Macintosh/.test(ua)) return 'mac'
  if (/Windows/.test(ua)) return 'windows'
  return 'other'
}

const STEPS: Record<string, { icon: string; label: string; instructions: string[] }> = {
  ios: {
    icon: '🍎',
    label: 'iPhone / iPad',
    instructions: [
      'Tap the Share button (□↑) at the bottom of Safari',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" — Klassical Prep is on your home screen',
    ],
  },
  android: {
    icon: '🤖',
    label: 'Android',
    instructions: [
      'Tap "Install App" below — Chrome will ask to install',
      'Tap "Install" in the Chrome popup',
      'Klassical Prep appears on your home screen',
    ],
  },
  mac: {
    icon: '💻',
    label: 'MacBook',
    instructions: [
      'Tap "Install App" below — Chrome/Edge will install it',
      'Or click the ⊕ icon in the address bar',
      'Klassical Prep opens as its own app window',
    ],
  },
  windows: {
    icon: '🪟',
    label: 'Windows',
    instructions: [
      'Tap "Install App" below — Chrome/Edge will install it',
      'Or click the ⊕ icon in the address bar',
      'Klassical Prep is added to your desktop',
    ],
  },
  other: {
    icon: '💻',
    label: 'Desktop',
    instructions: [
      'Open this site in Chrome or Edge',
      'Click the ⊕ install icon in the address bar',
      'Click Install — Klassical Prep opens as its own app',
    ],
  },
}

export default function PWABanner() {
  const [visible,      setVisible]      = useState(false)
  const [platform,     setPlatform]     = useState('other')
  const [prompt,       setPrompt]       = useState<BeforeInstallPromptEvent | null>(null)
  const [showSteps,    setShowSteps]    = useState(false)
  const [installed,    setInstalled]    = useState(false)

  useEffect(() => {
    // Already a PWA — never show
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true
    if (standalone) return

    // User dismissed recently (within 3 days) — don't pester
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return

    const p = getPlatform()
    setPlatform(p)

    // Capture native install prompt if Chrome fires it
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setVisible(false) })

    // Always show after 3 seconds — regardless of whether prompt fired
    const t = setTimeout(() => setVisible(true), 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-banner-dismissed', String(Date.now()))
    setVisible(false)
  }

  async function handleInstall() {
    if (prompt) {
      // Chrome/Edge — fire native install directly
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') { setInstalled(true); setVisible(false) }
      setPrompt(null)
    } else {
      // No native prompt (iOS, Firefox, already dismissed) — show steps
      setShowSteps(true)
    }
  }

  if (!visible || installed) return null

  const info = STEPS[platform] || STEPS.other

  return (
    <div
      className="fixed bottom-6 right-5 z-[9999] w-[280px] rounded-2xl overflow-hidden"
      style={{
        background: '#0E1F3D',
        border: '1px solid rgba(200,151,26,.4)',
        boxShadow: '0 20px 64px rgba(10,22,40,.65)',
        animation: 'kfSlideUp .4s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <style>{`
        @keyframes kfSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
      `}</style>

      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-xs"
        style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)' }}
      >✕</button>

      <div className="p-5">
        {/* Logo + title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xl"
            style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -1, boxShadow: '0 4px 20px rgba(200,151,26,.45)' }}
          >
            KH
          </div>
          <div>
            <div className="font-black text-[15px] text-white leading-tight">Install Klassical Prep</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,.45)' }}>
              {info.icon} {info.label} · Native app experience
            </div>
          </div>
        </div>

        {/* Steps — shown after tap on iOS or when no native prompt */}
        {showSteps && (
          <div className="mb-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(200,151,26,.2)' }}>
            {info.instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                  style={{ background: '#C8971A', color: '#0A1628' }}
                >
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.75)' }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Install button */}
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mb-2 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {showSteps ? (platform === 'ios' ? 'Tap Share ↑ then Add to Home' : 'Follow steps above') : 'Install App'}
        </button>

        <button
          onClick={dismiss}
          className="w-full py-2 rounded-xl text-xs"
          style={{ color: 'rgba(255,255,255,.35)' }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
