'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtDate, statusBadge, priorityBadge, fmtGBP } from '@/lib/utils'
import Link from 'next/link'
import type { Order } from '@/types/database'

export default function OrdersPage() {
  const { orders, sellers } = useStore()
  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState('all')
  const [sellerF,  setSellerF]  = useState('all')

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q || o.order_number.toLowerCase().includes(q) || (o.sellers?.name ?? '').toLowerCase().includes(q) || (o.customer_name ?? '').toLowerCase().includes(q)
    const matchStatus = statusF === 'all' || o.status === statusF
    const matchSeller = sellerF === 'all' || o.seller_id === sellerF
    return matchSearch && matchStatus && matchSeller
  })

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>All Orders</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {orders.filter(o=>o.status==='pending'||o.status==='processing').length} pending ·{' '}
            {orders.filter(o=>o.status==='fulfilled'||o.status==='dispatched').length} fulfilled
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            className="kh-input !w-48"
            placeholder="🔍 Search order / SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="kh-input !w-36" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="dispatched">Dispatched</option>
          </select>
          <select className="kh-input !w-36" value={sellerF} onChange={e => setSellerF(e.target.value)}>
            <option value="all">All Sellers</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn-gold btn-sm">Export CSV</button>
        </div>
      </div>

      <div className="kh-card">
        <table className="kh-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Seller</th><th>Customer</th><th>Items</th>
              <th>Carrier</th><th>Status</th><th>Priority</th><th>Date</th><th>Total</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-[#7A8BA0]">No orders found</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id}>
                <td className="font-bold text-[#142D56] font-mono">{o.order_number}</td>
                <td><span className="badge badge-navy">{o.sellers?.name ?? '—'}</span></td>
                <td>{o.customer_name ?? '—'}</td>
                <td className="text-center">{o.order_items?.length ?? 0}</td>
                <td className="text-[#7A8BA0] text-xs">{o.carrier}</td>
                <td><span className={statusBadge(o.status)}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                <td><span className={priorityBadge(o.priority)}>{o.priority.toUpperCase()}</span></td>
                <td className="text-[#7A8BA0] text-xs">{fmtDate(o.created_at)}</td>
                <td className="font-semibold">{o.total_cost ? fmtGBP(o.total_cost) : '—'}</td>
                <td>
                  {(o.status === 'pending' || o.status === 'processing') ? (
                    <Link href={`/fulfill/${o.id}`} className="btn-gold btn-sm">⚡ Fulfill</Link>
                  ) : (
                    <button className="btn-ghost btn-sm">📄 Invoice</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
