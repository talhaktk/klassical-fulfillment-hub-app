'use client'
import { useCallback, useState } from 'react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import type { InventoryItem } from '@/types/database'

interface OrderItem {
  sku:          string
  product_name: string
  quantity:     number
  unit_price:   number
}

interface ParsedLabel {
  file_name:         string
  preview_url:       string
  image_base64:      string
  mime_type:         string
  parsing:           boolean
  parse_error:       string | null
  customer_name:     string
  customer_address:  string
  customer_postcode: string
  carrier:           string
  tracking_number:   string
  notes:             string
  items:             OrderItem[]
}

const CARRIERS = ['Royal Mail', 'DPD', 'Evri', 'Hermes', 'UPS', 'FedEx', 'Amazon Logistics', 'Yodel', 'Parcelforce', 'Other']

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve({ base64: (reader.result as string).split(',')[1], mime: file.type })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function pdfToBase64(file: File): Promise<{ base64: string; mime: string }> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  const pdf      = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
  const page     = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas   = document.createElement('canvas')
  canvas.width   = viewport.width
  canvas.height  = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d')! as any, viewport, canvas }).promise
  return { base64: canvas.toDataURL('image/png').split(',')[1], mime: 'image/png' }
}

// ─── Simple Upload (manual) ───────────────────────────────────────────────────

