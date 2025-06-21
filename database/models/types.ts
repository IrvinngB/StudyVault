// TypeScript types for authentication only

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone: string
  subscription_tier: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: UserProfile
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
