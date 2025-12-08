// API configuration and utilities for Sport DH backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8888/api"

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  avatar?: string | null
  role: "ADMIN" | "OWNER" | "USER"
  address?: string | null
  settings?: Record<string, any>
  is_active: boolean
  is_superuser: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
  message?: string
}

export interface SportCenterImage {
  id: number
  preview?: string
  file: string
}

export interface SportCenter {
  id: number
  owner:
    | string
    | {
        id: string
        full_name: string
        phone: string | null
      }
  images: SportCenterImage[]
  name: string
  address: string
  total_field: number
  created_at: string
}

export interface SportFieldImage {
  id: number
  preview?: string
  file: string
}

export interface SportField {
  id: number
  sport_center: number
  center_info?: {
    name: string
    address: string
  }
  images: SportFieldImage[]
  name: string
  address: string
  sport_type: "FOOTBALL" | "BADMINTON" | "TENNIS" | "PICK_A_BALL"
  price: number
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

export interface ChatbotResponse {
  session_id: string
  question: string
  answer: string
}

export interface BookingUser {
  id: number
  full_name: string
  email: string
  phone: string
}

export interface BookingSportField {
  id: number
  name: string
  sport_type: string
  address: string
  sport_center?: {
    id: number
    name: string
    owner: string
  }
}

export interface BookingRentalSlot {
  id: number
  name: string
  time_slot: string
}

export interface Booking {
  id: number
  user: BookingUser | null
  sport_field: BookingSportField
  rental_slot: BookingRentalSlot
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  price: number
  booking_date: string
}

export interface BookingListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Booking[]
}

export interface BookingMiniListResponse {
  count: number
  next: string | null
  previous: string | null
  results: BookingMini[]
}

// Booking stats (revenue/booking) response
export interface BookingStatsFilters {
  preset: "today" | "this_week" | "this_month" | "this_quarter" | null
  date_from: string | null
  date_to: string | null
  statuses: string[]
  limit_top_fields: number
}

export interface BookingStatsSummary {
  total_revenue: number
  total_bookings: number
}

export interface BookingStatsByStatusItem {
  status: string
  revenue: number
  count: number
}

export interface BookingStatsByCenterItem {
  center_id: number
  center_name: string
  revenue: number
  count: number
}

export interface BookingStatsTopFieldItem {
  field_id: number
  field_name: string
  center_id: number
  center_name: string
  revenue: number
  count: number
}

export interface BookingStatsResponse {
  filters: BookingStatsFilters
  summary: BookingStatsSummary
  by_status: BookingStatsByStatusItem[]
  by_center: BookingStatsByCenterItem[]
  top_fields: BookingStatsTopFieldItem[]
}

export interface BookingMini {
  id: number
  sport_field: number
  rental_slot: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  booking_date: string
}

export interface RentalSlot {
  id: number
  name: string
  time_slot: string
  created_at: string
  updated_at: string
}

