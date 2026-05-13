'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Role = 'admin' | 'warehouse_manager' | 'warehouse_staff' | 'seller'

interface UserProfile {
  id:        string
  name:      string
  email:     string
  role:      Role
  seller_id: string | null
  status:    'active' | 'inactive'
}

const ROLE_LABELS: Record<Role, string> = {
  admin:             'Administrator',
  warehouse_manager: 'Warehouse Manager',
  warehouse_staff:   'Warehouse Staff',
  seller:            'Seller',
}

const ROLE_COLORS: Record<Role, string> = {
  admin:             'badge-red',
  warehouse_manager: 'badge-navy',
  warehouse_staff:   'badge-blue',
  seller:            'badge-orange',
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function UsersPage() {
  const { currentUser, sellers } = useStore()
  const [users,        setUsers]        = useState<UserProfile[]>([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState<(Partial<UserProfile> & { isNew?: boolean; password?: string }) | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const isAdmin   = currentUser?.role === 'admin'
  const canManage = isAdmin || currentUser?.role === 'warehouse_manager'

  const allowedRoles: Role[] = isAdmin
    ? ['admin', 'warehouse_manager', 'warehouse_staff', 'seller']
    : ['warehouse_staff', 'seller']

  async function loadUsers() {
    setLoading(true)
    const db = getSupabaseClient()
    const { data: profiles } = await db.from('user_profiles').select('*').order('name')
    if (profiles) {
      const { data: { users: authUsers } } = await db.auth.admin?.listUsers?.() ?? { data: { users: [] } }
      const emailMap: Record<string, string> = {}
      authUsers?.forEach((u: any) => { emailMap[u.id] = u.email })
      setUsers(profiles.map(p => ({
        id: p.id, name: p.name, email: emailMap[p.id] ?? '—',
        role: p.role as Role, seller_id: p.seller_id,
        status: p.status as 'active' | 'inactive',
      })))
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function handleSave() {
    if (!modal) return
    setSaving(true)
    const db = getSupabaseClient()

    if (modal.isNew) {
      if (!modal.password || modal.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        setSaving(false)
        return
      }
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modal.name, email: modal.email, role: modal.role, seller_id: modal.seller_id, password: modal.password }),
      })
      if (res.ok) { toast.success('User created successfully'); setModal(null); loadUsers() }
      else { const err = await res.json(); toast.error(err.error ?? 'Failed to create user') }
    } else {
      const { error } = await db.from('user_profiles').update({
        name: modal.name, role: modal.role,
        seller_id: modal.seller_id ?? null, status: modal.status,
      }).eq('id', modal.id!)
      if (error) toast.error(error.message)
      else { toast.success('User updated'); setModal(null); loadUsers() }
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: deleteTarget.id, userEmail: deleteTarget.email }),
    })
    if (res.ok) { toast.success(`${deleteTarget.name} deleted`); setDeleteTarget(null); loadUsers() }
    else { const err = await res.json(); toast.error(err.error ?? 'Failed to delete user') }
    setDeleting(false)
  }

  async function handleToggleStatus(user: UserProfile) {
    if (!canManage) return
    const db = getSupabaseClient()
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const { error } = await db.from('user_profiles').update({ status: newStatus }).eq('id', user.id)
    if (error) toast.error(error.message)
    else { toast.success(`User ${newStatus}`); loadUsers() }
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Users &amp; Roles</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">{users.filter(u => u.status === 'active').length} active users · role-based access</p>
        </div>
        {canManage && (
          <button className="btn-gold btn-sm" onClick={() => setModal({ isNew: true, name: '', email: '', role: 'warehouse_staff', seller_id: null, status: 'active', password: '' })}>
            + Add User
          </button>
        )}
      </div>

      <div className="kh-card">
        {loading ? (
          <div className="text-center py-8 text-sm text-[#7A8BA0]">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#7A8BA0]">No users yet. Add your first user above.</div>
        ) : (
          <table className="kh-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#1B3A6B,#2A6DC8)', color: 'white' }}>
                        {getInitials(u.name)}
                      </div>
                      <span className="font-semibold text-[#0E2040]">{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-[#7A8BA0] bg-[#F0F4FA] px-1.5 py-0.5 rounded-full">you</span>
                      )}
                    </div>
                  </td>
                  <td className="text-xs text-[#7A8BA0]">{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost btn-sm" onClick={() => setModal({ ...u, isNew: false })}>✏️ Edit</button>
                        {u.id !== currentUser?.id && (
                          <button className="btn-ghost btn-sm" onClick={() => handleToggleStatus(u)}>
                            {u.status === 'active' ? '⏸' : '▶'}
                          </button>
                        )}
                        {isAdmin && u.id !== currentUser?.id && (
                          <button className="btn-ghost btn-sm" style={{ color: '#C0321E' }} onClick={() => setDeleteTarget(u)}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[460px] max-h-[90vh] overflow-y-auto" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">{modal.isNew ? '+ Add User Directly' : 'Edit User'}</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Full Name</label>
                <input className="kh-input w-full" value={modal.name ?? ''} onChange={e => setModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              {modal.isNew && (
                <>
                  <div>
                    <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Email</label>
                    <input className="kh-input w-full" type="email" value={modal.email ?? ''} onChange={e => setModal(m => m ? { ...m, email: e.target.value } : m)} />
                  </div>
                  <div>
                    <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Password (min 8 chars)</label>
                    <input className="kh-input w-full" type="password" placeholder="Set a temporary password" value={modal.password ?? ''} onChange={e => setModal(m => m ? { ...m, password: e.target.value } : m)} />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Role</label>
                <select className="kh-input w-full" value={modal.role ?? 'warehouse_staff'}
                  onChange={e => setModal(m => m ? { ...m, role: e.target.value as Role, seller_id: e.target.value !== 'seller' ? null : m.seller_id } : m)}>
                  {allowedRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              {modal.role === 'seller' && (
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Seller Account</label>
                  <select className="kh-input w-full" value={modal.seller_id ?? ''} onChange={e => setModal(m => m ? { ...m, seller_id: e.target.value || null } : m)}>
                    <option value="">— Select seller —</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {modal.isNew && (
                <div className="rounded-lg p-3 text-xs" style={{ background: '#F0F8FF', border: '1px solid #D0E8FF', color: '#2A4F8A' }}>
                  ℹ️ User is created immediately — no email needed. Share the email + password directly with them.
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-gold flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal.isNew ? 'Create User' : 'Update User'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[400px]" style={{ border: '1px solid rgba(192,50,30,.4)' }}>
            <div className="text-base font-bold text-[#C0321E] mb-2">🗑️ Delete User</div>
            <p className="text-sm text-[#4A5A70] mb-1">Are you sure you want to permanently delete:</p>
            <p className="text-sm font-bold text-[#0E2040] mb-4">{deleteTarget.name} ({deleteTarget.email})</p>
            <p className="text-xs text-[#C0321E] mb-4">This cannot be undone. The user will lose all access immediately.</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: '#C0321E' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
