import { database } from "../sqlite/database"
import type { LocalFile } from "../models/types"
import * as FileSystem from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"

export class FileService {
  private static instance: FileService

  private constructor() {}

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService()
    }
    return FileService.instance
  }

  public async getAllFiles(): Promise<LocalFile[]> {
    const files = await database.selectQuery("SELECT * FROM local_files ORDER BY created_at DESC")
    return this.parseFiles(files)
  }

  public async getFileById(id: number): Promise<LocalFile | null> {
    const file = await database.selectFirstQuery("SELECT * FROM local_files WHERE id = ?", [id])
    return file ? this.parseFile(file) : null
  }

  public async getFilesByClass(classId: string): Promise<LocalFile[]> {
    const files = await database.selectQuery("SELECT * FROM local_files WHERE class_id = ? ORDER BY created_at DESC", [
      classId,
    ])
    return this.parseFiles(files)
  }

  public async getFilesByType(fileType: string): Promise<LocalFile[]> {
    const files = await database.selectQuery("SELECT * FROM local_files WHERE file_type = ? ORDER BY created_at DESC", [
      fileType,
    ])
    return this.parseFiles(files)
  }

  public async importFile(classId?: string): Promise<LocalFile | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      })

      if (result.canceled) return null

      const asset = result.assets[0]
      const fileName = asset.name
      const fileUri = asset.uri
      const fileSize = asset.size || 0
      const mimeType = asset.mimeType || "application/octet-stream"

      // Create app directory if it doesn't exist
      const appDir = `${FileSystem.documentDirectory}studyvault/`
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true })

      // Generate unique filename
      const timestamp = Date.now()
      const extension = fileName.split(".").pop()
      const uniqueFileName = `${timestamp}_${fileName}`
      const localPath = `${appDir}${uniqueFileName}`

      // Copy file to app directory
      await FileSystem.copyAsync({
        from: fileUri,
        to: localPath,
      })

      // Determine file type
      const fileType = this.determineFileType(mimeType)

      // Save to database
      const fileData: Omit<LocalFile, "id" | "created_at" | "last_accessed"> = {
        class_id: classId,
        file_name: fileName,
        file_path: localPath,
        file_type: fileType,
        file_size: fileSize,
        mime_type: mimeType,
        tags: [],
        is_encrypted: false,
      }

      return await this.createFile(fileData)
    } catch (error) {
      console.error("Error importing file:", error)
      return null
    }
  }

  public async createFile(fileData: Omit<LocalFile, "id" | "created_at" | "last_accessed">): Promise<LocalFile> {
    const now = new Date().toISOString()

    const result = await database.executeQuery(
      `INSERT INTO local_files 
       (class_id, file_name, file_path, file_type, file_size, mime_type, 
        tags, created_at, last_accessed, is_encrypted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileData.class_id,
        fileData.file_name,
        fileData.file_path,
        fileData.file_type,
        fileData.file_size,
        fileData.mime_type,
        JSON.stringify(fileData.tags),
        now,
        now,
        fileData.is_encrypted ? 1 : 0,
      ],
    )

    const newFile: LocalFile = {
      id: result.lastInsertRowId as number,
      ...fileData,
      created_at: now,
      last_accessed: now,
    }

    return newFile
  }

  public async updateFile(id: number, updates: Partial<LocalFile>): Promise<LocalFile | null> {
    const existingFile = await this.getFileById(id)
    if (!existingFile) return null

    const updatedFile = {
      ...existingFile,
      ...updates,
    }

    await database.executeQuery(
      `UPDATE local_files SET 
       class_id = ?, file_name = ?, tags = ?, is_encrypted = ?
       WHERE id = ?`,
      [
        updatedFile.class_id,
        updatedFile.file_name,
        JSON.stringify(updatedFile.tags),
        updatedFile.is_encrypted ? 1 : 0,
        id,
      ],
    )

    return updatedFile
  }

  public async deleteFile(id: number): Promise<boolean> {
    const file = await this.getFileById(id)
    if (!file) return false

    try {
      // Delete physical file
      const fileInfo = await FileSystem.getInfoAsync(file.file_path)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(file.file_path)
      }

      // Delete from database
      const result = await database.executeQuery("DELETE FROM local_files WHERE id = ?", [id])

      return result.changes > 0
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  public async updateLastAccessed(id: number): Promise<void> {
    await database.executeQuery("UPDATE local_files SET last_accessed = ? WHERE id = ?", [new Date().toISOString(), id])
  }

  public async searchFiles(query: string): Promise<LocalFile[]> {
    const files = await database.selectQuery(
      `SELECT * FROM local_files 
       WHERE file_name LIKE ?
       ORDER BY created_at DESC`,
      [`%${query}%`],
    )
    return this.parseFiles(files)
  }

  public async getFileStats(): Promise<{
    total: number
    totalSize: number
    byType: Record<string, number>
  }> {
    const [totalResult, sizeResult, typeResults] = await Promise.all([
      database.selectFirstQuery("SELECT COUNT(*) as count FROM local_files"),
      database.selectFirstQuery("SELECT SUM(file_size) as total FROM local_files"),
      database.selectQuery("SELECT file_type, COUNT(*) as count FROM local_files GROUP BY file_type"),
    ])

    const byType: Record<string, number> = {}
    typeResults.forEach((result) => {
      byType[result.file_type] = result.count
    })

    return {
      total: totalResult?.count || 0,
      totalSize: sizeResult?.total || 0,
      byType,
    }
  }

  public async cleanupOrphanedFiles(): Promise<number> {
    // Get all file paths from database
    const files = await this.getAllFiles()
    let cleanedCount = 0

    for (const file of files) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.file_path)
        if (!fileInfo.exists) {
          // File doesn't exist, remove from database
          await database.executeQuery("DELETE FROM local_files WHERE id = ?", [file.id])
          cleanedCount++
        }
      } catch (error) {
        console.error("Error checking file:", error)
      }
    }

    return cleanedCount
  }

  private determineFileType(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document"
    return "other"
  }

  private parseFile(file: any): LocalFile {
    return {
      ...file,
      tags: file.tags ? JSON.parse(file.tags) : [],
      is_encrypted: Boolean(file.is_encrypted),
    }
  }

  private parseFiles(files: any[]): LocalFile[] {
    return files.map((file) => this.parseFile(file))
  }
}

// Export singleton instance
export const fileService = FileService.getInstance()
