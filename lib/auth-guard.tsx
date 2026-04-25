"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, hasPendingOtp } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const publicRoutes = ["/login", "/register", "/verify-otp"]

<<<<<<< HEAD
    // ✅ allow OTP page ALWAYS
    if (pathname === "/verify-otp") return

    // ✅ if user has pending OTP → force OTP page
    if (hasPendingOtp) {
      router.replace("/verify-otp")
      return
    }

    // ✅ normal auth check
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, pathname, hasPendingOtp])
=======
    if (!isAuthenticated && !hasPendingOtp && !isPublic) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, hasPendingOtp, pathname, router])
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)

  return <>{children}</>
}
