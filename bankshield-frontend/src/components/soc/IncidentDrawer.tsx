import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  Clock,
  GitBranch,
  ShieldAlert,
  Percent,
  Atom,
  AlertTriangle,
  ChevronRight,
  Ban,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import type { Incident } from '../../types'
import { getIncidentDetail, transactionAction } from '../../api/admin.api'
import Drawer from '../common/Drawer'
import RiskBadge from '../common/RiskBadge'
import Loader from '../common/Loader'
import ConfirmModal from '../common/ConfirmModal'
import HorizontalTimeline from './HorizontalTimeline'
import { formatDateTime, formatCurrency, timeAgo } from '../../utils/formatters'

interface IncidentDrawerProps {
  incidentId: string | null
  onClose:    () => void
}

type TabId = 'timeline' | 'behaviour' | 'correlation' | 'fraud' | 'quantum'

interface Tab {
  id:    TabId
  label: string
  icon:  React.ElementType
}

const TABS: Tab[] = [
  { id: 'timeline',    label: 'Timeline',            icon: Clock      },
  { id: 'behaviour',   label: 'Behaviour Analysis',  icon: GitBranch  },
  { id: 'correlation', label: 'Correlation Signals',  icon: ShieldAlert },
  { id: 'fraud',       label: 'Fraud Analysis',       icon: Percent    },
  { id: 'quantum',     label: 'Quantum Risk',         icon: Atom       },
]

