import React, { useState } from 'react'
import { AlertTriangle, User, Clock } from 'lucide-react'
import type { Incident, RiskLevel } from '../../types'
import RiskBadge from '../common/RiskBadge'
import { formatCurrency, timeAgo } from '../../utils/formatters'

interface IncidentQueueProps {
  incidents:   Incident[]
  onSelect:    (incidentId: string) => void
  selectedId?: string
}

type FilterLevel = 'ALL' | RiskLevel

const FILTER_TABS: FilterLevel[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const FILTER_STYLES: Record<FilterLevel, string> = {
  ALL:      'border-border text-muted hover:text-text hover:border-border-light',
  CRITICAL: 'border-danger/40  text-danger  bg-danger/5',
  HIGH:     'border-orange/40  text-orange  bg-orange/5',
  MEDIUM:   'border-warning/40 text-warning bg-warning/5',
  LOW:      'border-success/40 text-success bg-success/5',
}

const ACTIVE_FILTER_STYLES: Record<FilterLevel, string> = {
  ALL:      'border-border-light text-text bg-surface-2',
  CRITICAL: 'border-danger/60  text-danger  bg-danger/15',
  HIGH:     'border-orange/60  text-orange  bg-orange/15',
  MEDIUM:   'border-warning/60 text-warning bg-warning/15',
  LOW:      'border-success/60 text-success bg-success/15',
}

const IncidentQueue: React.FC<IncidentQueueProps> = ({ incidents, onSelect, selectedId }) => {
  const [activeFilter, setActiveFilter] = useState<FilterLevel>('ALL')

  const filtered =
    activeFilter === 'ALL'
      ? incidents
      : incidents.filter((inc) => inc.risk_level === activeFilter)

  // Count per level for badge display
  const counts: Record<RiskLevel, number> = {
    CRITICAL: incidents.filter((i) => i.risk_level === 'CRITICAL').length,
    HIGH:     incidents.filter((i) => i.risk_level === 'HIGH').length,
    MEDIUM:   incidents.filter((i) => i.risk_level === 'MEDIUM').length,
    LOW:      incidents.filter((i) => i.risk_level === 'LOW').length,
  }

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center">
            <AlertTriangle size={15} className="text-orange" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Incident Queue</h2>
            <p className="text-xs text-muted mt-0.5">{incidents.length} total incidents</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map((filter) => {
            const isActive = activeFilter === filter
            const count = filter !== 'ALL' ? counts[filter as RiskLevel] : incidents.length
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold
                  transition-all duration-150
                  ${isActive ? ACTIVE_FILTER_STYLES[filter] : FILTER_STYLES[filter]}
                `}
              >
                {filter}
                {count > 0 && (
                  <span className="text-[10px] font-bold opacity-80">{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              {['Incident ID', 'Risk', 'Type', 'Affected User', 'Amount', 'Time'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No incidents match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => {
                const isSelected = inc.incident_id === selectedId
                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelect(inc.incident_id)}
                    className={`
                      cursor-pointer transition-all duration-100
                      ${
                        isSelected
                          ? 'bg-gold/5 border-l-2 border-l-gold'
                          : 'hover:bg-surface-2/60 border-l-2 border-l-transparent'
                      }
                    `}
                  >
                    {/* Incident ID */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isSelected ? 'text-gold' : 'text-text'
                        }`}
                      >
                        {inc.incident_id}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskBadge level={inc.risk_level} size="sm" />
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="text-muted capitalize text-[11px]">
                        {inc.incident_type.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>

                    {/* Affected User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <User size={11} className="flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{inc.affected_user}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-text">
                        {inc.transaction_amount != null
                          ? formatCurrency(inc.transaction_amount)
                          : '—'}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-muted">
                        <Clock size={10} className="flex-shrink-0" />
                        <span>{timeAgo(inc.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IncidentQueue
