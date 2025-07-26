import { ApiClient } from "@/database/api/client"
import type { UserDevice, UserDeviceCreate, UserDeviceUpdate } from "@/database/models/userTypes"
import Constants from "expo-constants"
import * as Device from "expo-device"

export class UserDeviceService {
  private static instance: UserDeviceService
  private apiClient: ApiClient

  private constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  public static getInstance(): UserDeviceService {
    if (!UserDeviceService.instance) {
      UserDeviceService.instance = new UserDeviceService()
    }
    return UserDeviceService.instance
  }

  /**
   * Obtener información del dispositivo actual
   */
  private getCurrentDeviceInfo(): UserDeviceCreate {
    return {
      device_id: Constants.deviceId || `unknown-${Date.now()}`,
      device_name: Device.deviceName || "Unknown Device",
      device_type: Device.deviceType ? Device.DeviceType[Device.deviceType] : "Unknown",
      platform: Device.osName || "Unknown",
      app_version: Constants.manifest?.version || "1.0.0",
    }
  }

  /**
   * Registrar el dispositivo actual
   */
  async registerCurrentDevice(): Promise<UserDevice | null> {
    try {
      const deviceInfo = this.getCurrentDeviceInfo()
      console.log("📱 Registering current device...", deviceInfo)
      
      const response = await this.apiClient.post<UserDevice>("/user-devices/", deviceInfo)
      console.log("✅ Device registered successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to register device:", error)
      return null
    }
  }

  /**
   * Obtener todos los dispositivos del usuario
   */
  async getUserDevices(): Promise<UserDevice[]> {
    try {
      console.log("📤 Getting user devices...")
      const response = await this.apiClient.get<UserDevice[]>("/user-devices/")
      console.log(`✅ Retrieved ${response.length} devices`)
      return response
    } catch (error) {
      console.error("❌ Failed to get user devices:", error)
      return []
    }
  }

  /**
   * Obtener un dispositivo específico
   */
  async getDevice(deviceId: string): Promise<UserDevice | null> {
    try {
      console.log("📤 Getting device:", deviceId)
      const response = await this.apiClient.get<UserDevice>(`/user-devices/${deviceId}`)
      console.log("✅ Device retrieved successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to get device:", error)
      return null
    }
  }

  /**
   * Actualizar un dispositivo
   */
  async updateDevice(deviceId: string, data: UserDeviceUpdate): Promise<UserDevice | null> {
    try {
      console.log("📤 Updating device:", deviceId, data)
      const response = await this.apiClient.put<UserDevice>(`/user-devices/${deviceId}`, data)
      console.log("✅ Device updated successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to update device:", error)
      return null
    }
  }

  /**
   * Sincronizar el dispositivo actual (actualizar timestamp)
   */
  async syncCurrentDevice(): Promise<boolean> {
    try {
      const deviceInfo = this.getCurrentDeviceInfo()
      console.log("🔄 Syncing current device...")
      
      await this.apiClient.post<any>(`/user-devices/${deviceInfo.device_id}/sync`)
      console.log("✅ Device synced successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to sync device:", error)
      return false
    }
  }

  /**
   * Desactivar un dispositivo
   */
  async deactivateDevice(deviceId: string): Promise<boolean> {
    try {
      console.log("📤 Deactivating device:", deviceId)
      await this.apiClient.delete(`/user-devices/${deviceId}`)
      console.log("✅ Device deactivated successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to deactivate device:", error)
      return false
    }
  }

  /**
   * Desactivar el dispositivo actual
   */
  async deactivateCurrentDevice(): Promise<boolean> {
    const deviceInfo = this.getCurrentDeviceInfo()
    return this.deactivateDevice(deviceInfo.device_id)
  }

  /**
   * Obtener el ID del dispositivo actual
   */
  getCurrentDeviceId(): string {
    return Constants.deviceId || `unknown-${Date.now()}`
  }
}