const IncidentDrawer: React.FC<IncidentDrawerProps> = ({ incidentId, onClose }) => {
  const [incident,  setIncident]  = useState<Incident | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('timeline')

  // Transaction action state
  const [actionModal, setActionModal] = useState<'REVERSE' | 'CANCEL' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (!incidentId) {
      setIncident(null)
      setActionResult(null)
      return
    }
    setLoading(true)
    setError(null)
    setActiveTab('timeline')
    setActionResult(null)

    getIncidentDetail(incidentId)
      .then((data) => setIncident(data))
      .catch(() => setError('Failed to load incident details. Please try again.'))
      .finally(() => setLoading(false))
  }, [incidentId])

  const handleAction = async (action: 'REVERSE' | 'CANCEL') => {
    if (!incident?.transaction_id) return
    const reason = (document.getElementById('confirm-reason') as HTMLTextAreaElement)?.value || ''
    setActionLoading(true)
    try {
      const res = await transactionAction(incident.transaction_id, action, reason)
      setActionResult({ success: true, message: res.message })
    } catch {
      setActionResult({ success: false, message: 'Action failed. Transaction may already be blocked.' })
    } finally {
      setActionLoading(false)
      setActionModal(null)
    }
  }

  const isOpen = incidentId !== null

  const fraudProbPct  = incident ? Math.round(incident.fraud_probability  * 100) : 0
  const fraudConfPct  = incident ? Math.round(incident.fraud_confidence    * 100) : 0
  const quantumExpPct = incident ? Math.round(incident.quantum_exposure_score * 100) : 0
  const devScorePct   = incident ? Math.min(Math.round(incident.behaviour_deviation_score * 100), 100) : 0

  return (
    <>
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={incident ? `Incident ${incident.incident_id}` : (incidentId ?? 'Incident Detail')}
      subtitle={incident ? `${incident.incident_type} · ${timeAgo(incident.created_at)}` : undefined}
      width="max-w-4xl"
    >
      {loading && <Loader text="Loading incident details…" />}

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-danger/30 bg-danger/10">
          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && incident && (
        <div className="space-y-5">

          {/* ── AI Summary (always visible) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={15} className="text-gold" />
                <p className="text-xs font-bold text-gold uppercase tracking-wider">AI Summary</p>
              </div>
              <RiskBadge level={incident.risk_level} size="sm" />
            </div>
            <div className="bg-gold/5 border border-gold/15 rounded-lg p-4">
              <p className="text-sm text-text leading-relaxed">{incident.ai_summary}</p>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 px-1">
              {[
                { label: 'User',        value: incident.affected_user },
                { label: 'Type',        value: incident.incident_type },
                { label: 'Amount',      value: incident.transaction_amount != null ? formatCurrency(incident.transaction_amount) : '—' },
                { label: 'Created',     value: formatDateTime(incident.created_at) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-xs text-text font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap
                  border-b-2 transition-all duration-150
                  ${activeTab === id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted hover:text-text hover:border-border-light'
                  }
                `}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab panels ── */}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div>
              {incident.timeline.length > 0 ? (
                <HorizontalTimeline events={incident.timeline} />
              ) : (
                <p className="text-sm text-muted italic text-center py-8">
                  No timeline events recorded.
                </p>
              )}
            </div>
          )}

          {/* Behaviour Analysis */}
          {activeTab === 'behaviour' && (
            <div className="space-y-4">
              <div className="bg-surface-2 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Behaviour Deviation Score
                  </p>
                  <p className="text-sm font-bold text-orange">
                    {incident.behaviour_deviation_score.toFixed(3)}
                  </p>
                </div>
                <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-warning to-danger transition-all duration-700"
                    style={{ width: `${devScorePct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted">Normal</span>
                  <span className="text-[10px] text-muted">Anomalous</span>
                </div>
              </div>

              <div className="bg-surface-2 border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Why Suspicious
                </p>
                <p className="text-sm text-text leading-relaxed">{incident.why_suspicious}</p>
              </div>

              <div className="bg-surface-2 border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Business Impact
                </p>
                <p className="text-sm text-text leading-relaxed">{incident.business_impact}</p>
              </div>
            </div>
          )}

          {/* Correlation Signals */}
          {activeTab === 'correlation' && (
            <div className="space-y-2">
              {incident.correlation_signals.length === 0 ? (
                <p className="text-sm text-muted italic text-center py-8">
                  No correlation signals detected.
                </p>
              ) : (
                incident.correlation_signals.map((signal, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-orange/20 bg-orange/5 px-3 py-2.5"
                  >
                    <ChevronRight size={12} className="text-orange mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text leading-relaxed">{signal}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Fraud Analysis */}
          {activeTab === 'fraud' && (
            <div className="space-y-4">

              {/* Action result banner */}
              {actionResult && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${
                  actionResult.success
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-danger/10 border-danger/30 text-danger'
                }`}>
                  {actionResult.success
                    ? <CheckCircle2 size={15} />
                    : <AlertTriangle size={15} />
                  }
                  {actionResult.message}
                </div>
              )}

              {/* Admin Power Actions */}
              {incident.transaction_id && !actionResult?.success && (
                <div className="bg-surface-2 border border-danger/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-danger uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Ban size={12} /> Admin Transaction Controls
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActionModal('CANCEL')}
                      className="flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/40 hover:border-danger/60 text-danger font-semibold text-sm py-2.5 rounded-xl transition-all duration-150"
                    >
                      <Ban size={14} />
                      Cancel Transaction
                    </button>
                    <button
                      onClick={() => setActionModal('REVERSE')}
                      className="flex items-center justify-center gap-2 bg-orange/10 hover:bg-orange/20 border border-orange/40 hover:border-orange/60 text-orange font-semibold text-sm py-2.5 rounded-xl transition-all duration-150"
                    >
                      <RotateCcw size={14} />
                      Reverse Transaction
                    </button>
                  </div>
                  <p className="text-[10px] text-muted mt-2.5 text-center">
                    Cancel blocks the transaction. Reverse blocks it and refunds the sender.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Fraud Probability */}
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2">
                    Fraud Probability
                  </p>
                  <p className="text-2xl font-bold text-danger mb-2">{fraudProbPct}%</p>
                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-danger transition-all duration-700"
                      style={{ width: `${fraudProbPct}%` }}
                    />
                  </div>
                </div>

                {/* Fraud Confidence */}
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-2">
                    Model Confidence
                  </p>
                  <p className="text-2xl font-bold text-gold mb-2">{fraudConfPct}%</p>
                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-700"
                      style={{ width: `${fraudConfPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fraud Reasons */}
              <div className="bg-surface-2 border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Detection Reasons
                </p>
                {incident.fraud_reasons.length === 0 ? (
                  <p className="text-sm text-muted italic">No specific reasons recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {incident.fraud_reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-text">
                        <span className="text-orange font-bold mt-0.5 flex-shrink-0">{idx + 1}.</span>
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Actions */}
              {incident.recommended_actions.length > 0 && (
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Recommended Actions
                  </p>
                  <div className="space-y-2">
                    {incident.recommended_actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/25 text-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-text leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantum Risk */}
          {activeTab === 'quantum' && (
            <div className="space-y-4">
              {/* Exposure Score */}
              <div className="bg-surface-2 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Quantum Exposure Score
                  </p>
                  <p className={`text-sm font-bold ${
                    quantumExpPct >= 70 ? 'text-danger'
                    : quantumExpPct >= 40 ? 'text-warning'
                    : 'text-success'
                  }`}>
                    {quantumExpPct}%
                  </p>
                </div>
                <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      quantumExpPct >= 70 ? 'bg-danger'
                      : quantumExpPct >= 40 ? 'bg-warning'
                      : 'bg-success'
                    }`}
                    style={{ width: `${quantumExpPct}%` }}
                  />
                </div>
              </div>

              {/* HNDL Warning */}
              {incident.quantum_hndl_warning ? (
                <div className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                  <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5 animate-pulse-slow" />
                  <div>
                    <p className="text-sm font-bold text-danger">
                      Harvest Now, Decrypt Later (HNDL) Warning Active
                    </p>
                    <p className="text-xs text-danger/80 mt-1 leading-relaxed">
                      This incident exhibits indicators consistent with HNDL attack patterns.
                      Encrypted data may have been exfiltrated for future decryption by quantum-capable
                      adversaries.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
                  <AlertTriangle size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-success font-medium">No HNDL indicators for this incident.</p>
                </div>
              )}

              {/* Recommendation */}
              {incident.quantum_recommendation && (
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Quantum Recommendation
                  </p>
                  <div className="flex items-start gap-2">
                    <Atom size={14} className="text-teal-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text leading-relaxed">
                      {incident.quantum_recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Prototype disclaimer */}
              <div className="flex items-start gap-2.5 rounded-lg border border-teal/20 bg-teal/5 px-4 py-3">
                <Atom size={13} className="text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted leading-relaxed">
                  <span className="font-semibold text-teal-400">Prototype Indicator:</span>{' '}
                  Quantum risk scores are generated by experimental prototype models and should
                  be treated as supplementary threat intelligence, not definitive assessments.
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </Drawer>

    {/* Confirmation modals */}
    <ConfirmModal
      open={actionModal === 'CANCEL'}
      title="Cancel Transaction"
      message={`This will permanently block the transaction of ${incident ? formatCurrency(incident.transaction_amount ?? 0) : ''}. No funds will be moved. This cannot be undone.`}
      confirmText="Yes, Cancel Transaction"
      confirmClass="bg-danger hover:bg-red-700 text-white"
      loading={actionLoading}
      onConfirm={() => handleAction('CANCEL')}
      onCancel={() => setActionModal(null)}
    />
    <ConfirmModal
      open={actionModal === 'REVERSE'}
      title="Reverse Transaction"
      message={`This will block the transaction and credit ${incident ? formatCurrency(incident.transaction_amount ?? 0) : ''} back to the sender's account.`}
      confirmText="Yes, Reverse & Refund"
      confirmClass="bg-orange-600 hover:bg-orange-700 text-white"
      loading={actionLoading}
      onConfirm={() => handleAction('REVERSE')}
      onCancel={() => setActionModal(null)}
    />
    </>
  )
}

export default IncidentDrawer
