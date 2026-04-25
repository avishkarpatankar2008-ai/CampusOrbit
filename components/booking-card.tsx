"use client"

import type { Booking } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MessageCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface BookingCardProps {
  booking: Booking
  type: "incoming" | "outgoing"
  onStatusChange?: (id: string, status: Booking["status"]) => void
  isUpdating?: boolean
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  active: {
    label: "Active",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  returned: {
    label: "Returned",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
}

export function BookingCard({ booking, type, onStatusChange, isUpdating }: BookingCardProps) {
  const status = statusConfig[booking.status]
  const canApprove = type === "incoming" && booking.status === "pending"
  const canCancel = booking.status === "pending" || booking.status === "approved"
  const canMarkReturned = type === "incoming" && booking.status === "active"

  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-32 w-full shrink-0 sm:h-auto sm:w-32">
            {booking.itemImage ? (
              <img
                src={booking.itemImage}
                alt={booking.itemTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <span className="text-xs">No image</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{booking.itemTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {type === "incoming" ? `From: ${booking.borrowerName}` : `Owner: ${booking.ownerName}`}
                </p>
              </div>
              <Badge className={status.className}>{status.label}</Badge>
            </div>

            {/* Dates */}
            <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Message */}
            {booking.message && (
              <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">{booking.message}</p>
              </div>
            )}

            {/* Price and Actions */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
              <span className="text-lg font-bold text-primary">₹{booking.totalPrice}</span>

              {onStatusChange && (
                <div className="flex gap-2">
                  {canApprove && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(booking.id, "rejected")}
                        disabled={isUpdating}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(booking.id, "approved")}
                        disabled={isUpdating}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  {canMarkReturned && (
                    <Button
                      size="sm"
                      onClick={() => onStatusChange(booking.id, "returned")}
                      disabled={isUpdating}
                    >
                      Mark Returned
                    </Button>
                  )}
                  {canCancel && type === "outgoing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(booking.id, "cancelled")}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BookingCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="h-32 w-full shrink-0 animate-skeleton bg-muted sm:h-auto sm:w-32" />
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 h-5 w-40 animate-skeleton rounded bg-muted" />
                <div className="h-4 w-24 animate-skeleton rounded bg-muted" />
              </div>
              <div className="h-6 w-20 animate-skeleton rounded-full bg-muted" />
            </div>
            <div className="mb-3 flex gap-4">
              <div className="h-4 w-32 animate-skeleton rounded bg-muted" />
              <div className="h-4 w-24 animate-skeleton rounded bg-muted" />
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="h-6 w-16 animate-skeleton rounded bg-muted" />
              <div className="h-9 w-24 animate-skeleton rounded bg-muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
