import * as FileSystem from "expo-file-system"

export interface FileInfo {
  uri: string
  name: string
  size: number
  type: "image" | "document"
  mimeType?: string
}

class LocalFileManager {
  private readonly baseDir = `${FileSystem.documentDirectory}StudyFiles/`
  private readonly photosDir = `${this.baseDir}Fotos/`
  private readonly pdfDir = `${this.baseDir}PDF/`
  private readonly documentsDir = `${this.baseDir}Documentos/`

  async initializeDirectories(): Promise<void> {
    try {
      // Crear directorio base
      const baseDirInfo = await FileSystem.getInfoAsync(this.baseDir)
      if (!baseDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.baseDir, { intermediates: true })
      }

      // Crear subdirectorios
      const directories = [this.photosDir, this.pdfDir, this.documentsDir]

      for (const dir of directories) {
        const dirInfo = await FileSystem.getInfoAsync(dir)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
        }
      }
    } catch (error) {
      console.error("Error al inicializar directorios:", error)
      throw new Error("No se pudieron crear los directorios necesarios")
    }
  }

  private getTargetDirectory(type: "image" | "document", mimeType?: string): string {
    if (type === "image") {
      return this.photosDir
    }

    if (mimeType?.includes("pdf")) {
      return this.pdfDir
    }

    return this.documentsDir
  }

  private generateFileName(originalName: string, noteId: string, type: "image" | "document"): string {
    const timestamp = Date.now()
    const extension = originalName.split(".").pop() || ""
    const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")

    const prefix = type === "image" ? "IMG" : "DOC"
    return `${prefix}_${noteId}_${timestamp}_${baseName}.${extension}`
  }

  async saveFile(fileInfo: FileInfo, noteId: string): Promise<string> {
    try {
      await this.initializeDirectories()

      const targetDir = this.getTargetDirectory(fileInfo.type, fileInfo.mimeType)
      const fileName = this.generateFileName(fileInfo.name, noteId, fileInfo.type)
      const targetPath = `${targetDir}${fileName}`

      // Copiar archivo al directorio de destino
      await FileSystem.copyAsync({
        from: fileInfo.uri,
        to: targetPath,
      })

      console.log(`Archivo guardado: ${targetPath}`)
      return targetPath
    } catch (error) {
      console.error("Error al guardar archivo:", error)
      throw new Error(`No se pudo guardar el archivo: ${fileInfo.name}`)
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath)
        console.log(`Archivo eliminado: ${filePath}`)
      }
    } catch (error) {
      console.error("Error al eliminar archivo:", error)
      throw new Error("No se pudo eliminar el archivo")
    }
  }

  async getFileInfo(filePath: string): Promise<FileSystem.FileInfo> {
    try {
      return await FileSystem.getInfoAsync(filePath)
    } catch (error) {
      console.error("Error al obtener información del archivo:", error)
      throw new Error("No se pudo obtener información del archivo")
    }
  }

  async cleanupOrphanedFiles(validFilePaths: string[]): Promise<void> {
    try {
      const directories = [this.photosDir, this.pdfDir, this.documentsDir]

      for (const dir of directories) {
        const dirInfo = await FileSystem.getInfoAsync(dir)
        if (!dirInfo.exists) continue

        const files = await FileSystem.readDirectoryAsync(dir)

        for (const file of files) {
          const fullPath = `${dir}${file}`

          // Si el archivo no está en la lista de archivos válidos, eliminarlo
          if (!validFilePaths.includes(fullPath)) {
            await this.deleteFile(fullPath)
            console.log(`Archivo huérfano eliminado: ${fullPath}`)
          }
        }
      }
    } catch (error) {
      console.error("Error al limpiar archivos huérfanos:", error)
    }
  }

  async getDirectorySize(): Promise<{ photos: number; pdfs: number; documents: number; total: number }> {
    try {
      const sizes = { photos: 0, pdfs: 0, documents: 0, total: 0 }

      const directories = [
        { path: this.photosDir, key: "photos" as keyof typeof sizes },
        { path: this.pdfDir, key: "pdfs" as keyof typeof sizes },
        { path: this.documentsDir, key: "documents" as keyof typeof sizes },
      ]

      for (const { path, key } of directories) {
        const dirInfo = await FileSystem.getInfoAsync(path)
        if (!dirInfo.exists) continue

        const files = await FileSystem.readDirectoryAsync(path)

        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${path}${file}`)
          if (fileInfo.exists && !fileInfo.isDirectory) {
            sizes[key] += fileInfo.size || 0
          }
        }
      }

      sizes.total = sizes.photos + sizes.pdfs + sizes.documents
      return sizes
    } catch (error) {
      console.error("Error al calcular tamaño de directorios:", error)
      return { photos: 0, pdfs: 0, documents: 0, total: 0 }
    }
  }

  // Método para comprimir imágenes (opcional)
  async compressImage(imageUri: string, quality = 0.8): Promise<string> {
    try {
      // Aquí podrías implementar compresión de imágenes usando expo-image-manipulator
      // Por ahora, simplemente retornamos la URI original
      return imageUri
    } catch (error) {
      console.error("Error al comprimir imagen:", error)
      return imageUri
    }
  }
}

export const localFileManager = new LocalFileManager()
