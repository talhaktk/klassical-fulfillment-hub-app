'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fmtGBP, fmtDate } from '@/lib/utils'

export default function RemindersPage() {
  const { invoices, reminderLog, sellers, sendReminder } = useStore()
  const [sending, setSending] = useState<string | null>(null)
  const [channels, setChannels] = useState({ email: true, whatsapp: true, portal: false })

  const overdueInvoices = invoices.filter(i => i.status === 'overdue' || i.status === 'pending' || i.status === 'partial')
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      return new Date(a.due_date ?? '').getTime() - new Date(b.due_date ?? '').getTime()
    })

  const activeChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k)

  async function handleSend(inv: typeof invoices[0]) {
    setSending(inv.id)
    await sendReminder(inv.seller_id, inv.id, activeChannels)
    setSending(null)
  }

  async function handleSendAll() {
    for (const inv of overdueInvoices.filter(i => i.status === 'overdue')) {
      await sendReminder(inv.seller_id, inv.id, activeChannels)
    }
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0E2040]" style={{ fontFamily: 'Playfair Display, serif' }}>Reminders &amp; Alerts</h1>
          <p className="text-sm text-[#7A8BA0] mt-0.5">
            {invoices.filter(i => i.status === 'overdue').length} overdue invoices requiring follow-up
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="kh-card !p-2.5 flex gap-3 items-center">
            <span className="text-xs text-[#7A8BA0] font-semibold">Send via:</span>
            {(['email', 'whatsapp', 'portal'] as const).map(ch => (
              <label key={ch} className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels[ch]}
                  onChange={e => setChannels(c => ({ ...c, [ch]: e.target.checked }))}
                  className="accent-[#C8971A]"
                />
                <span className="capitalize">{ch}</span>
              </label>
            ))}
          </div>
          <button
            className="btn-gold btn-sm"
            onClick={handleSendAll}
            disabled={overdueInvoices.filter(i => i.status === 'overdue').length === 0}
          >
            🔔 Send All Overdue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Invoices requiring action */}
        <div className="col-span-2">
          <div className="kh-card">
            <div className="text-sm font-bold text-[#0E2040] mb-4">Invoices Requiring Follow-Up</div>
            {overdueInvoices.length === 0 ? (
              <p className="text-[#7A8BA0] text-sm text-center py-8">All invoices settled ✓</p>
            ) : (
              <table className="kh-table">
                <thead>
                  <tr><th>Invoice</th><th>Seller</th><th>Outstanding</th><th>Due</th><th>Status</th><th>Reminders</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {overdueInvoices.map(inv => {
                    const outstanding = Math.max(0, inv.total_amount - inv.paid_amount)
                    const daysOverdue = inv.due_date ? Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000) : null
                    const seller = sellers.find(s => s.id === inv.seller_id)
                    return (
                      <tr key={inv.id}>
                        <td className="font-mono font-bold text-[#142D56]">{inv.invoice_number}</td>
                        <td>
                          <span className="badge badge-navy">{seller?.icon} {seller?.name ?? '—'}</span>
                        </td>
                        <td className="font-semibold text-[#C0321E]">{fmtGBP(outstanding)}</td>
                        <td className="text-xs">
                          <div className="text-[#7A8BA0]">{inv.due_date ? fmtDate(inv.due_date) : '—'}</div>
                          {daysOverdue !== null && daysOverdue > 0 && (
                            <div className="text-[#C0321E] font-semibold">{daysOverdue}d overdue</div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${inv.status === 'overdue' ? 'badge-red' : inv.status === 'partial' ? 'badge-yellow' : 'badge-gray'}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="text-center text-xs text-[#7A8BA0]">{inv.reminders_sent ?? 0} sent</td>
                        <td>
                          <button
                            className="btn-gold btn-sm"
                            disabled={sending === inv.id || activeChannels.length === 0}
                            onClick={() => handleSend(inv)}
                          >
                            {sending === inv.id ? '…' : '🔔 Remind'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Reminder log */}
        <div className="kh-card">
          <div className="text-sm font-bold text-[#0E2040] mb-4">Reminder Log</div>
          {reminderLog.length === 0 ? (
            <p className="text-[#7A8BA0] text-xs text-center py-6">No reminders sent yet</p>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {reminderLog.map(r => {
                const seller = sellers.find(s => s.id === r.seller_id)
                return (
                  <div key={r.id} className="p-2.5 rounded-lg border border-[#E8ECF2]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-[#0E2040]">{seller?.name ?? '—'}</span>
                      <span className="text-[10px] text-[#7A8BA0]">{fmtDate(r.sent_at)}</span>
                    </div>
                    <div className="text-xs text-[#7A8BA0] mt-0.5">{r.description}</div>
                    <div className="flex gap-1 mt-1.5">
                      {(r.channels ?? []).map(ch => (
                        <span key={ch} className="badge badge-blue" style={{ fontSize: 9 }}>{ch}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
