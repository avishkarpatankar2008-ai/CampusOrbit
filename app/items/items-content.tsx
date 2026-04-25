"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { ItemCard, ItemCardSkeleton } from "@/components/item-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getItems, type Item, type ItemFilters } from "@/lib/api"
import { Search, SlidersHorizontal, X, Package } from "lucide-react"

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Books",
  "Sports",
  "Vehicles",
  "Furniture",
  "Clothing",
  "Appliances",
  "Music",
  "Others",
]

const CONDITIONS = [
  { value: "all", label: "Any Condition" },
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

// SWR fetcher — receives the serialized filter key
async function fetcher(key: string): Promise<Item[]> {
  const filters: ItemFilters = JSON.parse(key)
  const result = await getItems(filters)
  return result.data?.items || []
}

export default function ItemsPageContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [condition, setCondition] = useState("all")
  const [sort, setSort] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  const filters: ItemFilters = {
    search: search || undefined,
    category: category && category !== "All Categories" ? category : undefined,
    condition: condition !== "all" ? condition : undefined,
  }

  // Stable SWR key: serialize filters to a string
  const swrKey = JSON.stringify(filters)

  const { data: items = [], isLoading, error } = useSWR<Item[]>(swrKey, fetcher, {
    revalidateOnFocus: false,
  })

  const sortedItems = [...items].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      default:
        return 0
    }
  })

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setCondition("all")
    setSort("newest")
  }

  const hasActiveFilters = !!(search || (category && category !== "All Categories") || condition !== "all")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-transition">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Browse Items</h1>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 self-start sm:self-auto">
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Search + Filter toggle */}
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters((v) => !v)}
              className="gap-2 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Category</p>
                <Select value={category || "All Categories"} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Condition</p>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Sort By</p>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results count */}
          {!isLoading && (
            <p className="mb-4 text-sm text-muted-foreground">
              {sortedItems.length} {sortedItems.length === 1 ? "item" : "items"} found
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12">
                <EmptyState
                  icon={<Package className="h-8 w-8 text-muted-foreground" />}
                  title="Failed to load items"
                  description="Something went wrong. Please try again."
                  action={{ label: "Retry", href: "/items" }}
                />
              </CardContent>
            </Card>
          ) : sortedItems.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12">
                <EmptyState
                  icon={<Package className="h-8 w-8 text-muted-foreground" />}
                  title="No items found"
                  description={
                    hasActiveFilters
                      ? "Try adjusting your filters or search query."
                      : "No items have been listed yet. Be the first!"
                  }
                  action={
                    hasActiveFilters
                      ? { label: "Clear filters", onClick: clearFilters }
                      : { label: "List an item", href: "/items/new" }
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