function SimpleUpload({ sellerId, sellerInventory, onSuccess }: {
  sellerId: string
  sellerInventory: InventoryItem[]
  onSuccess: () => void
}) {
  const { loadOrders } = useStore()
  const [step,       setStep]    = useState<'form' | 'confirm'>('form')
  const [submitting, setSubmit]  = useState(false)
  const [items,      setItems]   = useState<OrderItem[]>([])
  const [labelFile,  setLabelFile]  = useState<File | null>(null)
  const [labelPreview, setLabelPreview] = useState<string>('')

  function addSku(sku: string) {
    if (!sku || items.find(i => i.sku === sku)) return
    const inv = sellerInventory.find(i => i.sku === sku)
    if (!inv) return
    setItems(prev => [...prev, { sku, product_name: inv.product_name, quantity: 1, unit_price: inv.unit_price }])
  }

  function updateItem(sku: string, field: 'quantity' | 'unit_price', val: number) {
    setItems(prev => prev.map(i => i.sku === sku ? { ...i, [field]: Math.max(field === 'quantity' ? 1 : 0, val) } : i))
  }

  function removeItem(sku: string) { setItems(prev => prev.filter(i => i.sku !== sku)) }

  async function handleLabelFile(file: File) {
    setLabelFile(file)
    if (file.type === 'application/pdf') {
      const { base64, mime } = await pdfToBase64(file)
      setLabelPreview(`data:${mime};base64,${base64}`)
    } else {
      const reader = new FileReader()
      reader.onload = () => setLabelPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function validate() {
    if (items.length === 0) { toast.error('Add at least one SKU'); return false }
    if (!labelFile)         { toast.error('Label upload is required'); return false }
    return true
  }

  async function handleSubmit() {
    setSubmit(true)
    const res = await fetch('/api/orders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: [{ seller_id: sellerId, items }],
      }),
    })
    const data = await res.json()
    if (data.count > 0) {
      toast.success('Order created successfully')
      setItems([]); setLabelFile(null); setLabelPreview(''); setStep('form')
      await loadOrders(); onSuccess()
    } else if (data.errors?.length) {
      data.errors.forEach((e: string) => toast.error(e))
    }
    setSubmit(false)
  }

  const availableSkus = sellerInventory.filter(i => !items.find(it => it.sku === i.sku))

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="animate-fadeIn">
        <div className="rounded-xl overflow-hidden mb-5" style={{ border: '2px solid #C8971A' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(200,151,26,.08)', borderBottom: '1px solid rgba(200,151,26,.25)' }}>
            <div className="text-sm font-bold text-[#142D56]">✅ Confirm Order</div>
            <div className="text-xs text-[#7A8BA0] mt-0.5">Review before submitting</div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-2">Items</div>
              <div className="space-y-1.5">
                {items.map(i => (
                  <div key={i.sku} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs" style={{ background: '#F4F6FA' }}>
                    <span className="font-mono font-bold text-[#142D56] w-28 flex-shrink-0">{i.sku}</span>
                    <span className="text-[#4A5A70] flex-1 mx-2 truncate">{i.product_name}</span>
                    <span className="text-[#7A8BA0]">× {i.quantity}</span>
                    <span className="font-semibold text-[#0E2040] ml-3">£{(i.unit_price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            {labelPreview && (
              <div>
                <div className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1.5">Shipping Label</div>
                <img src={labelPreview} alt="label" className="h-28 rounded-lg object-contain border border-[#E8ECF2]" />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={() => setStep('form')}>← Back</button>
          <button className="btn-gold flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '⏳ Creating…' : '✅ Confirm & Submit Order'}
          </button>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* SKU selection */}
      <div>
        <div className="text-xs font-bold text-[#7A8BA0] uppercase tracking-wide mb-2">
          Select Products <span className="text-[#C0321E]">*</span>
        </div>
        {sellerInventory.length === 0 ? (
          <p className="text-xs text-[#7A8BA0] italic">No inventory found for your account.</p>
        ) : (
          <div className="space-y-2">
            <select className="kh-input w-full" defaultValue=""
              onChange={e => { addSku(e.target.value); e.currentTarget.value = '' }}>
              <option value="">+ Select SKU…</option>
              {availableSkus.map(i => (
                <option key={i.sku} value={i.sku}>
                  {i.sku} — {i.product_name} ({Math.max(0, i.good_stock - i.reserved)} available)
                </option>
              ))}
            </select>

            {items.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E8ECF2' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#F8F9FC', borderBottom: '1px solid #E8ECF2' }}>
                      <th className="text-left px-3 py-2 text-xs font-bold text-[#7A8BA0] uppercase tracking-wide">SKU</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-[#7A8BA0] uppercase tracking-wide">Product</th>
                      <th className="text-center px-3 py-2 text-xs font-bold text-[#7A8BA0] uppercase tracking-wide">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-bold text-[#7A8BA0] uppercase tracking-wide">Unit Price</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.sku} style={{ borderBottom: '1px solid #F0F4FA' }}>
                        <td className="px-3 py-2.5 font-mono text-xs font-bold text-[#142D56]">{item.sku}</td>
                        <td className="px-3 py-2.5 text-xs text-[#4A5A70] max-w-[160px] truncate">{item.product_name}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="number" min={1} className="kh-input !w-16 !py-1 text-center text-xs"
                            value={item.quantity} onChange={e => updateItem(item.sku, 'quantity', parseInt(e.target.value) || 1)} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs text-[#7A8BA0]">£</span>
                            <input type="number" min={0} step={0.01} className="kh-input !w-20 !py-1 text-right text-xs"
                              value={item.unit_price} onChange={e => updateItem(item.sku, 'unit_price', parseFloat(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <button className="text-[#C0321E] text-xs hover:underline" onClick={() => removeItem(item.sku)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {items.length === 0 && (
              <p className="text-xs text-[#7A8BA0] italic py-1">No products selected yet</p>
            )}
          </div>
        )}
      </div>

      {/* Label upload — required */}
      <div>
        <div className="text-xs font-bold text-[#7A8BA0] uppercase tracking-wide mb-2">
          Shipping Label <span className="text-[#C0321E]">*</span>
        </div>
        <div
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${labelFile ? 'border-[#1A7A48] bg-[#F0FBF4]' : 'border-[#D0D8E4] hover:border-[#C8971A]'}`}
          onClick={() => document.getElementById('simple-label-input')?.click()}
        >
          <input id="simple-label-input" type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => e.target.files?.[0] && handleLabelFile(e.target.files[0])} />
          {labelPreview ? (
            <div className="flex items-center justify-center gap-3">
              <img src={labelPreview} alt="label" className="h-20 rounded-lg object-contain border border-[#E8ECF2]" />
              <div className="text-left">
                <div className="text-sm font-semibold text-[#1A7A48]">✓ Label uploaded</div>
                <div className="text-xs text-[#7A8BA0]">{labelFile?.name}</div>
                <button className="text-xs text-[#7A8BA0] hover:underline mt-1"
                  onClick={e => { e.stopPropagation(); setLabelFile(null); setLabelPreview('') }}>Remove</button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-2xl mb-1.5">🏷️</div>
              <div className="text-sm font-semibold text-[#0E2040]">Upload shipping label</div>
              <div className="text-xs text-[#7A8BA0] mt-0.5">PNG, JPG, PDF · Required before submitting</div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-gold" onClick={() => { if (validate()) setStep('confirm') }}>
          Review Order →
        </button>
      </div>
    </div>
  )
}

// ─── Bulk Upload (AI) ─────────────────────────────────────────────────────────

function BulkUpload({ sellerId, sellerInventory }: { sellerId: string; sellerInventory: InventoryItem[] }) {
  const { loadOrders, loadInventory } = useStore()
  const [labels,   setLabels]   = useState<ParsedLabel[]>([])
  const [dragging, setDragging] = useState(false)
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'confirm'>('edit')

  const isParsing   = labels.some(l => l.parsing)
  const readyLabels = labels.filter(l => !l.parsing && !l.parse_error && l.customer_name)
  const readyCount  = readyLabels.length

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const accepted = Array.from(files).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
    if (accepted.length === 0) { toast.error('Please upload image or PDF files only'); return }

    const placeholders: ParsedLabel[] = accepted.map(f => ({
      file_name: f.name, preview_url: '', image_base64: '', mime_type: f.type,
      parsing: true, parse_error: null,
      customer_name: '', customer_address: '', customer_postcode: '',
      carrier: 'Royal Mail', tracking_number: '', notes: '', items: [],
    }))
    setLabels(prev => [...prev, ...placeholders])
    setViewMode('edit')
    const startIdx = labels.length

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i]
      const idx  = startIdx + i
      try {
        const { base64, mime } = file.type === 'application/pdf' ? await pdfToBase64(file) : await fileToBase64(file)
        const preview = `data:${mime};base64,${base64}`
        const res  = await fetch('/api/parse-label', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64, mime_type: mime }),
        })
        const lbl = (await res.json()).label ?? {}
        setLabels(prev => prev.map((p, j) => j === idx ? {
          ...p, preview_url: preview, image_base64: base64, mime_type: mime, parsing: false, parse_error: null,
          customer_name: lbl.customer_name ?? '', customer_address: lbl.customer_address ?? '',
          customer_postcode: lbl.customer_postcode ?? '', carrier: lbl.carrier ?? 'Royal Mail',
          tracking_number: lbl.tracking_number ?? '',
          notes: lbl.order_reference ? `Ref: ${lbl.order_reference}` : '',
        } : p))
      } catch (err: any) {
        setLabels(prev => prev.map((p, j) => j === idx ? { ...p, parsing: false, parse_error: err.message ?? 'Failed to parse' } : p))
      }
    }
  }, [labels.length])

  function updateLabel(idx: number, field: keyof ParsedLabel, value: any) {
    setLabels(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  function addItem(idx: number, sku: string) {
    const inv = sellerInventory.find(i => i.sku === sku)
    if (!inv) return
    setLabels(prev => prev.map((l, i) => i === idx ? {
      ...l, items: l.items.find(it => it.sku === sku) ? l.items
        : [...l.items, { sku, product_name: inv.product_name, quantity: 1, unit_price: inv.unit_price }]
    } : l))
  }

  function updateItemQty(labelIdx: number, sku: string, qty: number) {
    setLabels(prev => prev.map((l, i) => i === labelIdx ? {
      ...l, items: l.items.map(it => it.sku === sku ? { ...it, quantity: qty } : it)
    } : l))
  }

  function removeItem(labelIdx: number, sku: string) {
    setLabels(prev => prev.map((l, i) => i === labelIdx ? { ...l, items: l.items.filter(it => it.sku !== sku) } : l))
  }

  function removeLabel(idx: number) { setLabels(prev => prev.filter((_, i) => i !== idx)) }

  async function createOrders() {
    if (readyCount === 0) { toast.error('No valid labels to create orders from'); return }
    setCreating(true)
    const res = await fetch('/api/orders/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: readyLabels.map(l => ({
          seller_id: sellerId, customer_name: l.customer_name,
          customer_address: l.customer_address, customer_postcode: l.customer_postcode,
          carrier: l.carrier, tracking_number: l.tracking_number || null,
          notes: l.notes || null, items: l.items,
        })),
      }),
    })
    const data = await res.json()
    if (data.count > 0) {
      toast.success(`${data.count} order${data.count > 1 ? 's' : ''} created`)
      setLabels([]); setViewMode('edit')
      await Promise.all([loadOrders(), loadInventory()])
    }
    data.errors?.forEach((e: string) => toast.error(e))
    setCreating(false)
  }

  return (
    <div className="animate-fadeIn">
      <div className="rounded-lg px-3 py-2 mb-4 text-xs flex items-center gap-2" style={{ background: 'rgba(200,151,26,.08)', border: '1px solid rgba(200,151,26,.25)', color: '#9E7410' }}>
        🤖 AI scans each label and extracts customer details automatically. Review before confirming.
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-5 ${dragging ? 'border-[#C8971A] bg-[#FFF9EE]' : 'border-[#D0D8E4] hover:border-[#C8971A]'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
        onClick={() => document.getElementById('bulk-label-input')?.click()}
      >
        <input id="bulk-label-input" type="file" multiple accept="image/*,.pdf" className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)} />
        <div className="text-3xl mb-2">📁</div>
        <p className="font-semibold text-[#0E2040]">Drop multiple label files here or click to browse</p>
        <p className="text-xs text-[#7A8BA0] mt-1">PNG, JPG, WEBP, PDF · AI reads all automatically</p>
      </div>

      {labels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-[#0E2040]">
                {labels.length} label{labels.length > 1 ? 's' : ''}
                {isParsing && <span className="ml-2 text-xs text-[#C8971A] animate-pulse">· Scanning…</span>}
              </h3>
              {readyCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(26,122,72,.1)', color: '#1A7A48' }}>
                  {readyCount} ready
                </span>
              )}
            </div>
            {readyCount > 0 && !isParsing && (
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E8ECF2' }}>
                <button onClick={() => setViewMode('edit')} className="px-3 py-1.5 text-xs font-semibold transition-all"
                  style={viewMode === 'edit' ? { background: '#142D56', color: 'white' } : { color: '#7A8BA0' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setViewMode('confirm')} className="px-3 py-1.5 text-xs font-semibold transition-all"
                  style={viewMode === 'confirm' ? { background: '#142D56', color: 'white' } : { color: '#7A8BA0' }}>
                  ✅ Review & Confirm
                </button>
              </div>
            )}
          </div>

          {viewMode === 'confirm' && (
            <div>
              <div className="rounded-xl overflow-hidden mb-4" style={{ border: '2px solid #C8971A' }}>
                <div className="px-4 py-3" style={{ background: 'rgba(200,151,26,.08)', borderBottom: '1px solid rgba(200,151,26,.25)' }}>
                  <div className="text-sm font-bold text-[#142D56]">📋 {readyCount} Orders Ready</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#F8F9FC', borderBottom: '1px solid #E8ECF2' }}>
                        {['#', 'Customer', 'Address', 'Postcode', 'Carrier', 'Items', 'Tracking', ''].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-[#7A8BA0] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {labels.map((label, idx) => {
                        if (label.parsing || label.parse_error || !label.customer_name) return null
                        return (
                          <tr key={idx} className="border-b border-[#F0F4FA]">
                            <td className="px-4 py-3 text-xs font-mono text-[#7A8BA0]">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#0E2040] text-xs">{label.customer_name}</div>
                              {label.preview_url && <img src={label.preview_url} alt="" className="w-8 h-8 rounded object-cover mt-1 border border-[#E8ECF2]" />}
                            </td>
                            <td className="px-4 py-3 text-xs text-[#7A8BA0] max-w-[160px] truncate">{label.customer_address || '—'}</td>
                            <td className="px-4 py-3 text-xs font-mono text-[#142D56]">{label.customer_postcode || '—'}</td>
                            <td className="px-4 py-3 text-xs">{label.carrier}</td>
                            <td className="px-4 py-3 text-[10px]">
                              {label.items.length === 0 ? <span className="text-[#C8971A]">No items</span>
                                : label.items.map(it => <div key={it.sku}><span className="font-mono text-[#142D56]">{it.sku}</span><span className="text-[#7A8BA0] ml-1">× {it.quantity}</span></div>)}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-[#7A8BA0]">{label.tracking_number || '—'}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => removeLabel(idx)} className="text-xs text-[#C0321E] hover:underline font-semibold">✕</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button className="btn-ghost" onClick={() => setViewMode('edit')}>← Back</button>
                <button className="btn-gold" onClick={createOrders} disabled={creating || readyCount === 0}>
                  {creating ? '⏳ Creating…' : `✅ Confirm & Create ${readyCount} Order${readyCount !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}

          {viewMode === 'edit' && (
            <div className="space-y-4">
              {labels.map((label, idx) => (
                <div key={idx} className="kh-card" style={{ border: label.parse_error ? '1px solid #C0321E' : '1px solid #E8ECF2' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {label.parsing ? (
                        <div className="w-20 h-20 rounded-lg bg-[#F4F6FA] flex items-center justify-center animate-pulse text-xs text-[#7A8BA0]">Scanning…</div>
                      ) : label.preview_url ? (
                        <img src={label.preview_url} alt="" className="w-20 h-20 rounded-lg object-cover border border-[#E8ECF2]" />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-[#F4F6FA] flex items-center justify-center text-2xl">📄</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono text-[#7A8BA0] truncate">{label.file_name}</span>
                        <button className="text-xs text-[#C0321E] hover:underline ml-2" onClick={() => removeLabel(idx)}>✕ Remove</button>
                      </div>
                      {label.parsing && <p className="text-sm text-[#7A8BA0] animate-pulse">Scanning with AI…</p>}
                      {label.parse_error && <p className="text-sm text-[#C0321E]">⚠ {label.parse_error} — edit manually below</p>}
                      {!label.parsing && (
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Customer Name</label>
                            <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_name} onChange={e => updateLabel(idx, 'customer_name', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Postcode</label>
                            <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_postcode} onChange={e => updateLabel(idx, 'customer_postcode', e.target.value)} />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Address</label>
                            <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_address} onChange={e => updateLabel(idx, 'customer_address', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Carrier</label>
                            <select className="kh-input w-full !py-1.5 text-xs" value={label.carrier} onChange={e => updateLabel(idx, 'carrier', e.target.value)}>
                              {CARRIERS.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Tracking No.</label>
                            <input className="kh-input w-full !py-1.5 text-xs" value={label.tracking_number} onChange={e => updateLabel(idx, 'tracking_number', e.target.value)} />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">SKU / Items</label>
                            <select className="kh-input w-full !py-1.5 text-xs mb-2" defaultValue=""
                              onChange={e => { if (e.target.value) { addItem(idx, e.target.value); e.target.value = '' } }}>
                              <option value="">+ Add SKU…</option>
                              {sellerInventory.filter(i => !label.items.find(it => it.sku === i.sku)).map(i => (
                                <option key={i.sku} value={i.sku}>{i.sku} — {i.product_name} ({i.good_stock - i.reserved} avail)</option>
                              ))}
                            </select>
                            {label.items.map(item => (
                              <div key={item.sku} className="flex items-center gap-2 bg-[#F4F6FA] rounded-lg px-2.5 py-1.5 mb-1">
                                <span className="text-xs font-mono text-[#142D56] flex-1">{item.sku}</span>
                                <span className="text-xs text-[#7A8BA0] flex-1 truncate">{item.product_name}</span>
                                <input type="number" min={1} className="kh-input !w-16 !py-1 text-xs text-center"
                                  value={item.quantity} onChange={e => updateItemQty(idx, item.sku, parseInt(e.target.value) || 1)} />
                                <button className="text-[#C0321E] text-xs" onClick={() => removeItem(idx, item.sku)}>✕</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {readyCount > 0 && !isParsing && (
                <div className="flex justify-end pt-2">
                  <button className="btn-gold" onClick={() => setViewMode('confirm')}>
                    Review {readyCount} Order{readyCount !== 1 ? 's' : ''} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Mode = 'simple' | 'bulk'

export default function LabelUpload({ sellerId, sellerInventory }: { sellerId: string; sellerInventory: InventoryItem[] }) {
  const [mode, setMode] = useState<Mode>('simple')
  const [done, setDone] = useState(false)

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: '#F0F4FA' }}>
        <button
          onClick={() => setMode('simple')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={mode === 'simple'
            ? { background: 'white', color: '#0E2040', boxShadow: '0 1px 4px rgba(10,22,40,.1)' }
            : { color: '#7A8BA0' }}
        >
          📝 Simple Upload
        </button>
        <button
          onClick={() => setMode('bulk')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={mode === 'bulk'
            ? { background: 'white', color: '#0E2040', boxShadow: '0 1px 4px rgba(10,22,40,.1)' }
            : { color: '#7A8BA0' }}
        >
          🤖 Bulk Upload (AI)
        </button>
      </div>

      {mode === 'simple' && (
        <SimpleUpload
          sellerId={sellerId}
          sellerInventory={sellerInventory}
          onSuccess={() => setDone(true)}
        />
      )}

      {mode === 'bulk' && (
        <BulkUpload sellerId={sellerId} sellerInventory={sellerInventory} />
      )}
    </div>
  )
}
