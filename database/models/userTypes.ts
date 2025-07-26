// Tipos para el perfil de usuario que coinciden con el backend
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  timezone?: string
  created_at: string
  updated_at: string
  plan?: string
  subscription_tier?: string
}

export interface UserProfileCreate {
  email: string
  full_name?: string
  timezone?: string
}

export interface UserProfileUpdate {
  email?: string
  full_name?: string
  timezone?: string
}

// Tipos para dispositivos de usuario
export interface UserDevice {
  id: string
  user_id: string
  device_id: string
  device_name?: string
  device_type?: string
  platform?: string
  app_version?: string
  is_active: boolean
  last_sync: string
  created_at: string
  updated_at: string
}

export interface UserDeviceCreate {
  device_id: string
  device_name?: string
  device_type?: string
  platform?: string
  app_version?: string
}

export interface UserDeviceUpdate {
  device_name?: string
  device_type?: string
  platform?: string
  app_version?: string
  is_active?: boolean
}
