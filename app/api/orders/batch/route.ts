import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface OrderInput {
  seller_id:         string
  customer_name:     string
  customer_address:  string
  customer_postcode: string
  carrier:           string
  tracking_number:   string | null
  notes:             string | null
  items: { sku: string; product_name: string; quantity: number; unit_price: number }[]
}

export async function POST(req: NextRequest) {
  try {
    const { orders }: { orders: OrderInput[] } = await req.json()
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'orders array required' }, { status: 400 })
    }

    const supabase = createClient()

    // Generate sequential order numbers based on current timestamp
    const base = Date.now()
    const created: string[] = []
    const errors: string[]  = []

    for (let i = 0; i < orders.length; i++) {
      const o = orders[i]
      const order_number = `ORD-${String(base + i).slice(-6)}`

      // Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number,
          seller_id:         o.seller_id,
          customer_name:     o.customer_name,
          customer_address:  o.customer_address,
          customer_postcode: o.customer_postcode,
          carrier:           o.carrier || 'Royal Mail',
          tracking_number:   o.tracking_number ?? null,
          status:            'pending',
          priority:          'normal',
          notes:             o.notes ?? null,
        })
        .select('id')
        .single()

      if (orderErr || !order) {
        errors.push(`Order ${i + 1}: ${orderErr?.message ?? 'insert failed'}`)
        continue
      }

      // Insert order items
      if (o.items.length > 0) {
        const items = o.items.map(item => ({
          order_id:     order.id,
          sku:          item.sku,
          product_name: item.product_name,
          quantity:     item.quantity,
          unit_price:   item.unit_price,
        }))
        const { error: itemErr } = await supabase.from('order_items').insert(items)
        if (itemErr) errors.push(`Order ${i + 1} items: ${itemErr.message}`)
      }

      // Reserve inventory
      for (const item of o.items) {
        const { data: inv } = await supabase
          .from('inventory')
          .select('reserved')
          .eq('sku', item.sku)
          .single()
        if (inv) {
          await supabase
            .from('inventory')
            .update({ reserved: inv.reserved + item.quantity })
            .eq('sku', item.sku)
        }
      }

      created.push(order.id)
    }

    return NextResponse.json({ created, errors, count: created.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Batch error' }, { status: 500 })
  }
}
