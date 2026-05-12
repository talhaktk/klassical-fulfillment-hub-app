'use client'
import { useState } from 'react'

// Replace with your actual WhatsApp number (international format, no +)
const WA_NUMBER = '447000000000'
const WA_MESSAGE = encodeURIComponent('Hi Klassical! I\'m interested in your fulfillment services. Can I get more information?')
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

export default function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-300"
      style={{ filter: 'drop-shadow(0 4px 16px rgba(37,211,102,.4))' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <div
        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-all duration-300"
        style={{
          background: 'rgba(10,22,40,.9)',
          border: '1px solid rgba(255,255,255,.1)',
          backdropFilter: 'blur(8px)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(8px)',
          pointerEvents: 'none',
        }}
      >
        Chat with us 💬
      </div>

      {/* Button */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200"
        style={{
          background: '#25D366',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.555 4.11 1.523 5.84L.057 23.998l6.304-1.453A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.6-.5-5.1-1.37l-.36-.22-3.74.862.93-3.64-.23-.37A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </div>
    </a>
  )
}
