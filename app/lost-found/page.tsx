"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Navbar } from "@/components/navbar"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getLostFoundItems, createLostFoundItem, type LostFoundItem } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  Search,
  MapPin,
  Calendar,
  User,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

const categories = [
  "Electronics",
  "Documents",
  "Keys",
  "Wallet",
  "Clothing",
  "Accessories",
  "Books",
  "Others",
]

const fetcher = async (type?: "lost" | "found") => {
  const result = await getLostFoundItems(type)
  return result.data?.items || []
}

export default function LostFoundPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    description: "",
    category: "",
    location: "",
    date: format(new Date(), "yyyy-MM-dd"),
    contactInfo: "",
  })

  const { data: items, isLoading } = useSWR<LostFoundItem[]>(
    ["lost-found", activeTab],
    () => fetcher(activeTab)
  )

  const filteredItems = items?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return

    setIsSubmitting(true)

    const result = await createLostFoundItem({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      date: formData.date,
      contactInfo: formData.contactInfo,
    })

    if (result.data) {
      setIsDialogOpen(false)
      setFormData({
        type: "lost",
        title: "",
        description: "",
        category: "",
        location: "",
        date: format(new Date(), "yyyy-MM-dd"),
        contactInfo: "",
      })
      mutate(["lost-found", activeTab])
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-transition">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Lost & Found
              </h1>
              <p className="mt-1 text-muted-foreground">
                Help your campus community find their belongings
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Item
                </Button>
              </DialogTrigger>
              <DialogContent className="modal-enter max-w-lg">
                <DialogHeader>
                  <DialogTitle>Report Lost or Found Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.type === "lost" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setFormData((prev) => ({ ...prev, type: "lost" }))}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      I Lost Something
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === "found" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setFormData((prev) => ({ ...prev, type: "found" }))}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      I Found Something
                    </Button>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Name</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Blue Backpack, iPhone 13"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Category and Date */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">
                        {formData.type === "lost" ? "When lost?" : "When found?"}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, date: e.target.value }))
                        }
                        max={format(new Date(), "yyyy-MM-dd")}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {formData.type === "lost" ? "Last seen location" : "Where found?"}
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Library 2nd Floor, Cafeteria"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item in detail..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Information</Label>
                    <Input
                      id="contact"
                      placeholder="Phone or email"
                      value={formData.contactInfo}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-glow"
                    disabled={isSubmitting || !isAuthenticated}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : !isAuthenticated ? (
                      "Sign in to report"
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Tabs */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lost & found items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "lost" | "found")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lost" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Lost Items
                </TabsTrigger>
                <TabsTrigger value="found" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Found Items
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="mb-3 flex gap-3">
                      <div className="h-20 w-20 animate-skeleton rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 animate-skeleton rounded bg-muted" />
                        <div className="h-4 w-1/2 animate-skeleton rounded bg-muted" />
                      </div>
                    </div>
                    <div className="h-4 w-full animate-skeleton rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filteredItems || filteredItems.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12">
                <EmptyState
                  icon={<Package className="h-8 w-8 text-muted-foreground" />}
                  title={searchQuery ? "No matching items" : `No ${activeTab} items reported`}
                  description={
                    searchQuery
                      ? "Try adjusting your search terms."
                      : `Be the first to report a ${activeTab} item.`
                  }
                  hindiText={searchQuery ? undefined : "अभी कुछ नहीं है"}
                  marathiText={searchQuery ? undefined : "इथे अजून काही नाही"}
                  action={
                    !searchQuery
                      ? {
                          label: "Report an item",
                          onClick: () => setIsDialogOpen(true),
                        }
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="card-hover overflow-hidden border-border bg-card transition-all"
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant={item.type === "lost" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {item.type === "lost" ? "Lost" : "Found"}
                          </Badge>
                          {item.status === "resolved" && (
                            <Badge variant="secondary" className="text-xs">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-1 font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(item.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        <span>{item.reporterName}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Contact Reporter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
