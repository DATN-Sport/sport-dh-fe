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
  sport_type: "FOOTBALL" | "BADMINTON" | "TENNIS" | "BASKETBALL" | "VOLLEYBALL"
  price: number
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

export interface ChatbotResponse {
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
  async getAllSportCenters(params?: { owner?: string }): Promise<SportCenter[]> {
    const queryString = params?.owner ? `?owner=${params.owner}` : ""
    return this.request<SportCenter[]>(`/sport_center/${queryString}`, {
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
  async getAllSportFields(params?: { sport_center?: number }): Promise<SportField[]> {
    const queryString = params?.sport_center ? `?sport_center=${params.sport_center}` : ""
    return this.request<SportField[]>(`/sport_field/${queryString}`, {
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

  async chatbot(question: string): Promise<ChatbotResponse> {
    return this.request<ChatbotResponse>(`/chatbot/?q=${encodeURIComponent(question)}`, {
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

export async function getSportFields(params?: { status?: string; sport_center?: number }) {
  const fields = await apiClient.getAllSportFields(
    params?.sport_center ? { sport_center: params.sport_center } : undefined,
  )
  // Filter by status if provided
  if (params?.status) {
    return {
      results: fields.filter((f) => f.status === params.status),
    }
  }
  return { results: fields }
}
