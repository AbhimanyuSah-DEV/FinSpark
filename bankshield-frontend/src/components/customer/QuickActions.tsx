import React from 'react'
import { ArrowUpRight, Clock, FileText, HeadphonesIcon } from 'lucide-react'

interface QuickActionItem {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  accent?: boolean
}

interface QuickActionsProps {
  onTransferClick?: () => void
  onHistoryClick?: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({ onTransferClick, onHistoryClick }) => {
  const actions: QuickActionItem[] = [
    {
      label: 'Transfer',
      icon: <ArrowUpRight size={20} />,
      onClick: onTransferClick,
      accent: true,
    },
    {
      label: 'History',
      icon: <Clock size={20} />,
      onClick: onHistoryClick,
    },
    {
      label: 'Statement',
      icon: <FileText size={20} />,
    },
    {
      label: 'Support',
      icon: <HeadphonesIcon size={20} />,
    },
  ]

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`
              flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200
              ${action.accent
                ? 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50'
                : 'bg-surface-2 border-border text-muted hover:bg-surface-3 hover:text-text hover:border-border-light'
              }
            `}
          >
            <span className={`${action.accent ? 'text-gold' : 'text-muted'}`}>
              {action.icon}
            </span>
            <span className="text-xs font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
