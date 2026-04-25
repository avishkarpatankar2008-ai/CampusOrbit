"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { fetchApi } from "./api"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  college?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  hasPendingOtp: boolean
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean }>
  verifyOtp: (otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  college?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPendingOtp, setHasPendingOtp] = useState(false)

  // 🔹 Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem("token")
    const pendingUser = localStorage.getItem("pending_user_id")
    const pendingEmail = localStorage.getItem("pending_email")

    if (pendingUser || pendingEmail) {
      setHasPendingOtp(true)
    }

    if (!token) {
      setIsLoading(false)
      return
    }

    fetchApi("/api/auth/me")
      .then((result) => {
        if (result.data?.user) {
          setUser(result.data.user)
        } else {
          localStorage.removeItem("token")
        }
      })
      .catch(() => {
        localStorage.removeItem("token")
      })
      .finally(() => setIsLoading(false))
  }, [])

  // 🔹 Register
<<<<<<< HEAD
 
const register = useCallback(async (data: RegisterData) => {
  try {
    const result = await fetchApi<RegisterResponse>("/api/auth/register", {
=======
 // 🔹 Register
const register = useCallback(async (data: RegisterData) => {
  try {
    const result = await fetchApi("/api/auth/register", {
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)
      method: "POST",
      body: JSON.stringify(data),
    })

<<<<<<< HEAD
=======
    console.log("REGISTER RESPONSE:", result)

>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)
    if (result.error) {
      return { success: false, error: result.error }
    }

<<<<<<< HEAD
    const userId = getUserId(result.data ?? undefined)

    // If backend returned a token (rare in register)
    const token = result.data?.access_token ?? result.data?.token
    if (token) {
      localStorage.setItem("token", token)
      localStorage.removeItem("pending_user_id")
      localStorage.removeItem("pending_email")
      setHasPendingOtp(false)

      const meResult = await fetchApi<AuthUserResponse>("/api/auth/me")
      if (meResult.data?.user) setUser(meResult.data.user)

      return { success: true, requiresOtp: false, user_id: userId }
    }

    // Default: registration requires OTP
    if (userId) {
      localStorage.setItem("pending_user_id", String(userId))
    }
    localStorage.setItem("pending_email", data.email)
    setHasPendingOtp(true)

    return { success: true, requiresOtp: true, user_id: userId }
=======
    const userId =
      result.user_id ??   // ✅ MAIN FIX
      result.data?.user_id ??
      result.data?.id ??
      result.data?.userId ??
      result.data?.user?._id

    if (userId) {
      localStorage.setItem("pending_user_id", String(userId))
    }

    localStorage.setItem("pending_email", data.email)
    setHasPendingOtp(true)

    return { success: true }
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}, [])
<<<<<<< HEAD

=======
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)

  // 🔹 Login
  const login = useCallback(async (email: string, password: string) => {
  try {
    const result = await fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    console.log("LOGIN RESPONSE:", result)

    if (result.error) {
      return { success: false, error: result.error }
    }

    // ✅ CASE 1: USER ALREADY VERIFIED (NORMAL LOGIN)
   if (result.data?.access_token || result.data?.token) {
      const token = result.data.access_token ?? result.data.token
      localStorage.setItem("token", token)

      // clear pending data
      localStorage.removeItem("pending_user_id")
      localStorage.removeItem("pending_email")
      setHasPendingOtp(false)

      // set user
      if (result.data?.user) {
        setUser(result.data.user)
      } else {
        const meResult = await fetchApi("/api/auth/me")
        if (meResult.data?.user) setUser(meResult.data.user)
      }

      return { success: true, requiresOtp: false }
    }

    // ✅ CASE 2: OTP REQUIRED
    if (
      result.data?.requires_otp ||
      result.data?.requiresOtp ||
      result.requires_otp ||     // 🔥 extra safety
      result.requiresOtp
    ) {
      const userId =
        result.user_id ??                 // 🔥 important
        result.data?.user_id ??
        result.data?.id ??
        result.data?.userId ??
        result.data?.user?._id

      // ✅ SAVE BOTH VALUES (CRITICAL)
      if (userId) {
        localStorage.setItem("pending_user_id", String(userId))
      }

      localStorage.setItem("pending_email", email)
      setHasPendingOtp(true)

      return { success: true, requiresOtp: true }
    }

    return { success: false, error: "Unexpected response from server." }
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}, [])

  // 🔹 Verify OTP
  const verifyOtp = useCallback(async (otp: string) => {
    try {
      const userId = localStorage.getItem("pending_user_id")
      const email = localStorage.getItem("pending_email")

      const payload: Record<string, string> = { otp }
      if (userId) payload.user_id = userId

      const result = await fetchApi("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (result.error) {
        return { success: false, error: result.error }
      }

      const token = result.data?.access_token ?? result.data?.token
      if (!token) {
        return { success: false, error: "Verification failed" }
      }

      localStorage.setItem("token", token)
      localStorage.removeItem("pending_user_id")
      localStorage.removeItem("pending_email")
      setHasPendingOtp(false)

      if (result.data?.user) {
        setUser(result.data.user)
      } else {
        const meResult = await fetchApi("/api/auth/me")
        if (meResult.data?.user) setUser(meResult.data.user)
      }

      return { success: true }
    } catch {
      return { success: false, error: "Network error. Please try again." }
    }
  }, [])

  // 🔹 Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("pending_user_id")
    localStorage.removeItem("pending_email")
    setUser(null)
    setHasPendingOtp(false)
  }, [])

  const refreshUser = useCallback(async () => {
    const result = await fetchApi("/api/auth/me")
    if (result.data?.user) setUser(result.data.user)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasPendingOtp,
        register,
        login,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
