'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate, statusBadge } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import LabelUpload from '@/components/seller-portal/LabelUpload'
import type { Seller, Order, Invoice, InventoryItem } from '@/types/database'

type Tab = 'overview' | 'orders' | 'inventory' | 'invoices' | 'labels'
const VALID_TABS: Tab[] = ['overview', 'orders', 'inventory', 'invoices', 'labels']

export default function SellerPortalPage() {
  const { sellers, orders, invoices, inventory, role, currentUser } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const paramTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(
    paramTab && VALID_TABS.includes(paramTab) ? paramTab : 'overview'
  )

  useEffect(() => {
    if (paramTab && VALID_TABS.includes(paramTab) && paramTab !== tab) setTab(paramTab)
  }, [paramTab])

  // Seller users are locked to their own seller account
  const defaultSellerId = currentUser?.role === 'seller' && currentUser.seller_id
    ? currentUser.seller_id
    : (sellers[0]?.id ?? '')

  const [activeSeller, setActiveSeller] = useState(defaultSellerId)
  const isSellerRole = role === 'seller'

  const seller       = sellers.find(s => s.id === activeSeller)
  const sellerOrders = orders.filter(o => o.seller_id === activeSeller)
  const sellerInv    = invoices.filter(i => i.seller_id === activeSeller)
  const sellerStock  = inventory.filter(i => i.seller_id === activeSeller)
  const outstanding  = sellerInv.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0)
  const pendingOrds  = sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const lowStock     = sellerStock.filter(i => (i.good_stock - i.reserved) <= 5).length

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',   label: '📊 Overview' },
    { id: 'orders',     label: '📋 Orders' },
    { id: 'inventory',  label: '📦 Inventory' },
    { id: 'invoices',   label: '🧾 Invoices' },
    { id: 'labels',     label: '🏷 Upload Labels' },
  ]

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Seller Portal</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {isSellerRole ? seller?.name : 'Preview seller view'}
          </p>
        </div>
        {!isSellerRole && sellers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A8BA0]">Viewing as:</span>
            <select className="kh-input !w-48" value={activeSeller} onChange={e => setActiveSeller(e.target.value)}>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {!seller ? (
        <div className="kh-card text-center py-10 text-[#7A8BA0]">No sellers found. Add a seller first.</div>
      ) : (
        <>
          {/* Seller banner */}
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
              { label: 'Pending Orders',  val: pendingOrds,         color: pendingOrds > 0 ? '#C8971A' : '#1A7A48', icon: '📦' },
              { label: 'Total Orders',    val: sellerOrders.length, color: '#0E2040', icon: '🛒' },
              { label: 'Outstanding',     val: fmtGBP(outstanding), color: outstanding > 0 ? '#C0321E' : '#1A7A48', icon: '💰' },
              { label: 'Low Stock Items', val: lowStock,            color: lowStock > 0 ? '#C0321E' : '#1A7A48', icon: '⚠️' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="text-lg float-right opacity-40">{s.icon}</div>
                <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{s.label}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-[#E8ECF2]">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg"
                style={{
                  color:      tab === t.id ? '#0E2040' : '#7A8BA0',
                  background: tab === t.id ? 'white' : 'transparent',
                  borderBottom: tab === t.id ? '2px solid #C8971A' : '2px solid transparent',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'overview' && (
            <div className="grid grid-cols-3 gap-4">
              {/* Recent orders */}
              <div className="col-span-2 kh-card">
                <div className="text-sm font-bold text-[#0E2040] mb-4">Recent Orders</div>
                <table className="kh-table">
                  <thead>
                    <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {sellerOrders.slice(0, 8).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-[#7A8BA0]">No orders yet</td></tr>
                    ) : sellerOrders.slice(0, 8).map(o => (
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
              {/* Invoices + stock summary */}
              <div className="space-y-4">
                <div className="kh-card">
                  <div className="text-sm font-bold text-[#0E2040] mb-3">Recent Invoices</div>
                  {sellerInv.length === 0 ? (
                    <p className="text-xs text-[#7A8BA0]">No invoices</p>
                  ) : sellerInv.slice(0, 4).map(inv => {
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
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="kh-card">
                  <div className="text-sm font-bold text-[#0E2040] mb-3">Stock Summary</div>
                  {sellerStock.slice(0, 6).map(item => {
                    const avail = item.good_stock - item.reserved
                    return (
                      <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-[#E8ECF2] last:border-0">
                        <span className="text-xs font-mono">{item.sku}</span>
                        <span className={`badge ${avail <= 0 ? 'badge-red' : avail <= 5 ? 'badge-yellow' : 'badge-green'}`}>{avail}</span>
                      </div>
                    )
                  })}
                  {sellerStock.length === 0 && <p className="text-xs text-[#7A8BA0]">No stock in warehouse</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="kh-card">
              <table className="kh-table">
                <thead>
                  <tr><th>Order #</th><th>Customer</th><th>Address</th><th>Carrier</th><th>Items</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {sellerOrders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#7A8BA0]">No orders yet</td></tr>
                  ) : sellerOrders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono font-bold text-[#142D56]">{o.order_number}</td>
                      <td className="text-xs">{o.customer_name ?? '—'}</td>
                      <td className="text-xs text-[#7A8BA0]">{o.customer_address ?? '—'} {o.customer_postcode}</td>
                      <td className="text-xs">{o.carrier}</td>
                      <td className="text-center">{o.order_items?.length ?? 0}</td>
                      <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                      <td className="text-xs text-[#7A8BA0]">{fmtDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'inventory' && (
            <div className="kh-card">
              <table className="kh-table">
                <thead>
                  <tr><th>SKU</th><th>Product</th><th>Variant</th><th>Total In</th><th>Good Stock</th><th>Reserved</th><th>Available</th><th>Location</th></tr>
                </thead>
                <tbody>
                  {sellerStock.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-[#7A8BA0]">No inventory</td></tr>
                  ) : sellerStock.map(item => {
                    const avail = item.good_stock - item.reserved
                    return (
                      <tr key={item.id}>
                        <td className="font-mono text-xs text-[#142D56]">{item.sku}</td>
                        <td className="font-medium text-[#0E2040]">{item.product_name}</td>
                        <td className="text-xs text-[#7A8BA0]">{item.variant ?? '—'}</td>
                        <td className="text-center">{item.total_in}</td>
                        <td className="text-center">{item.good_stock}</td>
                        <td className="text-center">{item.reserved}</td>
                        <td className="text-center">
                          <span className={`badge ${avail <= 0 ? 'badge-red' : avail <= 5 ? 'badge-yellow' : 'badge-green'}`}>{avail}</span>
                        </td>
                        <td className="text-xs font-mono text-[#7A8BA0]">{item.warehouse_location ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'invoices' && (
            <div className="kh-card">
              <table className="kh-table">
                <thead>
                  <tr><th>Invoice #</th><th>Period</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due</th></tr>
                </thead>
                <tbody>
                  {sellerInv.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#7A8BA0]">No invoices</td></tr>
                  ) : sellerInv.map(inv => {
                    const bal = Math.max(0, inv.total_amount - inv.paid_amount)
                    return (
                      <tr key={inv.id}>
                        <td className="font-mono font-bold text-[#142D56]">{inv.invoice_number}</td>
                        <td className="text-xs">{inv.period_label}</td>
                        <td>{fmtGBP(inv.total_amount)}</td>
                        <td className="text-[#1A7A48]">{fmtGBP(inv.paid_amount)}</td>
                        <td className={bal > 0 ? 'text-[#C0321E] font-bold' : 'text-[#7A8BA0]'}>{bal > 0 ? fmtGBP(bal) : '—'}</td>
                        <td><span className={`badge badge-${inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'yellow'}`}>{inv.status}</span></td>
                        <td className="text-xs text-[#7A8BA0]">{inv.due_date ? fmtDate(inv.due_date) : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'labels' && (
            <div className="kh-card">
              <div className="mb-4">
                <h3 className="font-bold text-[#0E2040] mb-1">Upload Shipping Labels</h3>
                <p className="text-xs text-[#7A8BA0]">Upload any carrier labels (PNG, JPG, PDF). AI scans each label, extracts customer details, and creates a separate order per label.</p>
              </div>
              <LabelUpload sellerId={activeSeller} sellerInventory={sellerStock} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
