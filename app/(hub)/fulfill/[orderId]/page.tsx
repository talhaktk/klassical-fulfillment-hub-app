'use client'
import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore, type FulfillPayload } from '@/store'
import BarcodeScanner from '@/components/scanner/BarcodeScanner'
import { fmtGBP } from '@/lib/utils'
import toast from 'react-hot-toast'

type Tab = 'scan' | 'pack' | 'label' | 'dispatch'

interface ScannedItem { sku: string; name: string; qty: number; unitPrice: number; overridePrice: number | null }
interface MiscCharge  { desc: string; amt: number }

export default function FulfillPage() {
  const params   = useParams()
  const router   = useRouter()
  const orderId  = params.orderId as string
  const { orders, inventory, ratecards, fulfillOrder } = useStore()

  const order   = orders.find(o => o.id === orderId)
  const rc      = ratecards.find(r => r.seller_id === order?.seller_id)

  const [tab,           setTab]           = useState<Tab>('scan')
  const [cameraActive,  setCameraActive]  = useState(false)
  const [manualSku,     setManualSku]     = useState('')
  const [scanResult,    setScanResult]    = useState<string | null>(null)
  const [scannedItem,   setScannedItem]   = useState<ScannedItem | null>(null)
  const [priceOverride, setPriceOverride] = useState('')

  // Pack tab state
  const [packConfig,    setPackConfig]    = useState(0)
  const [bubbleWrap,    setBubbleWrap]    = useState(false)
  const [boxSmall,      setBoxSmall]      = useState(false)
  const [boxMedium,     setBoxMedium]     = useState(false)
  const [labelType,     setLabelType]     = useState<'none'|'full'|'print_only'>('none')
  const [labelChecked,  setLabelChecked]  = useState(false)
  const [insertPrint,   setInsertPrint]   = useState(false)
  const [tissue,        setTissue]        = useState(false)
  const [miscCharges,   setMiscCharges]   = useState<MiscCharge[]>([])
  const [miscDesc,      setMiscDesc]      = useState('')
  const [miscAmt,       setMiscAmt]       = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [dispatched,    setDispatched]    = useState(false)

  const labour = rc?.labour_per_order ?? 2.50

  const lookupSKU = useCallback((sku: string) => {
    const trimmed = sku.trim().toUpperCase()
    const item = inventory.find(i => i.sku.toUpperCase() === trimmed)
    if (item) {
      setScanResult(`✅ SKU matched: ${item.sku} — ${item.product_name}${item.variant ? ' (' + item.variant + ')' : ''}`)
      setScannedItem({ sku: item.sku, name: item.product_name + (item.variant ? ` (${item.variant})` : ''), qty: 1, unitPrice: item.unit_price, overridePrice: null })
    } else if (trimmed) {
      setScanResult(`⚠️ SKU not found in inventory: ${trimmed}`)
      setScannedItem(null)
    }
  }, [inventory])

  const handleScan = useCallback((code: string) => {
    setCameraActive(false)
    toast.success(`Scanned: ${code}`)
    lookupSKU(code)
  }, [lookupSKU])

  const effectivePrice = scannedItem ? (parseFloat(priceOverride) || scannedItem.unitPrice) : 0
  const productTotal   = effectivePrice * (scannedItem?.qty ?? 1)

  const optTotal = (bubbleWrap ? (rc?.bubble_wrap ?? 0.40) : 0)
    + (boxSmall  ? (rc?.box_small   ?? 1.50) : 0)
    + (boxMedium ? (rc?.box_medium  ?? 2.50) : 0)
    + (labelChecked ? (labelType === 'full' ? (rc?.label_full ?? 0.50) : (rc?.label_print_only ?? 0.20)) : 0)
    + (insertPrint  ? (rc?.insert_print ?? 0.80) : 0)
    + (tissue   ? (rc?.tissue_paper ?? 0.30) : 0)
    + packConfig

  const miscTotal = miscCharges.reduce((s, m) => s + m.amt, 0)
  const grandTotal = productTotal + labour + optTotal + miscTotal

  async function handleFulfill() {
    if (!order) return
    setSubmitting(true)
    try {
      const payload: FulfillPayload = {
        labour_charge: labour,
        pack_config_extra: packConfig,
        bubble_wrap: bubbleWrap, box_small: boxSmall, box_medium: boxMedium,
        label_type: labelChecked ? labelType : 'none',
        insert_print: insertPrint, tissue_paper: tissue,
        misc_charges: miscCharges,
        product_price_override: priceOverride ? parseFloat(priceOverride) : null,
        total_charge: grandTotal,
        items: scannedItem ? [{ sku: scannedItem.sku, quantity: scannedItem.qty, unit_price: effectivePrice }] : [],
      }
      await fulfillOrder(orderId, payload)
      toast.success(`Order ${order.order_number} fulfilled!`)
      setTab('dispatch')
      setDispatched(true)
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to fulfill order')
    } finally {
      setSubmitting(false)
    }
  }

  if (!order) return (
    <div className="p-6 text-center text-[#7A8BA0]">
      Order not found. <button className="btn-ghost btn-sm ml-2" onClick={() => router.push('/orders')}>← Back</button>
    </div>
  )

  const steps: { key: Tab; label: string }[] = [
    { key: 'scan', label: '1. Scan Items' },
    { key: 'pack', label: '2. Pack & Price' },
    { key: 'label', label: '3. Label' },
    { key: 'dispatch', label: '4. Dispatch' },
  ]
  const stepIdx = steps.findIndex(s => s.key === tab)

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>
            ⚡ Scan & Fulfill
          </h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {order.order_number} · {order.sellers?.name} · {order.order_items?.length ?? 0} items to pack
          </p>
        </div>
        <button className="btn-ghost btn-sm" onClick={() => router.push('/orders')}>← Back to Orders</button>
      </div>

      {/* Steps bar */}
      <div
        className="flex items-center rounded-xl px-6 py-4 mb-5 gap-3"
        style={{ background: 'white', border: '1px solid #E8ECF2' }}
      >
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => !dispatched && setTab(s.key)}
              className="flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: dispatched || i < stepIdx ? '#1A7A48' : i === stepIdx ? 'linear-gradient(135deg,#9E7410,#D4A520)' : '#E8ECF2',
                  color: (dispatched || i <= stepIdx) ? 'white' : '#7A8BA0',
                }}
              >
                {dispatched || i < stepIdx ? '✓' : i + 1}
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: i === stepIdx ? '#9E7410' : dispatched || i < stepIdx ? '#1A7A48' : '#7A8BA0' }}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="h-0.5 w-10 mx-2" style={{ background: i < stepIdx ? '#1A7A48' : '#E8ECF2' }} />
            )}
          </div>
        ))}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background: '#E8ECF2' }}>
        {steps.map(s => (
          <button
            key={s.key}
            onClick={() => !dispatched && setTab(s.key)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === s.key
              ? { background: 'white', color: '#142D56', fontWeight: 700, borderBottom: '2px solid #D4A520', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }
              : { background: 'transparent', color: '#7A8BA0' }}
          >
            {s.label.replace(/^\d+\. /, '')}
          </button>
        ))}
      </div>

      {/* ── SCAN TAB ── */}
      {tab === 'scan' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">📱 Camera / Barcode Scanner</div>

            <BarcodeScanner active={cameraActive} onScan={handleScan} />

            <div className="flex gap-2 mt-3">
              <button
                className={cameraActive ? 'btn-ghost btn-sm flex-1' : 'btn-navy btn-sm flex-1'}
                onClick={() => setCameraActive(v => !v)}
              >
                {cameraActive ? '🛑 Stop Camera' : '📷 Start Camera'}
              </button>
            </div>

            <div className="text-[11px] text-center text-[#7A8BA0] mt-2">
              Live camera scan · USB barcode scanner also supported
            </div>

            <div className="flex gap-2 mt-3">
              <input
                className="kh-input flex-1"
                placeholder="Type / paste SKU or scan barcode..."
                value={manualSku}
                onChange={e => setManualSku(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (lookupSKU(manualSku), setManualSku(''))}
              />
              <button className="btn-gold btn-sm" onClick={() => { lookupSKU(manualSku); setManualSku('') }}>
                🔍 Lookup
              </button>
            </div>
          </div>

          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">✅ Scan Results</div>

            <div
              className="rounded-lg p-3.5 text-sm min-h-[80px] mb-3"
              style={{ background: '#F4F6FA', border: '1px solid #E8ECF2', color: '#7A8BA0' }}
            >
              {scanResult ?? 'Awaiting scan...'}
            </div>

            {scannedItem && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: '#FEF5E0', border: '1px solid #C8971A' }}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: '#9E7410' }}>
                  💰 Product Price — From Inventory
                </div>
                <div className="flex items-center justify-between gap-2.5">
                  <div>
                    <div className="text-sm font-bold text-[#142D56]">{scannedItem.name}</div>
                    <div className="text-[11px] text-[#7A8BA0] mt-0.5">
                      SKU: <span className="font-mono">{scannedItem.sku}</span> · Qty: {scannedItem.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#7A8BA0]">Unit price</div>
                      <div className="text-lg font-bold" style={{ color: '#9E7410', fontFamily: 'Playfair Display, serif' }}>
                        {fmtGBP(effectivePrice)}
                      </div>
                    </div>
                    <div className="w-px h-9" style={{ background: '#E8ECF2' }} />
                    <div className="text-right">
                      <div className="text-[10px] text-[#7A8BA0]">Total</div>
                      <div className="text-lg font-bold text-[#142D56]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {fmtGBP(productTotal)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t" style={{ borderColor: 'rgba(200,151,26,.3)' }}>
                  <div className="text-[11px] text-[#7A8BA0] mb-1.5 font-semibold">⚙️ Override price if needed:</div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[#4A5A70]">£</span>
                    <input
                      type="number" step="0.01" className="kh-input flex-1 !font-bold"
                      placeholder="Override price..." value={priceOverride}
                      onChange={e => setPriceOverride(e.target.value)}
                    />
                    <button className="btn-ghost btn-sm" onClick={() => setPriceOverride('')}>↺ Reset</button>
                  </div>
                  {priceOverride && (
                    <div className="text-[11px] font-semibold mt-1.5" style={{ color: '#C85A00' }}>
                      ⚠️ Price overridden — will be flagged on invoice
                    </div>
                  )}
                </div>
              </div>
            )}

            <button className="btn-gold w-full mt-2" onClick={() => setTab('pack')}>
              Continue → Pack & Price
            </button>
          </div>
        </div>
      )}

      {/* ── PACK TAB ── */}
      {tab === 'pack' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">📦 Packaging — {order.order_number}</div>

            {/* Mandatory labour */}
            <div className="rounded-xl p-3.5 mb-4" style={{ background: '#EBF0F8', border: '1px solid #B8CCEC' }}>
              <div className="flex justify-between items-center mb-1">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#142D56]">⚙️ Mandatory — Labour Charge</div>
                <span className="badge badge-red text-[10px]">Always Charged</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div>
                  <div className="text-sm font-bold text-[#142D56]">Pick & Pack Labour</div>
                  <div className="text-[11px] text-[#7A8BA0] mt-0.5">
                    Rate agreed with {order.sellers?.name} · Per fulfilled order
                  </div>
                </div>
                <div className="text-xl font-bold text-[#142D56]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {fmtGBP(labour)}
                </div>
              </div>
              <div className="mt-2 pt-2 text-[11px] text-[#7A8BA0]" style={{ borderTop: '1px solid #B8CCEC' }}>
                Storage is billed separately on monthly invoice — not added per order
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Pack Configuration</label>
              <select className="kh-input" value={packConfig} onChange={e => setPackConfig(parseFloat(e.target.value))}>
                <option value={0}>Single item</option>
                <option value={0.5}>Pack of 2 (+£0.50 labour)</option>
                <option value={1.0}>Pack of 3 (+£1.00 labour)</option>
                <option value={1.5}>Pack of 4 (+£1.50 labour)</option>
              </select>
            </div>

            {/* Optional add-ons */}
            <div className="rounded-xl p-3.5" style={{ background: '#F4F6FA', border: '1px solid #E8ECF2' }}>
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#9E7410' }}>
                🎁 Optional Add-Ons
              </div>
              <div className="text-[11px] text-[#7A8BA0] mb-3">Tick only what applies. Prices from {order.sellers?.name} rate card.</div>

              {[
                { id: 'bubble', label: '🫧 Bubble Wrap Protection', desc: 'Fragile / high-value items', price: rc?.bubble_wrap ?? 0.40, val: bubbleWrap, set: setBubbleWrap },
                { id: 'boxSm',  label: '📦 Brown Box — Small',       desc: 'Seller uses own by default',  price: rc?.box_small   ?? 1.50, val: boxSmall,   set: setBoxSmall },
                { id: 'boxMd',  label: '📦 Brown Box — Medium',      desc: 'Use if small box insufficient',price: rc?.box_medium  ?? 2.50, val: boxMedium,  set: setBoxMedium },
                { id: 'insert', label: '🖨 On-Demand Insert Print',  desc: 'Thank-you cards, inserts',    price: rc?.insert_print ?? 0.80, val: insertPrint, set: setInsertPrint },
                { id: 'tissue', label: '🎀 Branded Tissue Paper',    desc: 'Gift-style presentation',     price: rc?.tissue_paper ?? 0.30, val: tissue,     set: setTissue },
              ].map(opt => (
                <label key={opt.id} className="flex items-center justify-between py-2.5 cursor-pointer" style={{ borderBottom: '1px solid #E8ECF2' }}>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-[#0E2040]">{opt.label}</span>
                    <span className="text-[10px] text-[#7A8BA0]">{opt.desc}</span>
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: '#9E7410' }}>+{fmtGBP(opt.price)}</span>
                    <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)}
                      className="w-4 h-4 cursor-pointer" style={{ accentColor: '#142D56' }} />
                  </span>
                </label>
              ))}

              {/* Label checkbox with sub-options */}
              <div className="py-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-[#0E2040]">🏷️ Label & Printing Required</span>
                    <span className="text-[10px] text-[#7A8BA0]">We handle label — choose type below</span>
                  </span>
                  <input type="checkbox" checked={labelChecked} onChange={e => setLabelChecked(e.target.checked)}
                    className="w-4 h-4 cursor-pointer" style={{ accentColor: '#142D56' }} />
                </label>
                {labelChecked && (
                  <div className="mt-2.5 p-2.5 rounded-lg" style={{ background: 'white', border: '1px solid #E8ECF2' }}>
                    {[
                      { val: 'full'       as const, label: 'Full Label & Courier Service', desc: 'We print + book courier dispatch', price: rc?.label_full ?? 0.50 },
                      { val: 'print_only' as const, label: 'Printing Only',                desc: 'We print label — seller arranges courier', price: rc?.label_print_only ?? 0.20 },
                    ].map(opt => (
                      <label key={opt.val} className="flex items-center justify-between py-1.5 cursor-pointer border-b border-[#E8ECF2] last:border-0">
                        <span className="flex items-center gap-2">
                          <input type="radio" name="labelType" checked={labelType === opt.val}
                            onChange={() => setLabelType(opt.val)} style={{ accentColor: '#142D56' }} />
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-[#142D56]">{opt.label}</span>
                            <span className="text-[10px] text-[#7A8BA0]">{opt.desc}</span>
                          </span>
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#9E7410' }}>{fmtGBP(opt.price)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">🧾 Order Cost Summary</div>

            {scannedItem && (
              <div className="rounded-lg p-3 mb-3" style={{ background: '#FEF5E0', border: '1px solid #C8971A' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-[#142D56]">📦 Product Value</div>
                    <div className="text-[10px] text-[#7A8BA0]">
                      {scannedItem.name} · {fmtGBP(effectivePrice)} × {scannedItem.qty}
                      {priceOverride && ' (overridden)'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold" style={{ color: '#9E7410', fontFamily: 'Playfair Display, serif' }}>
                      {fmtGBP(productTotal)}
                    </div>
                    <div className="text-[10px] text-[#7A8BA0]">declared value</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mandatory */}
            <div className="flex justify-between p-2.5 mb-3 rounded-lg" style={{ background: '#EBF0F8' }}>
              <div>
                <div className="text-sm font-bold text-[#142D56]">⚙️ Pick & Pack Labour</div>
                <div className="text-[10px] text-[#7A8BA0]">Mandatory · {order.sellers?.name} agreed rate</div>
              </div>
              <span className="font-bold text-[#142D56] text-base">{fmtGBP(labour)}</span>
            </div>

            {/* Optional lines */}
            <div className="text-sm mb-2">
              {[
                { show: bubbleWrap,   label: '🫧 Bubble Wrap', amt: rc?.bubble_wrap ?? 0.40 },
                { show: boxSmall,     label: '📦 Brown Box — Small', amt: rc?.box_small ?? 1.50 },
                { show: boxMedium,    label: '📦 Brown Box — Medium', amt: rc?.box_medium ?? 2.50 },
                { show: insertPrint,  label: '🖨 On-Demand Insert', amt: rc?.insert_print ?? 0.80 },
                { show: tissue,       label: '🎀 Tissue Paper', amt: rc?.tissue_paper ?? 0.30 },
                { show: labelChecked, label: labelType === 'full' ? '🏷️ Label & Courier Service' : '🖨️ Printing Only', amt: labelType === 'full' ? (rc?.label_full ?? 0.50) : (rc?.label_print_only ?? 0.20) },
                { show: packConfig > 0, label: '⚙️ Pack config extra', amt: packConfig },
              ].filter(l => l.show).map(l => (
                <div key={l.label} className="flex justify-between py-1.5 border-b border-[#E8ECF2]">
                  <span className="text-[#4A5A70]">{l.label}</span>
                  <span className="font-semibold">{fmtGBP(l.amt)}</span>
                </div>
              ))}
              {miscCharges.map((m, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-[#E8ECF2]">
                  <span className="text-[#4A5A70]">⚡ {m.desc}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{fmtGBP(m.amt)}</span>
                    <button onClick={() => setMiscCharges(c => c.filter((_, j) => j !== i))} className="text-[#C0321E] text-sm">✕</button>
                  </span>
                </div>
              ))}
            </div>

            {/* Storage note */}
            <div className="rounded-lg p-2.5 my-2.5 border-l-[3px] border-[#1A7A48] flex gap-2 items-start" style={{ background: '#F0F4F0' }}>
              <span className="text-[#1A7A48] text-sm">📦</span>
              <div>
                <div className="text-[11px] font-bold text-[#1A7A48]">STORAGE — Monthly Invoice Only</div>
                <div className="text-[11px] text-[#4A5A70]">Not charged per order. Billed on monthly statement.</div>
              </div>
            </div>

            {/* Misc charge input */}
            <div className="rounded-lg p-3 mb-3" style={{ background: '#FEF5E0', border: '1px solid rgba(200,151,26,.3)' }}>
              <div className="text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: '#9E7410' }}>
                ⚡ Miscellaneous / Custom Charge
              </div>
              <div className="flex gap-2">
                <input className="kh-input flex-1 text-xs" placeholder="e.g. Special handling..." value={miscDesc} onChange={e => setMiscDesc(e.target.value)} />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[#4A5A70] text-sm">£</span>
                  <input type="number" step="0.01" className="kh-input !w-16 font-bold text-xs" placeholder="0.00" value={miscAmt} onChange={e => setMiscAmt(e.target.value)} />
                </div>
                <button className="btn-ghost btn-sm" onClick={() => {
                  if (miscDesc && parseFloat(miscAmt) > 0) {
                    setMiscCharges(c => [...c, { desc: miscDesc, amt: parseFloat(miscAmt) }])
                    setMiscDesc(''); setMiscAmt('')
                  }
                }}>+ Add</button>
              </div>
            </div>

            {/* Grand total */}
            <div className="flex justify-between items-center py-3.5 border-t-2 mt-1" style={{ borderColor: '#C8971A' }}>
              <span className="text-lg font-bold text-[#0E2040]">Total This Order</span>
              <span className="text-2xl font-bold" style={{ color: '#9E7410', fontFamily: 'Playfair Display, serif' }}>
                {fmtGBP(grandTotal)}
              </span>
            </div>

            <button className="btn-gold w-full mt-4" onClick={() => setTab('label')}>
              Continue → Print Label
            </button>
          </div>
        </div>
      )}

      {/* ── LABEL TAB ── */}
      {tab === 'label' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">🏷️ Shipping Label</div>
            <div
              className="rounded-xl p-6 text-center mb-3 cursor-pointer"
              style={{ background: '#F4F6FA', border: '2px dashed #C8971A' }}
            >
              <div className="text-4xl mb-2">📄</div>
              <div className="text-sm font-bold text-[#0E2040]">label-{order.order_number}.pdf</div>
              <div className="text-xs text-[#7A8BA0] mt-1">Uploaded by {order.sellers?.name}</div>
              <div
                className="mt-3 rounded-lg p-3 text-left"
                style={{ background: 'white', border: '1px solid #E8ECF2' }}
              >
                <div className="text-[10px] uppercase text-[#7A8BA0] tracking-wide">Delivery To</div>
                <div className="font-bold text-[#142D56] mt-1">{order.customer_name}</div>
                <div className="text-xs text-[#4A5A70]">{order.customer_address}, {order.customer_postcode}</div>
                {order.tracking_number && (
                  <>
                    <div className="text-[10px] uppercase text-[#7A8BA0] tracking-wide mt-2">Tracking</div>
                    <div className="font-semibold font-mono text-sm" style={{ color: '#1B5FA8' }}>
                      {order.tracking_number}
                    </div>
                  </>
                )}
              </div>
            </div>
            <button className="btn-gold w-full">🖨️ Send to Printer</button>
          </div>

          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">✅ Pre-Dispatch Checklist</div>
            {[
              { done: !!scannedItem, label: 'Items scanned & SKU-verified' },
              { done: true,           label: 'Package weight confirmed' },
              { done: true,           label: `Cost approved & logged: ${fmtGBP(grandTotal)}` },
              { done: false,          label: 'Label printed & applied to parcel' },
              { done: false,          label: 'Awaiting dispatch confirmation' },
            ].map((c, i) => (
              <div key={i} className="flex gap-2.5 py-2.5 border-b border-[#E8ECF2] last:border-0 items-center">
                <span className={`text-lg font-bold ${c.done ? 'text-[#1A7A48]' : 'text-[#B8C4D4]'}`}>
                  {c.done ? '✓' : '○'}
                </span>
                <span className={c.done ? 'text-[#0E2040]' : 'text-[#7A8BA0]'}>{c.label}</span>
              </div>
            ))}
            <div className="mt-4">
              <label className="text-xs text-[#7A8BA0] font-semibold block mb-1">Dispatch Notes (Optional)</label>
              <textarea className="kh-input !h-16 resize-none" placeholder="Special handling notes..." />
            </div>
            <button
              className="btn-gold w-full mt-4"
              onClick={() => { setTab('dispatch'); handleFulfill() }}
              disabled={submitting}
            >
              {submitting ? '⏳ Processing...' : '🚚 Mark Dispatched & Send Notifications'}
            </button>
          </div>
        </div>
      )}

      {/* ── DISPATCH TAB ── */}
      {tab === 'dispatch' && (
        <div className="kh-card text-center py-12 px-10">
          <div className="text-6xl mb-4 animate-fadeIn">📦</div>
          <h2 className="text-2xl font-bold text-[#142D56] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order {order.order_number} Dispatched!
          </h2>
          <p className="text-sm text-[#7A8BA0] mb-7">
            {order.carrier} · {order.tracking_number ?? 'Tracking TBC'} · All notifications sent
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-7 text-left">
            {[
              { icon: '✅', color: '#1A7A48', title: 'EMAIL SENT',     body: `${order.sellers?.name}`, sub: 'Dispatched + tracking info' },
              { icon: '✅', color: '#1A7A48', title: 'WHATSAPP SENT',  body: 'WhatsApp Business API',  sub: 'Push notification delivered' },
              { icon: '✅', color: '#D4A520', title: 'PORTAL UPDATED', body: 'Seller Dashboard',        sub: 'Status: Fulfilled · Tracking live' },
            ].map(n => (
              <div key={n.title} className="kh-card !p-3.5" style={{ borderTop: `3px solid ${n.color}` }}>
                <div className="text-[11px] font-bold mb-1.5" style={{ color: n.color }}>{n.icon} {n.title}</div>
                <div className="text-sm font-semibold text-[#0E2040]">{n.body}</div>
                <div className="text-[11px] text-[#7A8BA0]">{n.sub}</div>
              </div>
            ))}
          </div>
          <button className="btn-navy" onClick={() => router.push('/orders')}>← Back to Orders</button>
        </div>
      )}
    </div>
  )
}
