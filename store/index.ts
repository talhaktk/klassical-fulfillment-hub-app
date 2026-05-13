import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase/client'
import type {
  Seller, RateCard, InventoryItem, Order, Invoice,
  BankAccount, Transaction, Message, ReminderLog, DashboardStats,
} from '@/types/database'

type Role = 'warehouse_manager' | 'warehouse_staff' | 'seller' | 'admin'

export interface CurrentUser {
  id:        string
  name:      string
  email:     string
  role:      Role
  seller_id: string | null
}

interface AppState {
  // ── Auth ──────────────────────────────────────────────────
  currentUser:    CurrentUser | null
  setCurrentUser: (u: CurrentUser | null) => void

  // ── Role ──────────────────────────────────────────────────
  role: Role
  setRole: (r: Role) => void

  // ── Data slices ───────────────────────────────────────────
  sellers:      Seller[]
  ratecards:    RateCard[]
  inventory:    InventoryItem[]
  orders:       Order[]
  invoices:     Invoice[]
  bankAccounts: BankAccount[]
  transactions: Transaction[]
  messages:     Message[]
  reminderLog:  ReminderLog[]

  // ── Dashboard stats (computed) ────────────────────────────
  stats: DashboardStats

  // ── UI state ──────────────────────────────────────────────
  loading:      boolean
  initialized:  boolean

  // ── Loaders ───────────────────────────────────────────────
  loadAll:         () => Promise<void>
  loadInventory:   () => Promise<void>
  loadOrders:      () => Promise<void>
  loadInvoices:    () => Promise<void>
  loadTransactions:() => Promise<void>
  loadMessages:    () => Promise<void>

  // ── Mutations (update multiple slices at once) ────────────
  fulfillOrder:     (orderId: string, fulfillData: FulfillPayload) => Promise<void>
  receiveGRN:       (grnData: GRNPayload)   => Promise<void>
  recordTransaction:(txData: TxPayload)     => Promise<void>
  markInvoicePaid:  (invoiceId: string, amount: number, accountId: string) => Promise<void>
  saveRateCard:     (sellerId: string, rates: Partial<RateCard>) => Promise<void>
  sendReminder:     (sellerId: string, invoiceId: string, channels: string[]) => Promise<void>

  // ── Realtime ──────────────────────────────────────────────
  subscribeRealtime: () => () => void
}

export interface FulfillPayload {
  labour_charge:         number
  pack_config_extra:     number
  bubble_wrap:           boolean
  box_small:             boolean
  box_medium:            boolean
  label_type:            'none' | 'full' | 'print_only'
  insert_print:          boolean
  tissue_paper:          boolean
  misc_charges:          { desc: string; amt: number }[]
  product_price_override:number | null
  total_charge:          number
  items:                 { sku: string; quantity: number; unit_price: number }[]
}

export interface GRNPayload {
  seller_id:            string
  product_name:         string
  sku:                  string
  variant:              string | null
  unit_price:           number
  boxes:                number
  units_per_box:        number
  total_in:             number
  damaged:              number
  condition:            string
  location:             string
  uom:                  string
  notes:                string
  notify_seller:        boolean
  weight_per_box_kg:    number
  weight_category:      'under_12kg' | '12_25kg' | 'over_25kg'
  branding_price_per_unit: number
  handling_charge:      number
  branding_charge:      number
}

export interface TxPayload {
  account_id:   string
  type:         'in' | 'out'
  category:     string
  description:  string
  amount:       number
  seller_id?:   string
  invoice_id?:  string
}

function computeStats(
  orders: Order[], inventory: InventoryItem[],
  invoices: Invoice[], bankAccounts: BankAccount[]
): DashboardStats {
  const today = new Date().toDateString()
  return {
    pendingOrders:      orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    fulfilledToday:     orders.filter(o => o.fulfilled_at && new Date(o.fulfilled_at).toDateString() === today).length,
    activeSkus:         inventory.length,
    lowStockAlerts:     inventory.filter(i => (i.good_stock - i.reserved) <= 5).length,
    totalRevenue:       invoices.reduce((s, i) => s + i.total_amount, 0),
    outstandingBalance: invoices.reduce((s, i) => s + Math.max(0, i.total_amount - i.paid_amount), 0),
    overdueInvoices:    invoices.filter(i => i.status === 'overdue').length,
    totalCash:          bankAccounts.reduce((s, a) => s + a.balance, 0),
  }
}

