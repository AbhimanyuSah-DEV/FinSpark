import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Monitor,
  MapPin,
  Clock,
  AlertTriangle,
  Lock,
  Smartphone,
  Globe,
  Eye,
  ChevronRight,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { getLoginHistory } from '../api/user.api'
import type { LoginHistory } from '../types'

// ── Static demo data (realistic) ─────────────────────────────────────────────
const DEMO_TRUSTED_DEVICES = [
  {
    id: 1,
    name: 'Windows PC – Chrome',
    lastSeen: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    trusted: true,
    icon: <Monitor size={16} />,
  },
  {
    id: 2,
    name: 'iPhone 15 – Safari',
    lastSeen: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    trusted: true,
    icon: <Smartphone size={16} />,
  },
  {
    id: 3,
    name: 'macOS – Firefox',
    lastSeen: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
    trusted: false,
    icon: <Globe size={16} />,
  },
]

const DEMO_SECURITY_EVENTS = [
  {
    id: 1,
    event: 'Successful Login',
    detail: 'Logged in from Mumbai, Maharashtra',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    type: 'info',
  },
  {
    id: 2,
    event: 'Transfer Completed',
    detail: 'Transfer of ₹12,500 cleared by BrainCore AI (LOW risk)',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    type: 'success',
  },
  {
    id: 3,
    event: 'Failed Login Attempt',
    detail: 'Wrong password from Firefox on macOS — Pune, MH',
    timestamp: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
    type: 'warning',
  },
  {
    id: 4,
    event: 'New Device Detected',
    detail: 'Safari login from iPhone 15 — flagged as new device',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    type: 'info',
  },
  {
    id: 5,
    event: 'Password Changed',
    detail: 'Password updated successfully',
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    type: 'success',
  },
]

const SECURITY_SCORE = 98

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDateFull = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

const eventTypeStyle = (type: string) => {
  switch (type) {
    case 'success': return { dot: 'bg-success', text: 'text-success', bg: 'bg-success/10 border-success/20' }
    case 'warning': return { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10 border-warning/20' }
    case 'danger':  return { dot: 'bg-danger',  text: 'text-danger',  bg: 'bg-danger/10 border-danger/20'   }
    default:        return { dot: 'bg-gold',    text: 'text-gold',    bg: 'bg-gold/10 border-gold/20'       }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
const CustomerSecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'logins' | 'devices' | 'events'>('logins')
  const [loginHistory, setLoginHistory] = React.useState<LoginHistory[]>([])

  React.useEffect(() => {
    getLoginHistory().then(setLoginHistory).catch(console.error)
  }, [])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDash = (SECURITY_SCORE / 100) * circumference

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
          <ChevronRight size={12} className="text-subtle" />
          <span className="text-sm text-text font-medium">Security Center</span>
        </div>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-success/10 border border-success/30 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">Security Center</h1>
            <p className="text-sm text-muted">Monitor and manage your account security</p>
          </div>
        </div>

        {/* Top row: Score + quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Score card */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl p-6 flex flex-col items-center shadow-card">
            {/* SVG ring */}
            <div className="relative mb-4">
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#1A3A4E" strokeWidth="10" />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-success">{SECURITY_SCORE}%</span>
                <span className="text-xs text-muted">Score</span>
              </div>
            </div>
            <p className="text-lg font-bold text-text mb-1">98% Protected</p>
            <p className="text-xs text-muted text-center">Your account has an excellent security rating</p>
            <div className="mt-4 flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-3 py-1">
              <CheckCircle2 size={13} className="text-success" />
              <span className="text-xs font-semibold text-success">All Systems Normal</span>
            </div>
          </div>

          {/* Quick stat cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              {
                label: 'Trusted Devices',
                value: '2',
                icon: <Monitor size={18} className="text-gold" />,
                sub: 'of 3 devices',
                accent: 'text-gold',
              },
              {
                label: 'Recent Logins',
                value: '5',
                icon: <Eye size={18} className="text-gold" />,
                sub: 'last 7 days',
                accent: 'text-gold',
              },
              {
                label: 'Failed Attempts',
                value: '1',
                icon: <AlertTriangle size={18} className="text-warning" />,
                sub: 'last 7 days',
                accent: 'text-warning',
              },
              {
                label: 'Auth Method',
                value: '2FA',
                icon: <Lock size={18} className="text-success" />,
                sub: 'Enabled',
                accent: 'text-success',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                    {s.label}
                  </span>
                  {s.icon}
                </div>
                <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
                <p className="text-xs text-muted">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {([
              { key: 'logins',  label: 'Login History',       icon: <Clock size={14} /> },
              { key: 'devices', label: 'Trusted Devices',      icon: <Monitor size={14} /> },
              { key: 'events',  label: 'Security Events',      icon: <Shield size={14} /> },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {/* ── Login History ── */}
            {activeTab === 'logins' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Date & Time', 'Location', 'Device', 'IP', 'Status'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold text-muted uppercase tracking-widest px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((login) => (
                      <tr key={login.id} className="border-b border-border/40 hover:bg-surface-2 transition-colors">
                        <td className="px-3 py-3.5">
                          <p className="text-xs text-text font-mono">{formatDateFull(login.timestamp)}</p>
                          <p className="text-xs text-muted mt-0.5">{timeAgo(login.timestamp)}</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-muted flex-shrink-0" />
                            <span className="text-xs text-muted">{login.location}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs text-muted">{login.device}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs font-mono text-subtle">{login.ip}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              login.status === 'SUCCESS'
                                ? 'bg-success/10 text-success border-success/30'
                                : 'bg-danger/10 text-danger border-danger/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {login.status === 'SUCCESS' ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Trusted Devices ── */}
            {activeTab === 'devices' && (
              <div className="space-y-3">
                {DEMO_TRUSTED_DEVICES.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          device.trusted
                            ? 'bg-success/10 border border-success/30 text-success'
                            : 'bg-surface-3 border border-border text-muted'
                        }`}
                      >
                        {device.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{device.name}</p>
                        <p className="text-xs text-muted">Last seen {timeAgo(device.lastSeen)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.trusted ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 border border-success/30 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={11} />
                          Trusted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 border border-warning/30 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={11} />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <p className="text-xs text-muted text-center pt-2">
                  Contact support to remove an unrecognised device.
                </p>
              </div>
            )}

            {/* ── Security Events ── */}
            {activeTab === 'events' && (
              <div className="space-y-3">
                {DEMO_SECURITY_EVENTS.map((ev) => {
                  const style = eventTypeStyle(ev.type)
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-start gap-3 border rounded-xl px-4 py-3.5 ${style.bg}`}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold ${style.text}`}>{ev.event}</p>
                          <span className="text-xs text-subtle flex-shrink-0">{timeAgo(ev.timestamp)}</span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">{ev.detail}</p>
                        <p className="text-xs text-subtle mt-1 font-mono">{formatDateFull(ev.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={14} />
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

export default CustomerSecurityPage
