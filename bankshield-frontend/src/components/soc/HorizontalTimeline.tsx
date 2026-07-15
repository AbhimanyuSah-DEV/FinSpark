import React from 'react'
import {
  LogIn,
  ArrowRightLeft,
  GitBranch,
  AlertTriangle,
  Clock,
  Activity,
  Shield,
  Zap,
} from 'lucide-react'
import type { TimelineEvent } from '../../types'
import { formatTime } from '../../utils/formatters'

interface HorizontalTimelineProps {
  events: TimelineEvent[]
}

// ── Colour + icon mapping by event type ───────────────────────────────────────
const EVENT_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; Icon: React.ElementType }
> = {
  login:       { bg: 'bg-blue-500/20',   border: 'border-blue-500/50',   text: 'text-blue-400',   Icon: LogIn },
  transfer:    { bg: 'bg-gold/20',        border: 'border-gold/50',        text: 'text-gold',        Icon: ArrowRightLeft },
  correlation: { bg: 'bg-orange/20',      border: 'border-orange/50',      text: 'text-orange',      Icon: GitBranch },
  incident:    { bg: 'bg-danger/20',      border: 'border-danger/60',      text: 'text-danger',      Icon: AlertTriangle },
  behaviour:   { bg: 'bg-purple-500/20',  border: 'border-purple-500/50',  text: 'text-purple-400',  Icon: Activity },
  quantum:     { bg: 'bg-teal/20',        border: 'border-teal/50',        text: 'text-teal-400',    Icon: Zap },
  security:    { bg: 'bg-warning/20',     border: 'border-warning/50',     text: 'text-warning',     Icon: Shield },
  default:     { bg: 'bg-muted/20',       border: 'border-muted/30',       text: 'text-muted',       Icon: Clock },
}

const getConfig = (type: string) =>
  EVENT_CONFIG[type?.toLowerCase()] ?? EVENT_CONFIG.default

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted text-sm">
        No timeline events available.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex items-start gap-0 min-w-max px-2">
        {events.map((event, idx) => {
          const cfg = getConfig(event.type)
          const Icon = cfg.Icon
          const isLast = idx === events.length - 1

          return (
            <div key={idx} className="flex items-start">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 100 }}>
                {/* Label above */}
                <div className="text-center w-24">
                  <p className="text-xs font-semibold text-text leading-tight line-clamp-2 text-center">
                    {event.event}
                  </p>
                </div>

                {/* Circle icon */}
                <div
                  className={`
                    w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${cfg.bg} ${cfg.border} ${cfg.text}
                  `}
                >
                  <Icon size={14} />
                </div>

                {/* Time + detail below */}
                <div className="text-center w-24">
                  <p className={`text-[10px] font-mono font-semibold ${cfg.text}`}>
                    {formatTime(event.time)}
                  </p>
                  {event.detail && (
                    <p className="text-[10px] text-muted mt-0.5 leading-tight line-clamp-2">
                      {event.detail}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line — not after the last node */}
              {!isLast && (
                <div className="flex items-center" style={{ marginTop: 26 }}>
                  <div className="w-8 h-px bg-border-light flex-shrink-0" />
                  <div className="w-1.5 h-1.5 rounded-full bg-border-light flex-shrink-0 -ml-px" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HorizontalTimeline
