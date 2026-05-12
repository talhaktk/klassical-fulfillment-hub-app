'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { Seller, Invoice } from '@/types/database'

const BLANK: Omit<Seller, 'id' | 'created_at'> = {
  name: '', email: null, whatsapp: null, website: null,
  status: 'active', since_date: null, icon: '🏪',
}

interface QuickPay {
  seller:          Seller
  unpaidInvoices:  Invoice[]
  outstanding:     number
}

export default function SellersPage() {
  const { sellers, orders, invoices, inventory, transactions, bankAccounts, markInvoicePaid, loadAll } = useStore()

  const [modal,    setModal]    = useState<Partial<Seller> | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')

  // Quick pay state
  const [quickPay,    setQuickPay]    = useState<QuickPay | null>(null)
  const [payInvId,    setPayInvId]    = useState('')
  const [payAmt,      setPayAmt]      = useState('')
  const [payAcctId,   setPayAcctId]   = useState('')
  const [paying,      setPaying]      = useState(false)

  // Derive per-seller stats live from state
  const sellerStats = useMemo(() =>
    sellers.map(seller => {
      const sOrders    = orders.filter(o => o.seller_id === seller.id)
      const sInventory = inventory.filter(i => i.seller_id === seller.id)
      const sInvoices  = invoices.filter(i => i.seller_id === seller.id)
      const sTx        = transactions.filter(t => t.seller_id === seller.id && t.type === 'in')

      const outstanding    = sInvoices.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0)
      const totalRevenue   = sInvoices.reduce((s, i) => s + i.total_amount, 0)
      const pending        = sOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
      const availableStock = sInventory.reduce((s, i) => s + Math.max(0, i.good_stock - i.reserved), 0)
      const overdueCount   = sInvoices.filter(i => i.status === 'overdue').length
      const remindersSent  = sInvoices.reduce((s, i) => s + (i.reminders_sent ?? 0), 0)
      const lastPayment    = sTx[0]?.transaction_date ?? null
      const unpaidInvoices = sInvoices.filter(i => i.status !== 'paid')

      return {
        seller, pending, availableStock,
        skuCount:   sInventory.length,
        orderCount: sOrders.length,
        totalRevenue, outstanding, overdueCount,
        remindersSent, lastPayment, unpaidInvoices,
      }
    })
  , [sellers, orders, inventory, invoices, transactions])

  const filtered = sellerStats.filter(({ seller }) => {
    const q = search.toLowerCase()
    const matchSearch = !q || seller.name.toLowerCase().includes(q) || (seller.email ?? '').toLowerCase().includes(q)
    const matchStatus = statusF === 'all' || seller.status === statusF
    return matchSearch && matchStatus
  })

  function openNew()       { setModal({ ...BLANK }) }
  function openEdit(s: Seller) { setModal({ ...s }) }

  async function handleSave() {
    if (!modal?.name) return
    setSaving(true)
    const db = getSupabaseClient()
    if (modal.id) {
      const { error } = await db.from('sellers').update({
        name: modal.name, email: modal.email, whatsapp: modal.whatsapp,
        website: modal.website, status: modal.status, since_date: modal.since_date, icon: modal.icon,
      }).eq('id', modal.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Seller updated')
    } else {
      const { error } = await db.from('sellers').insert({
        name: modal.name, email: modal.email, whatsapp: modal.whatsapp,
        website: modal.website, status: modal.status ?? 'active', since_date: modal.since_date, icon: modal.icon ?? '🏪',
      })
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Seller added')
    }
    await loadAll()
    setSaving(false)
    setModal(null)
  }

  async function toggleStatus(s: Seller) {
    const newStatus = s.status === 'active' ? 'inactive' : 'active'
    await getSupabaseClient().from('sellers').update({ status: newStatus }).eq('id', s.id)
    await loadAll()
  }

  function openQuickPay(stat: typeof sellerStats[0]) {
    if (stat.unpaidInvoices.length === 0) return
    const qp: QuickPay = {
      seller:         stat.seller,
      unpaidInvoices: stat.unpaidInvoices,
      outstanding:    stat.outstanding,
    }
    setQuickPay(qp)
    const first = stat.unpaidInvoices[0]
    setPayInvId(first.id)
    setPayAmt((Math.max(0, first.total_amount - first.paid_amount)).toFixed(2))
    setPayAcctId(bankAccounts[0]?.id ?? '')
  }

  async function handleQuickPay() {
    if (!quickPay || !payInvId || !payAcctId || !payAmt) return
    setPaying(true)
    try {
      await markInvoicePaid(payInvId, parseFloat(payAmt), payAcctId)
      toast.success(`Payment of ${fmtGBP(parseFloat(payAmt))} recorded for ${quickPay.seller.name}`)
      setQuickPay(null)
    } catch (e: any) {
      toast.error(e.message ?? 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const activeCount = sellers.filter(s => s.status === 'active').length

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Sellers</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {activeCount} active · {sellers.length} total — master client registry
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input className="kh-input !w-44" placeholder="🔍 Search sellers…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="kh-input !w-32" value={statusF} onChange={e => setStatusF(e.target.value as any)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="btn-gold btn-sm" onClick={openNew}>+ Add Seller</button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Active Sellers',      val: String(activeCount) },
          { label: 'Total Orders',        val: String(orders.length) },
          { label: 'Total Outstanding',   val: fmtGBP(invoices.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0)) },
          { label: 'Total Revenue Billed',val: fmtGBP(invoices.reduce((s, i) => s + i.total_amount, 0)) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-[10px] uppercase tracking-[.5px] text-[#7A8BA0] font-semibold mb-1">{s.label}</div>
            <div className="text-xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Seller cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 kh-card text-center py-10 text-[#7A8BA0]">No sellers match your filter</div>
        )}
        {filtered.map(({ seller, pending, availableStock, skuCount, orderCount, totalRevenue, outstanding, overdueCount, remindersSent, lastPayment, unpaidInvoices }) => (
          <div
            key={seller.id}
            className="kh-card"
            style={{ borderTopColor: seller.status === 'active' ? '#1A7A48' : seller.status === 'suspended' ? '#C0321E' : '#7A8BA0' }}
          >
            {/* Card header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#F0F4FA' }}
                >
                  {seller.icon}
                </div>
                <div>
                  <div className="font-bold text-lg text-[#0E2040] leading-tight">{seller.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`badge ${seller.status === 'active' ? 'badge-green' : seller.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}>
                      {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                    </span>
                    {seller.since_date && (
                      <span className="text-xs text-[#7A8BA0]">Since {fmtDate(seller.since_date)}</span>
                    )}
                    {overdueCount > 0 && (
                      <span className="badge badge-red">{overdueCount} overdue</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                <button className="btn-ghost btn-sm" onClick={() => openEdit(seller)}>✏️ Edit</button>
                <button className="btn-ghost btn-sm" onClick={() => toggleStatus(seller)}>
                  {seller.status === 'active' ? '⏸' : '▶'}
                </button>
              </div>
            </div>

            {/* Live stats — all derived from state */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {[
                { label: 'Orders',    val: orderCount,              highlight: false },
                { label: 'Pending',   val: pending,                 highlight: pending > 0 },
                { label: 'SKUs',      val: skuCount,                highlight: false },
                { label: 'Avail. Stock', val: availableStock,       highlight: false },
                { label: 'Revenue',   val: fmtGBP(totalRevenue),    highlight: false },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: '#F0F4FA' }}>
                  <div className="text-[9px] uppercase text-[#7A8BA0] font-semibold leading-tight">{stat.label}</div>
                  <div className={`text-sm font-bold mt-0.5 ${stat.highlight ? 'text-[#C8971A]' : 'text-[#0E2040]'}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="text-xs text-[#7A8BA0] flex flex-wrap gap-3 mb-3">
              {seller.email    && <span>✉️ {seller.email}</span>}
              {seller.whatsapp && <span>📱 {seller.whatsapp}</span>}
              {seller.website  && <span>🌐 {seller.website}</span>}
              {remindersSent > 0 && <span className="text-[#C8971A]">🔔 {remindersSent} reminder{remindersSent > 1 ? 's' : ''} sent</span>}
              {lastPayment && <span className="text-[#1A7A48]">💳 Last paid {fmtDate(lastPayment)}</span>}
            </div>

            {/* Outstanding balance + action row */}
            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E8ECF2' }}>
              <div>
                {outstanding > 0 ? (
                  <div>
                    <span className="text-xs font-bold text-[#C0321E]">Outstanding: {fmtGBP(outstanding)}</span>
                    {overdueCount > 0 && <span className="text-xs text-[#C0321E] ml-2">· {overdueCount} overdue</span>}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-[#1A7A48]">✓ Account cleared</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <Link
                  href="/rate-cards"
                  className="btn-ghost btn-sm text-xs"
                  style={{ fontSize: 11 }}
                >
                  💰 Rate Card
                </Link>
                {outstanding > 0 && (
                  <button
                    className="btn-gold btn-sm text-xs"
                    style={{ fontSize: 11 }}
                    onClick={() => openQuickPay({ seller, pending, availableStock, skuCount, orderCount, totalRevenue, outstanding, overdueCount, remindersSent, lastPayment, unpaidInvoices })}
                  >
                    💳 Pay
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit seller modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[500px]" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">
              {modal.id ? 'Edit Seller' : 'Add New Seller'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Company Name *</label>
                <input className="kh-input w-full" value={modal.name ?? ''} onChange={e => setModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Icon (emoji)</label>
                <input className="kh-input w-full" value={modal.icon ?? '🏪'} onChange={e => setModal(m => m ? { ...m, icon: e.target.value } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Status</label>
                <select className="kh-input w-full" value={modal.status ?? 'active'} onChange={e => setModal(m => m ? { ...m, status: e.target.value as any } : m)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Email</label>
                <input className="kh-input w-full" type="email" value={modal.email ?? ''} onChange={e => setModal(m => m ? { ...m, email: e.target.value || null } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">WhatsApp</label>
                <input className="kh-input w-full" value={modal.whatsapp ?? ''} onChange={e => setModal(m => m ? { ...m, whatsapp: e.target.value || null } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Website</label>
                <input className="kh-input w-full" value={modal.website ?? ''} onChange={e => setModal(m => m ? { ...m, website: e.target.value || null } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Since Date</label>
                <input className="kh-input w-full" type="date" value={modal.since_date ?? ''} onChange={e => setModal(m => m ? { ...m, since_date: e.target.value || null } : m)} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-gold flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal.id ? 'Update Seller' : 'Add Seller'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Pay modal */}
      {quickPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[440px]" style={{ border: '2px solid #C8971A' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-base font-bold text-[#0E2040]">Record Payment</div>
                <div className="text-xs text-[#7A8BA0] mt-0.5">{quickPay.seller.icon} {quickPay.seller.name}</div>
              </div>
              <button onClick={() => setQuickPay(null)} className="text-[#7A8BA0] text-lg">✕</button>
            </div>

            <div className="p-3 rounded-lg mb-4" style={{ background: '#FFF5E0', border: '1px solid rgba(200,151,26,.3)' }}>
              <div className="text-xs text-[#9E7410] font-semibold">Total outstanding</div>
              <div className="text-2xl font-bold text-[#C0321E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {fmtGBP(quickPay.outstanding)}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Invoice</label>
                <select
                  className="kh-input w-full"
                  value={payInvId}
                  onChange={e => {
                    setPayInvId(e.target.value)
                    const inv = quickPay.unpaidInvoices.find(i => i.id === e.target.value)
                    if (inv) setPayAmt((Math.max(0, inv.total_amount - inv.paid_amount)).toFixed(2))
                  }}
                >
                  {quickPay.unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {fmtGBP(Math.max(0, inv.total_amount - inv.paid_amount))} due · {inv.period_label ?? ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Amount (£)</label>
                <input
                  className="kh-input w-full"
                  type="number"
                  step="0.01"
                  value={payAmt}
                  onChange={e => setPayAmt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Bank Account</label>
                <select className="kh-input w-full" value={payAcctId} onChange={e => setPayAcctId(e.target.value)}>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} — {fmtGBP(a.balance)}</option>)}
                </select>
              </div>
            </div>

            <div className="text-xs text-[#7A8BA0] mt-3 p-2.5 rounded-lg" style={{ background: '#F4F6FA' }}>
              This records the payment, updates the invoice status, and adds the amount to the selected bank account — all in one action.
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-ghost flex-1" onClick={() => setQuickPay(null)}>Cancel</button>
              <button className="btn-gold flex-[2]" onClick={handleQuickPay} disabled={paying}>
                {paying ? 'Processing…' : `Confirm ${fmtGBP(parseFloat(payAmt) || 0)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
