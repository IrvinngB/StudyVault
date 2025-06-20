import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ApiResponse, AuthSession } from "../models/types"
// __DEV__ is a global variable in React Native, no need to import it

export class ApiClient {
  private static instance: ApiClient
  private baseURL: string
  private authSession: AuthSession | null = null

  private constructor() {
    // Configure your API base URL here
    
    this.baseURL = __DEV__
      ? "http://localhost:8000" // Development
      : "https://your-api-domain.com" // Production
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  public async initialize(): Promise<void> {
    // Load saved auth session
    try {
      const savedSession = await AsyncStorage.getItem("auth_session")
      if (savedSession) {
        this.authSession = JSON.parse(savedSession)

        // Check if token is expired
        if (this.authSession && this.authSession.expires_at < Date.now()) {
          await this.refreshToken()
        }
      }
    } catch (error) {
      console.error("Failed to load auth session:", error)
    }
  }

  private async saveAuthSession(session: AuthSession): Promise<void> {
    this.authSession = session
    await AsyncStorage.setItem("auth_session", JSON.stringify(session))
  }

  private async clearAuthSession(): Promise<void> {
    this.authSession = null
    await AsyncStorage.removeItem("auth_session")
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.authSession?.access_token) {
      headers["Authorization"] = `Bearer ${this.authSession.access_token}`
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || "Request failed",
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Authentication methods
  public async signUp(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    const response = await this.request<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      const session: AuthSession = {
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
        expires_at: Date.now() + response.data.session.expires_in * 1000,
        user: response.data.user,
      }
      await this.saveAuthSession(session)
      return { success: true, data: session }
    }

    return response
  }

  public async signIn(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    const response = await this.request<any>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      const session: AuthSession = {
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
        expires_at: Date.now() + response.data.session.expires_in * 1000,
        user: response.data.user,
      }
      await this.saveAuthSession(session)
      return { success: true, data: session }
    }

    return response
  }

  public async signOut(): Promise<ApiResponse<void>> {
    const response = await this.request<void>("/auth/signout", {
      method: "POST",
    })

    await this.clearAuthSession()
    return response
  }

  public async refreshToken(): Promise<boolean> {
    if (!this.authSession?.refresh_token) return false

    try {
      // Implement refresh token logic based on your API
      // This is a placeholder - adjust according to your API
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: this.authSession.refresh_token }),
      })

      if (response.ok) {
        const data = await response.json()
        const newSession: AuthSession = {
          ...this.authSession,
          access_token: data.access_token,
          expires_at: Date.now() + data.expires_in * 1000,
        }
        await this.saveAuthSession(newSession)
        return true
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    await this.clearAuthSession()
    return false
  }

  public isAuthenticated(): boolean {
    return this.authSession !== null && this.authSession.expires_at > Date.now()
  }

  public getCurrentUser(): AuthSession | null {
    return this.authSession
  }

  // API methods for different resources
  public async getClasses(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/classes")
  }

  public async createClass(classData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/classes", {
      method: "POST",
      body: JSON.stringify(classData),
    })
  }

  public async updateClass(id: string, classData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(classData),
    })
  }

  public async deleteClass(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/classes/${id}`, {
      method: "DELETE",
    })
  }

  public async getTasks(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request<any[]>(`/tasks${queryParams ? `?${queryParams}` : ""}`)
  }

  public async createTask(taskData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  public async updateTask(id: string, taskData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
  }

  public async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, {
      method: "DELETE",
    })
  }

  public async getCalendarEvents(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request<any[]>(`/calendar${queryParams ? `?${queryParams}` : ""}`)
  }

  public async createCalendarEvent(eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/calendar", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  }

  public async updateCalendarEvent(id: string, eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/calendar/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    })
  }

  public async deleteCalendarEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/${id}`, {
      method: "DELETE",
    })
  }

  public async getHabits(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/habits")
  }

  public async createHabit(habitData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/habits", {
      method: "POST",
      body: JSON.stringify(habitData),
    })
  }

  public async updateHabit(id: string, habitData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(habitData),
    })
  }

  public async deleteHabit(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/habits/${id}`, {
      method: "DELETE",
    })
  }

  public async getHabitLogs(habitId: string, filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request<any[]>(`/habits/${habitId}/logs${queryParams ? `?${queryParams}` : ""}`)
  }

  public async createHabitLog(habitId: string, logData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/habits/${habitId}/logs`, {
      method: "POST",
      body: JSON.stringify(logData),
    })
  }

  // Sync methods
  public async pullData(syncRequest: any): Promise<ApiResponse<any>> {
    return this.request<any>("/sync/pull", {
      method: "POST",
      body: JSON.stringify(syncRequest),
    })
  }

  public async pushData(tableName: string, records: any[], deviceId: string): Promise<ApiResponse<any>> {
    return this.request<any>("/sync/push", {
      method: "POST",
      body: JSON.stringify({
        table_name: tableName,
        records,
        device_id: deviceId,
      }),
    })
  }

  public async getSyncStatus(deviceId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/sync/status?device_id=${deviceId}`)
  }

  // Analytics methods
  public async getDashboardData(): Promise<ApiResponse<any>> {
    return this.request<any>("/analytics/dashboard")
  }

  public async getProductivityMetrics(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request<any[]>(`/analytics/productivity${queryParams ? `?${queryParams}` : ""}`)
  }

  public async createStudySession(sessionData: any): Promise<ApiResponse<any>> {
    return this.request<any>("/analytics/study-session", {
      method: "POST",
      body: JSON.stringify(sessionData),
    })
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()
