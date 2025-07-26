import { ApiClient } from "@/database/api/client"
import type { UserProfile, UserProfileCreate, UserProfileUpdate } from "@/database/models/userTypes"

export class UserProfileService {
  private static instance: UserProfileService
  private apiClient: ApiClient

  private constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService()
    }
    return UserProfileService.instance
  }

  /**
   * Obtener el perfil del usuario actual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      console.log("📤 Getting current user profile...")
      const response = await this.apiClient.get<UserProfile>("/profile/me")
      console.log("✅ User profile retrieved successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to get user profile:", error)
      return null
    }
  }

  /**
   * Crear un nuevo perfil de usuario
   */
  async createUserProfile(data: UserProfileCreate): Promise<UserProfile | null> {
    try {
      console.log("📤 Creating user profile...")
      const response = await this.apiClient.post<UserProfile>("/profile/", data)
      console.log("✅ User profile created successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to create user profile:", error)
      return null
    }
  }

  /**
   * Actualizar el perfil del usuario actual
   */
  async updateUserProfile(data: UserProfileUpdate): Promise<UserProfile | null> {
    try {
      console.log("📤 Updating user profile...", data)
      const response = await this.apiClient.put<UserProfile>("/profile/me", data)
      console.log("✅ User profile updated successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to update user profile:", error)
      return null
    }
  }

  /**
   * Actualización parcial del perfil
   */
  async patchUserProfile(data: UserProfileUpdate): Promise<UserProfile | null> {
    try {
      console.log("📤 Patching user profile...", data)
      const response = await this.apiClient.patch<UserProfile>("/profile/me", data)
      console.log("✅ User profile patched successfully")
      return response
    } catch (error) {
      console.error("❌ Failed to patch user profile:", error)
      return null
    }
  }

  /**
   * Eliminar el perfil del usuario actual
   */
  async deleteUserProfile(): Promise<boolean> {
    try {
      console.log("📤 Deleting user profile...")
      await this.apiClient.delete("/profile/me")
      console.log("✅ User profile deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to delete user profile:", error)
      return false
    }
  }
}
