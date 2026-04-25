const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://campusorbit-backend.onrender.com"

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      return { data: null, error: "Unauthorized. Please log in again." }
    }

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      const errorMsg =
        json?.detail ||
        json?.message ||
        json?.error ||
        `Request failed (${res.status})`
      return { data: null, error: errorMsg }
    }

    return { data: json as T, error: null }
  } catch (err) {
    return { data: null, error: "Network error. Please check your connection." }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Item {
  id: string
  title: string
  description: string
  price: number
  priceUnit: "hour" | "day" | "week" | "month"
  category: string
  condition: "new" | "like-new" | "good" | "fair"
  location: string
  images: string[]
  available: boolean
  ownerId: string
  ownerName?: string
  createdAt: string
}

export interface ItemFilters {
  search?: string
  category?: string
  condition?: string
  limit?: number
  offset?: number
}

export interface Booking {
  id: string
  itemId: string
  itemTitle: string
  ownerId: string
  borrowerId: string
  ownerName?: string
  borrowerName?: string
  startDate: string
  endDate: string
  status: "pending" | "approved" | "active" | "completed" | "cancelled"
  totalPrice: number
  createdAt: string
}

export interface LostFoundItem {
  id: string
  type: "lost" | "found"
  title: string
  description: string
  category: string
  location: string
  date: string
  contactInfo: string
  reporterName: string
  image?: string
  status: "open" | "resolved"
  createdAt: string
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(filters: ItemFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.category) params.set("category", filters.category)
  if (filters.condition) params.set("condition", filters.condition)
  if (filters.limit) params.set("limit", String(filters.limit))
  if (filters.offset) params.set("offset", String(filters.offset))

  const query = params.toString()
  return fetchApi<{ items: Item[]; total: number }>(`/api/items${query ? `?${query}` : ""}`)
}

export async function getItem(id: string) {
  return fetchApi<Item>(`/api/items/${id}`)
}

export async function createItem(data: Omit<Item, "id" | "ownerId" | "ownerName" | "createdAt">) {
  return fetchApi<Item>("/api/items", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateItem(id: string, data: Partial<Item>) {
  return fetchApi<Item>(`/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteItem(id: string) {
  return fetchApi(`/api/items/${id}`, { method: "DELETE" })
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings() {
  return fetchApi<{ bookings: Booking[] }>("/api/bookings")
}

export async function createBooking(data: {
  itemId: string
  startDate: string
  endDate: string
}) {
  return fetchApi<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBookingStatus(id: string, status: Booking["status"]) {
  return fetchApi<Booking>(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

// ─── Lost & Found ─────────────────────────────────────────────────────────────

export async function getLostFoundItems(type?: "lost" | "found") {
  const query = type ? `?type=${type}` : ""
  return fetchApi<{ items: LostFoundItem[] }>(`/api/lost-found${query}`)
}

export async function createLostFoundItem(
  data: Omit<LostFoundItem, "id" | "reporterName" | "status" | "createdAt">
) {
  return fetchApi<LostFoundItem>("/api/lost-found", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
