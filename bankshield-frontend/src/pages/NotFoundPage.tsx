import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Home, AlertTriangle } from 'lucide-react'

// ── 404 Not Found Page ────────────────────────────────────────────────────────
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
    {/* Decorative background glow */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
    </div>

    <div className="relative flex flex-col items-center gap-6 max-w-md">
      {/* Icon cluster */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center">
          <Shield size={40} className="text-gold/40" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
          <AlertTriangle size={14} className="text-danger" />
        </div>
      </div>

      {/* 404 number */}
      <div className="flex items-baseline gap-1">
        <span className="text-8xl font-black text-surface-3 select-none">404</span>
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-2xl font-black">Page Not Found</h1>
        <p className="text-muted text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Our AI scanned every corner — it&apos;s definitely not here.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-border" />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          to="/"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-background font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200"
        >
          <Home size={16} />
          Back to Home
        </Link>
        <Link
          to="/login"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-border-light hover:border-gold/40 hover:bg-white/5 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200"
        >
          <Shield size={16} className="text-gold" />
          Login
        </Link>
      </div>

      {/* BankShield branding */}
      <p className="text-subtle text-xs">
        <span className="text-white font-bold">Bank</span>
        <span className="text-gold font-bold">Shield</span>
        <span className="text-muted font-medium"> AI</span>
        {' '}— Powered by Bank of Maharashtra
      </p>
    </div>
  </div>
)

export default NotFoundPage
