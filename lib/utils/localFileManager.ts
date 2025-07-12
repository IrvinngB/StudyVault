import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { AttachmentData } from '../../database/services/notesService';

export interface FilePickerResult {
  success: boolean;
  attachment?: AttachmentData;
  error?: string;
}

export interface LocalFileManagerOptions {
  noteId: string;
  classId: string;
}

class LocalFileManager {
  private baseDir = `${FileSystem.documentDirectory}StudyFiles/`;

  /**
   * Inicializar el directorio base
   */
  async initializeDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.baseDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.baseDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing directory:', error);
      throw new Error('No se pudo inicializar el directorio de archivos');
    }
  }

  /**
   * Obtener la ruta del directorio para una nota específica
   */
  private getNoteDirectory(classId: string, noteId: string): string {
    return `${this.baseDir}${classId}/${noteId}/`;
  }

  /**
   * Crear directorio para una nota
   */
  private async createNoteDirectory(classId: string, noteId: string): Promise<string> {
    const noteDir = this.getNoteDirectory(classId, noteId);
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(noteDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(noteDir, { intermediates: true });
      }
      return noteDir;
    } catch (error) {
      console.error('Error creating note directory:', error);
      throw new Error('No se pudo crear el directorio de la nota');
    }
  }

  /**
   * Seleccionar y guardar una imagen
   */
  async pickImage(options: LocalFileManagerOptions): Promise<FilePickerResult> {
    try {
      await this.initializeDirectory();
      
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Se necesitan permisos para acceder a la galería'
        };
      }

      // Seleccionar imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { success: false, error: 'Selección cancelada' };
      }

      const asset = result.assets[0];
      const noteDir = await this.createNoteDirectory(options.classId, options.noteId);
      
      // Generar nombre único para el archivo
      const fileName = `img_${Date.now()}.${asset.uri.split('.').pop()}`;
      const localPath = `${noteDir}${fileName}`;

      // Copiar archivo al directorio local
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      // Crear thumbnail si es necesario
      const thumbnailPath = await this.createImageThumbnail(localPath, noteDir);

      const attachment: AttachmentData = {
        filename: fileName,
        type: 'image',
        size: asset.fileSize || 0,
        local_path: localPath,
        mime_type: asset.mimeType || 'image/jpeg',
        thumbnail_path: thumbnailPath,
      };

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      console.error('Error picking image:', error);
      return {
        success: false,
        error: 'Error al seleccionar imagen'
      };
    }
  }

  /**
   * Seleccionar y guardar un documento
   */
  async pickDocument(options: LocalFileManagerOptions): Promise<FilePickerResult> {
    try {
      await this.initializeDirectory();

      // Seleccionar documento
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, error: 'Selección cancelada' };
      }

      const asset = result.assets[0];
      const noteDir = await this.createNoteDirectory(options.classId, options.noteId);
      
      // Generar nombre único para el archivo
      const fileName = `doc_${Date.now()}_${asset.name}`;
      const localPath = `${noteDir}${fileName}`;

      // Copiar archivo al directorio local
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      const attachment: AttachmentData = {
        filename: fileName,
        type: this.getFileTypeFromMimeType(asset.mimeType || ''),
        size: asset.size || 0,
        local_path: localPath,
        mime_type: asset.mimeType || 'application/octet-stream',
      };

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      console.error('Error picking document:', error);
      return {
        success: false,
        error: 'Error al seleccionar documento'
      };
    }
  }

  /**
   * Tomar foto con la cámara
   */
  async takePhoto(options: LocalFileManagerOptions): Promise<FilePickerResult> {
    try {
      await this.initializeDirectory();
      
      // Pedir permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Se necesitan permisos para usar la cámara'
        };
      }

      // Tomar foto
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        return { success: false, error: 'Captura cancelada' };
      }

      const asset = result.assets[0];
      const noteDir = await this.createNoteDirectory(options.classId, options.noteId);
      
      // Generar nombre único para el archivo
      const fileName = `photo_${Date.now()}.jpg`;
      const localPath = `${noteDir}${fileName}`;

      // Copiar archivo al directorio local
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      // Crear thumbnail
      const thumbnailPath = await this.createImageThumbnail(localPath, noteDir);

      const attachment: AttachmentData = {
        filename: fileName,
        type: 'image',
        size: asset.fileSize || 0,
        local_path: localPath,
        mime_type: 'image/jpeg',
        thumbnail_path: thumbnailPath,
      };

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      console.error('Error taking photo:', error);
      return {
        success: false,
        error: 'Error al tomar foto'
      };
    }
  }

  /**
   * Crear thumbnail para imagen
   */
  private async createImageThumbnail(imagePath: string, noteDir: string): Promise<string> {
    try {
      const thumbnailName = `thumb_${Date.now()}.jpg`;
      const thumbnailPath = `${noteDir}${thumbnailName}`;
      
      // En este caso, usaremos la imagen original como thumbnail
      // En una implementación más completa, aquí se redimensionaría la imagen
      await FileSystem.copyAsync({
        from: imagePath,
        to: thumbnailPath,
      });
      
      return thumbnailPath;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return imagePath; // Fallback a la imagen original
    }
  }

  /**
   * Determinar tipo de archivo por MIME type
   */
  private getFileTypeFromMimeType(mimeType: string): AttachmentData['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Eliminar todos los archivos de una nota
   */
  async deleteNoteFiles(classId: string, noteId: string): Promise<boolean> {
    try {
      const noteDir = this.getNoteDirectory(classId, noteId);
      const dirInfo = await FileSystem.getInfoAsync(noteDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(noteDir);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting note files:', error);
      return false;
    }
  }

  /**
   * Obtener información de un archivo
   */
  async getFileInfo(filePath: string): Promise<FileSystem.FileInfo | null> {
    try {
      return await FileSystem.getInfoAsync(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Obtener tamaño total de archivos de una nota
   */
  async getNoteFilesSize(classId: string, noteId: string): Promise<number> {
    try {
      const noteDir = this.getNoteDirectory(classId, noteId);
      const dirInfo = await FileSystem.getInfoAsync(noteDir);
      
      if (!dirInfo.exists) return 0;
      
      const files = await FileSystem.readDirectoryAsync(noteDir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = `${noteDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          totalSize += fileInfo.size || 0;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting note files size:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    totalFiles: number;
    byType: Record<string, { count: number; size: number }>;
  }> {
    try {
      const stats = {
        totalSize: 0,
        totalFiles: 0,
        byType: {} as Record<string, { count: number; size: number }>
      };

      const baseInfo = await FileSystem.getInfoAsync(this.baseDir);
      if (!baseInfo.exists) return stats;

      // Esta sería una implementación simplificada
      // En una versión completa recorrería recursivamente todos los archivos
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalSize: 0,
        totalFiles: 0,
        byType: {}
      };
    }
  }
}

export const localFileManager = new LocalFileManager();
export default localFileManager;
