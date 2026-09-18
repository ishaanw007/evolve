import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getToken, logout as apiLogout } from "@/lib/api"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  setUser: (user: User | null, token?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getToken()
    if (stored) {
      // Decode JWT payload to get user info (no verification — backend validates)
      try {
        const payload = JSON.parse(atob(stored.split(".")[1]))
        setUserState({ id: payload.id ?? payload.sub, email: payload.email, name: payload.name })
        setToken(stored)
      } catch {
        apiLogout()
      }
    }
    setLoading(false)
  }, [])

  function setUser(user: User | null, newToken?: string) {
    setUserState(user)
    if (newToken) setToken(newToken)
  }

  function logout() {
    apiLogout()
    setUserState(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
