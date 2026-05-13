'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DEVICES = [
  {
    id: 'android',
    icon: '🤖',
    label: 'Android',
    sub: 'Chrome',
    steps: [
      'Open this site in Chrome on your Android phone',
      'Tap the ⋮ menu (top right)',
      'Tap "Add to Home Screen"',
      'Tap "Add" — the app appears as "Klassical Prep"',
    ],
  },
  {
    id: 'ios',
    icon: '🍎',
    label: 'iPhone / iPad',
    sub: 'Safari',
    steps: [
      'Open this site in Safari on your iPhone or iPad',
      'Tap the Share button (square with arrow up)',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" — the app appears as "Klassical Prep"',
    ],
  },
  {
    id: 'mac',
    icon: '💻',
    label: 'MacBook',
    sub: 'Chrome / Edge',
    steps: [
      'Open this site in Chrome or Edge on your Mac',
      'Click the ⊕ install icon in the address bar (far right)',
      'Click "Install" in the popup',
      'The app opens as "Klassical Prep" in its own window',
    ],
    canNativeInstall: true,
  },
  {
    id: 'windows',
    icon: '🪟',
    label: 'Windows',
    sub: 'Chrome / Edge',
    steps: [
      'Open this site in Chrome or Edge on your PC',
      'Click the ⊕ install icon in the address bar (far right)',
      'Click "Install" in the popup',
      'The app is added to your desktop as "Klassical Prep"',
    ],
    canNativeInstall: true,
  },
]

export default function PWAInstall({ variant = 'hero' }: { variant?: 'hero' | 'banner' }) {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [open,      setOpen]      = useState(false)
  const [selected,  setSelected]  = useState<string | null>(null)

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
    window.addEventListener('appinstalled', () => { setInstalled(true); setOpen(false) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleDeviceSelect(deviceId: string) {
    setSelected(deviceId)
    const device = DEVICES.find(d => d.id === deviceId)
    if (device?.canNativeInstall && prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') { setInstalled(true); setOpen(false) }
      setPrompt(null)
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
            <div className="text-sm font-bold" style={{ color: '#0A1628' }}>Install Klassical Prep</div>
            <div className="text-xs" style={{ color: '#7A8BA0' }}>Works offline · Android &amp; desktop</div>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}
        >
          Install
        </button>
        {open && <Modal prompt={prompt} selected={selected} onSelect={handleDeviceSelect} onClose={() => { setOpen(false); setSelected(null) }} />}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setSelected(null) }}
        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
        style={{ color: '#4A5A70', borderColor: '#D0D8E8', background: '#fff', cursor: 'pointer' }}
      >
        <span className="text-base">📲</span>
        Download App
      </button>

      {open && (
        <Modal
          prompt={prompt}
          selected={selected}
          onSelect={handleDeviceSelect}
          onClose={() => { setOpen(false); setSelected(null) }}
        />
      )}
    </>
  )
}

function Modal({
  prompt,
  selected,
  onSelect,
  onClose,
}: {
  prompt: BeforeInstallPromptEvent | null
  selected: string | null
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const device = DEVICES.find(d => d.id === selected)

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(10,22,40,.25)', border: '1px solid #E8ECF2' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif' }}
            >
              KH
            </div>
            <div>
              <div className="font-black text-base leading-tight" style={{ color: '#0A1628', fontFamily: 'Playfair Display, serif' }}>
                Install Klassical Prep
              </div>
              <div className="text-[11px] uppercase tracking-[1.5px]" style={{ color: '#C8971A' }}>
                Select your device
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-lg leading-none" style={{ color: '#9A9A9A' }}>✕</button>
        </div>

        {/* Device grid */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-2.5">
          {DEVICES.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="rounded-xl p-3.5 text-left transition-all"
              style={{
                background: selected === d.id ? 'rgba(200,151,26,.1)' : '#F8F9FC',
                border: selected === d.id ? '2px solid #C8971A' : '1.5px solid #E8ECF2',
              }}
            >
              <div className="text-2xl mb-1.5">{d.icon}</div>
              <div className="text-xs font-bold" style={{ color: '#0A1628' }}>{d.label}</div>
              <div className="text-[10px]" style={{ color: '#7A8BA0' }}>{d.sub}</div>
            </button>
          ))}
        </div>

        {/* Steps panel */}
        {device && (
          <div className="mx-6 mb-6 rounded-xl p-4" style={{ background: '#F4F6FA', border: '1px solid #E8ECF2' }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#C8971A' }}>
              {device.icon} {device.label} — Step by step
            </div>
            <ol className="space-y-2">
              {device.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs" style={{ color: '#4A5A70' }}>
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                    style={{ background: '#C8971A', color: '#fff' }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {device.canNativeInstall && prompt && (
              <button
                onClick={() => onSelect(device.id)}
                className="mt-3 w-full py-2.5 rounded-lg text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)', color: '#fff' }}
              >
                Click to Install Now →
              </button>
            )}
          </div>
        )}

        {!device && (
          <div className="px-6 pb-6 text-center text-xs" style={{ color: '#9A9A9A' }}>
            Tap a device above to see install steps
          </div>
        )}
      </div>
    </div>
  )
}
