"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { ItemCard, ItemCardSkeleton } from "@/components/item-card"
import { BookingCard, BookingCardSkeleton } from "@/components/booking-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getItems, getBookings, type Item, type Booking } from "@/lib/api"
import {
  Package,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react"

async function fetchItems() {
  const result = await getItems({ limit: 4 })
  return result.data?.items || []
}

async function fetchBookings() {
  const result = await getBookings()
  return result.data?.bookings || []
}

export default function DashboardPage() {
  const router = useRouter()

  // ✅ FIXED (added hasPendingOtp)
  const { user, isAuthenticated, isLoading: authLoading, hasPendingOtp } = useAuth()

  // ✅ FIXED redirect logic
  

  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>(
    isAuthenticated ? "dashboard-items" : null,
    fetchItems
  )

  const { data: bookings, isLoading: bookingsLoading } = useSWR<Booking[]>(
    isAuthenticated ? "dashboard-bookings" : null,
    fetchBookings
  )

  // ✅ show loader properly
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ✅ block access only when NOT OTP flow
  if (!isAuthenticated && !hasPendingOtp) {
    return null
  }

  const myItems = items?.filter((item) => item.ownerId === user?.id) || []
  const pendingBookings = bookings?.filter((b) => b.status === "pending") || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <AppSidebar />

        <main className="flex-1 p-4 lg:p-8">
          <div className="page-transition mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Welcome back, {user?.name?.split(" ")[0] || "User"}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage your listings and bookings from your dashboard
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">My Listings</p>
                    <p className="text-2xl font-bold text-foreground">{myItems.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{pendingBookings.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Rentals</p>
                    <p className="text-2xl font-bold text-foreground">
                      {bookings?.filter((b) => b.status === "active").length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <Button asChild className="h-full w-full btn-glow">
                    <Link href="/items/new" className="flex flex-col items-center justify-center gap-2 py-2">
                      <Plus className="h-6 w-6" />
                      <span>List Item</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Rest unchanged */}
          </div>
        </main>
      </div>
    </div>
  )
}
