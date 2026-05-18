'use client'
import { useEffect, useState, useRef } from 'react'
import { useStore } from '@/store'
import { fmtGBP } from '@/lib/utils'
import dynamic from 'next/dynamic'
const AIChat = dynamic(() => import('@/components/ai/AIChat'), { ssr: false })

const ROLE_LABELS: Record<string, string> = {
  admin:             'Super Admin',
  warehouse_manager: 'Warehouse Manager',
  warehouse_staff:   'WH Staff',
  seller:            'Seller',
}

const ROLE_COLORS: Record<string, string> = {
  admin:             'linear-gradient(135deg,#8B0000,#C0321E)',
  warehouse_manager: 'linear-gradient(135deg,#1B3A6B,#2A6DC8)',
  warehouse_staff:   'linear-gradient(135deg,#1B5E20,#2E7D32)',
  seller:            'linear-gradient(135deg,#9E7410,#D4A520)',
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function Topbar() {
  const { stats, invoices, currentUser } = useStore()
  const [clock, setClock]         = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatOpen, setChatOpen]   = useState(false)
  const notifRef                  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const userRole        = currentUser?.role ?? 'warehouse_staff'
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'warehouse_manager') setChatOpen(false)
  }, [userRole])
  const roleLabel       = ROLE_LABELS[userRole] ?? userRole
  const roleColor       = ROLE_COLORS[userRole] ?? ROLE_COLORS.seller
  const initials        = currentUser ? getInitials(currentUser.name) : '?'
  const totalNotifs     = overdueInvoices.length + stats.lowStockAlerts

  return (
    <>
    <header
      className="flex items-center px-6 flex-shrink-0 z-50 relative"
      style={{ height: 60, background: '#0A1628', borderBottom: '1px solid rgba(200,151,26,.3)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 mr-8">
        <div
          className="flex items-center justify-center rounded-xl font-black text-base"
          style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#C8971A,#E8B830)', color: '#0A1628', fontFamily: 'Georgia,serif', letterSpacing: -1 }}
        >
          KH
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '.5px' }}>
            Klassical Fulfillment HUB
          </div>
          <div className="text-[9px] uppercase tracking-[2px] font-medium" style={{ color: '#C8971A' }}>
            Klassical Holdings · UK
          </div>
        </div>
      </div>

      {/* Centre spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <span className="text-xs font-mono px-2.5 py-1 rounded-md" style={{ color: '#B8C4D4', background: 'rgba(255,255,255,.05)' }}>
          {clock}
        </span>

        {/* Role pill */}
        <span
          className="rounded-full px-3.5 py-1 text-[11px] font-bold tracking-wide text-white"
          style={{ background: roleColor }}
        >
          {roleLabel}
        </span>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative flex items-center justify-center rounded-xl w-9 h-9 text-sm transition-all"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
          >
            🔔
            {totalNotifs > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-black px-1"
                style={{ background: '#C0321E', color: 'white' }}
              >
                {totalNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl p-4 z-50 animate-fadeIn"
              style={{ background: 'white', border: '1px solid #E8ECF2', boxShadow: '0 16px 48px rgba(10,22,40,.2)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-[#0E2040]">Notifications</span>
                {totalNotifs > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3E0', color: '#C8971A' }}>
                    {totalNotifs} new
                  </span>
                )}
              </div>
              {overdueInvoices.slice(0, 3).map(inv => (
                <div key={inv.id} className="flex gap-2.5 p-2.5 rounded-xl mb-1 cursor-pointer hover:bg-[#F4F6FA] transition-colors">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                  <div>
                    <div className="text-sm font-semibold text-[#0E2040]">Overdue: {inv.invoice_number}</div>
                    <div className="text-xs text-[#7A8BA0]">{(inv as any).sellers?.name} · {fmtGBP(inv.total_amount - inv.paid_amount)} due</div>
                  </div>
                </div>
              ))}
              {stats.lowStockAlerts > 0 && (
                <div className="flex gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[#F4F6FA]">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-[#0E2040]">Low stock alert</div>
                    <div className="text-xs text-[#7A8BA0]">{stats.lowStockAlerts} SKUs below threshold</div>
                  </div>
                </div>
              )}
              {totalNotifs === 0 && (
                <p className="text-xs text-[#7A8BA0] text-center py-3">All clear — no alerts</p>
              )}
            </div>
          )}
        </div>

        {/* AI Chat — admin and warehouse_manager only */}
        {(userRole === 'admin' || userRole === 'warehouse_manager') && (
          <button
            onClick={() => setChatOpen(v => !v)}
            title="AI Analytics Assistant"
            className="flex items-center justify-center rounded-xl w-9 h-9 text-sm transition-all"
            style={{ background: chatOpen ? 'rgba(200,151,26,.3)' : 'rgba(255,255,255,.06)', border: `1px solid ${chatOpen ? 'rgba(200,151,26,.6)' : 'rgba(255,255,255,.1)'}` }}
          >
            🤖
          </button>
        )}

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black cursor-pointer"
          style={{ background: roleColor, color: 'white', fontFamily: 'DM Mono, monospace', letterSpacing: 1 }}
          title={currentUser?.name ?? ''}
        >
          {initials}
        </div>
      </div>
    </header>
    {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
    </>
  )
}
