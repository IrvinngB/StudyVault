# Database Schemas - StudyVault

## Definiciones de Esquemas de Base de Datos

Esta carpeta contiene las definiciones de todas las tablas y estructuras de datos de StudyVault.

## Archivos que se crearán:

### Core Entities
- **`user.schema.ts`** - Esquema de usuarios y perfiles
- **`course.schema.ts`** - Definición de cursos y asignaturas
- **`task.schema.ts`** - Estructura de tareas y evaluaciones
- **`note.schema.ts`** - Esquema de notas y contenido
- **`calendar.schema.ts`** - Eventos y horarios

### Support Entities
- **`tag.schema.ts`** - Sistema de etiquetas
- **`attachment.schema.ts`** - Archivos adjuntos
- **`notification.schema.ts`** - Notificaciones y alertas
- **`analytics.schema.ts`** - Métricas y estadísticas

## Diseño Consideraciones

### Para SQLite (V1.0)
- Usar **SQLite** con **Expo SQLite**
- Esquemas con **CREATE TABLE** statements
- Relaciones con **FOREIGN KEY**
- Índices para optimización

### Para Firebase (V2.0)
- Convertir esquemas a **Firestore collections**
- Mantener **compatibilidad** con estructura SQLite
- **Subcollections** para relaciones anidadas

## Estructura de Archivos

Cada archivo de esquema contendrá:
```typescript
// Interfaz TypeScript
export interface Entity {
  id: string;
  // ... campos
}

// Esquema SQLite
export const CREATE_TABLE_SQL = `...`;

// Esquema Firebase (para migración)
export const FIRESTORE_STRUCTURE = {...};
```

## Relaciones Entre Entidades

```
User (1) ←→ (N) Course
Course (1) ←→ (N) Task
Course (1) ←→ (N) Note  
Course (1) ←→ (N) CalendarEvent
Note (1) ←→ (N) Attachment
User (1) ←→ (N) Notification
```
