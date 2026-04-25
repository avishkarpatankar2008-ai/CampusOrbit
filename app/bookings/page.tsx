"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { BookingCard, BookingCardSkeleton } from "@/components/booking-card"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBookings, updateBookingStatus, type Booking } from "@/lib/api"
import { Calendar, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"

async function fetchBookings(): Promise<Booking[]> {
  const result = await getBookings()
  return result.data?.bookings || []
}

const BOOKINGS_KEY = "bookings"

export default function BookingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, hasPendingOtp } = useAuth()



  const { data: bookings, isLoading } = useSWR<Booking[]>(
    isAuthenticated ? BOOKINGS_KEY : null,
    fetchBookings
  )

  const handleStatusChange = async (id: string, status: Booking["status"]) => {
    setUpdatingId(id)
    await updateBookingStatus(id, status)
    mutate(BOOKINGS_KEY)
    setUpdatingId(null)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const incomingBookings = bookings?.filter((b) => b.ownerId === user?.id) || []
  const outgoingBookings = bookings?.filter((b) => b.borrowerId === user?.id) || []
  const pendingIncoming = incomingBookings.filter((b) => b.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <AppSidebar />

        <main className="flex-1 p-4 lg:p-8">
          <div className="page-transition mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Bookings</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your rental requests and reservations
              </p>
            </div>

            <Tabs defaultValue="incoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incoming" className="gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Incoming
                  {pendingIncoming > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {pendingIncoming}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Outgoing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incoming" className="space-y-4">
                {isLoading ? (
                  <>
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                  </>
                ) : incomingBookings.length === 0 ? (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                        title="No incoming requests"
                        description="When someone wants to rent your items, their requests will appear here."
                        hindiText="अभी कुछ नहीं है"
                        marathiText="इथे अजून काही नाही"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  incomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      type="incoming"
                      onStatusChange={handleStatusChange}
                      isUpdating={updatingId === booking.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="outgoing" className="space-y-4">
                {isLoading ? (
                  <>
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                  </>
                ) : outgoingBookings.length === 0 ? (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                        title="No bookings yet"
                        description="Your rental requests and reservations will appear here."
                        hindiText="आप शुरुआत करें"
                        marathiText="तुम्ही पहिले बना"
                        action={{ label: "Browse Items", href: "/items" }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  outgoingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      type="outgoing"
                      onStatusChange={handleStatusChange}
                      isUpdating={updatingId === booking.id}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
