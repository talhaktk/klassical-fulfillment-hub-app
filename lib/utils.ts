import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

export function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function fmtDateLong(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function daysSince(dateStr: string | null | undefined) {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    urgent: 'badge badge-red',
    high:   'badge badge-yellow',
    normal: 'badge badge-blue',
    low:    'badge badge-gray',
  }
  return map[priority] ?? 'badge badge-gray'
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending:    'badge badge-yellow',
    processing: 'badge badge-blue',
    fulfilled:  'badge badge-green',
    dispatched: 'badge badge-green',
    cancelled:  'badge badge-red',
    paid:       'badge badge-green',
    overdue:    'badge badge-red',
    partial:    'badge badge-orange',
    sent:       'badge badge-blue',
    complete:   'badge badge-green',
    damaged:    'badge badge-red',
  }
  return map[status] ?? 'badge badge-gray'
}

export function conditionBadge(condition: string) {
  return statusBadge(condition)
}