export interface RentalSlotListResponse {
  count: number
  next: string | null
  previous: string | null
  results: RentalSlot[]
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private objectToFormData(obj: Record<string, any>): FormData {
    const formData = new FormData()

    Object.keys(obj).forEach((key) => {
      const value = obj[key]

      // Skip undefined and null values
      if (value === undefined || value === null) {
        return
      }

      // Handle File objects
      if (value instanceof File) {
        formData.append(key, value)
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(key, item)
          } else {
            formData.append(`${key}[${index}]`, String(item))
          }
        })
      }
      // Handle objects (convert to JSON string)
      else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value))
      }
      // Handle primitive values
      else {
        formData.append(key, String(value))
      }
    })

    return formData
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Check if body is FormData
    const isFormData = options.body instanceof FormData

    const config: RequestInit = {
      ...options,
      headers: {
        // Only set Content-Type for non-FormData requests
        // Browser will automatically set correct Content-Type with boundary for FormData
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      credentials: "include",
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "An error occurred" }))

        // Handle field-level validation errors (e.g., {"email": ["error message"], "username": ["error message"]})
        if (error && typeof error === "object" && !error.detail && !error.message) {
          const fieldErrors: string[] = []
          for (const [field, messages] of Object.entries(error)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                fieldErrors.push(`${field}: ${msg}`)
              })
            }
          }
          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(", "))
          }
        }

        const errorMessage = error.detail || error.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.")
      }
      // Re-throw other errors
      throw error
    }
  }

  private getAuthHeader(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = this.objectToFormData(credentials as Record<string, any>)
    return this.request<AuthResponse>("/auth/login/", {
      method: "POST",
      body: formData,
    })
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<AuthResponse>("/auth/register/", {
      method: "POST",
      body: formData,
    })
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout/", {
      method: "POST",
    })
  }

  async refreshToken(): Promise<{ access: string }> {
    return this.request<{ access: string }>("/auth/refresh/", {
      method: "POST",
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/user/me/", {
      headers: this.getAuthHeader(),
    })
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<User>(`/user/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/user/", {
      headers: this.getAuthHeader(),
    })
  }

  async createUser(data: Partial<User>): Promise<User> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<User>("/user/", {
      method: "POST",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<User>(`/user/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request<void>(`/user/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
  }

  // Sport Center endpoints
  async getAllSportCenters(params?: { owner?: string; name?: string; address?: string }): Promise<SportCenter[]> {
    const queryParams = new URLSearchParams()
    if (params?.owner) queryParams.append("owner", params.owner)
    if (params?.name) queryParams.append("name", params.name)
    if (params?.address) queryParams.append("address", params.address)
    
    const queryString = queryParams.toString()
    return this.request<SportCenter[]>(`/sport_center/${queryString ? `?${queryString}` : ""}`, {
      headers: this.getAuthHeader(),
    })
  }

  async getSportCenter(id: number): Promise<SportCenter> {
    return this.request<SportCenter>(`/sport_center/${id}`, {
      headers: this.getAuthHeader(),
    })
  }

  async createSportCenter(data: Partial<SportCenter>): Promise<SportCenter> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<SportCenter>("/sport_center/", {
      method: "POST",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async updateSportCenter(id: number, data: Partial<SportCenter> | FormData): Promise<SportCenter> {
    const formData = data instanceof FormData ? data : this.objectToFormData(data as Record<string, any>)
    return this.request<SportCenter>(`/sport_center/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async deleteSportCenter(id: number): Promise<void> {
    return this.request<void>(`/sport_center/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
  }

  // Sport Field endpoints
  async getAllSportFields(params?: {
    sport_center?: number
    status?: string
    center_name?: string
    sport_type?: string
    address?: string
    price_lte?: number
  }): Promise<SportField[]> {
    const queryParams = new URLSearchParams()
    if (params?.sport_center) queryParams.append("sport_center", params.sport_center.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.center_name) queryParams.append("center_name", params.center_name)
    if (params?.sport_type) queryParams.append("sport_type", params.sport_type)
    if (params?.address) queryParams.append("address", params.address)
    if (params?.price_lte) queryParams.append("price_lte", params.price_lte.toString())

    const queryString = queryParams.toString()
    return this.request<SportField[]>(`/sport_field/${queryString ? `?${queryString}` : ""}`, {
      headers: this.getAuthHeader(),
    })
  }

  async getSportField(id: number): Promise<SportField> {
    return this.request<SportField>(`/sport_field/${id}`, {
      headers: this.getAuthHeader(),
    })
  }

  async createSportField(data: Partial<SportField> | FormData): Promise<SportField> {
    const formData = data instanceof FormData ? data : this.objectToFormData(data as Record<string, any>)
    return this.request<SportField>("/sport_field/", {
      method: "POST",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async updateSportField(id: number, data: Partial<SportField> | FormData): Promise<SportField> {
    const formData = data instanceof FormData ? data : this.objectToFormData(data as Record<string, any>)
    return this.request<SportField>(`/sport_field/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async deleteSportField(id: number): Promise<void> {
    return this.request<void>(`/sport_field/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
  }

  async deleteImage(imageId: number): Promise<void> {
    return this.request<void>(`/image_sport/${imageId}/delete/`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
  }

  async chatbot(question: string, sessionId?: string): Promise<ChatbotResponse> {
    const queryParams = new URLSearchParams({ q: question })
    if (sessionId) {
      queryParams.append("session_id", sessionId)
    }

    return this.request<ChatbotResponse>(`/chatbot/?${queryParams.toString()}`, {
      method: "POST",
      headers: this.getAuthHeader(),
    })
  }

  async getBookings(params?: {
    sport_field?: number
    rental_slot?: number
    price?: number
    booking_date?: string
    booking_date_after?: string
    booking_date_before?: string
    month?: number
    year?: number
    status?: string
    limit?: number
    offset?: number
    ordering?: string
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.sport_field) queryParams.append("sport_field", params.sport_field.toString())
    if (params?.rental_slot) queryParams.append("rental_slot", params.rental_slot.toString())
    if (params?.price) queryParams.append("price", params.price.toString())
    if (params?.booking_date) queryParams.append("booking_date", params.booking_date)
    if (params?.booking_date_after) queryParams.append("booking_date_after", params.booking_date_after)
    if (params?.booking_date_before) queryParams.append("booking_date_before", params.booking_date_before)
    if (params?.month) queryParams.append("month", params.month.toString())
    if (params?.year) queryParams.append("year", params.year.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.offset) queryParams.append("offset", params.offset.toString())
    if (params?.ordering) queryParams.append("ordering", params.ordering)

    return this.request<BookingListResponse>(`/booking/?${queryParams}`)
  }

  // Booking manage endpoints (admin/owner)
  async getBookingManage(params?: {
    limit?: number
    offset?: number
    owner?: string
    sport_center?: number
    sport_field?: number
    rental_slot?: number
    status?: "PENDING" | "CONFIRMED"
    booking_date_after?: string
    booking_date_before?: string
    booking_date_?: string
    month?: number
    year?: number
    user?: string
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.limit !== undefined) queryParams.append("limit", String(params.limit))
    if (params?.offset !== undefined) queryParams.append("offset", String(params.offset))
    if (params?.owner) queryParams.append("owner", params.owner)
    if (params?.sport_center !== undefined) queryParams.append("sport_center", String(params.sport_center))
    if (params?.sport_field !== undefined) queryParams.append("sport_field", String(params.sport_field))
    if (params?.rental_slot !== undefined) queryParams.append("rental_slot", String(params.rental_slot))
    if (params?.status) queryParams.append("status", params.status)
    if (params?.booking_date_after) queryParams.append("booking_date_after", params.booking_date_after)
    if (params?.booking_date_before) queryParams.append("booking_date_before", params.booking_date_before)
    if (params?.booking_date_) queryParams.append("booking_date_", params.booking_date_)
    if (params?.month !== undefined) queryParams.append("month", String(params.month))
    if (params?.year !== undefined) queryParams.append("year", String(params.year))
    if (params?.user) queryParams.append("user", params.user)

    return this.request<BookingListResponse>(`/booking_manage/?${queryParams.toString()}`, {
      headers: this.getAuthHeader(),
    })
  }

  async getBookingsMini(params?: {
    sport_field?: number
    rental_slot?: number
    booking_date_?: string
    booking_date_after?: string
    booking_date_before?: string
    month?: number
    year?: number
    status?: string
    limit?: number
    offset?: number
    ordering?: string
  }): Promise<BookingMiniListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.sport_field) queryParams.append("sport_field", params.sport_field.toString())
    if (params?.rental_slot) queryParams.append("rental_slot", params.rental_slot.toString())
    if (params?.booking_date_) queryParams.append("booking_date_", params.booking_date_)
    if (params?.booking_date_after) queryParams.append("booking_date_after", params.booking_date_after)
    if (params?.booking_date_before) queryParams.append("booking_date_before", params.booking_date_before)
    if (params?.month) queryParams.append("month", params.month.toString())
    if (params?.year) queryParams.append("year", params.year.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.offset) queryParams.append("offset", params.offset.toString())
    if (params?.ordering) queryParams.append("ordering", params.ordering)

    return this.request<BookingMiniListResponse>(`/booking/list/?${queryParams}`)
  }

  // Booking stats (revenue/booking) for admin/owner
  async getBookingStats(params?: {
    preset?: "today" | "this_week" | "this_month" | "this_quarter"
    date_from?: string
    date_to?: string
    statuses?: string[]
    limit_top_fields?: number
  }): Promise<BookingStatsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.preset) queryParams.append("preset", params.preset)
    if (params?.date_from) queryParams.append("date_from", params.date_from)
    if (params?.date_to) queryParams.append("date_to", params.date_to)
    if (params?.statuses && params.statuses.length > 0) {
      params.statuses.forEach((status) => {
        queryParams.append("statuses", status)
      })
    }
    if (params?.limit_top_fields !== undefined) {
      queryParams.append("limit_top_fields", String(params.limit_top_fields))
    }

    const queryString = queryParams.toString()

    return this.request<BookingStatsResponse>(`/booking/stats/${queryString ? `?${queryString}` : ""}`, {
      headers: this.getAuthHeader(),
    })
  }

  async getBookingDetail(id: number): Promise<Booking> {
    return this.request<Booking>(`/booking/${id}`)
  }

  async updateBooking(id: number, data: { status: "PENDING" | "CONFIRMED" }): Promise<Booking> {
    const formData = this.objectToFormData(data as Record<string, any>)
    return this.request<Booking>(`/booking/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    })
  }

  async getRentalSlots(params?: {
    name?: string
    time_slot?: string
    limit?: number
    offset?: number
    ordering?: string
  }): Promise<RentalSlotListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append("name", params.name)
    if (params?.time_slot) queryParams.append("time_slot", params.time_slot)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.offset) queryParams.append("offset", params.offset.toString())
    if (params?.ordering) queryParams.append("ordering", params.ordering)

    return this.request<RentalSlotListResponse>(`/rental_slot/?${queryParams}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

export const API_URL = API_BASE_URL

export async function getSportFields(params?: {
  status?: string
  sport_center?: number
  center_name?: string
  sport_type?: string
  address?: string
  price_lte?: number
}) {
  const apiParams: {
    status?: string
    sport_center?: number
    center_name?: string
    sport_type?: string
    address?: string
    price_lte?: number
  } = {}

  if (params?.sport_center) apiParams.sport_center = params.sport_center
  if (params?.status) apiParams.status = params.status
  if (params?.center_name) apiParams.center_name = params.center_name
  if (params?.sport_type) apiParams.sport_type = params.sport_type
  if (params?.address) apiParams.address = params.address
  if (params?.price_lte) apiParams.price_lte = params.price_lte

  const fields = await apiClient.getAllSportFields(Object.keys(apiParams).length > 0 ? apiParams : undefined)
  return { results: fields }
}
