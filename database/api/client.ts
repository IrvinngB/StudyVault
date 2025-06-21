import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ApiResponse, AuthSession } from "../models/types"

export class ApiClient {
  private static instance: ApiClient
  private baseURL: string
  private authSession: AuthSession | null = null

  private constructor() {
    this.baseURL = __DEV__
      ? "https://api-study-production.up.railway.app" // Development
      : "https://api-study-production.up.railway.app" // Production
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  public async initialize(): Promise<void> {
    try {
      const savedSession = await AsyncStorage.getItem("auth_session")
      if (savedSession) {
        this.authSession = JSON.parse(savedSession)

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
      console.log('🔑 Adding Authorization header with token:', this.authSession.access_token.substring(0, 10) + '...')
    } else {
      console.log('❌ No access token available for Authorization header')
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      console.log('🌐 API Request:', options.method || 'GET', url)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ API Error:', response.status, data)
        return {
          success: false,
          error: data.detail || data.message || "Request failed",
        }
      }

      console.log('✅ API Success:', data)
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

  // ==================== HTTP METHODS ====================
  
  /**
   * Realizar petición GET
   */
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const response = await this.request<T>(url, { method: 'GET' })
    
    if (!response.success) {
      throw new Error(response.error || 'GET request failed')
    }
    
    return response.data!
  }

  /**
   * Realizar petición POST
   */
  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.success) {
      throw new Error(response.error || 'POST request failed')
    }
    
    return response.data!
  }

  /**
   * Realizar petición PUT
   */
  public async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.success) {
      throw new Error(response.error || 'PUT request failed')
    }
    
    return response.data!
  }

  /**
   * Realizar petición PATCH
   */
  public async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.success) {
      throw new Error(response.error || 'PATCH request failed')
    }
    
    return response.data!
  }

  /**
   * Realizar petición DELETE
   */
  public async delete<T = void>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'DELETE' })
    
    if (!response.success) {
      throw new Error(response.error || 'DELETE request failed')
    }
    
    return response.data!
  }

  // ==================== AUTH METHODS ====================

  public async signUp(email: string, password: string, name?: string): Promise<ApiResponse<AuthSession>> {
    console.log('🔄 Attempting to create user:', { email, name });
    
    const response = await this.request<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ 
        email, 
        password,
        name: name || email.split('@')[0]
      }),
    })

    console.log('📡 SignUp API Response:', response);

    if (response.success && response.data) {
      const session: AuthSession = {
        access_token: response.data.session?.access_token || response.data.access_token,
        refresh_token: response.data.session?.refresh_token || response.data.refresh_token,
        expires_at: Date.now() + (response.data.session?.expires_in || response.data.expires_in || 3600) * 1000,
        user: response.data.user,
      }
      
      console.log('✅ User created successfully, saving session');
      await this.saveAuthSession(session)
      return { success: true, data: session }
    }

    console.log('❌ User creation failed:', response.error);
    return response
  }

  public async signIn(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    console.log('🔄 Attempting to sign in:', { email });
    
    const response = await this.request<any>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    console.log('📡 SignIn API Response:', response);

    if (response.success && response.data) {
      const session: AuthSession = {
        access_token: response.data.session?.access_token || response.data.access_token,
        refresh_token: response.data.session?.refresh_token || response.data.refresh_token,
        expires_at: Date.now() + (response.data.session?.expires_in || response.data.expires_in || 3600) * 1000,
        user: response.data.user,
      }
      
      console.log('✅ Sign in successful, saving session');
      await this.saveAuthSession(session)
      return { success: true, data: session }
    }

    console.log('❌ Sign in failed:', response.error);
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
    const hasSession = this.authSession !== null
    const notExpired = this.authSession?.expires_at ? this.authSession.expires_at > Date.now() : false
    const result = hasSession && notExpired
    
    console.log('🔐 isAuthenticated check:', {
      hasSession,
      notExpired,
      expires_at: this.authSession?.expires_at,
      current_time: Date.now(),
      result
    })
    
    return result
  }

  public getCurrentUser(): AuthSession | null {
    return this.authSession
  }

  public getBaseURL(): string {
    return this.baseURL
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Verificar estado de conexión con el API
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Upload de archivos
   */
  public async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`
      console.log('🌐 UPLOAD Request:', url)

      const headers: Record<string, string> = {}
      if (this.authSession?.access_token) {
        headers["Authorization"] = `Bearer ${this.authSession.access_token}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Upload failed')
      }

      return data
    } catch (error) {
      console.error('UPLOAD Request failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()