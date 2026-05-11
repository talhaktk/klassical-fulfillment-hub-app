'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'

export default function StatementsPage() {
  const { invoices, transactions, orders, sellers } = useStore()
  const [sellerF, setSellerF] = useState('all')
  const [period,  setPeriod]  = useState('all')

  // Derive unique periods from invoices
  const periods = useMemo(() => {
    const set = new Set(invoices.map(i => i.period_label).filter(Boolean) as string[])
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [invoices])

  // Build per-seller statement summaries
  const statements = useMemo(() => {
    return sellers.map(seller => {
      const sellerInvoices = invoices.filter(i =>
        i.seller_id === seller.id &&
        (period === 'all' || i.period_label === period)
      )
      const sellerTx = transactions.filter(t =>
        t.seller_id === seller.id && t.type === 'in'
      )
      const sellerOrders = orders.filter(o =>
        o.seller_id === seller.id &&
        (o.status === 'fulfilled' || o.status === 'dispatched')
      )
      const totalCharged = sellerInvoices.reduce((s, i) => s + i.total_amount, 0)
      const totalPaid    = sellerInvoices.reduce((s, i) => s + i.paid_amount,  0)
      const balanceDue   = totalCharged - totalPaid
      const overdueCount = sellerInvoices.filter(i => i.status === 'overdue').length

      return {
        seller,
        invoiceCount: sellerInvoices.length,
        orderCount:   sellerOrders.length,
        totalCharged,
        totalPaid,
        balanceDue,
        overdueCount,
        lastPayment:  sellerTx[0]?.transaction_date ?? null,
      }
    }).filter(s =>
      (sellerF === 'all' || s.seller.id === sellerF) &&
      s.invoiceCount > 0
    )
  }, [sellers, invoices, transactions, orders, sellerF, period])

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Statements</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">Monthly seller account summaries</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="kh-input !w-44" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="all">All Periods</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="kh-input !w-36" value={sellerF} onChange={e => setSellerF(e.target.value)}>
            <option value="all">All Sellers</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn-gold btn-sm">Export All</button>
        </div>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {[
          { label: 'Total Billed',     val: fmtGBP(statements.reduce((s, x) => s + x.totalCharged, 0)), color: '#0E2040' },
          { label: 'Collected',        val: fmtGBP(statements.reduce((s, x) => s + x.totalPaid,    0)), color: '#1A7A48' },
          { label: 'Balance Due',      val: fmtGBP(statements.reduce((s, x) => s + x.balanceDue,   0)), color: '#C0321E' },
          { label: 'Overdue Invoices', val: String(statements.reduce((s, x) => s + x.overdueCount, 0)), color: '#C0321E' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{s.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Per-seller statement cards */}
      <div className="grid grid-cols-2 gap-4">
        {statements.length === 0 && (
          <div className="col-span-2 kh-card text-center py-10 text-[#7A8BA0]">No statements for selected filters</div>
        )}
        {statements.map(({ seller, invoiceCount, orderCount, totalCharged, totalPaid, balanceDue, overdueCount, lastPayment }) => {
          const pct = totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0
          return (
            <div key={seller.id} className="kh-card" style={{ borderTopColor: balanceDue > 0 ? '#C0321E' : '#1A7A48' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{seller.icon}</span>
                  <div>
                    <div className="font-bold text-[#0E2040]">{seller.name}</div>
                    <div className="text-xs text-[#7A8BA0]">{invoiceCount} invoices · {orderCount} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  {overdueCount > 0 && (
                    <span className="badge badge-red">{overdueCount} overdue</span>
                  )}
                  {balanceDue <= 0 && (
                    <span className="badge badge-green">Settled</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2.5 rounded-lg" style={{ background: '#F0F4FA' }}>
                  <div className="text-[10px] uppercase text-[#7A8BA0] font-semibold">Total Billed</div>
                  <div className="text-base font-bold text-[#0E2040] mt-0.5">{fmtGBP(totalCharged)}</div>
                </div>
                <div className="text-center p-2.5 rounded-lg" style={{ background: '#F0FAF4' }}>
                  <div className="text-[10px] uppercase text-[#7A8BA0] font-semibold">Paid</div>
                  <div className="text-base font-bold text-[#1A7A48] mt-0.5">{fmtGBP(totalPaid)}</div>
                </div>
                <div className="text-center p-2.5 rounded-lg" style={{ background: balanceDue > 0 ? '#FFF0EE' : '#F0FAF4' }}>
                  <div className="text-[10px] uppercase text-[#7A8BA0] font-semibold">Balance Due</div>
                  <div className={`text-base font-bold mt-0.5 ${balanceDue > 0 ? 'text-[#C0321E]' : 'text-[#1A7A48]'}`}>{fmtGBP(balanceDue)}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#7A8BA0] mb-1">
                  <span>Payment progress</span>
                  <strong className="text-[#0E2040]">{pct}%</strong>
                </div>
                <div className="pb">
                  <div className="pf" style={{ width: `${pct}%`, background: pct >= 100 ? '#1A7A48' : pct >= 50 ? '#C8971A' : '#C0321E' }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-[#7A8BA0]">
                <span>Last payment: {lastPayment ? fmtDate(lastPayment) : 'Never'}</span>
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm">📄 Download PDF</button>
                  <button className="btn-gold btn-sm">📧 Send</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
