'use client'
import { useMemo, useState } from 'react'
import { useStore } from '@/store'

const ZONES = ['A', 'B', 'C', 'D', 'E', 'F']
const ROWS_PER_ZONE = 4
const SLOTS_PER_ROW = 6

export default function WarehouseMapPage() {
  const { inventory } = useStore()
  const [hovered, setHovered]     = useState<string | null>(null)
  const [zoneFilter, setZoneFilter] = useState<string | null>(null)

  // Build slot occupancy from inventory
  const slotMap = useMemo(() => {
    const map = new Map<string, typeof inventory>()
    inventory.forEach(item => {
      if (!item.warehouse_location) return
      const existing = map.get(item.warehouse_location) ?? []
      map.set(item.warehouse_location, [...existing, item])
    })
    return map
  }, [inventory])

  function getSlotColor(loc: string): string {
    const items = slotMap.get(loc)
    if (!items || items.length === 0) return '#E8ECF2'
    const hasLow = items.some(i => (i.good_stock - i.reserved) <= 5)
    const hasDamaged = items.some(i => i.damaged > 0)
    if (hasDamaged) return '#FEE2E2'
    if (hasLow)     return '#FEF3C7'
    return '#DCFCE7'
  }

  function getSlotBorder(loc: string): string {
    const items = slotMap.get(loc)
    if (!items || items.length === 0) return 'transparent'
    const hasLow = items.some(i => (i.good_stock - i.reserved) <= 5)
    if (hasLow) return '#C8971A'
    return '#1A7A48'
  }

  const hoveredItems = hovered ? slotMap.get(hovered) : null

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Warehouse Map</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">Luton Facility · Zones A–F · 4,200 pallet spaces</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 items-center">
            {[
              { color: '#DCFCE7', label: 'Occupied (healthy)' },
              { color: '#FEF3C7', label: 'Low stock' },
              { color: '#FEE2E2', label: 'Damaged items' },
              { color: '#E8ECF2', label: 'Empty' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1 text-xs text-[#7A8BA0]">
                <span className="w-3 h-3 rounded-sm inline-block border" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {(zoneFilter ? ZONES.filter(z => z === zoneFilter) : ZONES).map(zone => (
          <div key={zone} className="kh-card">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-[#0E2040]">Zone {zone}</div>
              <span className="text-xs text-[#7A8BA0]">
                {inventory.filter(i => i.warehouse_location?.startsWith(zone)).length} SKUs
              </span>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SLOTS_PER_ROW}, 1fr)` }}>
              {Array.from({ length: ROWS_PER_ZONE * SLOTS_PER_ROW }, (_, idx) => {
                const row  = Math.floor(idx / SLOTS_PER_ROW) + 1
                const slot = (idx % SLOTS_PER_ROW) + 1
                const loc  = `${zone}${row}-${slot}`
                const bg   = getSlotColor(loc)
                const bd   = getSlotBorder(loc)
                const items = slotMap.get(loc)
                return (
                  <div
                    key={loc}
                    className="rounded cursor-pointer transition-transform hover:scale-110 relative"
                    style={{ height: 28, background: bg, border: `1.5px solid ${bd === 'transparent' ? '#D0D8E8' : bd}` }}
                    onMouseEnter={() => setHovered(loc)}
                    onMouseLeave={() => setHovered(null)}
                    title={loc}
                  >
                    {items && items.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0E2040] opacity-60">
                        {items.length}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-2.5 flex gap-3 text-[10px] text-[#7A8BA0]">
              <span>{Array.from({ length: ROWS_PER_ZONE * SLOTS_PER_ROW }, (_, i) => {
                const r = Math.floor(i / SLOTS_PER_ROW) + 1
                const s = (i % SLOTS_PER_ROW) + 1
                return `${zone}${r}-${s}`
              }).filter(l => slotMap.has(l)).length} occupied</span>
              <span>{Array.from({ length: ROWS_PER_ZONE * SLOTS_PER_ROW }, (_, i) => {
                const r = Math.floor(i / SLOTS_PER_ROW) + 1
                const s = (i % SLOTS_PER_ROW) + 1
                return `${zone}${r}-${s}`
              }).filter(l => !slotMap.has(l)).length} empty</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hovered slot info */}
      {hovered && hoveredItems && (
        <div
          className="fixed bottom-6 right-6 kh-card w-[320px] z-50 shadow-2xl"
          style={{ border: '2px solid #C8971A' }}
        >
          <div className="text-xs font-bold text-[#0E2040] mb-2">📍 Location: {hovered}</div>
          <div className="space-y-1.5">
            {hoveredItems.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="font-mono text-[#2A4F8A]">{item.sku}</span>
                <span className="text-[#7A8BA0] truncate mx-2 flex-1">{item.product_name}</span>
                <span className={`font-semibold ${(item.good_stock - item.reserved) <= 5 ? 'text-[#C0321E]' : 'text-[#1A7A48]'}`}>
                  {item.good_stock - item.reserved} avail
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone filter buttons */}
      <div className="flex gap-2 mt-3 justify-center">
        <button
          className={`btn-sm ${!zoneFilter ? 'btn-gold' : 'btn-ghost'}`}
          onClick={() => setZoneFilter(null)}
        >All Zones</button>
        {ZONES.map(z => (
          <button
            key={z}
            className={`btn-sm ${zoneFilter === z ? 'btn-gold' : 'btn-ghost'}`}
            onClick={() => setZoneFilter(z === zoneFilter ? null : z)}
          >Zone {z}</button>
        ))}
      </div>
    </div>
  )
}
