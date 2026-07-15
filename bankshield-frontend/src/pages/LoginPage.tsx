import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, User, Lock, AlertCircle, Loader2, Eye, EyeOff, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGeoDataFromIP, parseUserAgent } from '../utils/geolocation'

// ── Tab type ──────────────────────────────────────────────────────────────────
type TabRole = 'user' | 'admin'

// ── Demo credential hint ───────────────────────────────────────────────────────
interface DemoHintProps {
  role: TabRole
}

const DemoHint: React.FC<DemoHintProps> = ({ role }) => (
  <div className="flex items-start gap-2 bg-gold/8 border border-gold/20 rounded-xl px-4 py-3 text-xs">
    <Shield size={13} className="text-gold mt-0.5 shrink-0" />
    <div className="text-muted leading-snug">
      <span className="text-gold font-semibold">Demo credentials: </span>
      {role === 'user' ? (
        <>
          Username: <span className="text-white font-mono">rahul_sharma</span>{' '}
          &nbsp;/&nbsp; Password: <span className="text-white font-mono">demo123</span>
        </>
      ) : (
        <>
          Username: <span className="text-white font-mono">admin</span>{' '}
          &nbsp;/&nbsp; Password: <span className="text-white font-mono">admin123</span>
        </>
      )}
    </div>
  </div>
)

// ── Main LoginPage ─────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  // Tab state — driven by ?role= query param
  const [activeTab, setActiveTab] = useState<TabRole>(() => {
    const param = searchParams.get('role')
    return param === 'admin' ? 'admin' : 'user'
  })

  // Sync tab when URL param changes
  useEffect(() => {
    const param = searchParams.get('role')
    setActiveTab(param === 'admin' ? 'admin' : 'user')
  }, [searchParams])

  // Form state
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // Reset form when tab switches
  const handleTabChange = (tab: TabRole) => {
    setActiveTab(tab)
    setUsername('')
    setPassword('')
    setError(null)
    setShowPass(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Fetch location and IP before logging in
      const geoData = await getGeoDataFromIP()
      const friendlyDevice = parseUserAgent(navigator.userAgent)
      const res = await login({
        username:   username.trim(),
        password:   password.trim(),
        device:     friendlyDevice,
        browser:    friendlyDevice,
        location:   geoData.location,
        ip_address: geoData.ip,
      })
      if (res.role === 'ADMIN') {
        navigate('/soc')
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo link */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-gold" />
        </div>
        <span className="text-white font-black text-2xl">
          Bank<span className="text-gold">Shield</span>{' '}
          <span className="text-muted font-medium text-sm">AI</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-border">
          <button
            type="button"
            onClick={() => handleTabChange('user')}
            className={`py-4 text-sm font-semibold transition-colors duration-150 ${
              activeTab === 'user'
                ? 'bg-surface text-gold border-b-2 border-gold'
                : 'bg-surface-2 text-muted hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <User size={15} />
              Customer Login
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-4 text-sm font-semibold transition-colors duration-150 ${
              activeTab === 'admin'
                ? 'bg-surface text-gold border-b-2 border-gold'
                : 'bg-surface-2 text-muted hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Shield size={15} />
              Admin Security Center
            </span>
          </button>
        </div>

        {/* Form body */}
        <div className="p-8 flex flex-col gap-6">
          {/* Context heading */}
          <div>
            <h1 className="text-white font-black text-xl leading-tight">
              {activeTab === 'user' ? 'Welcome Back' : 'Security Operations Center'}
            </h1>
            <p className="text-muted text-sm mt-1">
              {activeTab === 'user'
                ? 'Sign in to access your secure banking portal.'
                : 'Authenticate to access the SOC admin dashboard.'}
            </p>
          </div>

          {/* Demo hint */}
          <DemoHint role={activeTab} />

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-muted uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'user' ? 'rahul_sharma' : 'admin'}
                  disabled={loading}
                  className="w-full bg-surface-2 border border-border focus:border-gold/60 focus:ring-2 focus:ring-gold/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-subtle outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-muted uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-surface-2 border border-border focus:border-gold/60 focus:ring-2 focus:ring-gold/20 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-subtle outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed text-background font-bold text-sm py-3.5 rounded-xl transition-colors duration-200 shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  {activeTab === 'user' ? <User size={16} /> : <Shield size={16} />}
                  {activeTab === 'user' ? 'Sign In' : 'Access SOC'}
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center text-xs text-subtle">
            {activeTab === 'user' ? (
              <span>
                Need admin access?{' '}
                <button
                  type="button"
                  className="text-gold hover:underline font-medium"
                  onClick={() => handleTabChange('admin')}
                >
                  Switch to Admin
                </button>
              </span>
            ) : (
              <span>
                Customer?{' '}
                <button
                  type="button"
                  className="text-gold hover:underline font-medium"
                  onClick={() => handleTabChange('user')}
                >
                  Switch to Customer Login
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Back to home */}
      <Link to="/" className="mt-6 text-xs text-subtle hover:text-muted transition-colors">
        ← Back to Home
      </Link>
    </div>
  )
}

export default LoginPage
