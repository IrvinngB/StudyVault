import type { UserDevice, UserProfile, UserProfileUpdate } from "@/database/models/userTypes"
import { UserDeviceService } from "@/database/services/userDeviceService"
import { UserProfileService } from "@/database/services/userProfileService"
import { useCallback, useEffect, useState } from "react"

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const profileService = UserProfileService.getInstance()

  // Cargar perfil del usuario
  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await profileService.getCurrentUserProfile()
      setProfile(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profile")
    } finally {
      setLoading(false)
    }
  }, [profileService])

  // Actualizar perfil
  const updateProfile = useCallback(async (data: UserProfileUpdate): Promise<UserProfile | null> => {
    try {
      const result = await profileService.updateUserProfile(data)
      if (result) {
        setProfile(result)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating profile")
      return null
    }
  }, [profileService])

  // Actualización parcial
  const patchProfile = useCallback(async (data: UserProfileUpdate): Promise<UserProfile | null> => {
    try {
      const result = await profileService.patchUserProfile(data)
      if (result) {
        setProfile(result)
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error patching profile")
      return null
    }
  }, [profileService])

  // Cargar perfil al montar el componente
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    patchProfile,
    refresh: loadProfile,
  }
}

export function useUserDevices() {
  const [devices, setDevices] = useState<UserDevice[]>([])
  const [currentDevice, setCurrentDevice] = useState<UserDevice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const deviceService = UserDeviceService.getInstance()

  // Cargar dispositivos del usuario
  const loadDevices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await deviceService.getUserDevices()
      setDevices(result)
      
      // Buscar el dispositivo actual
      const currentDeviceId = deviceService.getCurrentDeviceId()
      const current = result.find(device => device.device_id === currentDeviceId)
      setCurrentDevice(current || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading devices")
    } finally {
      setLoading(false)
    }
  }, [deviceService])

  // Registrar dispositivo actual
  const registerCurrentDevice = useCallback(async (): Promise<UserDevice | null> => {
    try {
      const result = await deviceService.registerCurrentDevice()
      if (result) {
        // Actualizar la lista de dispositivos
        await loadDevices()
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registering device")
      return null
    }
  }, [deviceService, loadDevices])

  // Sincronizar dispositivo actual
  const syncCurrentDevice = useCallback(async (): Promise<boolean> => {
    try {
      const success = await deviceService.syncCurrentDevice()
      if (success) {
        // Actualizar la lista de dispositivos
        await loadDevices()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error syncing device")
      return false
    }
  }, [deviceService, loadDevices])

  // Desactivar dispositivo
  const deactivateDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const success = await deviceService.deactivateDevice(deviceId)
      if (success) {
        // Actualizar la lista de dispositivos
        await loadDevices()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deactivating device")
      return false
    }
  }, [deviceService, loadDevices])

  // Obtener conteo de dispositivos activos
  const activeDevicesCount = devices.filter(device => device.is_active).length

  // Cargar dispositivos al montar el componente
  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  return {
    devices,
    currentDevice,
    activeDevicesCount,
    loading,
    error,
    loadDevices,
    registerCurrentDevice,
    syncCurrentDevice,
    deactivateDevice,
    refresh: loadDevices,
  }
}
