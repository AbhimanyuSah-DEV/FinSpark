import React from 'react'
import { ArrowUpRight, History, CreditCard, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface BalanceCardProps {
  accountNumber: string
  balance: number
  fullName: string
  onTransferClick?: () => void
  onHistoryClick?: () => void
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  accountNumber,
  balance,
  fullName,
  onTransferClick,
  onHistoryClick,
}) => {
  const maskedAccount = accountNumber
    ? `•••• •••• ${accountNumber.slice(-4)}`
    : '•••• •••• ––––'

  return (
    <div className="relative bg-surface border border-border rounded-xl overflow-hidden shadow-card">
      {/* Gold accent left border */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-gold-light to-gold-dark rounded-l-xl" />

      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="pl-6 pr-6 pt-6 pb-5 relative">
        {/* Top row: label + card icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-muted" />
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">
              Savings Account
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-full px-2.5 py-1">
            <TrendingUp size={12} className="text-success" />
            <span className="text-xs font-semibold text-success">Active</span>
          </div>
        </div>

        {/* Account holder */}
        <p className="text-muted text-sm mb-1">{fullName}</p>

        {/* Balance */}
        <div className="mb-1">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-text tracking-tight">
            {formatCurrency(balance)}
          </p>
        </div>

        {/* Account number */}
        <div className="mt-3 mb-5">
          <p className="text-sm font-mono text-muted tracking-wider">{maskedAccount}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTransferClick}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-background font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 flex-1 justify-center"
          >
            <ArrowUpRight size={16} />
            Transfer Money
          </button>
          <button
            onClick={onHistoryClick}
            className="flex items-center gap-2 border border-border hover:border-border-light text-muted hover:text-text font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 flex-1 justify-center"
          >
            <History size={16} />
            View Transactions
          </button>
        </div>
      </div>
    </div>
  )
}

export default BalanceCard
