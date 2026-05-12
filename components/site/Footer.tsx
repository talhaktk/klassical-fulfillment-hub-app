import Link from 'next/link'

const COLS = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us',      href: '#' },
      { label: 'Contact',       href: '#contact' },
      { label: 'Careers',       href: '#' },
      { label: 'Blog',          href: '#' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Pick & Pack',        href: '#services' },
      { label: 'Storage',            href: '#services' },
      { label: 'Returns',            href: '#services' },
      { label: 'Custom Packaging',   href: '#services' },
      { label: 'B2B Dispatch',       href: '#services' },
    ],
  },
  {
    heading: 'Integrations',
    links: [
      { label: 'Shopify',       href: '#partners' },
      { label: 'Amazon',        href: '#partners' },
      { label: 'TikTok Shop',   href: '#partners' },
      { label: 'WooCommerce',   href: '#partners' },
      { label: 'Royal Mail',    href: '#partners' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',    href: '#' },
      { label: 'Terms of Service',  href: '#' },
      { label: 'Cookie Policy',     href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#060E1C', borderTop: '1px solid rgba(200,151,26,.15)' }}>
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -1 }}
              >
                KH
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Klassical</div>
                <div className="text-[9px] uppercase tracking-[2px]" style={{ color: '#C8971A' }}>Holdings Ltd</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#4A5A70' }}>
              Premium UK 3PL fulfillment. Smart storage, seamless delivery — Luton, UK.
            </p>
            <div className="flex gap-2">
              {['📧', '📱', '🌐'].map(icon => (
                <a
                  key={icon}
                  href="#contact"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.heading}>
              <div className="text-[10px] uppercase tracking-[1.5px] font-bold mb-4" style={{ color: '#C8971A' }}>
                {col.heading}
              </div>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs transition-colors"
                      style={{ color: '#4A5A70' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#B8C4D4')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#4A5A70')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <p className="text-xs" style={{ color: '#3A4A5A' }}>
            © {new Date().getFullYear()} Klassical Holdings Ltd. All rights reserved. Registered in England &amp; Wales.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#3A4A5A' }}>Staff portal:</span>
            <Link
              href="/auth/login"
              className="text-xs font-semibold transition-colors"
              style={{ color: '#C8971A' }}
            >
              Login to HUB →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
