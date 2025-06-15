# Database Repositories - StudyVault

## Patrón Repository para Acceso a Datos

Esta carpeta implementa el **patrón Repository** que permite abstraer el acceso a datos y facilitar la migración de SQLite a Firebase.

## Archivos que se crearán:

### Interfaces Base
- **`base.repository.ts`** - Interfaz base común para todos los repositories
- **`repository.types.ts`** - Tipos y interfaces compartidas

### Repositories por Entidad
- **`UserRepository.ts`** - Gestión de usuarios y perfiles
- **`CourseRepository.ts`** - CRUD de cursos y asignaturas  
- **`TaskRepository.ts`** - Gestión de tareas y evaluaciones
- **`NoteRepository.ts`** - CRUD de notas y contenido
- **`CalendarRepository.ts`** - Eventos y horarios
- **`AnalyticsRepository.ts`** - Métricas y estadísticas

### Implementaciones
- **`sqlite/`** - Implementaciones SQLite (V1.0)
- **`firebase/`** - Implementaciones Firebase (V2.0)

## Ventajas del Patrón Repository

### ✅ **Abstracción**
```typescript
// La app usa la interfaz, no la implementación
const taskRepo: TaskRepository = new SQLiteTaskRepository();
// Después se cambia por:
const taskRepo: TaskRepository = new FirebaseTaskRepository();
```

### ✅ **Testing**
```typescript
// Mock fácil para testing
const mockRepo: TaskRepository = new MockTaskRepository();
```

### ✅ **Migración Suave**
- Misma interfaz para SQLite y Firebase
- Cambio transparente para la lógica de negocio
- Migración gradual por módulos

## Estructura de Implementación

### V1.0 - SQLite
```typescript
class SQLiteTaskRepository implements TaskRepository {
  async getAll(): Promise<Task[]> {
    // Consulta SQLite
    return db.getAllAsync('SELECT * FROM tasks');
  }
}
```

### V2.0 - Firebase
```typescript
class FirebaseTaskRepository implements TaskRepository {
  async getAll(): Promise<Task[]> {
    // Consulta Firestore
    const snapshot = await firestore().collection('tasks').get();
    return snapshot.docs.map(doc => doc.data());
  }
}
```

## Operaciones Comunes

Cada repository implementará:
- **CRUD básico**: Create, Read, Update, Delete
- **Búsquedas**: Filtros, ordenación, paginación
- **Relaciones**: Datos relacionados entre entidades
- **Validación**: Validación de datos antes de guardar
- **Cache**: Estrategias de cache local (para Firebase)
