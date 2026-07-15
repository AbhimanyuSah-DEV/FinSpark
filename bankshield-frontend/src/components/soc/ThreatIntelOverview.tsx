import React from 'react'
import { Brain, Shield, Zap, ChevronRight, AlertCircle } from 'lucide-react'
import type { Incident } from '../../types'
import RiskBadge from '../common/RiskBadge'
import HorizontalTimeline from './HorizontalTimeline'
import { timeAgo, formatCurrency } from '../../utils/formatters'

interface ThreatIntelOverviewProps {
  incidents: Incident[]
}

const ThreatIntelOverview: React.FC<ThreatIntelOverviewProps> = ({ incidents }) => {
  // Most critical incident (sort by overall_risk_score desc)
  const sorted = [...incidents].sort((a, b) => b.overall_risk_score - a.overall_risk_score)
  const topIncident = sorted[0] ?? null

  // Get signal icon colour
  const getSignalStyle = (idx: number) => {
    const styles = [
      'text-danger   bg-danger/10   border-danger/20',
      'text-orange   bg-orange/10   border-orange/20',
      'text-warning  bg-warning/10  border-warning/20',
      'text-blue-400 bg-blue-500/10 border-blue-500/20',
    ]
    return styles[idx % styles.length]
  }

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center">
            <Brain size={15} className="text-danger" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">Threat Intelligence Overview</h2>
            <p className="text-xs text-muted mt-0.5">Most critical active incident</p>
          </div>
        </div>
        {topIncident && (
          <RiskBadge level={topIncident.risk_level} size="sm" />
        )}
      </div>

      {!topIncident ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <Shield size={32} className="text-muted mx-auto mb-3 opacity-40" />
            <p className="text-muted text-sm">No incidents to display</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Incident meta row */}
          <div className="flex items-center justify-between px-5 py-3 bg-surface-2/50 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-gold">{topIncident.incident_id}</span>
              <span className="text-xs text-muted">{topIncident.incident_type}</span>
            </div>
            <div className="flex items-center gap-3">
              {topIncident.transaction_amount != null && (
                <span className="text-xs font-semibold text-text">
                  {formatCurrency(topIncident.transaction_amount)}
                </span>
              )}
              <span className="text-xs text-muted">{timeAgo(topIncident.created_at)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Attack Timeline
            </p>
            {topIncident.timeline.length > 0 ? (
              <HorizontalTimeline events={topIncident.timeline} />
            ) : (
              <div className="flex items-center gap-2 text-muted text-xs py-4">
                <AlertCircle size={14} />
                <span>No timeline events recorded for this incident.</span>
              </div>
            )}
          </div>

          {/* Correlation Signals */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-orange" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                Correlation Signals
              </p>
            </div>

            {topIncident.correlation_signals.length === 0 ? (
              <p className="text-xs text-muted italic">No correlation signals detected.</p>
            ) : (
              <div className="space-y-2">
                {topIncident.correlation_signals.map((signal, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${getSignalStyle(idx)}`}
                  >
                    <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium leading-relaxed">{signal}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Behaviour deviation */}
          <div className="px-5 pb-5">
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted font-medium">Behaviour Deviation Score</p>
                <p className="text-xs font-bold text-orange">
                  {topIncident.behaviour_deviation_score.toFixed(2)}
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-danger transition-all duration-700"
                  style={{ width: `${Math.min(topIncident.behaviour_deviation_score * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThreatIntelOverview
