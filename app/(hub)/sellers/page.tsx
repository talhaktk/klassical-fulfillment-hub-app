'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Seller } from '@/types/database'

const BLANK: Omit<Seller, 'id' | 'created_at'> = {
  name: '', email: null, whatsapp: null, website: null,
  status: 'active', since_date: null, icon: '🏪',
}

export default function SellersPage() {
  const { sellers, orders, invoices, inventory, loadAll } = useStore()
  const [modal, setModal]   = useState<Partial<Seller> | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = sellers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  function openNew()      { setModal({ ...BLANK }) }
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
    const db  = getSupabaseClient()
    const newStatus = s.status === 'active' ? 'inactive' : 'active'
    await db.from('sellers').update({ status: newStatus }).eq('id', s.id)
    await loadAll()
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Sellers</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {sellers.filter(s => s.status === 'active').length} active · {sellers.length} total
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input className="kh-input !w-44" placeholder="🔍 Search sellers…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-gold btn-sm" onClick={openNew}>+ Add Seller</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(seller => {
          const sellerOrders    = orders.filter(o => o.seller_id === seller.id)
          const sellerInventory = inventory.filter(i => i.seller_id === seller.id)
          const sellerInvoices  = invoices.filter(i => i.seller_id === seller.id)
          const outstanding     = sellerInvoices.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0)
          const totalRevenue    = sellerInvoices.reduce((s, i) => s + i.total_amount, 0)
          const pending         = sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length

          return (
            <div key={seller.id} className="kh-card" style={{ borderTopColor: seller.status === 'active' ? '#1A7A48' : '#7A8BA0' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{seller.icon}</span>
                  <div>
                    <div className="font-bold text-lg text-[#0E2040]">{seller.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge ${seller.status === 'active' ? 'badge-green' : seller.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}>
                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                      </span>
                      {seller.since_date && (
                        <span className="text-xs text-[#7A8BA0]">Since {fmtDate(seller.since_date)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="btn-ghost btn-sm" onClick={() => openEdit(seller)}>✏️ Edit</button>
                  <button className="btn-ghost btn-sm" onClick={() => toggleStatus(seller)}>
                    {seller.status === 'active' ? '⏸ Deactivate' : '▶ Activate'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Orders',     val: sellerOrders.length },
                  { label: 'Pending',    val: pending,            highlight: pending > 0 },
                  { label: 'SKUs',       val: sellerInventory.length },
                  { label: 'Revenue',    val: fmtGBP(totalRevenue), wide: true },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: '#F0F4FA' }}>
                    <div className="text-[10px] uppercase text-[#7A8BA0] font-semibold">{stat.label}</div>
                    <div className={`text-sm font-bold mt-0.5 ${stat.highlight ? 'text-[#C8971A]' : 'text-[#0E2040]'}`}>{stat.val}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-[#7A8BA0] flex gap-4">
                {seller.email    && <span>✉️ {seller.email}</span>}
                {seller.whatsapp && <span>📱 {seller.whatsapp}</span>}
                {seller.website  && <span>🌐 {seller.website}</span>}
              </div>
              {outstanding > 0 && (
                <div className="mt-2 text-xs font-semibold text-[#C0321E]">
                  Outstanding balance: {fmtGBP(outstanding)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add/Edit modal */}
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
    </div>
  )
}
