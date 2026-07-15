import React from 'react'
import { Activity, RefreshCw, MapPin, Monitor, ArrowRight } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatTime, formatCurrency, truncate } from '../../utils/formatters'

interface LiveTransactionTableProps {
  transactions:  Transaction[]
  onRefresh:     () => void
  isRefreshing:  boolean
}

// ── Status chip ───────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-success/15 text-success border-success/25',
  PENDING:   'bg-warning/15 text-warning border-warning/25',
  FLAGGED:   'bg-orange/15  text-orange  border-orange/25',
  BLOCKED:   'bg-danger/15  text-danger  border-danger/25',
  FAILED:    'bg-muted/15   text-muted   border-muted/25',
}

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const style = STATUS_STYLES[status.toUpperCase()] ?? STATUS_STYLES.FAILED
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${style}`}>
      {status}
    </span>
  )
}

const LiveTransactionTable: React.FC<LiveTransactionTableProps> = ({
  transactions,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
            <Activity size={15} className="text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text">Live Transaction Monitor</h2>
              {/* Live pulse indicator */}
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
                <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Live</span>
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">{transactions.length} transactions loaded</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted hover:text-text hover:border-border-light transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              {['Time', 'Sender → Receiver', 'Amount', 'Type', 'Status', 'Device', 'Location / IP'].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  No transactions to display.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-surface-2/50 transition-colors duration-100 group"
                >
                  {/* Time */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-muted">{formatTime(tx.timestamp)}</span>
                  </td>

                  {/* Sender → Receiver */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-text">
                      <span className="font-medium truncate max-w-[80px]" title={tx.sender}>
                        {tx.sender ? truncate(tx.sender, 10) : '—'}
                      </span>
                      <ArrowRight size={10} className="text-muted flex-shrink-0" />
                      <span className="font-medium truncate max-w-[80px]" title={tx.receiver}>
                        {tx.receiver ? truncate(tx.receiver, 10) : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold text-text">{formatCurrency(tx.amount)}</span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-muted capitalize">
                      {tx.transaction_type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusChip status={tx.status} />
                  </td>

                  {/* Device */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted">
                      <Monitor size={11} className="flex-shrink-0" />
                      <span className="truncate max-w-[100px]" title={tx.device}>
                        {tx.device ? truncate(tx.device, 14) : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Location & IP */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-muted">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[100px]" title={tx.location}>
                          {tx.location ? truncate(tx.location, 14) : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                        <span className="font-mono">{tx.ip_address || '—'}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LiveTransactionTable
