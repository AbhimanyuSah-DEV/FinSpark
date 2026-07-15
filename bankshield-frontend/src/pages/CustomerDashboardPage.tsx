import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/layout/Header'
import Loader from '../components/common/Loader'
import BalanceCard from '../components/customer/BalanceCard'
import TransferForm from '../components/customer/TransferForm'
import TransactionTable from '../components/customer/TransactionTable'
import ProfileCard from '../components/customer/ProfileCard'
import SecurityWidget from '../components/customer/SecurityWidget'
import QuickActions from '../components/customer/QuickActions'
import { getUserDashboard } from '../api/user.api'
import type { UserDashboard, TransferResponse } from '../types'

const CustomerDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const transferSectionRef = useRef<HTMLDivElement>(null)
  const txSectionRef = useRef<HTMLDivElement>(null)

  const fetchDashboard = () => {
    setLoading(true)
    getUserDashboard()
      .then((data) => {
        setDashboard(data)
        setError(null)
      })
      .catch(() => setError('Failed to load your dashboard. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const scrollToTransfer = () => {
    transferSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTransactions = () => {
    txSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleTransferComplete = (result: TransferResponse) => {
    // Refresh dashboard data to show updated balance
    if (result.transaction?.status === 'COMPLETED' || result.transaction?.status === 'FLAGGED') {
      setTimeout(fetchDashboard, 1200)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Page title row */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">
            {dashboard ? `Welcome back, ${dashboard.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {dashboard
              ? `${dashboard.total_transactions} total transactions · Account secured by BrainCore AI`
              : 'Your personal banking command centre'}
          </p>
        </div>

        {/* Loading */}
        {loading && <Loader text="Loading your dashboard…" />}

        {/* Error */}
        {!loading && error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
            <p className="text-danger text-sm font-medium">{error}</p>
            <button
              onClick={fetchDashboard}
              className="mt-3 text-xs text-muted hover:text-text underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main layout */}
        {!loading && !error && dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── Left column (span 2) ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <BalanceCard
                accountNumber={dashboard.account_number}
                balance={dashboard.balance}
                fullName={dashboard.full_name}
                onTransferClick={scrollToTransfer}
                onHistoryClick={scrollToTransactions}
              />

              {/* Transfer form */}
              <div ref={transferSectionRef}>
                <TransferForm onTransferComplete={handleTransferComplete} />
              </div>

              {/* Transaction table */}
              <div ref={txSectionRef}>
                <TransactionTable transactions={dashboard.recent_transactions} />
              </div>
            </div>

            {/* ── Right column (span 1) ── */}
            <div className="lg:col-span-1 flex flex-col gap-5">
              <ProfileCard
                fullName={dashboard.full_name}
                username={
                  dashboard.full_name.toLowerCase().replace(/\s+/g, '.') + '@bank'
                }
                accountNumber={dashboard.account_number}
              />
              <SecurityWidget />
              <QuickActions
                onTransferClick={scrollToTransfer}
                onHistoryClick={scrollToTransactions}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CustomerDashboardPage
