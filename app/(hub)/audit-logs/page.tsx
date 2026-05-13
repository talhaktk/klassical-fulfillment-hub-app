'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuditLog {
  id: string
  created_at: string
  action: string
  target_type: string | null
  target_id: string | null
  actor_id: string | null
  details: Record<string, any> | null
}

const ACTION_COLORS: Record<string, string> = {
  'user.created': 'badge-green',
  'user.deleted': 'badge-red',
  'user.updated': 'badge-blue',
  'order.created': 'badge-blue',
  'order.updated': 'badge-navy',
  'order.deleted': 'badge-red',
}

function actionLabel(action: string) {
  return action.replace('.', ' › ')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    dateStyle: 'medium', timeStyle: 'short',
  })
}

export default function AuditLogsPage() {
  const { currentUser } = useStore()
  const [logs,    setLogs]    = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return
    async function load() {
      setLoading(true)
      const db = getSupabaseClient()
      const { data } = await db
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      setLogs(data ?? [])
      setLoading(false)
    }
    load()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-sm text-[#7A8BA0]">
        Access denied — Super Admin only.
      </div>
    )
  }

  const actionTypes = ['all', ...Array.from(new Set(logs.map(l => l.action)))]

  const filtered = logs.filter(l => {
    const matchesFilter = filter === 'all' || l.action === filter
    const q = search.toLowerCase()
    const matchesSearch = !q || l.action.includes(q) ||
      JSON.stringify(l.details ?? {}).toLowerCase().includes(q) ||
      (l.target_id ?? '').includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Audit Logs</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">{logs.length} records · last 500 events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="kh-input"
          style={{ width: 220 }}
          placeholder="Search action, details, ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="kh-input" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          {actionTypes.map(a => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : actionLabel(a)}</option>
          ))}
        </select>
      </div>

      <div className="kh-card">
        {loading ? (
          <div className="text-center py-8 text-sm text-[#7A8BA0]">Loading audit logs…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#7A8BA0]">No audit log records found.</div>
        ) : (
          <table className="kh-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id}>
                  <td className="text-xs text-[#7A8BA0] whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td>
                    <span className={`badge ${ACTION_COLORS[log.action] ?? 'badge-gray'}`}>
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="text-xs text-[#7A8BA0]">
                    {log.target_type && <span className="font-medium text-[#0E2040]">{log.target_type}</span>}
                    {log.target_id && <span className="ml-1 font-mono text-[10px]">{log.target_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="text-xs text-[#4A5A70] max-w-[320px]">
                    {log.details ? (
                      <span className="font-mono text-[10px] break-all">
                        {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SQL hint for first-time setup */}
      {!loading && logs.length === 0 && (
        <div className="mt-4 rounded-lg p-4 text-xs" style={{ background: '#F0F8FF', border: '1px solid #D0E8FF', color: '#2A4F8A' }}>
          <strong>First-time setup:</strong> Run this SQL in Supabase to create the audit_logs table:
          <pre className="mt-2 p-2 rounded text-[10px] overflow-x-auto" style={{ background: '#E8F0FE' }}>{`create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   uuid,
  details     jsonb
);
alter table public.audit_logs disable row level security;`}</pre>
        </div>
      )}
    </div>
  )
}
