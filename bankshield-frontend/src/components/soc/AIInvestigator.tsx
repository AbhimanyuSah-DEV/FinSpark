import React from 'react'
import {
  BrainCircuit,
  MousePointerClick,
  ShieldAlert,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Bot,
} from 'lucide-react'
import type { Incident } from '../../types'
import RiskBadge from '../common/RiskBadge'
import { formatCurrency, timeAgo } from '../../utils/formatters'

interface AIInvestigatorProps {
  incident: Incident | null
}

const AIInvestigator: React.FC<AIInvestigatorProps> = ({ incident }) => {
  if (!incident) {
    return (
      <div className="bg-surface border border-border rounded-xl flex flex-col items-center justify-center h-full min-h-64 py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
          <BrainCircuit size={22} className="text-gold" />
        </div>
        <p className="text-base font-semibold text-text mb-1">AI Investigator</p>
        <p className="text-sm text-muted">Select an incident to investigate</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          <MousePointerClick size={13} />
          <span>Click any row in the Incident Queue below</span>
        </div>
      </div>
    )
  }

  const confidencePct = Math.round(incident.fraud_confidence * 100)
  const fraudProbPct  = Math.round(incident.fraud_probability  * 100)

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border flex-shrink-0 bg-gradient-to-r from-surface to-surface-2">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BrainCircuit size={17} className="text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-text">AI Investigator</h2>
              <span className="text-xs font-mono text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                {incident.incident_id}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">{incident.incident_type}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
          <RiskBadge level={incident.risk_level} size="sm" />
          <span className="text-[10px] text-muted">{timeAgo(incident.created_at)}</span>
        </div>
      </div>

      {/* ── Confidence bar ── */}
      <div className="px-5 py-3 border-b border-border bg-surface-2/40 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Bot size={12} className="text-gold" />
            <span className="text-xs text-muted font-medium">AI Confidence</span>
          </div>
          <span className="text-sm font-bold text-gold">{confidencePct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-700"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* AI Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={13} className="text-gold" />
            <p className="text-xs font-bold text-gold uppercase tracking-wider">AI Summary</p>
          </div>
          <div className="bg-gold/5 border border-gold/15 rounded-lg p-3.5">
            <p className="text-sm text-text leading-relaxed">{incident.ai_summary}</p>
          </div>
        </div>

        {/* Why Suspicious */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={13} className="text-orange" />
            <p className="text-xs font-bold text-orange uppercase tracking-wider">Why Suspicious</p>
          </div>
          <div className="bg-orange/5 border border-orange/20 rounded-lg p-3.5">
            <p className="text-sm text-text leading-relaxed">{incident.why_suspicious}</p>
          </div>
        </div>

        {/* Fraud Probability */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-2 border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted font-medium mb-1">Fraud Probability</p>
            <p className="text-xl font-bold text-danger">{fraudProbPct}%</p>
            <div className="mt-2 w-full h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-danger transition-all duration-700"
                style={{ width: `${fraudProbPct}%` }}
              />
            </div>
          </div>
          <div className="bg-surface-2 border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted font-medium mb-1">Risk Score</p>
            <p className="text-xl font-bold text-warning">{incident.overall_risk_score.toFixed(2)}</p>
            <div className="mt-2 w-full h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-warning transition-all duration-700"
                style={{ width: `${Math.min(incident.overall_risk_score * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Business Impact */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={13} className="text-danger" />
            <p className="text-xs font-bold text-danger uppercase tracking-wider">Business Impact</p>
          </div>
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-3.5">
            <p className="text-sm text-text leading-relaxed">{incident.business_impact}</p>
            {incident.transaction_amount != null && (
              <p className="text-base font-bold text-danger mt-2">
                {formatCurrency(incident.transaction_amount)}
              </p>
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={13} className="text-gold" />
            <p className="text-xs font-bold text-gold uppercase tracking-wider">Recommended Actions</p>
          </div>
          <div className="space-y-2">
            {incident.recommended_actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/25 text-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-text leading-relaxed">{action}</p>
              </div>
            ))}
            {incident.recommended_actions.length === 0 && (
              <p className="text-xs text-muted italic px-1">No recommended actions at this time.</p>
            )}
          </div>
        </div>

        {/* Fraud Reasons */}
        {incident.fraud_reasons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight size={13} className="text-muted" />
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Detection Signals</p>
            </div>
            <div className="space-y-1.5">
              {incident.fraud_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted">
                  <span className="text-orange mt-0.5 flex-shrink-0">›</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInvestigator
