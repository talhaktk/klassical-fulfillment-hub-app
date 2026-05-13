'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'
import type { RateCard } from '@/types/database'

const RATE_GROUPS: { heading: string; fields: { key: keyof RateCard; label: string; desc: string }[] }[] = [
  {
    heading: 'Receiving & Handling (per box)',
    fields: [
      { key: 'receiving_forwarding',  label: 'Receiving & Forwarding',  desc: 'Standard receiving per box' },
      { key: 'handling_under_12kg',   label: 'Box under 12 kg',         desc: 'Handling fee — light boxes' },
      { key: 'handling_12_25kg',      label: 'Box 12–25 kg',            desc: 'Handling fee — medium boxes' },
      { key: 'handling_over_25kg',    label: 'Box over 25 kg',          desc: 'Handling fee — heavy boxes' },
    ],
  },
  {
    heading: 'Pick & Pack',
    fields: [
      { key: 'labour_per_order',   label: 'Labour per Order',      desc: 'Base pick & pack charge' },
      { key: 'labour_extra_item',  label: 'Labour — Extra Item',   desc: 'Per additional item beyond first' },
    ],
  },
  {
    heading: 'Storage & Returns',
    fields: [
      { key: 'storage_per_pallet', label: 'Storage / Pallet',      desc: 'Monthly pallet storage fee' },
      { key: 'returns_per_item',   label: 'Returns per Item',      desc: 'Returns processing fee' },
    ],
  },
  {
    heading: 'Packaging',
    fields: [
      { key: 'box_small',          label: 'Small Box',             desc: 'Small shipping box' },
      { key: 'box_medium',         label: 'Medium Box',            desc: 'Medium shipping box' },
      { key: 'bubble_wrap',        label: 'Bubble Wrap',           desc: 'Per order packaging' },
      { key: 'tissue_paper',       label: 'Tissue Paper Wrap',     desc: 'Premium tissue wrapping' },
    ],
  },
  {
    heading: 'Labels & Inserts',
    fields: [
      { key: 'label_full',         label: 'Full Label',            desc: 'Branded label + print' },
      { key: 'label_print_only',   label: 'Print Only Label',      desc: 'Label print only' },
      { key: 'insert_print',       label: 'Insert / Flyer Print',  desc: 'Printed insert per order' },
    ],
  },
]

// Flat list for backwards-compat with getValue
const RATE_FIELDS = RATE_GROUPS.flatMap(g => g.fields)

export default function RateCardsPage() {
  const { sellers, ratecards, saveRateCard } = useStore()
  const [activeSeller, setActiveSeller] = useState<string | null>(null)
  const [edits,  setEdits]  = useState<Partial<RateCard>>({})
  const [saving, setSaving] = useState(false)

  const seller = sellers.find(s => s.id === activeSeller)
  const rc     = ratecards.find(r => r.seller_id === activeSeller)

  function handleChange(key: keyof RateCard, val: string) {
    setEdits(e => ({ ...e, [key]: parseFloat(val) || 0 }))
  }

  function getValue(key: keyof RateCard): number {
    if (key in edits) return (edits as any)[key] ?? 0
    return rc ? (rc as any)[key] ?? 0 : 0
  }

  async function handleSave() {
    if (!activeSeller) return
    setSaving(true)
    await saveRateCard(activeSeller, edits)
    setEdits({})
    setSaving(false)
  }

  function openSeller(id: string) {
    setActiveSeller(id)
    setEdits({})
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Rate Cards</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">Service pricing per seller — drives all billing calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Seller list */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">Select Seller</div>
          <div className="space-y-1.5">
            {sellers.map(s => {
              const hasRc = ratecards.some(r => r.seller_id === s.id)
              return (
                <button
                  key={s.id}
                  className="w-full text-left px-3 py-2.5 rounded-lg border transition-all"
                  style={{
                    borderColor:  activeSeller === s.id ? '#C8971A' : '#E8ECF2',
                    background:   activeSeller === s.id ? 'rgba(200,151,26,.06)' : '#FAFBFD',
                  }}
                  onClick={() => openSeller(s.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0E2040]">{s.icon} {s.name}</span>
                    <span className={`badge ${hasRc ? 'badge-green' : 'badge-yellow'}`}>
                      {hasRc ? 'Configured' : 'Default'}
                    </span>
                  </div>
                  {ratecards.find(r => r.seller_id === s.id) && (
                    <div className="text-xs text-[#7A8BA0] mt-0.5">
                      Updated {fmtDate(ratecards.find(r => r.seller_id === s.id)!.updated_at)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rate card editor */}
        <div className="col-span-2">
          {!activeSeller ? (
            <div className="kh-card flex items-center justify-center h-full min-h-[300px] text-[#7A8BA0]">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-sm">Select a seller to view and edit their rate card</div>
              </div>
            </div>
          ) : (
            <div className="kh-card">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-base font-bold text-[#0E2040]">{seller?.icon} {seller?.name} — Rate Card</div>
                  {rc && <div className="text-xs text-[#7A8BA0] mt-0.5">Effective from {fmtDate(rc.effective_from)}</div>}
                </div>
                <button className="btn-gold btn-sm" onClick={handleSave} disabled={saving || Object.keys(edits).length === 0}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>

              <div className="space-y-5">
                {RATE_GROUPS.map(group => (
                  <div key={group.heading}>
                    <div className="text-[10px] uppercase tracking-[1.5px] font-bold mb-3 pb-1 border-b border-[#E8ECF2]" style={{ color: '#C8971A' }}>
                      {group.heading}
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {group.fields.map(f => {
                        const current = getValue(f.key)
                        const isDirty = f.key in edits
                        return (
                          <div key={f.key}>
                            <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">
                              {f.label}
                              <span className="ml-1 normal-case font-normal">— {f.desc}</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8BA0] text-sm">£</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="kh-input w-full !pl-7"
                                style={{ borderColor: isDirty ? '#C8971A' : undefined }}
                                value={current}
                                onChange={e => handleChange(f.key, e.target.value)}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(edits).length > 0 && (
                <div
                  className="mt-4 px-4 py-3 rounded-lg text-xs text-[#9E7410]"
                  style={{ background: 'rgba(200,151,26,.08)', border: '1px solid rgba(200,151,26,.3)' }}
                >
                  ⚠️ {Object.keys(edits).length} field{Object.keys(edits).length > 1 ? 's' : ''} changed — save to apply. All future invoices for {seller?.name} will use these rates.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
