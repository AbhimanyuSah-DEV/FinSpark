import React from 'react'
import { Check, Send, UserCheck, GitBranch, Cpu, ShieldAlert, FileText, Sparkles, Loader2 } from 'lucide-react'
import { PIPELINE_STAGES } from '../../utils/constants'
import RiskBadge from './RiskBadge'
import type { RiskLevel } from '../../types'

interface PipelineProgressProps {
  currentStage: number   // 0 = not started, 1-8 = active stage, 8 = complete
  riskLevel?:   RiskLevel
  error?:       string
}

const ICONS = [Send, UserCheck, GitBranch, Cpu, ShieldAlert, FileText, Sparkles, Check]

const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentStage, riskLevel, error }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-widest">
          BrainCore Intelligence Pipeline
        </h3>
        {currentStage === 8 && riskLevel && <RiskBadge level={riskLevel} size="lg" />}
      </div>

      <div className="space-y-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const stageNum   = idx + 1
          const isComplete = currentStage > stageNum
          const isActive   = currentStage === stageNum
          const isPending  = currentStage < stageNum
          const Icon       = ICONS[idx]

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isActive   ? 'bg-gold/10 border border-gold/30'   :
                isComplete ? 'bg-success/5 border border-success/20' :
                             'border border-transparent opacity-40'
              }`}
            >
              {/* Step icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isActive   ? 'bg-gold/20 text-gold'     :
                isComplete ? 'bg-success/20 text-success' :
                             'bg-surface-2 text-subtle'
              }`}>
                {isActive ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isComplete ? (
                  <Check size={14} />
                ) : (
                  <Icon size={14} />
                )}
              </div>

              {/* Label */}
              <span className={`text-sm font-medium ${
                isActive   ? 'text-gold'    :
                isComplete ? 'text-success' :
                             'text-subtle'
              }`}>
                {stage.label}
                {isActive && stageNum < 8 && (
                  <span className="ml-2 text-xs text-muted animate-pulse">Processing…</span>
                )}
              </span>

              {/* Connector line */}
              {isComplete && (
                <div className="ml-auto text-success">
                  <Check size={14} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default PipelineProgress
