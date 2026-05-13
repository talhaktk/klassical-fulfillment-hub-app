import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'linear-gradient(135deg,#C8971A,#E8B830)',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia,serif',
          fontWeight: 900,
          fontSize: 68,
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
