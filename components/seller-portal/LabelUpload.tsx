'use client'
import { useCallback, useState } from 'react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import type { InventoryItem } from '@/types/database'

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

interface OrderItem {
  sku:          string
  product_name: string
  quantity:     number
  unit_price:   number
}

const CARRIERS = ['Royal Mail', 'DPD', 'Evri', 'Hermes', 'UPS', 'FedEx', 'Amazon Logistics', 'Yodel', 'Parcelforce', 'Other']

async function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve({ base64, mime: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function pdfToBase64(file: File): Promise<{ base64: string; mime: string }> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2.0 })

  const canvas  = document.createElement('canvas')
  canvas.width  = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise

  const dataUrl = canvas.toDataURL('image/png')
  const base64  = dataUrl.split(',')[1]
  return { base64, mime: 'image/png' }
}

export default function LabelUpload({ sellerId, sellerInventory }: { sellerId: string; sellerInventory: InventoryItem[] }) {
  const { loadOrders, loadInventory } = useStore()
  const [labels,   setLabels]   = useState<ParsedLabel[]>([])
  const [dragging, setDragging] = useState(false)
  const [creating, setCreating] = useState(false)

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    const accepted = fileArr.filter(f =>
      f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    if (accepted.length === 0) {
      toast.error('Please upload image or PDF files only')
      return
    }

    // Add placeholder entries immediately
    const placeholders: ParsedLabel[] = accepted.map(f => ({
      file_name: f.name, preview_url: '', image_base64: '', mime_type: f.type,
      parsing: true, parse_error: null,
      customer_name: '', customer_address: '', customer_postcode: '',
      carrier: 'Royal Mail', tracking_number: '', notes: '',
      items: [],
    }))
    setLabels(prev => [...prev, ...placeholders])

    const startIdx = labels.length

    // Process each file
    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i]
      const idx  = startIdx + i

      try {
        const { base64, mime } = file.type === 'application/pdf'
          ? await pdfToBase64(file)
          : await fileToBase64(file)

        const preview = `data:${mime};base64,${base64}`

        // Call parse-label API
        const res = await fetch('/api/parse-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64, mime_type: mime }),
        })

        const data = await res.json()
        const lbl  = data.label ?? {}

        setLabels(prev => prev.map((p, j) => j === idx ? {
          ...p,
          preview_url:       preview,
          image_base64:      base64,
          mime_type:         mime,
          parsing:           false,
          parse_error:       null,
          customer_name:     lbl.customer_name     ?? '',
          customer_address:  lbl.customer_address  ?? '',
          customer_postcode: lbl.customer_postcode ?? '',
          carrier:           lbl.carrier           ?? 'Royal Mail',
          tracking_number:   lbl.tracking_number   ?? '',
          notes:             lbl.order_reference ? `Ref: ${lbl.order_reference}` : '',
        } : p))
      } catch (err: any) {
        setLabels(prev => prev.map((p, j) => j === idx ? {
          ...p, parsing: false, parse_error: err.message ?? 'Failed to parse',
        } : p))
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
      ...l,
      items: l.items.find(it => it.sku === sku)
        ? l.items
        : [...l.items, { sku, product_name: inv.product_name, quantity: 1, unit_price: inv.unit_price }]
    } : l))
  }

  function updateItemQty(labelIdx: number, sku: string, qty: number) {
    setLabels(prev => prev.map((l, i) => i === labelIdx ? {
      ...l, items: l.items.map(it => it.sku === sku ? { ...it, quantity: qty } : it)
    } : l))
  }

  function removeItem(labelIdx: number, sku: string) {
    setLabels(prev => prev.map((l, i) => i === labelIdx ? {
      ...l, items: l.items.filter(it => it.sku !== sku)
    } : l))
  }

  function removeLabel(idx: number) {
    setLabels(prev => prev.filter((_, i) => i !== idx))
  }

  async function createOrders() {
    const ready = labels.filter(l => !l.parsing && !l.parse_error && l.customer_name)
    if (ready.length === 0) {
      toast.error('No valid labels to create orders from')
      return
    }

    setCreating(true)
    const res = await fetch('/api/orders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: ready.map(l => ({
          seller_id:         sellerId,
          customer_name:     l.customer_name,
          customer_address:  l.customer_address,
          customer_postcode: l.customer_postcode,
          carrier:           l.carrier,
          tracking_number:   l.tracking_number || null,
          notes:             l.notes || null,
          items:             l.items,
        })),
      }),
    })

    const data = await res.json()
    if (data.count > 0) {
      toast.success(`${data.count} order${data.count > 1 ? 's' : ''} created successfully`)
      setLabels([])
      await Promise.all([loadOrders(), loadInventory()])
    }
    if (data.errors?.length) {
      data.errors.forEach((e: string) => toast.error(e))
    }
    setCreating(false)
  }

  const readyCount = labels.filter(l => !l.parsing && !l.parse_error && l.customer_name).length

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragging ? 'border-[#C8971A] bg-[#FFF9EE]' : 'border-[#D0D8E4] hover:border-[#C8971A]'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
        onClick={() => document.getElementById('label-file-input')?.click()}
      >
        <input
          id="label-file-input"
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">📁</div>
        <p className="font-semibold text-[#0E2040]">Drop label files here or click to browse</p>
        <p className="text-xs text-[#7A8BA0] mt-1">PNG, JPG, WEBP, PDF — multiple files supported</p>
        <p className="text-xs text-[#C8971A] mt-1 font-medium">Each file creates a separate order</p>
      </div>

      {/* Parsed labels review */}
      {labels.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0E2040]">{labels.length} label{labels.length > 1 ? 's' : ''} loaded</h3>
            <button
              className="btn-gold"
              onClick={createOrders}
              disabled={creating || readyCount === 0}
            >
              {creating ? 'Creating orders…' : `Create ${readyCount} Order${readyCount !== 1 ? 's' : ''}`}
            </button>
          </div>

          {labels.map((label, idx) => (
            <div key={idx} className="kh-card" style={{ border: label.parse_error ? '1px solid #C0321E' : '1px solid #E8ECF2' }}>
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {label.parsing ? (
                    <div className="w-20 h-20 rounded-lg bg-[#F4F6FA] flex items-center justify-center animate-pulse">
                      <span className="text-xs text-[#7A8BA0]">Parsing…</span>
                    </div>
                  ) : label.preview_url ? (
                    <img src={label.preview_url} alt={label.file_name} className="w-20 h-20 rounded-lg object-cover border border-[#E8ECF2]" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-[#F4F6FA] flex items-center justify-center text-2xl">📄</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#7A8BA0] truncate">{label.file_name}</span>
                    <button className="text-xs text-[#C0321E] hover:underline ml-2 flex-shrink-0" onClick={() => removeLabel(idx)}>Remove</button>
                  </div>

                  {label.parsing && (
                    <p className="text-sm text-[#7A8BA0] animate-pulse">Scanning label with AI…</p>
                  )}

                  {label.parse_error && (
                    <p className="text-sm text-[#C0321E]">⚠ {label.parse_error} — edit fields manually below</p>
                  )}

                  {!label.parsing && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Customer Name</label>
                        <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_name} onChange={e => updateLabel(idx, 'customer_name', e.target.value)} placeholder="Full name" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Postcode</label>
                        <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_postcode} onChange={e => updateLabel(idx, 'customer_postcode', e.target.value)} placeholder="XX0 0XX" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Delivery Address</label>
                        <input className="kh-input w-full !py-1.5 text-xs" value={label.customer_address} onChange={e => updateLabel(idx, 'customer_address', e.target.value)} placeholder="Street address" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Carrier</label>
                        <select className="kh-input w-full !py-1.5 text-xs" value={label.carrier} onChange={e => updateLabel(idx, 'carrier', e.target.value)}>
                          {CARRIERS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Tracking No.</label>
                        <input className="kh-input w-full !py-1.5 text-xs" value={label.tracking_number} onChange={e => updateLabel(idx, 'tracking_number', e.target.value)} placeholder="Optional" />
                      </div>

                      {/* SKU assignment */}
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#7A8BA0] font-semibold uppercase tracking-wide block mb-1">Items / SKUs</label>
                        <div className="flex gap-2 mb-2">
                          <select
                            className="kh-input flex-1 !py-1.5 text-xs"
                            defaultValue=""
                            onChange={e => { if (e.target.value) { addItem(idx, e.target.value); e.target.value = '' } }}
                          >
                            <option value="">+ Add SKU…</option>
                            {sellerInventory.filter(i => !label.items.find(it => it.sku === i.sku)).map(i => (
                              <option key={i.sku} value={i.sku}>{i.sku} — {i.product_name} ({i.good_stock - i.reserved} avail)</option>
                            ))}
                          </select>
                        </div>
                        {label.items.length > 0 && (
                          <div className="space-y-1">
                            {label.items.map(item => (
                              <div key={item.sku} className="flex items-center gap-2 bg-[#F4F6FA] rounded-lg px-2.5 py-1.5">
                                <span className="text-xs font-mono text-[#142D56] flex-1">{item.sku}</span>
                                <span className="text-xs text-[#7A8BA0] flex-1">{item.product_name}</span>
                                <input
                                  type="number"
                                  min={1}
                                  className="kh-input !w-16 !py-1 text-xs text-center"
                                  value={item.quantity}
                                  onChange={e => updateItemQty(idx, item.sku, parseInt(e.target.value) || 1)}
                                />
                                <button className="text-[#C0321E] text-xs hover:underline" onClick={() => removeItem(idx, item.sku)}>✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {label.items.length === 0 && (
                          <p className="text-xs text-[#7A8BA0] italic">No items assigned — order will be created without items</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
