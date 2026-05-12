'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem { label: string; href: string; icon: string; locked?: boolean; badge?: number }

const warehouseNav: { section: string; items: NavItem[] }[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard',        href: '/',               icon: '📊' },
      { label: 'Orders',           href: '/orders',         icon: '📦' },
      { label: 'Scan & Fulfill',   href: '/fulfill',        icon: '⚡', locked: true },
      { label: 'Inventory',        href: '/inventory',      icon: '🗄️' },
      { label: 'Warehouse Map',    href: '/warehouse-map',  icon: '🗺️' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Sellers',           href: '/sellers',        icon: '🤝' },
      { label: 'Billing & Invoices', href: '/billing',       icon: '🧾' },
      { label: 'Statements',        href: '/statements',     icon: '📄' },
      { label: 'Reminders & Alerts',href: '/reminders',      icon: '🔔' },
      { label: 'Messages',          href: '/messages',       icon: '💬' },
      { label: 'Analytics',         href: '/analytics',      icon: '📈' },
      { label: 'Bank & Payments',   href: '/payments',       icon: '🏦' },
    ],
  },
]

const adminNav: NavItem[] = [
  { label: 'Users & Roles', href: '/users',      icon: '👥' },
  { label: 'Rate Cards',    href: '/rate-cards',  icon: '💰' },
]

const sellerNav: { section: string; items: NavItem[] }[] = [
  {
    section: 'My Seller Portal',
    items: [
      { label: 'My Dashboard',  href: '/seller-portal',           icon: '🏠' },
      { label: 'New Order',     href: '/seller-portal/new-order', icon: '➕' },
      { label: 'My Orders',     href: '/seller-portal/orders',    icon: '📦' },
      { label: 'My Inventory',  href: '/seller-portal/inventory', icon: '🗄️' },
      { label: 'Billing',       href: '/seller-portal/billing',   icon: '🧾' },
      { label: 'Messages',      href: '/seller-portal/messages',  icon: '💬' },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  admin:             'Super Admin',
  warehouse_manager: 'Warehouse Manager',
  warehouse_staff:   'WH Staff',
  seller:            'Seller',
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function Sidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { role, stats, orders, messages, currentUser } = useStore()

  const pendingOrders  = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const unreadMessages = messages.filter(m => !m.read && m.sender_role === 'seller').length

  const navGroups  = role === 'seller' ? sellerNav : warehouseNav
  const showConfig = role === 'admin' || role === 'warehouse_manager'

  async function handleLogout() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function renderItem(item: NavItem) {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    const badgeCount = item.href === '/orders' ? pendingOrders
      : item.href === '/messages' || item.href === '/seller-portal/messages' ? unreadMessages
      : item.href === '/reminders' ? stats.overdueInvoices
      : undefined

    if (item.locked) {
      return (
        <div
          key={item.href}
          className="flex items-center gap-2.5 px-4 py-2.5 mx-2 my-px rounded-lg text-sm border-l-[3px] border-transparent cursor-not-allowed select-none"
          style={{ opacity: 0.38 }}
          title="Coming soon — not yet available"
        >
          <span className="text-sm w-4.5 text-center">{item.icon}</span>
          <span className="flex-1" style={{ color: '#7A8BA0' }}>{item.label}</span>
          <span className="text-[9px] px-1.5 py-px rounded font-bold tracking-wide" style={{ background: 'rgba(200,151,26,.15)', color: '#C8971A' }}>SOON</span>
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 mx-2 my-px rounded-lg text-sm font-medium transition-all border-l-[3px]',
          isActive
            ? 'border-l-[#D4A520] text-[#E8B830] font-semibold'
            : 'border-transparent text-[#B8C4D4] hover:text-white hover:border-l-[rgba(200,151,26,.4)]'
        )}
        style={isActive ? { background: 'linear-gradient(90deg,rgba(200,151,26,.2),rgba(200,151,26,.05))' } : { background: 'transparent' }}
      >
        <span className="text-sm w-4.5 text-center">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {badgeCount != null && badgeCount > 0 && (
          <span
            className="ml-auto rounded-[10px] px-2 py-px text-[10px] font-extrabold"
            style={{ background: '#D4A520', color: '#0E2040' }}
          >
            {badgeCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className="flex flex-col overflow-y-auto flex-shrink-0"
      style={{ width: 'var(--sidebar-w)', background: '#142D56', borderRight: '1px solid rgba(200,151,26,.18)' }}
    >
      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto pt-1 pb-2">
        {navGroups.map(group => (
          <div key={group.section}>
            <div
              className="px-4 pt-3.5 pb-1 text-[10px] uppercase tracking-[1.4px] font-bold"
              style={{ color: '#C8971A' }}
            >
              {group.section}
            </div>
            {group.items.map(renderItem)}
          </div>
        ))}

        {showConfig && (
          <div>
            <div className="px-4 pt-3.5 pb-1 text-[10px] uppercase tracking-[1.4px] font-bold" style={{ color: '#C8971A' }}>
              Configuration
            </div>
            {adminNav.map(renderItem)}
          </div>
        )}
      </div>

      {/* Bottom: user card + logout */}
      <div style={{ borderTop: '1px solid rgba(200,151,26,.18)' }}>
        <div className="px-3 py-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
            style={{ background: 'rgba(200,151,26,.25)', color: '#E8B830', fontFamily: 'DM Mono, monospace' }}
          >
            {currentUser ? getInitials(currentUser.name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser?.name ?? 'User'}</div>
            <div className="text-[10px] truncate" style={{ color: '#7A8BA0' }}>
              {ROLE_LABELS[currentUser?.role ?? ''] ?? currentUser?.role ?? ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all hover:bg-red-900/20"
          style={{ color: '#E57373', borderTop: '1px solid rgba(255,255,255,.05)' }}
        >
          <span className="text-sm">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
