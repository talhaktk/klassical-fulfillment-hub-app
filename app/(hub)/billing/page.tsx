'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate, statusBadge } from '@/lib/utils'
import type { Invoice } from '@/types/database'

export default function BillingPage() {
  const { invoices, sellers, bankAccounts, sendReminder, markInvoicePaid, loadInvoices } = useStore()
  const [sellerF, setSellerF] = useState('all')
  const [statusF, setStatusF] = useState('all')
  const [search,  setSearch]  = useState('')
  const [payModal, setPayModal] = useState<Invoice | null>(null)
  const [payAmt,   setPayAmt]   = useState('')
  const [payAcct,  setPayAcct]  = useState('')
  const [sending,  setSending]  = useState<string | null>(null)

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q || inv.invoice_number.toLowerCase().includes(q) || (inv.sellers?.name ?? '').toLowerCase().includes(q)
    const matchStatus = statusF === 'all' || inv.status === statusF
    const matchSeller = sellerF === 'all' || inv.seller_id === sellerF
    return matchSearch && matchStatus && matchSeller
  })

  const totals = {
    total:       filtered.reduce((s, i) => s + i.total_amount, 0),
    paid:        filtered.reduce((s, i) => s + i.paid_amount,  0),
    outstanding: filtered.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0),
  }

  async function handleReminder(inv: Invoice) {
    setSending(inv.id)
    await sendReminder(inv.seller_id, inv.id, ['email', 'whatsapp'])
    setSending(null)
  }

  async function handlePay() {
    if (!payModal || !payAcct || !payAmt) return
    await markInvoicePaid(payModal.id, parseFloat(payAmt), payAcct)
    setPayModal(null)
    setPayAmt('')
    setPayAcct('')
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Billing &amp; Invoices</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {invoices.filter(i => i.status === 'overdue').length} overdue ·{' '}
            {invoices.filter(i => i.status === 'pending' || i.status === 'sent').length} awaiting payment
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input className="kh-input !w-44" placeholder="🔍 Search invoice…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="kh-input !w-36" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
          <select className="kh-input !w-36" value={sellerF} onChange={e => setSellerF(e.target.value)}>
            <option value="all">All Sellers</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3.5 mb-5">
        {[
          { label: 'Total Invoiced',   val: fmtGBP(totals.total),       color: '#0E2040' },
          { label: 'Collected',        val: fmtGBP(totals.paid),         color: '#1A7A48' },
          { label: 'Outstanding',      val: fmtGBP(totals.outstanding),  color: '#C0321E' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{s.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Invoice table */}
      <div className="kh-card">
        <table className="kh-table">
          <thead>
            <tr>
              <th>Invoice #</th><th>Seller</th><th>Period</th><th>Total</th>
              <th>Paid</th><th>Outstanding</th><th>Status</th><th>Due</th>
              <th>Reminders</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-[#7A8BA0]">No invoices found</td></tr>
            ) : filtered.map(inv => {
              const outstanding = Math.max(0, inv.total_amount - inv.paid_amount)
              const pct = inv.total_amount > 0 ? Math.round((inv.paid_amount / inv.total_amount) * 100) : 0
              return (
                <tr key={inv.id}>
                  <td className="font-bold text-[#142D56] font-mono">{inv.invoice_number}</td>
                  <td>
                    <span className="badge badge-navy">
                      {inv.sellers?.icon} {inv.sellers?.name ?? '—'}
                    </span>
                  </td>
                  <td className="text-xs text-[#7A8BA0]">{inv.period_label ?? '—'}</td>
                  <td className="font-semibold">{fmtGBP(inv.total_amount)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1A7A48] font-semibold">{fmtGBP(inv.paid_amount)}</span>
                      <div className="pb w-12">
                        <div className="pf" style={{ width: `${pct}%`, background: '#1A7A48' }} />
                      </div>
                    </div>
                  </td>
                  <td className={outstanding > 0 ? 'font-semibold text-[#C0321E]' : 'text-[#7A8BA0]'}>
                    {outstanding > 0 ? fmtGBP(outstanding) : '—'}
                  </td>
                  <td>
                    <span className={statusBadge(inv.status)}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                  </td>
                  <td className="text-xs text-[#7A8BA0]">{inv.due_date ? fmtDate(inv.due_date) : '—'}</td>
                  <td className="text-center text-xs text-[#7A8BA0]">{inv.reminders_sent ?? 0}</td>
                  <td>
                    <div className="flex gap-1">
                      {inv.status !== 'paid' && (
                        <>
                          <button
                            className="btn-gold btn-sm"
                            onClick={() => { setPayModal(inv); setPayAmt(String(outstanding.toFixed(2))); setPayAcct(bankAccounts[0]?.id ?? '') }}
                          >
                            💳 Pay
                          </button>
                          <button
                            className="btn-ghost btn-sm"
                            disabled={sending === inv.id}
                            onClick={() => handleReminder(inv)}
                          >
                            {sending === inv.id ? '…' : '🔔'}
                          </button>
                        </>
                      )}
                      {inv.status === 'paid' && <span className="text-[#1A7A48] text-xs font-semibold">✓ Paid</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pay modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[420px]" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">
              Record Payment — {payModal.invoice_number}
            </div>
            <div className="text-sm text-[#7A8BA0] mb-4">
              Outstanding: <strong className="text-[#C0321E]">{fmtGBP(Math.max(0, payModal.total_amount - payModal.paid_amount))}</strong>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Amount (£)</label>
                <input className="kh-input w-full" type="number" step="0.01" value={payAmt} onChange={e => setPayAmt(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Bank Account</label>
                <select className="kh-input w-full" value={payAcct} onChange={e => setPayAcct(e.target.value)}>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} — {fmtGBP(a.balance)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-gold flex-1" onClick={handlePay}>Confirm Payment</button>
              <button className="btn-ghost flex-1" onClick={() => setPayModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
