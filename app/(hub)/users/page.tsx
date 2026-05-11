'use client'
import { useState } from 'react'
import { useStore } from '@/store'

type Role = 'admin' | 'warehouse_manager' | 'warehouse_staff' | 'seller'

interface User {
  id:     string
  name:   string
  email:  string
  role:   Role
  seller: string | null
  status: 'active' | 'inactive'
  avatar: string
}

// Static users — extend with real Supabase Auth later
const MOCK_USERS: User[] = [
  { id: '1', name: 'Talha Khan',    email: 'dr.talhaktk@gmail.com', role: 'admin',             seller: null,            status: 'active', avatar: '👑' },
  { id: '2', name: 'Sarah Ahmed',   email: 'sarah@klassical.co.uk', role: 'warehouse_manager', seller: null,            status: 'active', avatar: '🏭' },
  { id: '3', name: 'James Wright',  email: 'james@klassical.co.uk', role: 'warehouse_staff',   seller: null,            status: 'active', avatar: '📦' },
  { id: '4', name: 'Emma Retail',   email: 'emma@retailco.com',     role: 'seller',             seller: 'RetailCo Ltd', status: 'active', avatar: '🛍️' },
]

const ROLE_LABELS: Record<Role, string> = {
  admin:             'Administrator',
  warehouse_manager: 'Warehouse Manager',
  warehouse_staff:   'Warehouse Staff',
  seller:            'Seller',
}

const ROLE_PERMS: Record<Role, string[]> = {
  admin:             ['Full system access', 'User management', 'All modules', 'Configuration'],
  warehouse_manager: ['Orders & Fulfillment', 'Inventory', 'Billing', 'Analytics', 'Messages'],
  warehouse_staff:   ['Orders & Fulfillment', 'Inventory (view)', 'Scanner access'],
  seller:            ['Seller Portal only', 'Own orders & invoices', 'Messaging'],
}

const ROLE_COLORS: Record<Role, string> = {
  admin:             'badge-red',
  warehouse_manager: 'badge-navy',
  warehouse_staff:   'badge-blue',
  seller:            'badge-orange',
}

export default function UsersPage() {
  const { role: currentRole, setRole } = useStore()
  const [users, setUsers]   = useState<User[]>(MOCK_USERS)
  const [modal, setModal]   = useState<User | null>(null)

  function handleRoleChange(id: string, newRole: Role) {
    setUsers(us => us.map(u => u.id === id ? { ...u, role: newRole } : u))
  }

  function handleStatusToggle(id: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Users &amp; Roles</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">{users.filter(u => u.status === 'active').length} active users · role-based access control</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="kh-card !p-2.5 flex items-center gap-2">
            <span className="text-xs text-[#7A8BA0] font-semibold">Preview as:</span>
            <select className="kh-input !w-44 !py-1" value={currentRole} onChange={e => setRole(e.target.value as any)}>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="warehouse_staff">Warehouse Staff</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn-gold btn-sm" onClick={() => setModal({ id: '', name: '', email: '', role: 'warehouse_staff', seller: null, status: 'active', avatar: '👤' })}>
            + Invite User
          </button>
        </div>
      </div>

      {/* Role permission matrix */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
          <div key={r} className="kh-card" style={{ borderTopColor: r === 'admin' ? '#C0321E' : r === 'warehouse_manager' ? '#1B3A6B' : r === 'warehouse_staff' ? '#2A6DC8' : '#C8971A' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${ROLE_COLORS[r]}`}>{ROLE_LABELS[r]}</span>
              <span className="text-xs text-[#7A8BA0]">{users.filter(u => u.role === r && u.status === 'active').length} users</span>
            </div>
            <ul className="space-y-1">
              {ROLE_PERMS[r].map(p => (
                <li key={p} className="text-xs text-[#4A5A70] flex items-center gap-1.5">
                  <span className="text-[#1A7A48]">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="kh-card">
        <table className="kh-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Seller Account</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{u.avatar}</span>
                    <span className="font-semibold text-[#0E2040]">{u.name}</span>
                  </div>
                </td>
                <td className="text-xs text-[#7A8BA0]">{u.email}</td>
                <td>
                  <select
                    className="kh-input !w-44 !py-1 text-xs"
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                  >
                    {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="text-xs text-[#7A8BA0]">{u.seller ?? '—'}</td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn-ghost btn-sm" onClick={() => setModal(u)}>✏️ Edit</button>
                    <button className="btn-ghost btn-sm" onClick={() => handleStatusToggle(u.id)}>
                      {u.status === 'active' ? '⏸' : '▶'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal (simplified) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[420px]" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">{modal.id ? 'Edit User' : 'Invite User'}</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Full Name</label>
                <input className="kh-input w-full" value={modal.name} onChange={e => setModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Email</label>
                <input className="kh-input w-full" type="email" value={modal.email} onChange={e => setModal(m => m ? { ...m, email: e.target.value } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Role</label>
                <select className="kh-input w-full" value={modal.role} onChange={e => setModal(m => m ? { ...m, role: e.target.value as Role } : m)}>
                  {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg text-xs text-[#4A5A70]" style={{ background: '#F0F4FA' }}>
              <strong>Permissions:</strong> {ROLE_PERMS[modal.role].join(' · ')}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-gold flex-1" onClick={() => {
                if (modal.id) setUsers(us => us.map(u => u.id === modal.id ? modal : u))
                else setUsers(us => [...us, { ...modal, id: Date.now().toString() }])
                setModal(null)
              }}>
                {modal.id ? 'Update' : 'Send Invite'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
