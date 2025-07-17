import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ApiResponse, AuthSession } from "../models/types"

export class ApiClient {
  private static instance: ApiClient
  private baseURL: string
  private authSession: AuthSession | null = null

  private constructor() {
    this.baseURL = __DEV__
      ? "https://squid-app-fr38f.ondigitalocean.app" // Development
      : "https://squid-app-fr38f.ondigitalocean.app" // Production
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
          console.log("🔄 Token expirado, intentando refrescar...")
          const refreshed = await this.refreshToken()
          if (!refreshed) {
            console.log("❌ No se pudo refrescar el token, limpiando sesión")
            await this.clearAuthSession()
          }
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

      // ❌ REMOVER ESTA VERIFICACIÓN - Era el problema principal
      // No verificar autenticación aquí, dejar que el servidor responda
      
      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("❌ Error parsing JSON response:", parseError)
        data = { message: "Error parsing server response" }
      }

      if (!response.ok) {
        console.error("❌ API Error:", response.status, data)

        // Manejar errores de autenticación
        if (response.status === 401) {
          console.log("🔄 Token inválido, limpiando sesión...")
          await this.clearAuthSession()
          return {
            success: false,
            error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
          }
        }

        return {
          success: false,
          error: data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("API request failed:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("Network request failed")) {
        return {
          success: false,
          error: "Error de conexión. Verifica tu conexión a internet.",
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error de red desconocido",
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

    const response = await this.request<T>(url, { method: "GET" })

    if (!response.success) {
      throw new Error(response.error || "GET request failed")
    }

    return response.data!
  }

  /**
   * Realizar petición POST
   */
  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.success) {
      throw new Error(response.error || "POST request failed")
    }

    return response.data!
  }

  /**
   * Realizar petición PUT
   */
  public async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.success) {
      throw new Error(response.error || "PUT request failed")
    }

    return response.data!
  }

  /**
   * Realizar petición PATCH
   */
  public async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.success) {
      throw new Error(response.error || "PATCH request failed")
    }

    return response.data!
  }

  /**
   * Realizar petición DELETE
   */
  public async delete<T = void>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "DELETE" })

    if (!response.success) {
      throw new Error(response.error || "DELETE request failed")
    }

    return response.data!
  }

  // ==================== AUTH METHODS ====================

  public async signUp(email: string, password: string, name?: string): Promise<ApiResponse<AuthSession>> {
    const response = await this.request<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name: name || email.split("@")[0],
      }),
    })

    if (response.success && response.data) {
      const session: AuthSession = {
        access_token: response.data.session?.access_token || response.data.access_token,
        refresh_token: response.data.session?.refresh_token || response.data.refresh_token,
        expires_at: Date.now() + (response.data.session?.expires_in || response.data.expires_in || 3600) * 1000,
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
        access_token: response.data.session?.access_token || response.data.access_token,
        refresh_token: response.data.session?.refresh_token || response.data.refresh_token,
        expires_at: Date.now() + (response.data.session?.expires_in || response.data.expires_in || 3600) * 1000,
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
    if (!this.authSession?.refresh_token) {
      console.log("❌ No refresh token available")
      return false
    }

    try {
      console.log("🔄 Attempting to refresh token...")
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
        console.log("✅ Token refreshed successfully")
        return true
      } else {
        console.log("❌ Token refresh failed:", response.status)
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    await this.clearAuthSession()
    return false
  }

  public isAuthenticated(): boolean {
    const hasSession = this.authSession !== null
    const hasToken = !!this.authSession?.access_token
    const notExpired = this.authSession?.expires_at ? this.authSession.expires_at > Date.now() : false
    const result = hasSession && hasToken && notExpired

    console.log("🔐 isAuthenticated check:", {
      hasSession,
      hasToken,
      notExpired,
      expires_at: this.authSession?.expires_at,
      current_time: Date.now(),
      result,
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
      await this.get("/health")
      return true
    } catch (error) {
      console.error("Health check failed:", error)
      return false
    }
  }

  /**
   * Upload de archivos
   */
  public async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`
      console.log("🌐 UPLOAD Request:", url)

      const headers: Record<string, string> = {}
      if (this.authSession?.access_token) {
        headers["Authorization"] = `Bearer ${this.authSession.access_token}`
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Upload failed")
      }

      return data
    } catch (error) {
      console.error("UPLOAD Request failed:", error)
      throw error
    }
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()