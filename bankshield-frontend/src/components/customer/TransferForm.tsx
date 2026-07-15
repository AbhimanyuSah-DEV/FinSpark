import React, { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Send, AlertCircle, CheckCircle2, Sparkles, Loader2, Lock } from 'lucide-react'
import { submitTransfer } from '../../api/user.api'
import RiskBadge from '../common/RiskBadge'
import type { TransferResponse } from '../../types'
import { getGeoDataFromIP } from '../../utils/geolocation'

interface TransferFormProps {
  onTransferComplete: (result: TransferResponse) => void
}

type TxType = 'TRANSFER' | 'PAYMENT' | 'WITHDRAWAL'

interface FormState {
  receiverAccount: string
  amount: string
  txType: TxType
  password: string
  description: string
}

const INITIAL_FORM: FormState = {
  receiverAccount: '',
  amount: '',
  txType: 'TRANSFER',
  password: '',
  description: '',
}

const TransferForm: React.FC<TransferFormProps> = ({ onTransferComplete }) => {
  const [open, setOpen] = useState(true)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // State
  const [pipelineStage, setPipelineStage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [pipelineError, setPipelineError] = useState<string | undefined>()
  const [result, setResult] = useState<TransferResponse | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.receiverAccount.trim()) errs.receiverAccount = 'Account number is required'
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount'
    if (amt > 10_00_000) errs.amount = 'Amount cannot exceed ₹10,00,000'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const advancePipeline = (apiCallPromise: Promise<TransferResponse>) => {
    setPipelineStage(1)
    
    // We simulate a short delay for UX, but don't show the full pipeline UI anymore
    // We just wait for the API call to complete
    apiCallPromise
      .then((res) => {
        setPipelineStage(8)
        setResult(res)
        onTransferComplete(res)
      })
      .catch((err) => {
        setPipelineError(
          err?.response?.data?.detail ?? err?.message ?? 'Transfer failed. Please try again.',
        )
        setPipelineStage(0)
        setSubmitting(false)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setPipelineError(undefined)
    setResult(null)
    setSubmitting(true)

    // Get live location and IP (async, non-blocking if slow)
    const geoData = await getGeoDataFromIP()

    const promise = submitTransfer({
      receiver_account: form.receiverAccount.trim(),
      amount: parseFloat(form.amount),
      transaction_type: form.txType,
      password: form.password,
      description: form.description.trim() || undefined,
      device: navigator.userAgent.slice(0, 80),
      location: geoData.location,
      ip_address: geoData.ip,
    })

    advancePipeline(promise)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setPipelineStage(0)
    setPipelineError(undefined)
    setResult(null)
    setSubmitting(false)
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => !submitting && setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
            <Send size={13} className="text-gold" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-text">New Transfer</p>
            <p className="text-xs text-muted">Send money securely via BrainCore AI</p>
          </div>
        </div>
        <span className="text-muted">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {/* If completed: show result */}
          {result && pipelineStage === 8 ? (
            <div className="space-y-4">
              {/* ── Animated tick / cross ── */}
              <div className="flex flex-col items-center py-4">
                {result.transaction?.status === 'BLOCKED' ? (
                  /* Animated red cross for blocked */
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="4"
                      strokeDasharray="226"
                      strokeDashoffset="226"
                      style={{
                        animation: 'drawCircle 0.5s ease forwards',
                      }}
                    />
                    <line
                      x1="26" y1="26" x2="54" y2="54"
                      stroke="#DC2626" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray="40"
                      strokeDashoffset="40"
                      style={{ animation: 'drawLine 0.3s ease 0.5s forwards' }}
                    />
                    <line
                      x1="54" y1="26" x2="26" y2="54"
                      stroke="#DC2626" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray="40"
                      strokeDashoffset="40"
                      style={{ animation: 'drawLine 0.3s ease 0.7s forwards' }}
                    />
                    <style>{`
                      @keyframes drawCircle {
                        to { stroke-dashoffset: 0; }
                      }
                      @keyframes drawLine {
                        to { stroke-dashoffset: 0; }
                      }
                    `}</style>
                  </svg>
                ) : (
                  /* Animated green tick for approved */
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke={result.risk_level === 'LOW' ? '#16A34A' : result.risk_level === 'MEDIUM' ? '#F59E0B' : '#F97316'}
                      strokeWidth="4"
                      strokeDasharray="226"
                      strokeDashoffset="226"
                      style={{ animation: 'drawCircle 0.5s ease forwards' }}
                    />
                    <polyline
                      points="24,42 36,54 56,28"
                      fill="none"
                      stroke={result.risk_level === 'LOW' ? '#16A34A' : result.risk_level === 'MEDIUM' ? '#F59E0B' : '#F97316'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="50"
                      strokeDashoffset="50"
                      style={{ animation: 'drawLine 0.4s ease 0.5s forwards' }}
                    />
                    <style>{`
                      @keyframes drawCircle {
                        to { stroke-dashoffset: 0; }
                      }
                      @keyframes drawLine {
                        to { stroke-dashoffset: 0; }
                      }
                    `}</style>
                  </svg>
                )}

                <p className="text-sm font-bold text-text mt-3">
                  {result.transaction?.status === 'BLOCKED' ? 'Transaction Blocked' : 'Transfer Complete'}
                </p>
                <div className="mt-1">
                  <RiskBadge level={result.risk_level} size="sm" />
                </div>
              </div>

              {/* Result summary card */}
              <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-3">
                {result.ai_summary && (
                  <div className="bg-background/40 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={12} className="text-gold" />
                      <span className="text-xs font-semibold text-gold uppercase tracking-widest">
                        AI Analysis
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{result.ai_summary}</p>
                  </div>
                )}

                {result.fraud_reasons?.length > 0 && (
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-warning mb-1.5">Risk Signals Detected</p>
                    <ul className="space-y-1">
                      {result.fraud_reasons.map((r, i) => (
                        <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                          <AlertCircle size={10} className="text-warning mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-semibold text-sm py-2 rounded-lg transition-colors"
                >
                  Make Another Transfer
                </button>
              </div>
            </div>

          ) : submitting ? (
            /* Simple loading state */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Loader2 size={32} className="text-gold animate-spin mb-4" />
              <p className="text-sm font-semibold text-text">Processing Transfer...</p>
              <p className="text-xs text-muted mt-1">Securing transaction with BrainCore AI</p>
            </div>
          ) : (
            /* The form */
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Receiver account */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Receiver Account Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACC-20250001"
                  value={form.receiverAccount}
                  onChange={(e) => updateField('receiverAccount', e.target.value)}
                  className={`w-full bg-surface-2 border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors ${
                    errors.receiverAccount ? 'border-danger/60' : 'border-border'
                  }`}
                />
                {errors.receiverAccount && (
                  <p className="text-xs text-danger mt-1">{errors.receiverAccount}</p>
                )}
              </div>

              {/* Amount + type row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Amount (₹) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    className={`w-full bg-surface-2 border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors ${
                      errors.amount ? 'border-danger/60' : 'border-border'
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-xs text-danger mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Transaction type */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Transaction Type
                  </label>
                  <select
                    value={form.txType}
                    onChange={(e) => updateField('txType', e.target.value as TxType)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="TRANSFER">Transfer</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                  </select>
                </div>
              </div>

              {/* Description & Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Description{' '}
                    <span className="text-subtle font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rent payment"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1.5">
                    <Lock size={12} className="text-gold" />
                    Security Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full bg-surface-2 border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors ${
                      errors.password ? 'border-danger/60' : 'border-border'
                    }`}
                  />
                  {errors.password && (
                    <p className="text-xs text-danger mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Error banner */}
              {pipelineError && (
                <div className="flex items-start gap-2.5 bg-danger/10 border border-danger/30 rounded-lg px-3.5 py-3">
                  <AlertCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">{pipelineError}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-background font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200"
                >
                  <Send size={15} />
                  Initiate Transfer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_FORM)
                    setErrors({})
                    setPipelineError(undefined)
                  }}
                  className="px-4 py-2.5 border border-border hover:border-border-light text-muted hover:text-text text-sm font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Security notice */}
              <p className="text-center text-xs text-subtle flex items-center justify-center gap-1.5">
                <CheckCircle2 size={11} className="text-success" />
                All transfers are verified by BrainCore AI in real-time
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default TransferForm
