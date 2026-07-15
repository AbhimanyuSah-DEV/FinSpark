import React from 'react'
import { Atom, AlertTriangle, ShieldCheck, Info, User, Clock, ChevronRight } from 'lucide-react'
import type { QuantumOverview } from '../../types'
import { timeAgo } from '../../utils/formatters'

interface QuantumWidgetProps {
  quantumData: QuantumOverview | null
}

const QuantumWidget: React.FC<QuantumWidgetProps> = ({ quantumData }) => {
  const hasHndl = quantumData?.incidents.some((inc) => inc.quantum_hndl_warning) ?? false

  // Average exposure score
  const avgExposure =
    quantumData && quantumData.incidents.length > 0
      ? quantumData.incidents.reduce((acc, inc) => acc + inc.quantum_exposure_score, 0) /
        quantumData.incidents.length
      : 0

  const exposurePct = Math.round(avgExposure * 100)

  // Colour for exposure gauge
  const gaugeColor =
    exposurePct >= 70 ? 'bg-danger'
    : exposurePct >= 40 ? 'bg-warning'
    : 'bg-success'

  const gaugeTextColor =
    exposurePct >= 70 ? 'text-danger'
    : exposurePct >= 40 ? 'text-warning'
    : 'text-success'

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
            <Atom size={15} className="text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text">Quantum Risk Intelligence</h2>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-teal/30 text-teal-400 bg-teal/5">
                Prototype
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Prototype Quantum Risk Indicators — experimental threat surface analysis
            </p>
          </div>
        </div>
        {quantumData && (
          <div className="flex-shrink-0 ml-3">
            <div className="text-right">
              <p className="text-xl font-bold text-gold">{quantumData.total_quantum_alerts}</p>
              <p className="text-[10px] text-muted">Quantum Alerts</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">

        {/* ── Left: Gauge + HNDL ── */}
        <div className="lg:w-72 flex-shrink-0 p-5 space-y-4">
          {/* Exposure Gauge */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                Avg Exposure Score
              </p>
              <p className={`text-sm font-bold ${gaugeTextColor}`}>{exposurePct}%</p>
            </div>
            <div className="w-full h-3 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${gaugeColor}`}
                style={{ width: `${exposurePct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted">Low Risk</span>
              <span className="text-[10px] text-muted">Critical</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-surface-2 border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Info size={12} className="text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-text">
                  Harvest Now, Decrypt Later (HNDL)
                </p>
                <p className="text-[10px] text-muted mt-1 leading-relaxed">
                  Adversaries collect encrypted data today, intending to decrypt it once
                  quantum computers become powerful enough to break current cryptographic
                  standards (RSA / ECC).
                </p>
              </div>
            </div>
          </div>

          {/* HNDL Warning Banner */}
          {hasHndl ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/10 px-3 py-3">
              <AlertTriangle size={14} className="text-danger flex-shrink-0 mt-0.5 animate-pulse-slow" />
              <div>
                <p className="text-xs font-bold text-danger">HNDL Attack Indicators Detected</p>
                <p className="text-[10px] text-danger/70 mt-0.5">
                  One or more incidents show signs of harvest-now-decrypt-later activity.
                  Immediate cryptographic review recommended.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3 py-3">
              <ShieldCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success">No HNDL Warnings</p>
                <p className="text-[10px] text-muted mt-0.5">
                  No harvest-now-decrypt-later indicators found in current incidents.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Quantum Incidents List ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Quantum Incident Details
            </p>
          </div>

          {!quantumData || quantumData.incidents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <Atom size={28} className="text-muted mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted">No quantum incidents detected</p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-72 divide-y divide-border">
              {quantumData.incidents.map((inc) => {
                const incExposurePct = Math.round(inc.quantum_exposure_score * 100)
                const incGaugeColor =
                  incExposurePct >= 70 ? 'bg-danger'
                  : incExposurePct >= 40 ? 'bg-warning'
                  : 'bg-success'
                const incTextColor =
                  incExposurePct >= 70 ? 'text-danger'
                  : incExposurePct >= 40 ? 'text-warning'
                  : 'text-success'

                return (
                  <div key={inc.incident_id} className="px-5 py-3.5 hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-gold">
                            {inc.incident_id}
                          </span>
                          {inc.quantum_hndl_warning && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-danger/40 text-danger bg-danger/10">
                              HNDL
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <User size={10} className="text-muted flex-shrink-0" />
                          <span className="text-[11px] text-muted truncate">{inc.affected_user}</span>
                          <span className="text-muted">·</span>
                          <Clock size={10} className="text-muted flex-shrink-0" />
                          <span className="text-[11px] text-muted">{timeAgo(inc.created_at)}</span>
                        </div>

                        {/* Exposure bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full ${incGaugeColor}`}
                              style={{ width: `${incExposurePct}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold ${incTextColor} w-8 text-right`}>
                            {incExposurePct}%
                          </span>
                        </div>

                        {/* Recommendation */}
                        {inc.quantum_recommendation && (
                          <div className="flex items-start gap-1.5 mt-2">
                            <ChevronRight size={10} className="text-teal-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-muted leading-relaxed">
                              {inc.quantum_recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuantumWidget
