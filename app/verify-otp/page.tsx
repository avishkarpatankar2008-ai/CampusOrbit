"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { CampusOrbitLogo } from "@/components/campus-orbit-logo"

export default function VerifyOtpPage() {
  const router = useRouter()
<<<<<<< HEAD
  const params = useSearchParams()
  const userId = params.get("userId") // ✅ read userId from query string
  const { isAuthenticated, isLoading: authLoading } = useAuth()
=======
  const { verifyOtp } = useAuth()
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // ✅ Load email safely (client-side only)
  useEffect(() => {
    const email = localStorage.getItem("pending_email")
<<<<<<< HEAD
    if (email) {
      setPendingEmail(email)
    }
    inputRefs.current[0]?.focus()

    if (!userId) {
      // If no userId, fallback to login
      router.replace("/login")
    }
  }, [authLoading, isAuthenticated, router, userId])
=======

    if (email) {
      setPendingEmail(email)
    } else {
      console.warn("No pending email found")
    }
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)

    // focus first input
    inputRefs.current[0]?.focus()
  }, [])

  // ✅ OTP resend timer
  useEffect(() => {
    if (resendTimer === 0) return

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendTimer])

  // ✅ Handle OTP input
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // ✅ Submit OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter complete 6-digit OTP")
      return
    }

    setIsLoading(true)
<<<<<<< HEAD
=======

    const result = await verifyOtp(otpString)
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, otp: otpString }),
      }).then(r => r.json())

      if (res.success) {
        router.replace("/login") // ✅ after OTP success, go to login
      } else {
        setError(res.message || "Invalid OTP")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/">
            <CampusOrbitLogo size="sm" />
          </Link>
          <Link href="/register" className="text-sm text-muted-foreground">
            <ArrowLeft className="inline h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-8 w-8 text-primary" />
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>
              {pendingEmail
                ? `Code sent to ${pendingEmail}`
<<<<<<< HEAD
                : "Enter the 6-digit OTP"}
=======
                : "Enter the OTP sent to your email"}
>>>>>>> f45d87a (fix: complete OTP verification flow + auth fixes)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error */}
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-12 text-center text-lg"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* Resend Timer */}
              <div className="text-center text-sm text-muted-foreground">
                {resendTimer > 0 ? (
                  <>Resend OTP in {resendTimer}s</>
                ) : (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      // optional: call resend API here
                      setResendTimer(60)
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}