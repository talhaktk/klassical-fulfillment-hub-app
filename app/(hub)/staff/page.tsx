'use client'
import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { fmtGBP } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type PayType = 'hourly' | 'daily' | 'monthly'
type AttStatus = 'present' | 'absent' | 'half_day' | 'leave'

interface StaffMember {
  id:          string
  name:        string
  role:        string
  pay_type:    PayType
  pay_rate:    number
  phone:       string | null
  joined_date: string | null
  status:      'active' | 'inactive'
  created_at:  string
}

interface AttendanceRecord {
  id:           string
  staff_id:     string
  date:         string
  status:       AttStatus
  check_in:     string | null
  check_out:    string | null
  hours_worked: number | null
  notes:        string | null
}

interface PayrollRun {
  id:              string
  period_label:    string
  period_start:    string
  period_end:      string
  total_amount:    number
  status:          'pending' | 'paid'
  bank_account_id: string | null
  paid_at:         string | null
  notes:           string | null
  created_at:      string
  payroll_items?:  PayrollItem[]
}

interface PayrollItem {
  id:             string
  staff_id:       string
  days_worked:    number
  hours_worked:   number
  gross_pay:      number
  net_pay:        number
  notes:          string | null
  staff?:         { name: string; role: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAY_LABELS: Record<PayType, string> = { hourly: 'Hourly', daily: 'Daily', monthly: 'Monthly' }
const ATT_LABELS: Record<AttStatus, string> = { present: 'Present', absent: 'Absent', half_day: 'Half Day', leave: 'Leave' }
const ATT_COLORS: Record<AttStatus, string> = { present: 'badge-green', absent: 'badge-red', half_day: 'badge-orange', leave: 'badge-blue' }

function isoToday() { return new Date().toISOString().split('T')[0] }

function hoursFromTimes(inT: string, outT: string): number {
  const [ih, im] = inT.split(':').map(Number)
  const [oh, om] = outT.split(':').map(Number)
  return Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100
}

function calcGross(s: StaffMember, days: number, hours: number): number {
  if (s.pay_type === 'hourly') return s.pay_rate * hours
  if (s.pay_type === 'daily')  return s.pay_rate * days
  return s.pay_rate // monthly — fixed
}

// ─── SQL hint ─────────────────────────────────────────────────────────────────

const SETUP_SQL = `-- Run this once in Supabase SQL Editor

create table if not exists public.staff (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null default 'Warehouse Staff',
  pay_type    text not null default 'daily',
  pay_rate    numeric not null default 0,
  phone       text,
  joined_date date,
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);

create table if not exists public.attendance (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid references public.staff(id) on delete cascade,
  date         date not null,
  status       text not null default 'present',
  check_in     time,
  check_out    time,
  hours_worked numeric,
  notes        text,
  created_at   timestamptz not null default now(),
  unique(staff_id, date)
);

create table if not exists public.payroll_runs (
  id              uuid primary key default gen_random_uuid(),
  period_label    text not null,
  period_start    date not null,
  period_end      date not null,
  total_amount    numeric not null,
  status          text not null default 'pending',
  bank_account_id uuid references public.bank_accounts(id),
  transaction_id  uuid references public.transactions(id),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id             uuid primary key default gen_random_uuid(),
  payroll_run_id uuid references public.payroll_runs(id) on delete cascade,
  staff_id       uuid references public.staff(id),
  days_worked    numeric default 0,
  hours_worked   numeric default 0,
  gross_pay      numeric not null,
  net_pay        numeric not null,
  notes          text
);

alter table public.staff disable row level security;
alter table public.attendance disable row level security;
alter table public.payroll_runs disable row level security;
alter table public.payroll_items disable row level security;`

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'staff' | 'attendance' | 'payroll'

export default function StaffPage() {
  const { currentUser, bankAccounts } = useStore()
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'warehouse_manager'

  const [tab, setTab] = useState<Tab>('staff')

  // ── Staff state ──────────────────────────────────────────────────────────
  const [staff,        setStaff]        = useState<StaffMember[]>([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [staffModal,   setStaffModal]   = useState<Partial<StaffMember> & { isNew?: boolean } | null>(null)
  const [saving,       setSaving]       = useState(false)

  // ── Attendance state ──────────────────────────────────────────────────────
  const [attDate,     setAttDate]     = useState(isoToday())
  const [attRecords,  setAttRecords]  = useState<Record<string, Partial<AttendanceRecord>>>({})
  const [attSaved,    setAttSaved]    = useState<AttendanceRecord[]>([])
  const [attLoading,  setAttLoading]  = useState(false)
  const [attSaving,   setAttSaving]   = useState(false)

  // ── Payroll state ─────────────────────────────────────────────────────────
  const [pStart,      setPStart]      = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]
  })
  const [pEnd,        setPEnd]        = useState(isoToday())
  const [preview,     setPreview]     = useState<{ member: StaffMember; days: number; hours: number; gross: number }[]>([])
  const [calculating, setCalculating] = useState(false)
  const [payAcct,     setPayAcct]     = useState('')
  const [payNotes,    setPayNotes]    = useState('')
  const [payRuns,     setPayRuns]     = useState<PayrollRun[]>([])
  const [runsLoading, setRunsLoading] = useState(true)
  const [recording,   setRecording]   = useState(false)

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadStaff = useCallback(async () => {
    setStaffLoading(true)
    const db = getSupabaseClient()
    const { data } = await db.from('staff').select('*').order('name')
    setStaff((data ?? []) as StaffMember[])
    setStaffLoading(false)
  }, [])

  const loadAttendance = useCallback(async (date: string) => {
    setAttLoading(true)
    const db = getSupabaseClient()
    const { data } = await db.from('attendance').select('*').eq('date', date)
    const saved = (data ?? []) as AttendanceRecord[]
    setAttSaved(saved)
    const map: Record<string, Partial<AttendanceRecord>> = {}
    saved.forEach(r => { map[r.staff_id] = r })
    setAttRecords(map)
    setAttLoading(false)
  }, [])

  const loadPayrollRuns = useCallback(async () => {
    setRunsLoading(true)
    const db = getSupabaseClient()
    const { data } = await db
      .from('payroll_runs')
      .select('*, payroll_items(*, staff(name, role))')
      .order('created_at', { ascending: false })
      .limit(20)
    setPayRuns((data ?? []) as PayrollRun[])
    setRunsLoading(false)
  }, [])

  useEffect(() => { loadStaff() }, [loadStaff])
  useEffect(() => { loadAttendance(attDate) }, [loadAttendance, attDate])
  useEffect(() => { loadPayrollRuns() }, [loadPayrollRuns])

  // ── Staff CRUD ────────────────────────────────────────────────────────────

  async function handleSaveStaff() {
    if (!staffModal) return
    if (!staffModal.name || !staffModal.role || !staffModal.pay_type) {
      toast.error('Name, role and pay type are required'); return
    }
    setSaving(true)
    const db = getSupabaseClient()
    const payload = {
      name: staffModal.name, role: staffModal.role,
      pay_type: staffModal.pay_type, pay_rate: Number(staffModal.pay_rate ?? 0),
      phone: staffModal.phone ?? null, joined_date: staffModal.joined_date ?? null,
      status: staffModal.status ?? 'active',
    }
    if (staffModal.isNew) {
      const { error } = await db.from('staff').insert(payload)
      if (error) toast.error(error.message)
      else { toast.success('Staff member added'); setStaffModal(null); loadStaff() }
    } else {
      const { error } = await db.from('staff').update(payload).eq('id', staffModal.id!)
      if (error) toast.error(error.message)
      else { toast.success('Staff updated'); setStaffModal(null); loadStaff() }
    }
    setSaving(false)
  }

  async function handleToggleActive(s: StaffMember) {
    const db = getSupabaseClient()
    const { error } = await db.from('staff').update({ status: s.status === 'active' ? 'inactive' : 'active' }).eq('id', s.id)
    if (error) toast.error(error.message)
    else { toast.success(`${s.name} ${s.status === 'active' ? 'deactivated' : 'activated'}`); loadStaff() }
  }

  // ── Attendance ────────────────────────────────────────────────────────────

  function setAttField(staffId: string, field: string, value: any) {
    setAttRecords(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], staff_id: staffId, date: attDate, [field]: value },
    }))
  }

  async function saveAttendance() {
    const activeStaff = staff.filter(s => s.status === 'active')
    if (activeStaff.length === 0) return
    setAttSaving(true)
    const db = getSupabaseClient()

    for (const s of activeStaff) {
      const rec = attRecords[s.id]
      if (!rec?.status) continue
      let hours = rec.hours_worked ?? null
      if (!hours && rec.check_in && rec.check_out) {
        hours = hoursFromTimes(rec.check_in, rec.check_out)
      }
      if (rec.status === 'half_day') hours = (hours ?? 4)

      await db.from('attendance').upsert({
        staff_id: s.id, date: attDate,
        status: rec.status,
        check_in: rec.check_in ?? null,
        check_out: rec.check_out ?? null,
        hours_worked: hours,
        notes: rec.notes ?? null,
      }, { onConflict: 'staff_id,date' })
    }

    toast.success('Attendance saved')
    loadAttendance(attDate)
    setAttSaving(false)
  }

  // ── Payroll calculation ───────────────────────────────────────────────────

  async function calculatePayroll() {
    if (!pStart || !pEnd) { toast.error('Select a period'); return }
    setCalculating(true)
    const db = getSupabaseClient()
    const { data: attData } = await db
      .from('attendance')
      .select('*')
      .gte('date', pStart)
      .lte('date', pEnd)
      .in('status', ['present', 'half_day'])

    const activeStaff = staff.filter(s => s.status === 'active')
    const rows = activeStaff.map(s => {
      const records = (attData ?? []).filter((r: any) => r.staff_id === s.id)
      let days = 0, hours = 0
      records.forEach((r: any) => {
        if (r.status === 'present') days += 1
        else if (r.status === 'half_day') days += 0.5
        hours += Number(r.hours_worked ?? 0)
      })
      return { member: s, days, hours, gross: calcGross(s, days, hours) }
    })
    setPreview(rows)
    setCalculating(false)
  }

  async function recordPayroll() {
    if (preview.length === 0) { toast.error('Calculate payroll first'); return }
    if (!payAcct) { toast.error('Select a bank account'); return }
    const total = preview.reduce((s, r) => s + r.gross, 0)
    if (total === 0) { toast.error('Total payroll is zero'); return }

    setRecording(true)
    const db = getSupabaseClient()
    const label = `${new Date(pStart).toLocaleString('en-GB', { month: 'long' })} ${new Date(pStart).getFullYear()} Payroll`

    // Create payroll run
    const { data: run, error: runErr } = await db.from('payroll_runs').insert({
      period_label: label, period_start: pStart, period_end: pEnd,
      total_amount: total, status: 'paid', bank_account_id: payAcct,
      paid_at: new Date().toISOString(), notes: payNotes || null,
    }).select().single()

    if (runErr) { toast.error(runErr.message); setRecording(false); return }

    // Insert payroll items
    await db.from('payroll_items').insert(preview.map(r => ({
      payroll_run_id: run.id, staff_id: r.member.id,
      days_worked: r.days, hours_worked: r.hours,
      gross_pay: r.gross, net_pay: r.gross,
    })))

    // Record bank transaction
    const { data: acct } = await db.from('bank_accounts').select('balance').eq('id', payAcct).single()
    if (acct) {
      await db.from('transactions').insert({
        account_id: payAcct, type: 'out', category: 'Staff Wages',
        description: label + (payNotes ? ` — ${payNotes}` : ''),
        amount: total, transaction_date: new Date().toISOString().split('T')[0],
      })
      await db.from('bank_accounts').update({ balance: acct.balance - total }).eq('id', payAcct)
    }

    toast.success(`Payroll of ${fmtGBP(total)} recorded`)
    setPreview([])
    setPayNotes('')
    loadPayrollRuns()
    setRecording(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const activeStaff = staff.filter(s => s.status === 'active')

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Staff & Payroll</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {activeStaff.length} active · {staff.filter(s => s.status === 'inactive').length} inactive
          </p>
        </div>
        {tab === 'staff' && canManage && (
          <button className="btn-gold btn-sm"
            onClick={() => setStaffModal({ isNew: true, name: '', role: 'Warehouse Staff', pay_type: 'daily', pay_rate: 0, status: 'active' })}>
            + Add Staff
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[#E8ECF2]">
        {(['staff', 'attendance', 'payroll'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize ${
              tab === t ? 'border-[#C8971A] text-[#C8971A]' : 'border-transparent text-[#7A8BA0] hover:text-[#0E2040]'
            }`}>
            {t === 'staff' ? '👥 Staff' : t === 'attendance' ? '📅 Attendance' : '💰 Payroll'}
          </button>
        ))}
      </div>

      {/* ── TAB: STAFF ───────────────────────────────────────────────────────── */}
      {tab === 'staff' && (
        <div className="kh-card">
          {staffLoading ? (
            <div className="text-center py-8 text-sm text-[#7A8BA0]">Loading staff…</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm text-[#7A8BA0] mb-4">No staff added yet. Run the SQL below, then add your first team member.</div>
              <details className="text-left max-w-2xl mx-auto">
                <summary className="cursor-pointer text-xs text-[#C8971A] font-semibold">Show setup SQL</summary>
                <pre className="mt-2 p-3 rounded-lg text-[10px] overflow-x-auto" style={{ background: '#F0F4FA', color: '#2A4F8A' }}>{SETUP_SQL}</pre>
              </details>
            </div>
          ) : (
            <table className="kh-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Pay Rate</th><th>Phone</th><th>Joined</th><th>Status</th>{canManage && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-[#0E2040]">{s.name}</td>
                    <td className="text-xs text-[#7A8BA0]">{s.role}</td>
                    <td className="text-xs">
                      <span className="font-semibold text-[#0E2040]">{fmtGBP(s.pay_rate)}</span>
                      <span className="text-[#7A8BA0] ml-1">/ {PAY_LABELS[s.pay_type].toLowerCase()}</span>
                    </td>
                    <td className="text-xs text-[#7A8BA0]">{s.phone ?? '—'}</td>
                    <td className="text-xs text-[#7A8BA0]">{s.joined_date ? new Date(s.joined_date).toLocaleDateString('en-GB') : '—'}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {s.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-ghost btn-sm" onClick={() => setStaffModal({ ...s, isNew: false })}>✏️ Edit</button>
                          <button className="btn-ghost btn-sm" onClick={() => handleToggleActive(s)}>
                            {s.status === 'active' ? '⏸' : '▶'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: ATTENDANCE ──────────────────────────────────────────────────── */}
      {tab === 'attendance' && (
        <div>
          {/* Date selector */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-semibold text-[#0E2040]">Date</label>
            <input type="date" className="kh-input" value={attDate} max={isoToday()}
              onChange={e => setAttDate(e.target.value)} />
            {canManage && (
              <button className="btn-gold btn-sm" onClick={saveAttendance} disabled={attSaving}>
                {attSaving ? 'Saving…' : '✓ Save Attendance'}
              </button>
            )}
          </div>

          <div className="kh-card">
            {attLoading ? (
              <div className="text-center py-8 text-sm text-[#7A8BA0]">Loading attendance…</div>
            ) : activeStaff.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#7A8BA0]">No active staff to mark attendance for.</div>
            ) : (
              <table className="kh-table">
                <thead>
                  <tr>
                    <th>Staff Member</th><th>Role</th><th>Status</th>
                    <th>Check In</th><th>Check Out</th><th>Hours</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStaff.map(s => {
                    const rec = attRecords[s.id] ?? {}
                    const isEditable = canManage
                    return (
                      <tr key={s.id}>
                        <td className="font-semibold text-[#0E2040]">{s.name}</td>
                        <td className="text-xs text-[#7A8BA0]">{s.role}</td>
                        <td>
                          {isEditable ? (
                            <select className="kh-input text-xs py-1" value={rec.status ?? ''}
                              onChange={e => setAttField(s.id, 'status', e.target.value as AttStatus)}>
                              <option value="">— Select —</option>
                              {Object.entries(ATT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          ) : rec.status ? (
                            <span className={`badge ${ATT_COLORS[rec.status as AttStatus]}`}>{ATT_LABELS[rec.status as AttStatus]}</span>
                          ) : <span className="text-xs text-[#7A8BA0]">—</span>}
                        </td>
                        <td>
                          {isEditable && rec.status === 'present' ? (
                            <input type="time" className="kh-input text-xs py-1 w-28" value={rec.check_in ?? ''}
                              onChange={e => setAttField(s.id, 'check_in', e.target.value)} />
                          ) : <span className="text-xs text-[#7A8BA0]">{rec.check_in ?? '—'}</span>}
                        </td>
                        <td>
                          {isEditable && rec.status === 'present' ? (
                            <input type="time" className="kh-input text-xs py-1 w-28" value={rec.check_out ?? ''}
                              onChange={e => setAttField(s.id, 'check_out', e.target.value)} />
                          ) : <span className="text-xs text-[#7A8BA0]">{rec.check_out ?? '—'}</span>}
                        </td>
                        <td>
                          {isEditable && rec.status === 'present' ? (
                            <input type="number" className="kh-input text-xs py-1 w-16" placeholder="hrs"
                              value={rec.hours_worked ?? ''}
                              onChange={e => setAttField(s.id, 'hours_worked', e.target.value ? Number(e.target.value) : null)} />
                          ) : <span className="text-xs text-[#7A8BA0]">{rec.hours_worked != null ? `${rec.hours_worked}h` : '—'}</span>}
                        </td>
                        <td>
                          {isEditable ? (
                            <input type="text" className="kh-input text-xs py-1" placeholder="optional note"
                              value={rec.notes ?? ''} onChange={e => setAttField(s.id, 'notes', e.target.value)} />
                          ) : <span className="text-xs text-[#7A8BA0]">{rec.notes ?? '—'}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Attendance summary (past 7 days) */}
          {attSaved.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#0E2040] mb-2">
                Saved for {new Date(attDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {attSaved.map(r => {
                  const member = staff.find(s => s.id === r.staff_id)
                  return (
                    <div key={r.id} className="rounded-lg px-3 py-2 text-xs flex items-center gap-2" style={{ background: '#F0F4FA' }}>
                      <span className="font-semibold text-[#0E2040]">{member?.name ?? 'Unknown'}</span>
                      <span className={`badge ${ATT_COLORS[r.status]}`}>{ATT_LABELS[r.status]}</span>
                      {r.hours_worked != null && <span className="text-[#7A8BA0]">{r.hours_worked}h</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PAYROLL ─────────────────────────────────────────────────────── */}
      {tab === 'payroll' && (
        <div>
          {/* Period + calculate */}
          <div className="kh-card mb-4">
            <div className="text-sm font-bold text-[#0E2040] mb-3">Calculate Payroll</div>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Period Start</label>
                <input type="date" className="kh-input" value={pStart} onChange={e => setPStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Period End</label>
                <input type="date" className="kh-input" value={pEnd} max={isoToday()} onChange={e => setPEnd(e.target.value)} />
              </div>
              <button className="btn-gold" onClick={calculatePayroll} disabled={calculating}>
                {calculating ? 'Calculating…' : '🧮 Calculate'}
              </button>
            </div>

            {preview.length > 0 && (
              <div className="mt-4">
                <table className="kh-table mb-3">
                  <thead>
                    <tr><th>Name</th><th>Role</th><th>Pay Type</th><th>Rate</th><th>Days</th><th>Hours</th><th>Gross Pay</th></tr>
                  </thead>
                  <tbody>
                    {preview.map(r => (
                      <tr key={r.member.id}>
                        <td className="font-semibold text-[#0E2040]">{r.member.name}</td>
                        <td className="text-xs text-[#7A8BA0]">{r.member.role}</td>
                        <td className="text-xs text-[#7A8BA0]">{PAY_LABELS[r.member.pay_type]}</td>
                        <td className="text-xs">{fmtGBP(r.member.pay_rate)}</td>
                        <td className="text-xs">{r.days}</td>
                        <td className="text-xs">{r.hours > 0 ? `${r.hours}h` : '—'}</td>
                        <td className="font-bold text-[#0E2040]">{fmtGBP(r.gross)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={6} className="text-right font-bold text-[#0E2040] text-sm">Total Payroll</td>
                      <td className="font-black text-[#C8971A] text-base">{fmtGBP(preview.reduce((s, r) => s + r.gross, 0))}</td>
                    </tr>
                  </tfoot>
                </table>

                {canManage && (
                  <div className="flex flex-wrap gap-3 items-end pt-3 border-t border-[#E8ECF2]">
                    <div>
                      <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Pay From Account</label>
                      <select className="kh-input" value={payAcct} onChange={e => setPayAcct(e.target.value)}>
                        <option value="">— Select bank account —</option>
                        {bankAccounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({fmtGBP(a.balance)})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Notes (optional)</label>
                      <input className="kh-input" placeholder="e.g. May 2026 wages" value={payNotes}
                        onChange={e => setPayNotes(e.target.value)} />
                    </div>
                    <button className="btn-gold" onClick={recordPayroll} disabled={recording}>
                      {recording ? 'Recording…' : '✓ Record Payroll'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payroll history */}
          <h3 className="text-sm font-bold text-[#0E2040] mb-2">Payroll History</h3>
          <div className="kh-card">
            {runsLoading ? (
              <div className="text-center py-6 text-sm text-[#7A8BA0]">Loading payroll history…</div>
            ) : payRuns.length === 0 ? (
              <div className="text-center py-6 text-sm text-[#7A8BA0]">No payroll runs recorded yet.</div>
            ) : (
              <table className="kh-table">
                <thead>
                  <tr><th>Period</th><th>Staff</th><th>Total</th><th>Status</th><th>Paid At</th></tr>
                </thead>
                <tbody>
                  {payRuns.map(run => (
                    <tr key={run.id}>
                      <td className="font-semibold text-[#0E2040]">{run.period_label}</td>
                      <td className="text-xs text-[#7A8BA0]">
                        {run.payroll_items?.map(i => i.staff?.name).filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="font-bold text-[#0E2040]">{fmtGBP(run.total_amount)}</td>
                      <td><span className={`badge ${run.status === 'paid' ? 'badge-green' : 'badge-orange'}`}>{run.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                      <td className="text-xs text-[#7A8BA0]">
                        {run.paid_at ? new Date(run.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Staff modal ───────────────────────────────────────────────────────── */}
      {staffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(14,32,64,.7)' }}>
          <div className="kh-card w-[460px] max-h-[90vh] overflow-y-auto" style={{ border: '1px solid rgba(200,151,26,.4)' }}>
            <div className="text-base font-bold text-[#0E2040] mb-4">{staffModal.isNew ? '+ Add Staff Member' : 'Edit Staff'}</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Full Name</label>
                <input className="kh-input w-full" value={staffModal.name ?? ''}
                  onChange={e => setStaffModal(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div>
                <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Role / Position</label>
                <input className="kh-input w-full" placeholder="e.g. Warehouse Staff, Packer, Driver"
                  value={staffModal.role ?? ''}
                  onChange={e => setStaffModal(m => m ? { ...m, role: e.target.value } : m)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Pay Type</label>
                  <select className="kh-input w-full" value={staffModal.pay_type ?? 'daily'}
                    onChange={e => setStaffModal(m => m ? { ...m, pay_type: e.target.value as PayType } : m)}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">
                    Rate (£ / {PAY_LABELS[staffModal.pay_type as PayType ?? 'daily'].toLowerCase()})
                  </label>
                  <input type="number" className="kh-input w-full" min="0" step="0.5"
                    value={staffModal.pay_rate ?? ''}
                    onChange={e => setStaffModal(m => m ? { ...m, pay_rate: Number(e.target.value) } : m)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Phone</label>
                  <input className="kh-input w-full" placeholder="+44 …"
                    value={staffModal.phone ?? ''}
                    onChange={e => setStaffModal(m => m ? { ...m, phone: e.target.value } : m)} />
                </div>
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Joined Date</label>
                  <input type="date" className="kh-input w-full"
                    value={staffModal.joined_date ?? ''}
                    onChange={e => setStaffModal(m => m ? { ...m, joined_date: e.target.value } : m)} />
                </div>
              </div>
              {!staffModal.isNew && (
                <div>
                  <label className="text-xs text-[#7A8BA0] font-semibold uppercase tracking-wide mb-1 block">Status</label>
                  <select className="kh-input w-full" value={staffModal.status ?? 'active'}
                    onChange={e => setStaffModal(m => m ? { ...m, status: e.target.value as 'active' | 'inactive' } : m)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-gold flex-1" onClick={handleSaveStaff} disabled={saving}>
                {saving ? 'Saving…' : staffModal.isNew ? 'Add Staff' : 'Update'}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setStaffModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
