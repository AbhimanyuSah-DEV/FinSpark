import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary          from './components/common/ErrorBoundary'
import LandingPage            from './pages/LandingPage'
import LoginPage              from './pages/LoginPage'
import CustomerDashboardPage  from './pages/CustomerDashboardPage'
import CustomerSecurityPage   from './pages/CustomerSecurityPage'
import SecurityCenterPage     from './pages/SecurityCenterPage'
import NotFoundPage           from './pages/NotFoundPage'

// ── Route Guards ──────────────────────────────────────────────────────────────
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (isAdmin)     return <Navigate to="/soc"   replace />
  return <>{children}</>
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login"      replace />
  if (!isAdmin)    return <Navigate to="/dashboard"  replace />
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()
  if (isLoggedIn) return <Navigate to={isAdmin ? '/soc' : '/dashboard'} replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/"         element={<LandingPage />} />
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/dashboard" element={<UserRoute><CustomerDashboardPage /></UserRoute>} />
    <Route path="/security"  element={<UserRoute><CustomerSecurityPage /></UserRoute>} />
    <Route path="/soc"       element={<AdminRoute><SecurityCenterPage /></AdminRoute>} />
    <Route path="*"          element={<NotFoundPage />} />
  </Routes>
)

const App: React.FC = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)

export default App
