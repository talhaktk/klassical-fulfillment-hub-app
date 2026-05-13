import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(135deg,#C8971A,#E8B830)',
          borderRadius: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia,serif',
          fontWeight: 900,
          fontSize: 72,
          color: '#0A1628',
          letterSpacing: -2,
        }}
      >
        KH
      </div>
    ),
    { ...size }
  )
}
