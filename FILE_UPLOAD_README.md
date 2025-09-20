# 📁 Sistema de Archivos para Notas

## 🚀 Funcionalidades Implementadas

### Backend (FastAPI)
- ✅ **Subir archivos** a notas existentes
- ✅ **Descargar archivos** de notas
- ✅ **Eliminar archivos** de notas
- ✅ **Listar archivos** de una nota
- ✅ **Almacenamiento seguro** en el servidor
- ✅ **Validación de permisos** por usuario

### Frontend (React Native)
- ✅ **Hook `useNoteFiles`** para manejo de archivos
- ✅ **Integración con el servicio de notas**
- ✅ **Manejo de errores** y estados de carga

## 📋 Endpoints del Backend

### 1. Subir Archivo a Nota
```
POST /notes/{note_id}/upload-file
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: file (archivo)
```

### 2. Descargar Archivo de Nota
```
GET /notes/{note_id}/download/{file_id}
Authorization: Bearer <token>
```

### 3. Eliminar Archivo de Nota
```
DELETE /notes/{note_id}/files/{file_id}
Authorization: Bearer <token>
```

### 4. Listar Archivos de Nota
```
GET /notes/{note_id}/files
Authorization: Bearer <token>
```

## 🛠️ Uso en el Frontend

### Hook useNoteFiles

```typescript
import { useNoteFiles } from '@/hooks/useNotes';

const { uploadFile, downloadFile, deleteFile, listFiles, loading, error } = useNoteFiles();

// Subir archivo
const handleUpload = async (noteId: string, file: File) => {
  const result = await uploadFile(noteId, file);
  if (result) {
    console.log('Archivo subido:', result.attachment);
  }
};

// Listar archivos
const handleListFiles = async (noteId: string) => {
  const files = await listFiles(noteId);
  if (files) {
    console.log('Archivos:', files);
  }
};

// Descargar archivo
const handleDownload = async (noteId: string, fileId: string) => {
  const blob = await downloadFile(noteId, fileId);
  if (blob) {
    // Crear URL para descarga
    const url = URL.createObjectURL(blob);
    // Abrir en navegador o guardar
  }
};

// Eliminar archivo
const handleDelete = async (noteId: string, fileId: string) => {
  const result = await deleteFile(noteId, fileId);
  if (result) {
    console.log('Archivo eliminado');
  }
};
```

### Ejemplo de Componente

```typescript
import React, { useState } from 'react';
import { useNoteFiles } from '@/hooks/useNotes';

const NoteFileManager = ({ noteId }: { noteId: string }) => {
  const { uploadFile, downloadFile, deleteFile, listFiles, loading, error } = useNoteFiles();
  const [files, setFiles] = useState([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(noteId, file);
      // Actualizar lista de archivos
      const updatedFiles = await listFiles(noteId);
      if (updatedFiles) setFiles(updatedFiles);
    }
  };

  const handleDownload = async (fileId: string) => {
    const blob = await downloadFile(noteId, fileId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (fileId: string) => {
    await deleteFile(noteId, fileId);
    // Actualizar lista de archivos
    const updatedFiles = await listFiles(noteId);
    if (updatedFiles) setFiles(updatedFiles);
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {files.map((file) => (
        <div key={file.id}>
          <span>{file.filename}</span>
          <button onClick={() => handleDownload(file.id)}>Descargar</button>
          <button onClick={() => handleDelete(file.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
};
```

## 📂 Estructura de Archivos en el Servidor

```
uploads/
└── notes/
    └── {note_id}/
        ├── {uuid1}.pdf
        ├── {uuid2}.docx
        └── {uuid3}.jpg
```

## 🔒 Seguridad

- ✅ **Autenticación requerida** para todas las operaciones
- ✅ **Validación de permisos** - usuarios solo pueden acceder a sus propias notas
- ✅ **Nombres de archivo únicos** para evitar conflictos
- ✅ **Limpieza automática** si falla la actualización en base de datos

## 📊 Tipos de Archivo Soportados

- **Documentos**: PDF, DOC, DOCX, TXT
- **Imágenes**: JPG, PNG, GIF
- **Otros**: Cualquier tipo de archivo

## 🚨 Consideraciones

1. **Límites de tamaño**: Configurar límites según necesidades
2. **Tipos permitidos**: Agregar validación de tipos de archivo
3. **Almacenamiento**: Considerar usar servicios de almacenamiento en la nube para producción
4. **Backup**: Implementar estrategias de backup para archivos importantes

## 🔧 Configuración del Servidor

Asegúrate de que el directorio `uploads/` tenga permisos de escritura:

```bash
mkdir -p uploads/notes
chmod 755 uploads/notes
```

## 📱 Integración con CreateNoteForm

El `CreateNoteForm.tsx` ya está configurado para usar el backend FastAPI. Las notas se guardan automáticamente en Supabase a través del backend, y los archivos se almacenan en el servidor.

Para agregar funcionalidad de archivos al formulario de creación de notas, puedes usar el hook `useNoteFiles` después de crear la nota.
