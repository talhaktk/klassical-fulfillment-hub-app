'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWABanner() {
  const [prompt,  setPrompt]  = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)   // auto-show as soon as Chrome is ready
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setDone(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
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
      className="fixed bottom-6 right-5 z-[9999] w-72 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
      style={{
        background: '#0E1F3D',
        border: '1px solid rgba(200,151,26,.35)',
        boxShadow: '0 20px 60px rgba(10,22,40,.55)',
      }}
    >
      {/* close */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-sm leading-none"
        style={{ color: 'rgba(255,255,255,.4)' }}
      >
        ✕
      </button>

      <div className="p-5">
        {/* logo + title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#C8971A,#E8B830)',
              color: '#0A1628',
              fontFamily: 'Georgia,serif',
              boxShadow: '0 4px 16px rgba(200,151,26,.4)',
            }}
          >
            KH
          </div>
          <div>
            <div className="font-black text-base leading-tight text-white">
              Install Klassical Prep
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.55)' }}>
              Add to home screen for a faster, native-like experience
            </div>
          </div>
        </div>

        {/* buttons */}
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mb-2 transition-all"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install App
        </button>

        <button
          onClick={() => setVisible(false)}
          className="w-full py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
