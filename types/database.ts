export type SellerStatus = 'active' | 'inactive' | 'suspended'
export type OrderStatus  = 'pending' | 'processing' | 'fulfilled' | 'dispatched' | 'cancelled'
export type OrderPriority= 'urgent'  | 'high' | 'normal' | 'low'
export type InvoiceStatus= 'pending' | 'sent'  | 'paid'    | 'overdue'    | 'partial'
export type Condition    = 'complete'| 'partial'| 'damaged'
export type TxType       = 'in'      | 'out'
export type LabelType    = 'none'    | 'full'  | 'print_only'
export type SenderRole   = 'warehouse'| 'seller'

export interface Seller {
  id:         string
  name:       string
  email:      string | null
  whatsapp:   string | null
  website:    string | null
  status:     SellerStatus
  since_date: string | null
  icon:       string
  created_at: string
}

export interface RateCard {
  id:                      string
  seller_id:               string
  labour_per_order:        number
  labour_extra_item:       number
  storage_per_pallet:      number
  returns_per_item:        number
  box_small:               number
  box_medium:              number
  bubble_wrap:             number
  label_full:              number
  label_print_only:        number
  insert_print:            number
  tissue_paper:            number
  // Weight-based receiving/handling
  receiving_forwarding:    number
  handling_under_12kg:     number
  handling_12_25kg:        number
  handling_over_25kg:      number
  effective_from:          string
  updated_at:              string
}

export interface InventoryItem {
  id:                     string
  seller_id:              string
  product_name:           string
  sku:                    string
  variant:                string | null
  unit_price:             number
  boxes_in:               number
  units_per_box:          number
  total_in:               number
  damaged:                number
  good_stock:             number
  reserved:               number
  warehouse_location:     string | null
  condition:              Condition
  unit_of_measure:        string
  grn_ref:                string | null
  weight_per_box_kg:      number | null
  weight_category:        'under_12kg' | '12_25kg' | 'over_25kg' | null
  branding_price_per_unit:number | null
  created_at:             string
  updated_at:             string
  sellers?:               Seller
}

export interface GRN {
  id:              string
  ref:             string
  seller_id:       string
  product_name:    string | null
  boxes:           number | null
  total_in:        number | null
  good_units:      number | null
  damaged_units:   number
  condition:       Condition
  notes:           string | null
  seller_notified: boolean
  received_date:   string
  created_at:      string
  sellers?:        Seller
}

export interface Order {
  id:                string
  order_number:      string
  seller_id:         string
  customer_name:     string | null
  customer_address:  string | null
  customer_postcode: string | null
  carrier:           string | null
  tracking_number:   string | null
  status:            OrderStatus
  priority:          OrderPriority
  label_url:         string | null
  total_cost:        number | null
  notes:             string | null
  created_at:        string
  fulfilled_at:      string | null
  dispatched_at:     string | null
  sellers?:          Seller
  order_items?:      OrderItem[]
}

export interface OrderItem {
  id:           string
  order_id:     string
  inventory_id: string | null
  sku:          string | null
  product_name: string | null
  quantity:     number
  unit_price:   number
  created_at:   string
}

export interface MiscCharge { desc: string; amt: number }

export interface OrderFulfillment {
  id:                    string
  order_id:              string
  labour_charge:         number
  pack_config_extra:     number
  bubble_wrap:           boolean
  box_small:             boolean
  box_medium:            boolean
  label_type:            LabelType
  insert_print:          boolean
  tissue_paper:          boolean
  misc_charges:          MiscCharge[]
  product_price_override:number | null
  total_charge:          number
  created_at:            string
}

export interface Invoice {
  id:              string
  invoice_number:  string
  seller_id:       string
  period_label:    string | null
  period_start:    string | null
  period_end:      string | null
  subtotal:        number
  storage_charge:  number
  total_amount:    number
  paid_amount:     number
  status:          InvoiceStatus
  due_date:        string | null
  reminders_sent:  number
  last_reminder_at:string | null
  created_at:      string
  sellers?:        Seller
}

export interface InvoiceItem {
  id:          string
  invoice_id:  string
  order_id:    string | null
  description: string | null
  amount:      number
  item_type:   string | null
  created_at:  string
}

export interface BankAccount {
  id:                    string
  name:                  string
  account_number_masked: string | null
  account_type:          string | null
  icon:                  string
  balance:               number
  created_at:            string
}

export interface Transaction {
  id:               string
  account_id:       string
  type:             TxType
  category:         string | null
  description:      string | null
  amount:           number
  seller_id:        string | null
  invoice_id:       string | null
  transaction_date: string
  created_at:       string
  bank_accounts?:   BankAccount
  sellers?:         Seller
  invoices?:        Invoice
}

export interface Statement {
  id:            string
  ref:           string
  seller_id:     string
  period_label:  string | null
  period_start:  string | null
  period_end:    string | null
  total_charges: number
  balance_due:   number
  sent_via:      string[] | null
  sent_at:       string | null
  created_at:    string
  sellers?:      Seller
}

export interface Message {
  id:          string
  seller_id:   string
  sender_role: SenderRole
  content:     string
  read:        boolean
  created_at:  string
  sellers?:    Seller
}

export interface ReminderLog {
  id:          string
  type:        string | null
  description: string | null
  seller_id:   string | null
  invoice_id:  string | null
  channels:    string[] | null
  sent_at:     string
}

// Dashboard aggregate
export interface DashboardStats {
  pendingOrders:    number
  fulfilledToday:   number
  activeSkus:       number
  lowStockAlerts:   number
  totalRevenue:     number
  outstandingBalance: number
  overdueInvoices:  number
  totalCash:        number
}
