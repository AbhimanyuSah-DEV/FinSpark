// ── Safe date parser ─────────────────────────────────────────────────────────
const safeDate = (iso: string | null | undefined): Date | null => {
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

// Currency formatter (INR)
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

// Date formatters
export const formatDate = (iso: string): string => {
  const d = safeDate(iso)
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export const formatDateTime = (iso: string): string => {
  const d = safeDate(iso)
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(d)
}

export const formatTime = (iso: string | null | undefined): string => {
  const d = safeDate(iso ?? '')
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d)
}

export const timeAgo = (iso: string): string => {
  const d = safeDate(iso)
  if (!d) return '—'
  const diff = Date.now() - d.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days  > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins  > 0) return `${mins}m ago`
  return 'Just now'
}

// Risk label capitalise
export const capitalise = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''

// Transaction status label
export const txStatusLabel = (status: string): string => ({
  PENDING:   'Pending',
  COMPLETED: 'Completed',
  FAILED:    'Failed',
  FLAGGED:   'Flagged',
  BLOCKED:   'Blocked',
}[status] ?? status)

// Truncate long strings
export const truncate = (str: string, n = 40): string =>
  str.length > n ? str.slice(0, n) + '…' : str
