import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  open:        boolean
  title:       string
  message:     string
  confirmText: string
  confirmClass?: string   // tailwind classes for confirm button
  onConfirm:   () => void
  onCancel:    () => void
  loading?:    boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, title, message, confirmText, confirmClass, onConfirm, onCancel, loading,
}) => {
  // Lock scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-danger/10 border border-danger/25 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-danger" />
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-text text-center mb-2">{title}</h3>
        <p className="text-sm text-muted text-center leading-relaxed mb-6">{message}</p>

        {/* Reason input */}
        <textarea
          id="confirm-reason"
          placeholder="Reason (optional)"
          rows={2}
          className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 mb-4 resize-none"
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border text-muted hover:text-text hover:border-border-light text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              confirmClass ?? 'bg-danger hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
