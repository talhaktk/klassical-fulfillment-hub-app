'use client'
import { useMemo } from 'react'
import { useStore } from '@/store'
import { fmtGBP } from '@/lib/utils'

export default function AnalyticsPage() {
  const { orders, invoices, inventory, sellers, transactions } = useStore()

  // Revenue by seller
  const sellerRevenue = useMemo(() =>
    sellers.map(s => ({
      seller: s,
      revenue:    invoices.filter(i => i.seller_id === s.id).reduce((sum, i) => sum + i.total_amount, 0),
      collected:  invoices.filter(i => i.seller_id === s.id).reduce((sum, i) => sum + i.paid_amount, 0),
      orders:     orders.filter(o => o.seller_id === s.id).length,
      fulfilled:  orders.filter(o => o.seller_id === s.id && (o.status === 'fulfilled' || o.status === 'dispatched')).length,
    })).sort((a, b) => b.revenue - a.revenue)
  , [sellers, invoices, orders])

  const maxRevenue = Math.max(...sellerRevenue.map(s => s.revenue), 1)

  // Orders by day of week (last 90 days)
  const dowData = useMemo(() => {
    const labels  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const counts  = [0, 0, 0, 0, 0, 0, 0]
    const cutoff  = Date.now() - 90 * 86400000
    orders.forEach(o => {
      const d = new Date(o.created_at)
      if (d.getTime() > cutoff) counts[(d.getDay() + 6) % 7]++
    })
    const max = Math.max(...counts, 1)
    return labels.map((l, i) => ({ label: l, count: counts[i], pct: Math.round(counts[i] / max * 100) }))
  }, [orders])

  // Revenue by month (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 5; i >= 0; i--) {
      const d  = new Date()
      d.setMonth(d.getMonth() - i)
      map.set(d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }), 0)
    }
    invoices.forEach(inv => {
      const d   = new Date(inv.created_at)
      const key = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' })
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + inv.total_amount)
    })
    const entries = Array.from(map.entries())
    const maxVal  = Math.max(...entries.map(([, v]) => v), 1)
    return entries.map(([label, val]) => ({ label, val, pct: Math.round(val / maxVal * 100) }))
  }, [invoices])

  // Top SKUs by stock
  const topSku = [...inventory].sort((a, b) => b.good_stock - a.good_stock).slice(0, 8)

  // KPI summary
  const fulfilmentRate = orders.length > 0
    ? Math.round(orders.filter(o => o.status === 'fulfilled' || o.status === 'dispatched').length / orders.length * 100)
    : 0
  const avgOrderValue = orders.filter(o => o.total_cost).length > 0
    ? orders.filter(o => o.total_cost).reduce((s, o) => s + (o.total_cost ?? 0), 0) / orders.filter(o => o.total_cost).length
    : 0
  const totalRevenue   = invoices.reduce((s, i) => s + i.total_amount, 0)
  const collectionRate = totalRevenue > 0
    ? Math.round(invoices.reduce((s, i) => s + i.paid_amount, 0) / totalRevenue * 100)
    : 0

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Analytics</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">Performance insights across all modules</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm">📥 Export Report</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {[
          { label: 'Total Revenue',    val: fmtGBP(totalRevenue),          sub: `${collectionRate}% collected`,       color: '#0E2040' },
          { label: 'Fulfilment Rate',  val: `${fulfilmentRate}%`,           sub: `${orders.filter(o => o.status === 'fulfilled' || o.status === 'dispatched').length} of ${orders.length} orders`, color: '#1A7A48' },
          { label: 'Avg Order Value',  val: fmtGBP(avgOrderValue),         sub: `across all sellers`,                 color: '#C8971A' },
          { label: 'Active Sellers',   val: String(sellers.filter(s => s.status === 'active').length), sub: `of ${sellers.length} total`, color: '#2A4F8A' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{k.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: k.color }}>{k.val}</div>
            <div className="text-[11px] mt-1 text-[#7A8BA0]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Monthly revenue chart */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">📈 Monthly Revenue (Last 6 Months)</div>
          <div className="flex items-end gap-2 h-[100px]">
            {monthlyRevenue.map(m => (
              <div key={m.label} className="flex-1 text-center">
                <div className="text-[9px] text-[#7A8BA0] mb-1">{m.val > 0 ? fmtGBP(m.val) : ''}</div>
                <div
                  className="rounded-t w-full mx-auto"
                  style={{ height: `${Math.max(m.pct, 6)}%`, background: 'linear-gradient(180deg,#E8B830,#9E7410)', minHeight: 4 }}
                />
                <div className="text-[9px] text-[#7A8BA0] mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Day of week chart */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">📅 Orders by Day of Week</div>
          <div className="flex items-end gap-2 h-[100px]">
            {dowData.map(d => (
              <div key={d.label} className="flex-1 text-center">
                <div className="text-[9px] text-[#7A8BA0] mb-1">{d.count > 0 ? d.count : ''}</div>
                <div
                  className="rounded-t w-full mx-auto"
                  style={{ height: `${Math.max(d.pct, 6)}%`, background: 'linear-gradient(180deg,#2A6DC8,#1B3A6B)', minHeight: 4 }}
                />
                <div className="text-[9px] text-[#7A8BA0] mt-1">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Seller revenue breakdown */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">🏆 Revenue by Seller</div>
          <div className="space-y-3">
            {sellerRevenue.length === 0 ? (
              <p className="text-[#7A8BA0] text-xs text-center py-4">No data yet</p>
            ) : sellerRevenue.map(({ seller, revenue, collected, orders: ord, fulfilled }) => {
              const pct = maxRevenue > 0 ? Math.round(revenue / maxRevenue * 100) : 0
              const collPct = revenue > 0 ? Math.round(collected / revenue * 100) : 0
              return (
                <div key={seller.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#4A5A70]">{seller.icon} {seller.name}</span>
                    <div className="text-right">
                      <span className="font-semibold text-[#0E2040]">{fmtGBP(revenue)}</span>
                      <span className="text-xs text-[#7A8BA0] ml-2">{ord} orders · {collPct}% paid</span>
                    </div>
                  </div>
                  <div className="pb">
                    <div className="pf" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#C8971A,#9E7410)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top SKUs by stock level */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">📦 Top SKUs by Stock</div>
          <table className="kh-table">
            <thead>
              <tr><th>SKU</th><th>Product</th><th>Stock</th><th>Reserved</th><th>Available</th></tr>
            </thead>
            <tbody>
              {topSku.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-[#7A8BA0]">No inventory data</td></tr>
              ) : topSku.map(item => {
                const avail = item.good_stock - item.reserved
                return (
                  <tr key={item.id}>
                    <td className="font-mono text-xs">{item.sku}</td>
                    <td className="text-xs max-w-[120px] truncate">{item.product_name}</td>
                    <td className="text-center font-semibold">{item.good_stock}</td>
                    <td className="text-center text-[#7A8BA0]">{item.reserved}</td>
                    <td className="text-center">
                      <span className={`badge ${avail <= 0 ? 'badge-red' : avail <= 5 ? 'badge-yellow' : 'badge-green'}`}>{avail}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
