'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate, statusBadge } from '@/lib/utils'
import Link from 'next/link'
import type { Seller, Order, Invoice, InventoryItem } from '@/types/database'

export default function SellerPortalPage() {
  const { sellers, orders, invoices, inventory, role } = useStore()
  const [activeSeller, setActiveSeller] = useState(sellers[0]?.id ?? '')

  const seller       = sellers.find(s => s.id === activeSeller)
  const sellerOrders = orders.filter(o => o.seller_id === activeSeller).slice(0, 10)
  const sellerInv    = invoices.filter(i => i.seller_id === activeSeller)
  const sellerStock  = inventory.filter(i => i.seller_id === activeSeller)
  const outstanding = sellerInv.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0)
  const pendingOrds = sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const lowStock    = sellerStock.filter(i => (i.good_stock - i.reserved) <= 5).length

  if (role !== 'seller' && role !== 'admin') {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Seller Portal</h1>
            <p className="text-sm text-[#7A8BA0] mt-0.5">Preview seller view — select a seller to see their portal</p>
          </div>
          <select className="kh-input !w-48" value={activeSeller} onChange={e => setActiveSeller(e.target.value)}>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <SellerView seller={seller} sellerOrders={sellerOrders} sellerInv={sellerInv} sellerStock={sellerStock} outstanding={outstanding} pendingOrds={pendingOrds} lowStock={lowStock} />
      </div>
    )
  }

  return (
    <div className="p-6 animate-fadeIn">
      <SellerView seller={seller} sellerOrders={sellerOrders} sellerInv={sellerInv} sellerStock={sellerStock} outstanding={outstanding} pendingOrds={pendingOrds} lowStock={lowStock} />
    </div>
  )
}

interface SellerViewProps {
  seller:       Seller | undefined
  sellerOrders: Order[]
  sellerInv:    Invoice[]
  sellerStock:  InventoryItem[]
  outstanding:  number
  pendingOrds:  number
  lowStock:     number
}

function SellerView({ seller, sellerOrders, sellerInv, sellerStock, outstanding, pendingOrds, lowStock }: SellerViewProps) {
  if (!seller) return <div className="kh-card text-center py-10 text-[#7A8BA0]">Select a seller</div>

  return (
    <>
      {/* Welcome header */}
      <div
        className="rounded-xl px-5 py-5 mb-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,#0E2040,#1B3A6B)', border: '1px solid rgba(200,151,26,.3)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{seller.icon}</span>
          <div>
            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{seller.name}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>
              Partner since {seller.since_date ? fmtDate(seller.since_date) : '—'} · {seller.status}
            </div>
          </div>
        </div>
        <Link href="/messages" className="btn-gold btn-sm">💬 Message Warehouse</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {[
          { label: 'Pending Orders',  val: pendingOrds,           color: pendingOrds > 0 ? '#C8971A' : '#1A7A48', icon: '📦' },
          { label: 'Total Orders',    val: sellerOrders.length,   color: '#0E2040',  icon: '🛒' },
          { label: 'Outstanding',     val: fmtGBP(outstanding),   color: outstanding > 0 ? '#C0321E' : '#1A7A48', icon: '💰' },
          { label: 'Low Stock Items', val: lowStock,              color: lowStock > 0 ? '#C0321E' : '#1A7A48',     icon: '⚠️' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-lg float-right opacity-40">{s.icon}</div>
            <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{s.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="col-span-2 kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">📋 Recent Orders</div>
          <table className="kh-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {sellerOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-[#7A8BA0]">No orders yet</td></tr>
              ) : sellerOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono font-bold text-[#142D56]">{o.order_number}</td>
                  <td className="text-xs">{o.customer_name ?? '—'}</td>
                  <td className="text-center">{o.order_items?.length ?? 0}</td>
                  <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                  <td className="text-xs text-[#7A8BA0]">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Invoices */}
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-3">🧾 Invoices</div>
            {sellerInv.length === 0 ? (
              <p className="text-xs text-[#7A8BA0]">No invoices</p>
            ) : sellerInv.slice(0, 5).map(inv => {
              const bal = Math.max(0, inv.total_amount - inv.paid_amount)
              return (
                <div key={inv.id} className="flex justify-between py-1.5 border-b border-[#E8ECF2] last:border-0">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[#142D56]">{inv.invoice_number}</div>
                    <div className="text-[10px] text-[#7A8BA0]">{inv.period_label}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${bal > 0 ? 'text-[#C0321E]' : 'text-[#1A7A48]'}`}>
                      {bal > 0 ? fmtGBP(bal) + ' due' : '✓ Paid'}
                    </div>
                    <div className="text-[10px] text-[#7A8BA0]">{fmtGBP(inv.total_amount)} total</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stock levels */}
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-3">📦 Your Inventory</div>
            {sellerStock.length === 0 ? (
              <p className="text-xs text-[#7A8BA0]">No stock in warehouse</p>
            ) : sellerStock.slice(0, 6).map(item => {
              const avail = item.good_stock - item.reserved
              return (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-[#E8ECF2] last:border-0">
                  <span className="text-xs font-mono">{item.sku}</span>
                  <span className={`badge ${avail <= 0 ? 'badge-red' : avail <= 5 ? 'badge-yellow' : 'badge-green'}`}>{avail} units</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
