'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'
import type { TxPayload } from '@/store'

export default function PaymentsPage() {
  const { bankAccounts, transactions, invoices, sellers, recordTransaction } = useStore()

  const [activeAcct, setActiveAcct] = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [form, setForm]             = useState<TxPayload>({
    account_id:  '',
    type:        'in',
    category:    'Seller Payment',
    description: '',
    amount:      0,
    seller_id:   undefined,
    invoice_id:  undefined,
  })

  const displayTx = activeAcct
    ? transactions.filter(t => t.account_id === activeAcct)
    : transactions

  const acct = activeAcct ? bankAccounts.find(a => a.id === activeAcct) : null

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid')

  async function handleSave() {
    if (!form.account_id || !form.description || !form.amount) return
    setSaving(true)
    await recordTransaction(form)
    setSaving(false)
    setShowForm(false)
    setForm({ account_id: '', type: 'in', category: 'Seller Payment', description: '', amount: 0 })
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Bank &amp; Payments</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            Total cash: <strong className="text-[#0E2040]">{fmtGBP(bankAccounts.reduce((s, a) => s + a.balance, 0))}</strong>
          </p>
        </div>
        <button className="btn-gold btn-sm" onClick={() => { setShowForm(true); setForm(f => ({ ...f, account_id: bankAccounts[0]?.id ?? '' })) }}>
          + Record Transaction
        </button>
      </div>

      {/* Bank account cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div
          className={`stat-card cursor-pointer transition-all ${!activeAcct ? 'ring-2 ring-[#C8971A]' : ''}`}
          onClick={() => setActiveAcct(null)}
        >
          <div className="text-lg float-right opacity-40">🏦</div>
          <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">All Accounts</div>
          <div className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {fmtGBP(bankAccounts.reduce((s, a) => s + a.balance, 0))}
          </div>
          <div className="text-[11px] mt-1 text-[#7A8BA0]">{bankAccounts.length} accounts</div>
        </div>
        {bankAccounts.map(a => (
          <div
            key={a.id}
            className={`stat-card cursor-pointer transition-all ${activeAcct === a.id ? 'ring-2 ring-[#C8971A]' : ''}`}
            onClick={() => setActiveAcct(a.id)}
          >
            <div className="text-lg float-right opacity-40">{a.icon}</div>
            <div className="text-[11px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{a.name}</div>
            <div className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {fmtGBP(a.balance)}
            </div>
            <div className="text-[11px] mt-1 text-[#7A8BA0]">{a.account_number_masked ?? a.account_type}</div>
          </div>
        ))}
      </div>

      {/* Transaction ledger */}
      <div className="kh-card">
        <div className="text-sm font-bold text-[#0E2040] mb-4">
          {acct ? `${acct.icon} ${acct.name} — Transactions` : 'All Transactions'}
          <span className="ml-2 text-xs font-normal text-[#7A8BA0]">({displayTx.length} records)</span>
        </div>
        <table className="kh-table">
          <thead>
            <tr>
              <th>Date</th><th>Account</th><th>Type</th><th>Category</th>
              <th>Description</th><th>Seller</th><th>Invoice</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayTx.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-[#7A8BA0]">No transactions</td></tr>
            ) : displayTx.map(tx => (
              <tr key={tx.id}>
                <td className="text-xs text-[#7A8BA0]">{fmtDate(tx.transaction_date)}</td>
                <td className="text-xs">{tx.bank_accounts?.name ?? '—'}</td>
                <td>
                  <span className={`badge ${tx.type === 'in' ? 'badge-green' : 'badge-red'}`}>
                    {tx.type === 'in' ? '↓ IN' : '↑ OUT'}
                  </span>
                </td>
                <td className="text-xs text-[#7A8BA0]">{tx.category ?? '—'}</td>
                <td className="text-xs max-w-[200px] truncate">{tx.description ?? '—'}</td>
                <td className="text-xs">{tx.sellers?.name ?? '—'}</td>
                <td className="font-mono text-xs text-[#7A8BA0]">{tx.invoices?.invoice_number ?? '—'}</td>
                <td className={`font-bold ${tx.type === 'in' ? 'text-[#1A7A48]' : 'text-[#C0321E]'}`}>
                  {tx.type === 'in' ? '+' : '-'}{fmtGBP(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record transaction modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[480px]" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">Record Transaction</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Bank Account</label>
                <select className="kh-input w-full" value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}>
                  <option value="">Select account…</option>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Type</label>
                <select className="kh-input w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'in' | 'out' }))}>
                  <option value="in">Money In (↓)</option>
                  <option value="out">Money Out (↑)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Category</label>
                <select className="kh-input w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option>Seller Payment</option>
                  <option>Refund</option>
                  <option>Operational Cost</option>
                  <option>Transfer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Amount (£)</label>
                <input className="kh-input w-full" type="number" step="0.01" min="0" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Description</label>
                <input className="kh-input w-full" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="E.g. Seller payment for April invoices" />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Seller (optional)</label>
                <select className="kh-input w-full" value={form.seller_id ?? ''} onChange={e => setForm(f => ({ ...f, seller_id: e.target.value || undefined }))}>
                  <option value="">None</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Link Invoice (optional)</label>
                <select className="kh-input w-full" value={form.invoice_id ?? ''} onChange={e => setForm(f => ({ ...f, invoice_id: e.target.value || undefined }))}>
                  <option value="">None</option>
                  {unpaidInvoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number} — {fmtGBP(i.total_amount - i.paid_amount)} due</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-gold flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Record Transaction'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
