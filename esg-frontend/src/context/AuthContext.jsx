import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, logoutRequest, getStoredUser } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    const result = await loginRequest(credentials)
    setUser(result.user)
    return result
  }

  const logout = () => {
    logoutRequest()
    setUser(null)
  }

  const value = { user, isAuthenticated: Boolean(user), isLoading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
