import { database } from "../sqlite/database"
import { apiClient } from "../api/client"
import { syncManager } from "../sync/syncManager"

export class DatabaseInitializer {
  public static async initialize(): Promise<void> {
    try {
      console.log("Initializing StudyVault database...")

      // Step 1: Initialize SQLite database
      await database.initialize()
      console.log("✓ SQLite database initialized")

      // Step 2: Initialize API client
      await apiClient.initialize()
      console.log("✓ API client initialized")

      // Step 3: Initialize sync manager
      await syncManager.initialize()
      console.log("✓ Sync manager initialized")

      // Step 4: Perform initial sync if authenticated
      if (apiClient.isAuthenticated()) {
        console.log("User authenticated, performing initial sync...")
        await syncManager.performSync()
        console.log("✓ Initial sync completed")
      }

      console.log("🎉 StudyVault database initialization complete!")
    } catch (error) {
      console.error("❌ Database initialization failed:", error)
      throw error
    }
  }

  public static async cleanup(): Promise<void> {
    try {
      console.log("Cleaning up database connections...")

      syncManager.stopPeriodicSync()
      await database.close()

      console.log("✓ Database cleanup complete")
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }
}
