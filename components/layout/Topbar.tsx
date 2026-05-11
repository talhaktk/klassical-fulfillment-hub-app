'use client'
import { useEffect, useState, useRef } from 'react'
import { useStore } from '@/store'
import { fmtGBP } from '@/lib/utils'
import dynamic from 'next/dynamic'
const AIChat = dynamic(() => import('@/components/ai/AIChat'), { ssr: false })

const ROLES = [
  { value: 'warehouse_manager', label: '🏭 Warehouse Manager' },
  { value: 'warehouse_staff',   label: '👷 Warehouse Staff' },
  { value: 'seller',            label: '🛒 Seller Portal' },
  { value: 'admin',             label: '🔐 Super Admin' },
] as const

const ROLE_LABELS: Record<string, string> = {
  warehouse_manager: 'Warehouse Manager',
  warehouse_staff:   'WH Staff',
  seller:            'Seller — TechGear UK',
  admin:             'Super Admin',
}

export default function Topbar() {
  const { role, setRole, stats, invoices } = useStore()
  const [clock, setClock]               = useState('')
  const [notifOpen, setNotifOpen]       = useState(false)
  const [chatOpen, setChatOpen]         = useState(false)
  const notifRef                        = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
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

  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  return (
    <>
    <header
      className="flex items-center px-5 flex-shrink-0 z-50 relative gap-3.5"
      style={{ height: 58, background: '#0E2040', borderBottom: '2px solid #C8971A' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <svg width="36" height="40" viewBox="0 0 38 44" fill="none">
          <path d="M19 1L37 9V23C37 34 28 41 19 43C10 41 1 34 1 23V9L19 1Z" fill="#C8971A"/>
          <path d="M19 3.5L35 11V23C35 32.5 27 39 19 41C11 39 3 32.5 3 23V11L19 3.5Z" fill="#1B3A6B"/>
          <text x="6.5" y="30" fontSize="19" fontWeight="900" fill="#C8971A" fontFamily="Georgia,serif">KH</text>
        </svg>
        <div>
          <div className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            KLASSICAL HOLDINGS
          </div>
          <div className="text-[9px] uppercase tracking-[1.5px] font-medium" style={{ color: '#D4A520' }}>
            Fulfillment Hub · UK
          </div>
        </div>
      </div>

      {/* Role selector */}
      <select
        value={role}
        onChange={e => setRole(e.target.value as any)}
        className="ml-4 rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{
          background: 'rgba(255,255,255,.08)',
          border: '1px solid rgba(200,151,26,.4)',
          color: '#D4A520',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value} style={{ background: '#0E2040', color: 'white' }}>
            {r.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Clock */}
        <span className="text-xs font-mono" style={{ color: '#B8C4D4' }}>{clock}</span>

        {/* Role badge */}
        <span
          className="rounded-full px-3.5 py-1 text-[11px] font-bold tracking-[.3px] text-white"
          style={{ background: 'linear-gradient(135deg,#9E7410,#D4A520)' }}
        >
          {ROLE_LABELS[role]}
        </span>

        {/* Notifications bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative flex items-center justify-center rounded-lg w-9 h-9 text-sm transition-all"
            style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.2)' }}
          >
            🔔
            {stats.overdueInvoices > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
                style={{ background: '#E8B830', borderColor: '#0E2040' }}
              />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-80 rounded-[14px] p-4 z-50 animate-fadeIn"
              style={{ background: 'white', border: '1px solid #E8ECF2', boxShadow: '0 12px 40px rgba(27,58,107,.18)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-[#0E2040]">Notifications</span>
                <span className="text-xs font-semibold" style={{ color: '#D4A520' }}>
                  {overdueInvoices.length + stats.lowStockAlerts} new
                </span>
              </div>

              {overdueInvoices.slice(0, 2).map(inv => (
                <div key={inv.id} className="flex gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-[#F4F6FA] border-b border-[#E8ECF2]">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-red-500" />
                  <div>
                    <div className="text-sm font-semibold text-[#0E2040]">Invoice overdue: {inv.invoice_number}</div>
                    <div className="text-xs text-[#7A8BA0]">{inv.sellers?.name} · {fmtGBP(inv.total_amount - inv.paid_amount)}</div>
                  </div>
                </div>
              ))}

              {stats.lowStockAlerts > 0 && (
                <div className="flex gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-[#F4F6FA]">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-yellow-400" />
                  <div>
                    <div className="text-sm font-semibold text-[#0E2040]">Low stock alerts</div>
                    <div className="text-xs text-[#7A8BA0]">{stats.lowStockAlerts} SKUs below threshold</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Chat */}
        <button
          onClick={() => setChatOpen(v => !v)}
          className="flex items-center justify-center rounded-lg w-9 h-9 text-sm transition-all"
          style={{ background: chatOpen ? 'rgba(200,151,26,.3)' : 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.2)' }}
          title="AI Assistant"
        >
          🤖
        </button>

        {/* Settings */}
        <button
          className="flex items-center justify-center rounded-lg w-9 h-9 text-sm"
          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(200,151,26,.2)' }}
        >
          ⚙️
        </button>

        {/* Avatar */}
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold cursor-pointer border-2"
          style={{
            background: 'linear-gradient(135deg,#9E7410,#E8B830)',
            color: '#0E2040',
            borderColor: '#C8971A',
            fontFamily: 'DM Mono, monospace',
          }}
        >
          AK
        </div>
      </div>
    </header>
    {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
    </>
  )
}
