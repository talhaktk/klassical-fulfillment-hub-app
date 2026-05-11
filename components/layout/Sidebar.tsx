'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

interface NavItem { label: string; href: string; icon: string; badge?: number }

const warehouseNav: { section: string; items: NavItem[] }[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard',        href: '/',               icon: '📊' },
      { label: 'Orders',           href: '/orders',         icon: '📦', badge: 0 },
      { label: 'Scan & Fulfill',   href: '/fulfill',        icon: '⚡' },
      { label: 'Inventory',        href: '/inventory',      icon: '🗄️' },
      { label: 'Warehouse Map',    href: '/warehouse-map',  icon: '🗺️' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Sellers',          href: '/sellers',        icon: '🤝' },
      { label: 'Billing & Invoices',href: '/billing',       icon: '🧾' },
      { label: 'Statements',       href: '/statements',     icon: '📄' },
      { label: 'Reminders & Alerts',href: '/reminders',     icon: '🔔', badge: 0 },
      { label: 'Messages',         href: '/messages',       icon: '💬', badge: 0 },
      { label: 'Analytics',        href: '/analytics',      icon: '📈' },
      { label: 'Bank & Payments',  href: '/payments',       icon: '🏦' },
    ],
  },
]

const adminNav: NavItem[] = [
  { label: 'Users & Roles', href: '/users',     icon: '👥' },
  { label: 'Rate Cards',    href: '/rate-cards', icon: '💰' },
]

const sellerNav: { section: string; items: NavItem[] }[] = [
  {
    section: 'My Seller Portal',
    items: [
      { label: 'My Dashboard',  href: '/seller-portal',              icon: '🏠' },
      { label: 'New Order',     href: '/seller-portal/new-order',    icon: '➕' },
      { label: 'My Orders',     href: '/seller-portal/orders',       icon: '📦' },
      { label: 'My Inventory',  href: '/seller-portal/inventory',    icon: '🗄️' },
      { label: 'Billing',       href: '/seller-portal/billing',      icon: '🧾' },
      { label: 'Messages',      href: '/seller-portal/messages',     icon: '💬', badge: 1 },
    ],
  },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const { role, stats, orders, messages } = useStore()

  const pendingOrders  = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const unreadMessages = messages.filter(m => !m.read && m.sender_role === 'seller').length

  const navGroups = role === 'seller' ? sellerNav : warehouseNav
  const showAdmin = role === 'admin'

  return (
    <aside
      className="flex flex-col overflow-y-auto flex-shrink-0"
      style={{ width: 'var(--sidebar-w)', background: '#142D56', borderRight: '1px solid rgba(200,151,26,.18)' }}
    >
      {navGroups.map(group => (
        <div key={group.section}>
          <div
            className="px-4 pt-3.5 pb-1 text-[10px] uppercase tracking-[1.4px] font-bold"
            style={{ color: '#C8971A' }}
          >
            {group.section}
          </div>
          {group.items.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const badgeCount = item.href === '/orders' ? pendingOrders
              : item.href === '/messages' ? unreadMessages
              : item.href === '/reminders' ? stats.overdueInvoices
              : item.badge

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
          })}
        </div>
      ))}

      {showAdmin && (
        <div>
          <div className="px-4 pt-3.5 pb-1 text-[10px] uppercase tracking-[1.4px] font-bold" style={{ color: '#C8971A' }}>
            Configuration
          </div>
          {adminNav.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 mx-2 my-px rounded-lg text-sm font-medium transition-all border-l-[3px]',
                  isActive
                    ? 'border-l-[#D4A520] text-[#E8B830] font-semibold'
                    : 'border-transparent text-[#B8C4D4] hover:text-white'
                )}
                style={isActive ? { background: 'linear-gradient(90deg,rgba(200,151,26,.2),rgba(200,151,26,.05))' } : {}}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </aside>
  )
}
