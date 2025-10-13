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
  file: string
}

export interface SportCenter {
  id: number
  owner: string
  images: SportCenterImage[]
  name: string
  address: string
  created_at: string
}

export interface SportFieldImage {
  id: number
  file: string
}

export interface SportField {
  id: number
  sport_center: number
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
        // Try to parse error response
        const error = await response.json().catch(() => ({ detail: "An error occurred" }))
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
}

export const apiClient = new ApiClient(API_BASE_URL)
