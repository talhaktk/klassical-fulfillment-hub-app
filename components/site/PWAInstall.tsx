'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall({ variant = 'hero' }: { variant?: 'hero' | 'banner' }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already running as standalone PWA
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

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  if (installed) {
    if (variant === 'banner') return null
    return (
      <div
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'rgba(26,122,72,.2)', color: '#5EE8A0', border: '1px solid rgba(26,122,72,.4)' }}
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
            <div className="text-sm font-bold text-white">Install the app</div>
            <div className="text-xs" style={{ color: '#7A8BA0' }}>Works offline · Available on Android &amp; desktop</div>
          </div>
        </div>
        <button
          onClick={install}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#0A1628' }}
        >
          Install
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={prompt ? install : undefined}
      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
      style={{
        color: '#B8C4D4',
        borderColor: 'rgba(184,196,212,.25)',
        background: 'rgba(255,255,255,.05)',
        cursor: prompt ? 'pointer' : 'default',
        opacity: prompt ? 1 : 0.6,
      }}
      title={!prompt ? 'Open in Chrome/Edge to install' : undefined}
    >
      <span className="text-base">📲</span>
      {prompt ? 'Install App' : 'Add to Home Screen'}
    </button>
  )
}
