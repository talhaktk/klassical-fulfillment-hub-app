'use client'
import { useState } from 'react'
import { useStore, type GRNPayload } from '@/store'
import { fmtGBP, conditionBadge, statusBadge } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { InventoryItem } from '@/types/database'

type InvTab = 'stock' | 'variants' | 'damaged'

export default function InventoryPage() {
  const { inventory, sellers, ratecards, receiveGRN, loadInventory } = useStore()
  const [activeTab,  setActiveTab]  = useState<InvTab>('stock')
  const [searchQ,    setSearchQ]    = useState('')
  const [sellerF,    setSellerF]    = useState('all')
  const [showGRN,    setShowGRN]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [grnRef,     setGrnRef]     = useState(`GRN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`)

  // Quick restock state
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)
  const [restockQty,  setRestockQty]  = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [restocking,  setRestocking]  = useState(false)

  async function submitRestock() {
    if (!restockItem || restockQty < 1) return
    setRestocking(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('inventory')
        .update({
          good_stock: restockItem.good_stock + restockQty,
          total_in:   restockItem.total_in   + restockQty,
        })
        .eq('id', restockItem.id)
      if (error) throw new Error(error.message)
      toast.success(`+${restockQty} units added to ${restockItem.sku}`)
      setRestockItem(null)
      setRestockQty(1)
      setRestockNote('')
      await loadInventory()
    } catch (e: any) {
      toast.error(e.message ?? 'Restock failed')
    } finally {
      setRestocking(false)
    }
  }

  // GRN form state
  const [gSeller,        setGSeller]        = useState(sellers[0]?.id ?? '')
  const [gProduct,       setGProduct]       = useState('')
  const [gSku,           setGSku]           = useState('')
  const [gVariant,       setGVariant]       = useState('')
  const [gPrice,         setGPrice]         = useState('')
  const [gBoxes,         setGBoxes]         = useState(1)
  const [gPerBox,        setGPerBox]        = useState(12)
  const [gLocation,      setGLocation]      = useState('')
  const [gUom,           setGUom]           = useState('Each')
  const [gDamaged,       setGDamaged]       = useState(0)
  const [gCond,          setGCond]          = useState('complete')
  const [gNotes,         setGNotes]         = useState('')
  const [gNotify,        setGNotify]        = useState(true)
  const [gWeightKg,      setGWeightKg]      = useState<number | ''>('')
  const [gBrandingPrice, setGBrandingPrice] = useState<number | ''>('')

  const totalIn   = gBoxes * gPerBox
  const goodUnits = Math.max(0, totalIn - gDamaged)

  // Weight category derived from weight per box
  const weightCat: 'under_12kg' | '12_25kg' | 'over_25kg' =
    gWeightKg === '' || (gWeightKg as number) < 12 ? 'under_12kg'
    : (gWeightKg as number) <= 25 ? '12_25kg'
    : 'over_25kg'

  const sellerRc = ratecards.find(r => r.seller_id === (gSeller || sellers[0]?.id))

  const weightRate =
    weightCat === 'under_12kg' ? (sellerRc?.handling_under_12kg ?? 3.40)
    : weightCat === '12_25kg'  ? (sellerRc?.handling_12_25kg    ?? 4.40)
    :                             (sellerRc?.handling_over_25kg  ?? 5.40)

  const handlingCharge  = parseFloat((gBoxes * weightRate).toFixed(2))
  const brandingCharge  = parseFloat(((gBrandingPrice as number || 0) * goodUnits).toFixed(2))
  const totalGRNInvoice = parseFloat((handlingCharge + brandingCharge).toFixed(2))

  const filtered = inventory.filter(i => {
    const q = searchQ.toLowerCase()
    const ms = !q || i.sku.toLowerCase().includes(q) || i.product_name.toLowerCase().includes(q) || (i.variant ?? '').toLowerCase().includes(q)
    const mf = sellerF === 'all' || i.seller_id === sellerF
    return ms && mf
  })

  const damaged = inventory.filter(i => i.damaged > 0)

  // Group by product for variants view
  const groups: Record<string, typeof inventory> = {}
  inventory.forEach(i => {
    const key = `${i.product_name}__${i.seller_id}`
    if (!groups[key]) groups[key] = []
    groups[key].push(i)
  })

  async function submitGRN() {
    if (!gProduct || !gSku) { toast.error('Product name and SKU are required'); return }
    setSubmitting(true)
    try {
      const payload: GRNPayload = {
        seller_id: gSeller || sellers[0]?.id,
        product_name: gProduct, sku: gSku, variant: gVariant || null,
        unit_price: parseFloat(gPrice) || 0,
        boxes: gBoxes, units_per_box: gPerBox, total_in: totalIn,
        damaged: gDamaged, condition: gCond,
        location: gLocation, uom: gUom, notes: gNotes,
        notify_seller: gNotify,
        weight_per_box_kg: gWeightKg as number || 0,
        weight_category: weightCat,
        branding_price_per_unit: gBrandingPrice as number || 0,
        handling_charge: handlingCharge,
        branding_charge: brandingCharge,
      }
      await receiveGRN(payload)
      const invoiceMsg = totalGRNInvoice > 0 ? ` · Invoice of £${totalGRNInvoice.toFixed(2)} added to statement` : ''
      toast.success(`GRN ${grnRef} submitted — ${goodUnits} units added to inventory${invoiceMsg}`)
      setShowGRN(false)
      setGProduct(''); setGSku(''); setGVariant(''); setGPrice('')
      setGBoxes(1); setGPerBox(12); setGDamaged(0); setGLocation(''); setGNotes('')
      setGWeightKg(''); setGBrandingPrice('')
      setGrnRef(`GRN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`)
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to submit GRN')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 animate-fadeIn">

      {/* Quick Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,22,40,.55)' }}>
          <div className="w-80 rounded-2xl p-5 shadow-2xl" style={{ background: 'white', border: '2px solid #C8971A' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm font-bold text-[#142D56]">Quick Restock</div>
                <div className="text-xs text-[#7A8BA0] mt-0.5 font-mono">{restockItem.sku}</div>
                <div className="text-xs text-[#0E2040] mt-0.5">{restockItem.product_name}{restockItem.variant ? ` — ${restockItem.variant}` : ''}</div>
              </div>
              <button onClick={() => setRestockItem(null)} className="text-[#7A8BA0] text-lg leading-none">✕</button>
            </div>

            <div className="mb-3 p-2.5 rounded-lg text-xs" style={{ background: '#F4F6FA' }}>
              Current good stock: <strong className="text-[#1A7A48]">{restockItem.good_stock}</strong> units
              {restockItem.reserved > 0 && <> · Reserved: <strong className="text-[#C85A00]">{restockItem.reserved}</strong></>}
            </div>

            <div className="mb-3">
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Units to Add</label>
              <input
                type="number"
                min={1}
                className="kh-input w-full text-lg font-bold text-center"
                style={{ color: '#1A7A48' }}
                value={restockQty}
                onChange={e => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Note (optional)</label>
              <input className="kh-input w-full text-xs" placeholder="e.g. Top-up from reserve stock" value={restockNote} onChange={e => setRestockNote(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setRestockItem(null)}>Cancel</button>
              <button className="btn-gold flex-[2]" onClick={submitRestock} disabled={restocking}>
                {restocking ? 'Adding…' : `Add ${restockQty} Unit${restockQty !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Inventory</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">SKU master with variants · Goods receipt · Live stock levels</p>
        </div>
        <div className="flex gap-2 items-center">
          <input className="kh-input !w-44" placeholder="🔍 Search SKU / product..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          <select className="kh-input !w-36" value={sellerF} onChange={e => setSellerF(e.target.value)}>
            <option value="all">All Sellers</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn-navy btn-sm" onClick={() => setShowGRN(v => !v)}>
            📥 {showGRN ? 'Close GRN' : 'Receive New Stock (GRN)'}
          </button>
        </div>
      </div>

      {/* GRN Panel */}
      {showGRN && (
        <div className="kh-card mb-5" style={{ border: '2px solid #C8971A' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-base font-bold text-[#142D56]">📥 Goods Receipt Note (GRN)</div>
              <div className="text-xs text-[#7A8BA0] mt-0.5">Register new stock arrival with full detail</div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-xs text-[#7A8BA0]">GRN Ref: <strong className="font-mono text-[#142D56]">{grnRef}</strong></div>
              <button onClick={() => setShowGRN(false)} className="text-[#7A8BA0] text-lg bg-none border-none cursor-pointer">✕</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Seller</label>
              <select className="kh-input" value={gSeller} onChange={e => setGSeller(e.target.value)}>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Product Name</label>
              <input className="kh-input" placeholder="e.g. Classic T-Shirt" value={gProduct} onChange={e => setGProduct(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">SKU</label>
              <input className="kh-input font-mono" placeholder="e.g. SK-TSHIRT-RED-M" value={gSku} onChange={e => setGSku(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Variant (optional)</label>
              <input className="kh-input" placeholder="e.g. Red / M" value={gVariant} onChange={e => setGVariant(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Unit Price (£)</label>
              <input type="number" step="0.01" className="kh-input font-bold" placeholder="0.00" value={gPrice} onChange={e => setGPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Total Boxes</label>
              <input type="number" min={1} className="kh-input" value={gBoxes} onChange={e => setGBoxes(parseInt(e.target.value)||1)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Units/Box</label>
              <input type="number" min={1} className="kh-input" value={gPerBox} onChange={e => setGPerBox(parseInt(e.target.value)||1)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Total Units</label>
              <input className="kh-input font-bold bg-[#F8F9FC]" readOnly value={totalIn} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Location</label>
              <input className="kh-input" placeholder="e.g. B2-R3-S1" value={gLocation} onChange={e => setGLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Unit of Measure</label>
              <select className="kh-input" value={gUom} onChange={e => setGUom(e.target.value)}>
                {['Each (pcs)','Pair','Pack','Box','Set','kg','ml','L'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Damaged Units</label>
              <input type="number" min={0} className="kh-input" value={gDamaged} onChange={e => setGDamaged(parseInt(e.target.value)||0)} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Good Units</label>
              <input className="kh-input font-bold bg-[#F8F9FC] text-[#1A7A48]" readOnly value={goodUnits} />
            </div>
            <div>
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Overall Condition</label>
              <select className="kh-input" value={gCond} onChange={e => setGCond(e.target.value)}>
                <option value="complete">✅ Complete — No damage</option>
                <option value="partial">⚠️ Partially Damaged</option>
                <option value="damaged">❌ Complete Damage</option>
              </select>
            </div>
          </div>

          {/* Weight & Branding */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#F0F7FF', border: '1px solid #D0E0F0' }}>
            <div className="text-xs font-bold text-[#142D56] mb-3">⚖️ Weight & Branding — used for handling invoice</div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Weight per Box (kg)</label>
                <input
                  type="number" step="0.1" min={0} className="kh-input"
                  placeholder="e.g. 8.5"
                  value={gWeightKg}
                  onChange={e => setGWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Weight Category</label>
                <input
                  className="kh-input bg-[#F8F9FC] font-semibold"
                  readOnly
                  value={gWeightKg === '' ? 'Enter weight above' : weightCat === 'under_12kg' ? '< 12 kg' : weightCat === '12_25kg' ? '12–25 kg' : '> 25 kg'}
                  style={{ color: gWeightKg === '' ? '#B8C4D4' : '#142D56' }}
                />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">
                  Handling Rate (£/box)
                  <span className="ml-1 font-normal" style={{ color: '#B8C4D4' }}>from rate card</span>
                </label>
                <input className="kh-input bg-[#F8F9FC] font-bold text-[#142D56]" readOnly value={`£${weightRate.toFixed(2)}`} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Branding Price (£/unit)</label>
                <input
                  type="number" step="0.01" min={0} className="kh-input"
                  placeholder="e.g. 0.50"
                  value={gBrandingPrice}
                  onChange={e => setGBrandingPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Invoice preview */}
            {totalGRNInvoice > 0 && (
              <div className="mt-3 rounded-lg p-3 flex gap-6 text-xs" style={{ background: 'rgba(200,151,26,.08)', border: '1px solid rgba(200,151,26,.3)' }}>
                <div><span className="text-[#7A8BA0]">Handling: </span><strong className="text-[#142D56]">£{handlingCharge.toFixed(2)}</strong> ({gBoxes} boxes × £{weightRate.toFixed(2)})</div>
                {brandingCharge > 0 && <div><span className="text-[#7A8BA0]">Branding: </span><strong className="text-[#142D56]">£{brandingCharge.toFixed(2)}</strong> ({goodUnits} units × £{(gBrandingPrice as number || 0).toFixed(2)})</div>}
                <div><span className="text-[#7A8BA0]">Invoice Total: </span><strong style={{ color: '#C8971A' }}>£{totalGRNInvoice.toFixed(2)}</strong> — will be added to seller statement</div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Damage Notes (if any)</label>
            <textarea className="kh-input !h-14 resize-none" placeholder="e.g. 3 boxes had water damage to outer packaging..." value={gNotes} onChange={e => setGNotes(e.target.value)} />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: '#EBF0F8' }}>
            <span className="text-base">📣</span>
            <div className="flex-1 text-sm text-[#142D56]">
              <strong>Notify seller on receipt?</strong>
              <div className="text-xs text-[#7A8BA0] mt-0.5">Send GRN number, units received, and condition report</div>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={gNotify} onChange={e => setGNotify(e.target.checked)} style={{ accentColor: '#142D56', width: 16, height: 16 }} />
              <span className="text-sm font-semibold">Yes, notify seller</span>
            </label>
          </div>

          <div className="flex gap-2.5">
            <button className="btn-ghost flex-1" onClick={() => setShowGRN(false)}>Cancel</button>
            <button className="btn-gold flex-[2]" onClick={submitGRN} disabled={submitting}>
              {submitting ? '⏳ Submitting...' : '✅ Submit & Add to Inventory'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background: '#E8ECF2' }}>
        {(['stock','variants','damaged'] as InvTab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
            style={activeTab === t ? { background: 'white', color: '#142D56', fontWeight: 700, borderBottom: '2px solid #D4A520' } : { background: 'transparent', color: '#7A8BA0' }}
          >
            {t === 'stock' ? '📦 Live Stock' : t === 'variants' ? '🎨 Variants View' : '⚠️ Damaged Items'}
          </button>
        ))}
      </div>

      {/* Live Stock */}
      {activeTab === 'stock' && (
        <div className="kh-card overflow-x-auto">
          <table className="kh-table">
            <thead>
              <tr>
                <th>SKU</th><th>Product</th><th>Variant</th><th>Seller</th>
                <th>Price</th><th>Total In</th><th>Damaged</th><th>Good</th>
                <th>Reserved</th><th>Available</th><th>Weight</th><th>Branding</th><th>Location</th><th>Condition</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={15} className="text-center py-8 text-[#7A8BA0]">No inventory items found</td></tr>
              ) : filtered.map(item => {
                const avail = item.good_stock - item.reserved
                const st    = avail <= 0 ? 'badge-red' : avail <= 5 ? 'badge-yellow' : 'badge-green'
                return (
                  <tr key={item.id}>
                    <td className="font-mono font-semibold text-[#142D56] text-xs">{item.sku}</td>
                    <td className="font-semibold">{item.product_name}</td>
                    <td>{item.variant ? <span className="badge badge-navy text-xs">{item.variant}</span> : <span className="text-[#7A8BA0]">—</span>}</td>
                    <td><span className="badge badge-gray text-xs">{(item.sellers as any)?.name ?? '—'}</span></td>
                    <td className="font-semibold" style={{ color: '#9E7410' }}>{fmtGBP(item.unit_price)}</td>
                    <td className="text-center">{item.total_in}</td>
                    <td className={`text-center font-semibold ${item.damaged > 0 ? 'text-[#C0321E]' : 'text-[#7A8BA0]'}`}>{item.damaged || '—'}</td>
                    <td className="text-center font-bold text-[#1A7A48]">{item.good_stock}</td>
                    <td className="text-center text-[#C85A00]">{item.reserved}</td>
                    <td className={`text-center font-bold ${avail > 10 ? 'text-[#1A7A48]' : avail > 0 ? 'text-[#C85A00]' : 'text-[#C0321E]'}`}>{avail}</td>
                    <td className="text-xs text-center">
                      {item.weight_per_box_kg
                        ? <span className="badge badge-gray text-xs">{item.weight_per_box_kg}kg</span>
                        : <span className="text-[#B8C4D4]">—</span>}
                    </td>
                    <td className="text-xs text-center">
                      {item.branding_price_per_unit
                        ? <span style={{ color: '#9E7410' }}>{fmtGBP(item.branding_price_per_unit)}</span>
                        : <span className="text-[#B8C4D4]">—</span>}
                    </td>
                    <td><span className="badge badge-gray text-xs">{item.warehouse_location ?? '—'}</span></td>
                    <td><span className={`badge ${conditionBadge(item.condition)} text-xs`}>{item.condition}</span></td>
                    <td><span className={`badge ${st} text-xs`}>{avail <= 0 ? 'Out of Stock' : avail <= 5 ? 'Low Stock' : 'In Stock'}</span></td>
                    <td>
                      <button
                        onClick={() => { setRestockItem(item); setRestockQty(1); setRestockNote('') }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#1A7A48,#27AE60)', color: 'white', whiteSpace: 'nowrap' }}
                        title="Quick restock — add units to this SKU"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-3 rounded-lg p-2.5 text-xs" style={{ background: '#FEF5E0', border: '1px solid rgba(200,151,26,.3)', color: '#9E7410' }}>
            💡 Unit Price is the declared value — auto-loaded at fulfillment and can be overridden by staff.
          </div>
        </div>
      )}

      {/* Variants View */}
      {activeTab === 'variants' && (
        <div className="space-y-3.5">
          {Object.entries(groups).map(([key, items]) => {
            const first = items[0]
            const totalAvail = items.reduce((s, i) => s + Math.max(0, i.good_stock - i.reserved), 0)
            return (
              <div key={key} className="kh-card !p-0 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-[#E8ECF2]" style={{ background: '#F8F9FC' }}>
                  <div>
                    <div className="font-bold text-sm text-[#142D56]">{first.product_name}</div>
                    <div className="text-xs text-[#7A8BA0]">
                      {(first.sellers as any)?.name ?? '—'} · {items.length} variant{items.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#1A7A48]">Total available: {totalAvail} units</div>
                </div>
                <table className="kh-table text-xs">
                  <thead><tr><th>SKU</th><th>Variant</th><th>Price</th><th>Good</th><th>Reserved</th><th>Available</th><th>Location</th><th>Condition</th></tr></thead>
                  <tbody>
                    {items.map(i => {
                      const avail = Math.max(0, i.good_stock - i.reserved)
                      return (
                        <tr key={i.id}>
                          <td className="font-mono text-[#142D56]">{i.sku}</td>
                          <td><strong>{i.variant ?? '—'}</strong></td>
                          <td style={{ color: '#9E7410', fontWeight: 600 }}>{fmtGBP(i.unit_price)}</td>
                          <td className="text-center font-bold text-[#1A7A48]">{i.good_stock}</td>
                          <td className="text-center text-[#C85A00]">{i.reserved}</td>
                          <td className={`text-center font-bold ${avail > 5 ? 'text-[#1A7A48]' : avail > 0 ? 'text-[#C85A00]' : 'text-[#C0321E]'}`}>{avail}</td>
                          <td><span className="badge badge-gray">{i.warehouse_location ?? '—'}</span></td>
                          <td><span className={`badge ${conditionBadge(i.condition)}`}>{i.condition}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}

      {/* Damaged */}
      {activeTab === 'damaged' && (
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-3">⚠️ Damaged Items Register</div>
          <div className="text-xs text-[#7A8BA0] mb-3">All units received with damage — for seller dispute resolution and insurance claims</div>
          {damaged.length === 0 ? (
            <div className="text-center py-8 text-[#7A8BA0] text-sm">✅ No damaged items on record</div>
          ) : (
            <table className="kh-table">
              <thead><tr><th>SKU</th><th>Product</th><th>Seller</th><th>Damaged</th><th>Condition</th><th>Location</th><th>GRN Ref</th></tr></thead>
              <tbody>
                {damaged.map(i => (
                  <tr key={i.id}>
                    <td className="font-mono text-[#142D56]">{i.sku}</td>
                    <td className="font-semibold">{i.product_name}{i.variant ? ` — ${i.variant}` : ''}</td>
                    <td><span className="badge badge-gray text-xs">{(i.sellers as any)?.name ?? '—'}</span></td>
                    <td className="text-center font-bold text-[#C0321E]">{i.damaged}</td>
                    <td><span className={`badge ${conditionBadge(i.condition)}`}>{i.condition}</span></td>
                    <td>{i.warehouse_location ?? '—'}</td>
                    <td className="font-mono text-xs text-[#7A8BA0]">{i.grn_ref ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
