"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient, type User, type LoginCredentials, type RegisterData } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount by calling backend
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          // No token -> not authenticated
          setUser(null)
          return
        }

        // Validate token with backend and sync latest user info
        const me = await apiClient.getCurrentUser()
        setUser(me)
        localStorage.setItem("user", JSON.stringify(me))
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("access_token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.login(credentials)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("access_token", response.access)
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.register(data)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("access_token", response.access)
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("access_token")
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
