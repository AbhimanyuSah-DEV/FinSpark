import React, { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatCurrency, formatDateTime, truncate } from '../../utils/formatters'

interface TransactionTableProps {
  transactions: Transaction[]
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  COMPLETED: { bg: 'bg-success/10',  text: 'text-success',  border: 'border-success/30' },
  PENDING:   { bg: 'bg-warning/10',  text: 'text-warning',  border: 'border-warning/30' },
  FLAGGED:   { bg: 'bg-orange/10',   text: 'text-orange',   border: 'border-orange/30'  },
  FAILED:    { bg: 'bg-danger/10',   text: 'text-danger',   border: 'border-danger/30'  },
  BLOCKED:   { bg: 'bg-danger/10',   text: 'text-danger',   border: 'border-danger/30'  },
}

const TX_TYPE_LABEL: Record<string, string> = {
  TRANSFER:   'Transfer',
  PAYMENT:    'Payment',
  WITHDRAWAL: 'Withdrawal',
  DEPOSIT:    'Deposit',
  CREDIT:     'Credit',
  DEBIT:      'Debit',
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions],
  )

  if (!sorted.length) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-muted text-sm">No transactions found.</p>
      </div>
    )
  }

  const isDebit = (tx: Transaction) =>
    ['TRANSFER', 'PAYMENT', 'WITHDRAWAL', 'DEBIT'].includes(tx.transaction_type?.toUpperCase())

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-text">Recent Transactions</h3>
          <p className="text-xs text-muted mt-0.5">{sorted.length} records</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-muted hover:text-text border border-border hover:border-border-light rounded-lg px-3 py-1.5 transition-colors">
          <Filter size={12} />
          Filter
        </button>
      </div>

      {/* Table wrapper — scrollable */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['Date', 'Type', 'Amount', 'Status', 'Device', 'Location'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((tx, i) => {
              const debit = isDebit(tx)
              const statusKey = tx.status?.toUpperCase() ?? 'COMPLETED'
              const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES['COMPLETED']

              return (
                <tr
                  key={tx.id}
                  className={`border-b border-border/50 hover:bg-surface-2 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-background/20'
                  }`}
                >
                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-muted font-mono">
                      {formatDateTime(tx.timestamp)}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          debit ? 'bg-danger/10' : 'bg-success/10'
                        }`}
                      >
                        {debit ? (
                          <ArrowUpRight size={12} className="text-danger" />
                        ) : (
                          <ArrowDownLeft size={12} className="text-success" />
                        )}
                      </span>
                      <span className="text-xs font-medium text-text">
                        {TX_TYPE_LABEL[tx.transaction_type?.toUpperCase()] ?? tx.transaction_type}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-sm font-bold ${
                        debit ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {debit ? '−' : '+'} {formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Status chip */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusKey.charAt(0) + statusKey.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Device */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-muted">
                      {tx.device ? truncate(tx.device, 24) : '—'}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-muted">
                      {tx.location ? truncate(tx.location, 22) : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionTable
