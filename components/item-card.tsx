"use client"

import Link from "next/link"
import type { Item } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ItemCardProps {
  item: Item
}

const conditionColors = {
  new: "bg-green-500/10 text-green-600 dark:text-green-400",
  "like-new": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  good: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fair: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

const conditionLabels = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
}

export function ItemCard({ item }: ItemCardProps) {
  const priceUnitLabels = {
    hour: "/hr",
    day: "/day",
    week: "/wk",
    month: "/mo",
  }

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="card-hover group h-full overflow-hidden border-border bg-card transition-all">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-sm">No image</span>
            </div>
          )}
          
          {/* Availability Badge */}
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Badge variant="secondary" className="text-sm">
                Currently Unavailable
              </Badge>
            </div>
          )}

          {/* Condition Badge */}
          <Badge
            className={`absolute right-2 top-2 border-0 ${conditionColors[item.condition]}`}
          >
            {conditionLabels[item.condition]}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>

          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>

          {/* Price */}
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              ₹{item.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {priceUnitLabels[item.priceUnit]}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{item.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ItemCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-border bg-card">
      <div className="aspect-[4/3] animate-skeleton bg-muted" />
      <CardContent className="p-4">
        <div className="mb-2 h-5 w-3/4 animate-skeleton rounded bg-muted" />
        <div className="mb-1 h-4 w-full animate-skeleton rounded bg-muted" />
        <div className="mb-3 h-4 w-2/3 animate-skeleton rounded bg-muted" />
        <div className="mb-3 h-6 w-20 animate-skeleton rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-4 w-16 animate-skeleton rounded bg-muted" />
          <div className="h-4 w-20 animate-skeleton rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