let grnCounter = 41

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  role: 'warehouse_manager',
  setRole: (role) => set({ role }),

  sellers:      [],
  ratecards:    [],
  inventory:    [],
  orders:       [],
  invoices:     [],
  bankAccounts: [],
  transactions: [],
  messages:     [],
  reminderLog:  [],
  stats:        { pendingOrders: 0, fulfilledToday: 0, activeSkus: 0, lowStockAlerts: 0, totalRevenue: 0, outstandingBalance: 0, overdueInvoices: 0, totalCash: 0 },
  loading:      false,
  initialized:  false,

  // ── Load everything ────────────────────────────────────────
  loadAll: async () => {
    set({ loading: true })
    const db = getSupabaseClient()
    const [
      { data: sellers },
      { data: ratecards },
      { data: inventory },
      { data: orders },
      { data: invoices },
      { data: bankAccounts },
      { data: transactions },
      { data: messages },
      { data: reminderLog },
    ] = await Promise.all([
      db.from('sellers').select('*').order('name'),
      db.from('rate_cards').select('*'),
      db.from('inventory').select('*, sellers(name, icon)').order('product_name'),
      db.from('orders').select('*, sellers(name, icon), order_items(*)').order('created_at', { ascending: false }),
      db.from('invoices').select('*, sellers(name, icon)').order('created_at', { ascending: false }),
      db.from('bank_accounts').select('*').order('name'),
      db.from('transactions').select('*, bank_accounts(name), sellers(name), invoices(invoice_number)').order('transaction_date', { ascending: false }).limit(100),
      db.from('messages').select('*, sellers(name, icon)').order('created_at', { ascending: false }),
      db.from('reminder_log').select('*').order('sent_at', { ascending: false }).limit(50),
    ])

    const s  = (sellers      ?? []) as Seller[]
    const rc = (ratecards    ?? []) as RateCard[]
    const inv= (inventory    ?? []) as InventoryItem[]
    const ord= (orders       ?? []) as Order[]
    const inv2=(invoices     ?? []) as Invoice[]
    const ba = (bankAccounts ?? []) as BankAccount[]
    const tx = (transactions ?? []) as Transaction[]
    const msg= (messages     ?? []) as Message[]
    const rl = (reminderLog  ?? []) as ReminderLog[]

    set({
      sellers: s, ratecards: rc, inventory: inv, orders: ord,
      invoices: inv2, bankAccounts: ba, transactions: tx,
      messages: msg, reminderLog: rl,
      stats: computeStats(ord, inv, inv2, ba),
      loading: false, initialized: true,
    })
  },

  loadInventory: async () => {
    const { data } = await getSupabaseClient().from('inventory').select('*, sellers(name, icon)').order('product_name')
    if (data) set(s => ({ inventory: data as InventoryItem[], stats: computeStats(s.orders, data as InventoryItem[], s.invoices, s.bankAccounts) }))
  },

  loadOrders: async () => {
    const { data } = await getSupabaseClient().from('orders').select('*, sellers(name, icon), order_items(*)').order('created_at', { ascending: false })
    if (data) set(s => ({ orders: data as Order[], stats: computeStats(data as Order[], s.inventory, s.invoices, s.bankAccounts) }))
  },

  loadInvoices: async () => {
    const { data } = await getSupabaseClient().from('invoices').select('*, sellers(name, icon)').order('created_at', { ascending: false })
    if (data) set(s => ({ invoices: data as Invoice[], stats: computeStats(s.orders, s.inventory, data as Invoice[], s.bankAccounts) }))
  },

  loadTransactions: async () => {
    const { data } = await getSupabaseClient().from('transactions').select('*, bank_accounts(name), sellers(name), invoices(invoice_number)').order('transaction_date', { ascending: false }).limit(100)
    if (data) set({ transactions: data as Transaction[] })
  },

  loadMessages: async () => {
    const { data } = await getSupabaseClient().from('messages').select('*, sellers(name, icon)').order('created_at', { ascending: false })
    if (data) set({ messages: data as Message[] })
  },

  // ── Fulfill an order ──────────────────────────────────────
  fulfillOrder: async (orderId, payload) => {
    const db = getSupabaseClient()

    // 1. Save fulfillment record
    await db.from('order_fulfillment').upsert({
      order_id: orderId,
      labour_charge: payload.labour_charge,
      pack_config_extra: payload.pack_config_extra,
      bubble_wrap: payload.bubble_wrap,
      box_small: payload.box_small,
      box_medium: payload.box_medium,
      label_type: payload.label_type,
      insert_print: payload.insert_print,
      tissue_paper: payload.tissue_paper,
      misc_charges: payload.misc_charges,
      product_price_override: payload.product_price_override,
      total_charge: payload.total_charge,
    })

    // 2. Mark order as fulfilled
    await db.from('orders').update({
      status: 'fulfilled',
      total_cost: payload.total_charge,
      fulfilled_at: new Date().toISOString(),
    }).eq('id', orderId)

    // 3. Decrement inventory: good_stock and reserved by fulfilled quantity
    for (const item of payload.items) {
      const { data: inv } = await db.from('inventory').select('good_stock, reserved').eq('sku', item.sku).single()
      if (inv) {
        await db.from('inventory').update({
          good_stock: Math.max(0, inv.good_stock - item.quantity),
          reserved:   Math.max(0, inv.reserved   - item.quantity),
        }).eq('sku', item.sku)
      }
    }

    // 4. Add invoice line items for this order
    const { data: order } = await db.from('orders').select('*, sellers(*)').eq('id', orderId).single()
    if (order) {
      // Find or create invoice for this seller/period
      const periodLabel = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })
      let { data: inv } = await db.from('invoices')
        .select('*')
        .eq('seller_id', order.seller_id)
        .eq('period_label', periodLabel)
        .single()

      if (!inv) {
        const invNum = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
        const { data: newInv } = await db.from('invoices').insert({
          invoice_number: invNum,
          seller_id: order.seller_id,
          period_label: periodLabel,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          total_amount: payload.total_charge,
          status: 'pending',
          due_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25).toISOString().split('T')[0],
        }).select().single()
        inv = newInv
      } else {
        await db.from('invoices').update({ total_amount: (inv.total_amount || 0) + payload.total_charge }).eq('id', inv.id)
      }

      if (inv) {
        await db.from('invoice_items').insert({
          invoice_id: inv.id,
          order_id: orderId,
          description: `Pick & Pack — ${order.order_number}`,
          amount: payload.total_charge,
          item_type: 'labour',
        })
      }
    }

    // 5. Reload affected slices
    await Promise.all([get().loadOrders(), get().loadInvoices(), get().loadInventory()])
  },

  // ── Receive GRN ───────────────────────────────────────────
  receiveGRN: async (payload) => {
    const db = getSupabaseClient()
    grnCounter++
    const ref = `GRN-${new Date().getFullYear()}-${String(grnCounter).padStart(3, '0')}`

    // 1. Create/upsert inventory item
    const { data: existing } = await db.from('inventory').select('id, good_stock, total_in').eq('sku', payload.sku).single()
    const goodUnits = payload.total_in - payload.damaged

    if (existing) {
      await db.from('inventory').update({
        good_stock: existing.good_stock + goodUnits,
        total_in: existing.total_in + payload.total_in,
        damaged: (existing as any).damaged + payload.damaged,
        condition: payload.condition,
        warehouse_location: payload.location,
        grn_ref: ref,
        weight_per_box_kg: payload.weight_per_box_kg || null,
        weight_category: payload.weight_category || null,
        branding_price_per_unit: payload.branding_price_per_unit || null,
        updated_at: new Date().toISOString(),
      }).eq('sku', payload.sku)
    } else {
      await db.from('inventory').insert({
        seller_id: payload.seller_id,
        product_name: payload.product_name,
        sku: payload.sku,
        variant: payload.variant,
        unit_price: payload.unit_price,
        boxes_in: payload.boxes,
        units_per_box: payload.units_per_box,
        total_in: payload.total_in,
        damaged: payload.damaged,
        good_stock: goodUnits,
        reserved: 0,
        warehouse_location: payload.location,
        condition: payload.condition,
        unit_of_measure: payload.uom,
        grn_ref: ref,
        weight_per_box_kg: payload.weight_per_box_kg || null,
        weight_category: payload.weight_category || null,
        branding_price_per_unit: payload.branding_price_per_unit || null,
      })
    }

    // 2. Log GRN
    await db.from('grn').insert({
      ref, seller_id: payload.seller_id,
      product_name: payload.product_name,
      boxes: payload.boxes, total_in: payload.total_in,
      good_units: goodUnits, damaged_units: payload.damaged,
      condition: payload.condition, notes: payload.notes,
      seller_notified: payload.notify_seller,
    })

    // 3. Create handling + branding invoice if charges exist
    const totalInvoice = (payload.handling_charge || 0) + (payload.branding_charge || 0)
    if (totalInvoice > 0) {
      const periodLabel = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })
      let { data: existingInv } = await db.from('invoices')
        .select('*')
        .eq('seller_id', payload.seller_id)
        .eq('period_label', periodLabel)
        .maybeSingle()

      if (!existingInv) {
        const invNum = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
        const { data: newInv } = await db.from('invoices').insert({
          invoice_number: invNum,
          seller_id: payload.seller_id,
          period_label: periodLabel,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          total_amount: totalInvoice,
          status: 'pending',
          due_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25).toISOString().split('T')[0],
        }).select().single()
        existingInv = newInv
      } else {
        await db.from('invoices').update({ total_amount: (existingInv.total_amount || 0) + totalInvoice }).eq('id', existingInv.id)
      }

      if (existingInv) {
        const lineItems = []
        if (payload.handling_charge > 0) {
          lineItems.push({
            invoice_id: existingInv.id,
            description: `Handling charge — GRN ${ref} (${payload.boxes} boxes × ${payload.weight_category?.replace(/_/g,' ') ?? ''} rate)`,
            amount: payload.handling_charge,
            item_type: 'handling',
          })
        }
        if (payload.branding_charge > 0) {
          lineItems.push({
            invoice_id: existingInv.id,
            description: `Branding/packaging — ${goodUnits} units × £${payload.branding_price_per_unit.toFixed(2)}`,
            amount: payload.branding_charge,
            item_type: 'branding',
          })
        }
        if (lineItems.length > 0) await db.from('invoice_items').insert(lineItems)
      }
      await get().loadInvoices()
    }

    await get().loadInventory()
  },

  // ── Record bank transaction ───────────────────────────────
  recordTransaction: async (txData) => {
    const db = getSupabaseClient()

    // 1. Insert transaction
    await db.from('transactions').insert({
      account_id: txData.account_id,
      type: txData.type,
      category: txData.category,
      description: txData.description,
      amount: txData.amount,
      seller_id: txData.seller_id ?? null,
      invoice_id: txData.invoice_id ?? null,
      transaction_date: new Date().toISOString().split('T')[0],
    })

    // 2. Update bank account balance
    const { data: acct } = await db.from('bank_accounts').select('balance').eq('id', txData.account_id).single()
    if (acct) {
      const newBal = txData.type === 'in' ? acct.balance + txData.amount : acct.balance - txData.amount
      await db.from('bank_accounts').update({ balance: newBal }).eq('id', txData.account_id)
    }

    // 3. If seller payment, update invoice paid_amount
    if (txData.invoice_id) {
      const { data: inv } = await db.from('invoices').select('paid_amount, total_amount').eq('id', txData.invoice_id).single()
      if (inv) {
        const newPaid = (inv.paid_amount || 0) + txData.amount
        const newStatus = newPaid >= inv.total_amount ? 'paid' : newPaid > 0 ? 'partial' : inv.paid_amount === 0 ? 'pending' : 'partial'
        await db.from('invoices').update({ paid_amount: newPaid, status: newStatus }).eq('id', txData.invoice_id)
      }
    }

    await Promise.all([get().loadTransactions(), get().loadInvoices()])
    // Reload bank accounts
    const { data: bacs } = await db.from('bank_accounts').select('*').order('name')
    if (bacs) set(s => ({ bankAccounts: bacs as BankAccount[], stats: computeStats(s.orders, s.inventory, s.invoices, bacs as BankAccount[]) }))
  },

  // ── Mark invoice fully paid ───────────────────────────────
  markInvoicePaid: async (invoiceId, amount, accountId) => {
    const inv = get().invoices.find(i => i.id === invoiceId)
    const invNum = inv?.invoice_number ?? 'invoice'
    await get().recordTransaction({
      account_id: accountId,
      type: 'in',
      category: 'Seller Payment',
      description: `Payment for ${invNum}`,
      amount,
      invoice_id: invoiceId,
      seller_id: inv?.seller_id,
    })
  },

  // ── Save rate card ────────────────────────────────────────
  saveRateCard: async (sellerId, rates) => {
    const db = getSupabaseClient()
    await db.from('rate_cards').upsert({ seller_id: sellerId, ...rates, updated_at: new Date().toISOString() }, { onConflict: 'seller_id' })
    const { data } = await db.from('rate_cards').select('*')
    if (data) set({ ratecards: data as RateCard[] })
  },

  // ── Send reminder ─────────────────────────────────────────
  sendReminder: async (sellerId, invoiceId, channels) => {
    const db = getSupabaseClient()
    const { data: inv } = await db.from('invoices').select('*').eq('id', invoiceId).single()
    if (inv) {
      await db.from('invoices').update({
        reminders_sent: (inv.reminders_sent || 0) + 1,
        last_reminder_at: new Date().toISOString(),
      }).eq('id', invoiceId)
    }
    await db.from('reminder_log').insert({
      type: channels.join('+'),
      description: `Payment reminder sent`,
      seller_id: sellerId,
      invoice_id: invoiceId,
      channels,
    })
    await Promise.all([get().loadInvoices()])
    const { data: rl } = await db.from('reminder_log').select('*').order('sent_at', { ascending: false }).limit(50)
    if (rl) set({ reminderLog: rl as ReminderLog[] })
  },

  // ── Realtime subscriptions ────────────────────────────────
  subscribeRealtime: () => {
    const db = getSupabaseClient()
    const channel = db.channel('klassical-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        () => get().loadOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' },
        () => get().loadInventory())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' },
        () => get().loadInvoices())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' },
        () => get().loadTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
        () => get().loadMessages())
      .subscribe()

    return () => { db.removeChannel(channel) }
  },
}))
