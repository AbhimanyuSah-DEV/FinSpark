import React, { createContext, useContext, useState, useCallback } from 'react'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'
import { login as apiLogin } from '../api/auth.api'
import type { LoginPayload, TokenResponse } from '../types'

interface AuthState {
  token:    string | null
  role:     'USER' | 'ADMIN' | null
  userId:   string | null
  fullName: string | null
}

interface AuthContextValue extends AuthState {
  login:     (payload: LoginPayload) => Promise<TokenResponse>
  logout:    () => void
  isLoggedIn: boolean
  isAdmin:   boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const user  = localStorage.getItem(USER_KEY)
    if (token && user) {
      try { return { token, ...JSON.parse(user) } }
      catch { /* ignore */ }
    }
    return { token: null, role: null, userId: null, fullName: null }
  })

  const login = useCallback(async (payload: LoginPayload): Promise<TokenResponse> => {
    const res = await apiLogin(payload)
    const state: AuthState = {
      token:    res.access_token,
      role:     res.role,
      userId:   res.user_id,
      fullName: res.full_name,
    }
    localStorage.setItem(TOKEN_KEY, res.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify({ role: res.role, userId: res.user_id, fullName: res.full_name }))
    setAuth(state)
    return res
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuth({ token: null, role: null, userId: null, fullName: null })
  }, [])

  return (
    <AuthContext.Provider value={{
      ...auth,
      login,
      logout,
      isLoggedIn: !!auth.token,
      isAdmin:    auth.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
