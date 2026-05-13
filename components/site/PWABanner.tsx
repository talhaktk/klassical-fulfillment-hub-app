'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectPlatform(): 'ios' | 'android' | 'mac' | 'windows' | 'other' {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Macintosh/.test(ua)) return 'mac'
  if (/Windows/.test(ua)) return 'windows'
  return 'other'
}

const IOS_STEPS = [
  { icon: '1️⃣', text: 'Tap the Share button at the bottom of Safari' },
  { icon: '2️⃣', text: 'Scroll down and tap "Add to Home Screen"' },
  { icon: '3️⃣', text: 'Tap "Add" — Klassical Prep appears on your home screen' },
]

export default function PWABanner() {
  const [prompt,   setPrompt]   = useState<BeforeInstallPromptEvent | null>(null)
  const [visible,  setVisible]  = useState(false)
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>('other')
  const [done,     setDone]     = useState(false)
  const [iosStep,  setIosStep]  = useState(false)

  useEffect(() => {
    // Already running as installed PWA — hide everything
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return

    const p = detectPlatform()
    setPlatform(p)

    if (p === 'ios') {
      // iOS Safari: auto-show our instruction banner after 2 s
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    }

    // Chrome / Edge on Android, Mac, Windows
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setDone(true); setVisible(false) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (platform === 'ios') {
      setIosStep(true)
      return
    }
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setDone(true)
    setPrompt(null)
    setVisible(false)
  }

  if (!visible || done) return null

  return (
    <div
      className="fixed bottom-6 right-5 z-[9999] w-72 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: '#0E1F3D',
        border: '1px solid rgba(200,151,26,.35)',
        boxShadow: '0 20px 60px rgba(10,22,40,.6)',
        animation: 'slideUp .35s ease',
      }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* close */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-sm leading-none"
        style={{ color: 'rgba(255,255,255,.4)' }}
      >✕</button>

      <div className="p-5">
        {/* logo + title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xl"
            style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', boxShadow: '0 4px 16px rgba(200,151,26,.4)' }}
          >
            KH
          </div>
          <div>
            <div className="font-black text-base text-white leading-tight">Install Klassical Prep</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.5)' }}>
              Add to home screen for a faster, native-like experience
            </div>
          </div>
        </div>

        {/* iOS step-by-step (shown after tapping Install on iOS) */}
        {iosStep ? (
          <div className="mb-3 rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(200,151,26,.2)' }}>
            {IOS_STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                <span className="text-base leading-none mt-0.5">{s.icon}</span>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.75)' }}>{s.text}</span>
              </div>
            ))}
            {/* Arrow pointing to Safari share button */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#D4A520' }}>
              <span>↓</span> Tap the Share icon below ↓
            </div>
          </div>
        ) : (
          <>
            {/* platform badge */}
            <div className="mb-3 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(200,151,26,.7)' }}>
              {platform === 'ios'     && '🍎 iPhone / iPad — Safari'}
              {platform === 'android' && '🤖 Android — Chrome'}
              {platform === 'mac'     && '💻 MacBook — Chrome / Edge'}
              {platform === 'windows' && '🪟 Windows — Chrome / Edge'}
            </div>
          </>
        )}

        {/* Install button */}
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mb-2 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {iosStep ? 'Follow steps above ↑' : 'Install App'}
        </button>

        <button
          onClick={() => setVisible(false)}
          className="w-full py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)' }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
