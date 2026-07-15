import React from 'react'
import {
  ArrowRightLeft,
  AlertTriangle,
  Flame,
  TrendingUp,
  Brain,
  Atom,
} from 'lucide-react'
import type { AdminKPI } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface DashboardCardsProps {
  kpi: AdminKPI
}

interface KPICardProps {
  label:       string
  value:       string | number
  icon:        React.ElementType
  iconClass:   string
  bgClass:     string
  borderClass: string
  pulse?:      boolean
  highlight?:  boolean
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  borderClass,
  pulse = false,
  highlight = false,
}) => (
  <div
    className={`
      relative overflow-hidden rounded-xl border p-5 flex flex-col gap-4
      bg-surface ${borderClass}
      transition-all duration-200 hover:border-opacity-80
      ${highlight ? 'shadow-glow-red' : ''}
    `}
  >
    {/* Top row: icon + pulse indicator */}
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}>
        <Icon size={18} className={iconClass} />
      </div>
      {pulse && (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse-fast" />
          <span className="text-[10px] font-semibold text-danger uppercase tracking-wider">Live</span>
        </span>
      )}
    </div>

    {/* Value */}
    <div>
      <p className={`text-3xl font-bold leading-none ${highlight ? 'text-danger' : 'text-text'}`}>
        {value}
      </p>
      <p className="text-sm text-muted mt-1.5 font-medium">{label}</p>
    </div>

    {/* Subtle gradient corner accent */}
    <div
      className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 ${bgClass}`}
    />
  </div>
)

const DashboardCards: React.FC<DashboardCardsProps> = ({ kpi }) => {
  const cards: KPICardProps[] = [
    {
      label:       'Total Transactions',
      value:       kpi.total_transactions.toLocaleString('en-IN'),
      icon:        ArrowRightLeft,
      iconClass:   'text-blue-400',
      bgClass:     'bg-blue-500/15',
      borderClass: 'border-blue-500/20',
    },
    {
      label:       'Total Incidents',
      value:       kpi.total_incidents.toLocaleString('en-IN'),
      icon:        AlertTriangle,
      iconClass:   'text-orange',
      bgClass:     'bg-orange/15',
      borderClass: 'border-orange/20',
    },
    {
      label:       'Critical Incidents',
      value:       kpi.critical_incidents,
      icon:        Flame,
      iconClass:   'text-danger',
      bgClass:     'bg-danger/15',
      borderClass: 'border-danger/20',
      pulse:       kpi.critical_incidents > 0,
      highlight:   kpi.critical_incidents > 0,
    },
    {
      label:       'Fraud Rate',
      value:       `${kpi.fraud_rate.toFixed(2)}%`,
      icon:        TrendingUp,
      iconClass:   'text-warning',
      bgClass:     'bg-warning/15',
      borderClass: 'border-warning/20',
    },
    {
      label:       'Avg Fraud Probability',
      value:       `${(kpi.avg_fraud_probability * 100).toFixed(1)}%`,
      icon:        Brain,
      iconClass:   'text-purple-400',
      bgClass:     'bg-purple-500/15',
      borderClass: 'border-purple-500/20',
    },
    {
      label:       'Quantum Alerts',
      value:       kpi.quantum_alerts,
      icon:        Atom,
      iconClass:   kpi.quantum_alerts > 0 ? 'text-gold' : 'text-muted',
      bgClass:     kpi.quantum_alerts > 0 ? 'bg-gold/15' : 'bg-muted/10',
      borderClass: kpi.quantum_alerts > 0 ? 'border-gold/30' : 'border-border',
      highlight:   false,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  )
}

export default DashboardCards
