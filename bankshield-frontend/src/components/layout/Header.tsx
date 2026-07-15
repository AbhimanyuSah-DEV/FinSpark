import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Header: React.FC = () => {
  const { isLoggedIn, isAdmin, fullName, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-gold" />
          </div>
          <div className="leading-none">
            <span className="text-text font-bold text-lg">Bank</span>
            <span className="text-gold font-bold text-lg">Shield</span>
            <span className="text-muted font-medium text-sm ml-1">AI</span>
          </div>
        </Link>

        {/* Nav links (public) */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            {['Personal', 'Business', 'Loans', 'Cards', 'Support'].map(l => (
              <a key={l} href="#" className="hover:text-text transition-colors">{l}</a>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="hidden sm:block text-sm text-muted">
                {fullName}
              </span>
              {isAdmin && (
                <span className="text-xs bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-medium">
                  SOC Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className="btn-ghost text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login?role=user"  className="btn-ghost  text-sm">Customer Login</Link>
              <Link to="/login?role=admin" className="btn-primary text-sm">Admin Security Center</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
