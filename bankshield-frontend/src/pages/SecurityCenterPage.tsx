import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Shield, Clock, AlertCircle } from 'lucide-react'
import type { AdminDashboard, Incident, QuantumOverview } from '../types'
import { getAdminDashboard, getQuantumOverview } from '../api/admin.api'
import { REFRESH_INTERVAL } from '../utils/constants'
import { formatDateTime } from '../utils/formatters'

import SOCSidebar         from '../components/layout/SOCSidebar'
import Header             from '../components/layout/Header'
import Loader             from '../components/common/Loader'
import DashboardCards     from '../components/soc/DashboardCards'
import ThreatIntelOverview from '../components/soc/ThreatIntelOverview'
import AIInvestigator     from '../components/soc/AIInvestigator'
import LiveTransactionTable from '../components/soc/LiveTransactionTable'
import IncidentQueue      from '../components/soc/IncidentQueue'
import QuantumWidget      from '../components/soc/QuantumWidget'
import IncidentDrawer     from '../components/soc/IncidentDrawer'
import AIChat             from '../components/soc/AIChat'

const SecurityCenterPage: React.FC = () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [dashboard,    setDashboard]    = useState<AdminDashboard | null>(null)
  const [quantumData,  setQuantumData]  = useState<QuantumOverview | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [lastUpdated,  setLastUpdated]  = useState<string | null>(null)

  // Selected incident in the queue (drives AIInvestigator)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // Drawer state — opened by clicking a row in the queue a second time
  // or via a dedicated drawer call (clicking the same row twice opens the drawer)
  const [drawerIncidentId, setDrawerIncidentId] = useState<string | null>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else        setIsRefreshing(true)
    setError(null)

    try {
      const [dash, quantum] = await Promise.all([
        getAdminDashboard(),
        getQuantumOverview(),
      ])
      setDashboard(dash)
      setQuantumData(quantum)
      setLastUpdated(new Date().toISOString())

      // If a selected incident is in the refreshed list, update it
      if (selectedIncident) {
        const refreshed = dash.recent_incidents.find(
          (inc) => inc.incident_id === selectedIncident.incident_id
        )
        if (refreshed) setSelectedIncident(refreshed)
      }
    } catch {
      setError('Failed to load Security Operations data. Check your connection and try again.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedIncident])

  // Mount + auto-refresh
  useEffect(() => {
    fetchAll(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setInterval(() => fetchAll(true), REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchAll])

  // ── Incident selection ────────────────────────────────────────────────────
  const handleIncidentSelect = (incidentId: string) => {
    const inc = dashboard?.recent_incidents.find((i) => i.incident_id === incidentId) ?? null
    setSelectedIncident(inc)
    // Open drawer immediately on first click
    setDrawerIncidentId(incidentId)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <SOCSidebar />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Sticky header */}
        <Header />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 pb-8">

          {/* ── Page title row ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-6 pb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Shield size={16} className="text-gold" />
                </div>
                <h1 className="text-xl font-bold text-text tracking-tight">
                  Security Operations Center
                </h1>
              </div>
              <p className="text-sm text-muted ml-10">
                Real-time threat monitoring, AI-powered fraud detection &amp; quantum risk intelligence
              </p>
              {lastUpdated && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-10">
                  <Clock size={11} className="text-muted" />
                  <span className="text-[11px] text-muted">
                    Last updated {formatDateTime(lastUpdated)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => fetchAll(true)}
              disabled={isRefreshing || loading}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg
                border border-gold/30 bg-gold/10 text-gold text-sm font-semibold
                hover:bg-gold/20 hover:border-gold/50
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                flex-shrink-0
              "
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing…' : 'Refresh Now'}
            </button>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-danger/30 bg-danger/10 mb-5">
              <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">Data Fetch Error</p>
                <p className="text-xs text-danger/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── Full-page loader (first load only) ── */}
          {loading && !dashboard && (
            <div className="flex items-center justify-center py-32">
              <Loader text="Loading Security Operations Center…" />
            </div>
          )}

          {/* ── Dashboard content ── */}
          {dashboard && (
            <div className="space-y-5">

              {/* 1. KPI Cards */}
              <section id="dashboard">
                <DashboardCards kpi={dashboard.kpi} />
              </section>

              {/* 2. Two-column: ThreatIntelOverview (60%) + AIInvestigator (40%) */}
              <section id="threats">
                <div className="flex flex-col xl:flex-row gap-5" style={{ minHeight: 480 }}>
                  <div className="xl:w-3/5 min-w-0">
                    <ThreatIntelOverview incidents={dashboard.recent_incidents} />
                  </div>
                  <div className="xl:w-2/5 min-w-0">
                    <AIInvestigator incident={selectedIncident} />
                  </div>
                </div>
              </section>

              {/* 3. Live Transaction Table */}
              <section id="live">
                <LiveTransactionTable
                  transactions={dashboard.recent_transactions}
                  onRefresh={() => fetchAll(true)}
                  isRefreshing={isRefreshing}
                />
              </section>

              {/* 4. Incident Queue */}
              <section id="incidents">
                <IncidentQueue
                  incidents={dashboard.recent_incidents}
                  onSelect={handleIncidentSelect}
                  selectedId={selectedIncident?.incident_id}
                />
              </section>

              {/* 5. Quantum Widget */}
              <section id="quantum">
                <QuantumWidget quantumData={quantumData} />
              </section>

            </div>
          )}
        </main>
      </div>

      {/* ── Incident Detail Drawer ── */}
      <IncidentDrawer
        incidentId={drawerIncidentId}
        onClose={() => setDrawerIncidentId(null)}
      />

      {/* ── AI Chat floating widget ── */}
      <AIChat incidentId={selectedIncident?.incident_id} />
    </div>
  )
}

export default SecurityCenterPage
