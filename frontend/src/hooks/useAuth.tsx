"use client"
import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { apiGet, apiPost, setAuthToken, clearAuthToken, User } from '../lib/api-client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  name?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Restore auth from localStorage
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setAuthToken(storedToken)
      
      // Fetch user data
      apiGet('/auth/me')
        .then(res => setUser(res))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost('/auth/login', { email, password })
    const { token: newToken, user: userData } = res
    
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    setAuthToken(newToken)
    
    router.push('/')
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    const res = await apiPost('/auth/register', data)
    const { token: newToken } = res
    
    localStorage.setItem('token', newToken)
    setToken(newToken)
    
    // Fetch user data after registration
    const userRes = await apiGet('/auth/me')
    setUser(userRes)
    
    router.push('/')
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    clearAuthToken()
    router.push('/auth/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
