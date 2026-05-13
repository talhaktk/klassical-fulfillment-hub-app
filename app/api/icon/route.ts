import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get('size') ?? '192')
  const s = size > 256 ? 512 : 192
  const radius = Math.round(s * 0.2)
  const fontSize = Math.round(s * 0.36)

  return new ImageResponse(
    (
      /* Outer container — navy background with padding so icon sits centred */
      <div
        style={{
          width: s,
          height: s,
          background: '#0A1628',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Gold gradient rounded square — exact match of Navbar KH logo */}
        <div
          style={{
            width: Math.round(s * 0.75),
            height: Math.round(s * 0.75),
            background: 'linear-gradient(135deg,#C8971A,#E8B830)',
            borderRadius: radius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'serif',
            fontWeight: 900,
            fontSize: fontSize,
            color: '#0A1628',
            letterSpacing: -2,
          }}
        >
          KH
        </div>
      </div>
    ),
    { width: s, height: s }
  )
}
