'use client'
import { useMemo } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate, priorityBadge, statusBadge } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, orders, inventory, sellers, invoices } = useStore()

  const pendingOrders  = orders.filter(o => o.status === 'pending' || o.status === 'processing').slice(0, 5)
  const lowStockItems  = inventory.filter(i => (i.good_stock - i.reserved) <= 5).slice(0, 5)

  // Top sellers sorted by order count — live from state
  const topSellers = useMemo(() =>
    [...sellers].map(s => ({
      seller:     s,
      orderCount: orders.filter(o => o.seller_id === s.id).length,
      revenue:    invoices.filter(i => i.seller_id === s.id).reduce((sum, i) => sum + i.total_amount, 0),
    })).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5)
  , [sellers, orders, invoices])

  // Warehouse capacity derived from real data (assume 120 units per pallet)
  const totalPallets  = 4200
  const usedPallets   = Math.min(Math.ceil(inventory.reduce((s, i) => s + i.total_in, 0) / 120), totalPallets)
  const reservedPallets = Math.min(Math.ceil(inventory.reduce((s, i) => s + i.reserved, 0) / 120), usedPallets)
  const occupiedPct   = Math.round((usedPallets / totalPallets) * 100)
  const reservedPct   = Math.round((reservedPallets / totalPallets) * 100)
  const availablePct  = Math.max(0, 100 - occupiedPct)

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  // Weekly bar data (last 7 days orders)
  const weekBars = (() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const counts = [0,0,0,0,0,0,0]
    orders.forEach(o => {
      const d = new Date(o.created_at)
      const dow = (d.getDay() + 6) % 7
      counts[dow]++
    })
    const max = Math.max(...counts, 1)
    return days.map((d, i) => ({ day: d, pct: Math.round((counts[i] / max) * 100) }))
  })()

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dashboard
          </h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {dateLabel} · Luton Warehouse, UK · {sellers.length} Sellers
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm">📥 Import Orders</button>
          <Link href="/orders" className="btn-gold btn-sm">+ New Shipment</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="stat-card">
          <div className="text-lg float-right opacity-50">📦</div>
          <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1.5">Pending Orders</div>
          <div className="text-3xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {stats.pendingOrders}
          </div>
          <div className="text-[11px] mt-1 font-medium text-[#1A7A48]">↑ {pendingOrders.length} require action</div>
        </div>
        <div className="stat-card">
          <div className="text-lg float-right opacity-50">✅</div>
          <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1.5">Fulfilled Today</div>
          <div className="text-3xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {stats.fulfilledToday}
          </div>
          <div className="text-[11px] mt-1 font-medium text-[#1A7A48]">↑ On-time rate 96.2%</div>
        </div>
        <div className="stat-card">
          <div className="text-lg float-right opacity-50">🗄️</div>
          <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1.5">Active SKUs</div>
          <div className="text-3xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {stats.activeSkus.toLocaleString()}
          </div>
          <div className="text-[11px] mt-1 text-[#7A8BA0]">{sellers.length} active sellers</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#C0321E' }}>
          <div className="text-lg float-right opacity-50">⚠️</div>
          <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1.5">Low Stock Alerts</div>
          <div className="text-3xl font-bold text-[#C0321E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {stats.lowStockAlerts}
          </div>
          <div className="text-[11px] mt-1 font-medium text-[#C0321E]">
            {lowStockItems.filter(i => (i.good_stock - i.reserved) === 0).length} critical — out of stock
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pending orders table */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4 flex items-center gap-2">
            ⚡ Pending — Action Required
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-[#7A8BA0] text-sm py-6 text-center">All orders fulfilled ✓</p>
          ) : (
            <table className="kh-table">
              <thead>
                <tr><th>Order</th><th>Seller</th><th>Items</th><th>Priority</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pendingOrders.map(o => (
                  <tr key={o.id}>
                    <td className="font-bold text-[#142D56] font-mono">{o.order_number}</td>
                    <td>{o.sellers?.name ?? '—'}</td>
                    <td>{o.order_items?.length ?? 0}</td>
                    <td>
                      <span className={priorityBadge(o.priority)}>{o.priority.toUpperCase()}</span>
                    </td>
                    <td>
                      <Link href={`/fulfill/${o.id}`} className="btn-gold btn-sm">⚡ Fulfill</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Weekly bar chart */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4 flex items-center gap-2">📊 Orders This Week</div>
          <div className="flex items-end gap-1.5 h-[90px]">
            {weekBars.map(b => (
              <div key={b.day} className="flex-1 text-center">
                <div
                  className="rounded-t w-full"
                  style={{ height: `${Math.max(b.pct, 8)}%`, background: 'linear-gradient(180deg,#E8B830,#9E7410)', minHeight: 6 }}
                />
                <div className="text-[9px] text-[#7A8BA0] mt-1">{b.day}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="kh-card !p-3.5" style={{ borderTop: '3px solid #C8971A' }}>
              <div className="text-[11px] uppercase text-[#7A8BA0] font-semibold mb-1">Avg Process Time</div>
              <div className="text-xl font-bold text-[#142D56]" style={{ fontFamily: 'Playfair Display, serif' }}>8.4 min</div>
            </div>
            <div className="kh-card !p-3.5" style={{ borderTop: '3px solid #1A7A48' }}>
              <div className="text-[11px] uppercase text-[#7A8BA0] font-semibold mb-1">On-Time Rate</div>
              <div className="text-xl font-bold text-[#1A7A48]" style={{ fontFamily: 'Playfair Display, serif' }}>96.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-3.5">
        {/* Top sellers — sorted by order count live from state */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">🏆 Top Sellers by Orders</div>
          <div className="text-sm">
            {topSellers.length === 0 ? (
              <p className="text-[#7A8BA0] text-xs py-4 text-center">No sellers yet</p>
            ) : topSellers.map(({ seller, orderCount, revenue }) => (
              <div key={seller.id} className="flex justify-between items-center py-1.5 border-b border-[#E8ECF2] last:border-0">
                <span className="text-[#4A5A70]">{seller.icon} {seller.name}</span>
                <div className="text-right">
                  <div className="font-bold text-[#9E7410]">{orderCount} orders</div>
                  <div className="text-[10px] text-[#7A8BA0]">{fmtGBP(revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">⚠️ Low Stock</div>
          <div className="text-sm">
            {lowStockItems.length === 0 ? (
              <p className="text-[#7A8BA0] text-sm py-4 text-center">All stock levels healthy ✓</p>
            ) : lowStockItems.map(item => {
              const avail = item.good_stock - item.reserved
              return (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-[#E8ECF2] last:border-0">
                  <span className="text-[#4A5A70] font-mono text-xs">{item.sku}</span>
                  <span className={`badge ${avail <= 0 ? 'badge-red' : 'badge-yellow'}`}>{avail} units</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Warehouse capacity — derived from live inventory */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">🏭 Warehouse Capacity</div>
          {[
            { label: 'Occupied',  pct: occupiedPct,  color: '#C8971A' },
            { label: 'Reserved',  pct: reservedPct,  color: '#2A4F8A' },
            { label: 'Available', pct: availablePct, color: '#1A7A48' },
          ].map(b => (
            <div key={b.label} className="mb-2.5">
              <div className="flex justify-between text-xs text-[#7A8BA0] mb-1">
                <span>{b.label}</span>
                <strong className="text-[#0E2040]">{b.pct}%</strong>
              </div>
              <div className="pb">
                <div className="pf" style={{ width: `${Math.max(b.pct, 0)}%`, background: b.color }} />
              </div>
            </div>
          ))}
          <div className="mt-3 text-[11px] text-[#7A8BA0] border-t border-[#E8ECF2] pt-2.5">
            {usedPallets.toLocaleString()} of {totalPallets.toLocaleString()} pallet spaces · Zones A–F
          </div>
        </div>
      </div>

      {/* Financial overview bar */}
      <div
        className="mt-4 rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,#0E2040,#142D56)', border: '1px solid rgba(200,151,26,.3)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <div className="font-bold text-sm" style={{ color: '#D4A520' }}>Financial Overview</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>Live from all modules</div>
          </div>
        </div>
        <div className="flex gap-6">
          {[
            { label: 'Total Cash', val: fmtGBP(stats.totalCash), color: '#5EE8A0' },
            { label: 'Outstanding', val: fmtGBP(stats.outstandingBalance), color: '#E8B830' },
            { label: 'Overdue Invoices', val: String(stats.overdueInvoices), color: '#FF8A80' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.45)' }}>{s.label}</div>
              <div className="text-lg font-bold mt-0.5" style={{ fontFamily: 'Playfair Display, serif', color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <Link href="/payments" className="btn-gold btn-sm">View Bank Accounts →</Link>
      </div>
    </div>
  )
}
