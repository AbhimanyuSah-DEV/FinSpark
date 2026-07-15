import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Monitor, MapPin, CheckCircle2, ChevronRight, Clock } from 'lucide-react'

const SECURITY_SCORE = 98

// Static but realistic last-login data
const LAST_LOGIN = {
  location: 'Mumbai, Maharashtra',
  device: 'Chrome on Windows',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
}

const SecurityWidget: React.FC = () => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDash = (SECURITY_SCORE / 100) * circumference

  const formatLastLogin = (iso: string): string => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso))
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-success/10 border border-success/30 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-success" />
          </div>
          <span className="text-sm font-semibold text-text">Security Status</span>
        </div>
        <Link
          to="/security"
          className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
        >
          Full Center
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Score ring + label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            {/* Track */}
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="#1A3A4E"
              strokeWidth="7"
            />
            {/* Progress */}
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="#16A34A"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset="0"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-success leading-none">{SECURITY_SCORE}%</span>
          </div>
        </div>

        <div>
          <p className="text-base font-bold text-text leading-tight">98% Protected</p>
          <p className="text-xs text-muted mt-0.5">Excellent security posture</p>
          <div className="mt-2 flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-full px-2.5 py-0.5 w-fit">
            <CheckCircle2 size={11} className="text-success" />
            <span className="text-xs font-semibold text-success">All Systems Safe</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-3" />

      {/* Last Login */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest">Last Login</p>

        <div className="flex items-start gap-2.5">
          <Clock size={13} className="text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-text font-medium">{formatLastLogin(LAST_LOGIN.timestamp)}</p>
            <p className="text-xs text-muted">Today's session</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin size={13} className="text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-text font-medium">{LAST_LOGIN.location}</p>
            <p className="text-xs text-muted">Login location</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Monitor size={13} className="text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-text font-medium">{LAST_LOGIN.device}</p>
            <p className="text-xs text-muted">Current device</p>
          </div>
        </div>
      </div>

      {/* Trusted device badge */}
      <div className="mt-3 flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2">
        <CheckCircle2 size={14} className="text-success flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-text">Device Trusted</p>
          <p className="text-xs text-muted">Recognised & verified</p>
        </div>
      </div>
    </div>
  )
}

export default SecurityWidget
