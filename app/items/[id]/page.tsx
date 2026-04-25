"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getItem, createBooking, type Item } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Calendar,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import { formatDistanceToNow, format, addDays } from "date-fns"

const conditionLabels = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
}

const conditionColors = {
  new: "bg-green-500/10 text-green-600 dark:text-green-400",
  "like-new": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  good: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fair: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

const priceUnitLabels = {
  hour: "per hour",
  day: "per day",
  week: "per week",
  month: "per month",
}

const fetcher = async (id: string) => {
  const result = await getItem(id)
  return result.data
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, hasPendingOtp } = useAuth()
  const itemId = params.id as string

  const { data: item, isLoading, error } = useSWR<Item | null>(
    itemId ? `item-${itemId}` : null,
    () => fetcher(itemId)
  )

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingData, setBookingData] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    message: "",
  })
  const { isAuthenticated, hasPendingOtp } = useAuth()
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    

    setIsBooking(true)
    const result = await createBooking({
      itemId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      message: bookingData.message,
    })

    if (result.data) {
      setBookingSuccess(true)
      setShowBookingForm(false)
    }
    setIsBooking(false)
  }

  const nextImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-32 rounded bg-muted" />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square rounded-xl bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-24 rounded bg-muted" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center">
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Item not found
              </h2>
              <p className="mb-4 text-muted-foreground">
                This item may have been removed or doesn&apos;t exist.
              </p>
              <Button asChild>
                <Link href="/items">Browse Items</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isOwner = user?.id === item.ownerId

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-transition">
          {/* Back Button */}
          <Link
            href="/items"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to items
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                {item.images?.[0] ? (
                  <>
                    <img
                      src={item.images[currentImageIndex]}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-background"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-background"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                          {item.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 w-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "bg-primary w-4"
                                  : "bg-background/60"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}

                {!item.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                    <Badge variant="secondary" className="text-base">
                      Currently Unavailable
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {item.images && item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge className={`border-0 ${conditionColors[item.condition]}`}>
                  {conditionLabels[item.condition]}
                </Badge>
              </div>

              <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                {item.title}
              </h1>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  ₹{item.price}
                </span>
                <span className="text-lg text-muted-foreground">
                  {priceUnitLabels[item.priceUnit]}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-2 font-semibold text-foreground">Description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="mb-6 space-y-3">
                {item.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Listed {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Owner */}
              <Card className="mb-6 border-border bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  {item.ownerAvatar ? (
                    <img
                      src={item.ownerAvatar}
                      alt={item.ownerName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                      {item.ownerName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.ownerName}</p>
                    <p className="text-sm text-muted-foreground">Owner</p>
                  </div>
                  {!isOwner && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/chat?user=${item.ownerId}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Booking Section */}
              {bookingSuccess ? (
                <Card className="border-green-500/20 bg-green-500/10">
                  <CardContent className="flex items-center gap-4 p-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-foreground">Booking Request Sent!</p>
                      <p className="text-sm text-muted-foreground">
                        The owner will review your request and get back to you.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : showBookingForm ? (
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <h3 className="mb-4 font-semibold text-foreground">Book this item</h3>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) =>
                              setBookingData((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                            min={format(new Date(), "yyyy-MM-dd")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={bookingData.endDate}
                            onChange={(e) =>
                              setBookingData((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                            min={bookingData.startDate}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message to owner (optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Introduce yourself and explain why you need this item..."
                          value={bookingData.message}
                          onChange={(e) =>
                            setBookingData((prev) => ({ ...prev, message: e.target.value }))
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1 btn-glow" disabled={isBooking}>
                          {isBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              Send Request
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                !isOwner &&
                item.available && (
                  <Button
                    size="lg"
                    className="w-full btn-glow"
                    onClick={() => {
                      if (!isAuthenticated && !hasPendingOtp) {
                        router.push("/login")
                      } else {
                        setShowBookingForm(true)
                      }
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Now
                  </Button>
                )
              )}

              {isOwner && (
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This is your listing. You can edit it from your dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
