# Database Layer - StudyVault

## Arquitectura de Base de Datos

### Estrategia de Desarrollo
- **V1.0**: SQLite local únicamente (desarrollo rápido)
- **V2.0**: Migración gradual a Firebase + SQLite como cache
- **V3.0**: Funciones avanzadas en la nube

### Estructura de Carpetas

```
lib/database/
├── schemas/          # Definiciones de tablas y estructuras
├── repositories/     # Capa de acceso a datos (Repository Pattern)
├── migrations/       # Scripts de migración y versionado
├── sync/            # Lógica de sincronización (para V2.0)
└── index.ts         # Configuración principal de la DB
```

## Diseño para Migración SQLite → Firebase

### Patrón Repository
Usar el patrón Repository permite cambiar el backend sin afectar la lógica de negocio:

```typescript
interface TaskRepository {
  getAll(): Promise<Task[]>
  create(task: Task): Promise<Task>
  update(id: string, task: Partial<Task>): Promise<Task>
  delete(id: string): Promise<void>
}

// V1.0: SQLiteTaskRepository
// V2.0: FirebaseTaskRepository (misma interfaz)
```

### Estrategia de Migración

#### Fase 1 (V1.0) - Solo SQLite
- Desarrollo completo con SQLite
- Interfaces Repository definidas
- Toda la funcionalidad offline

#### Fase 2 (V2.0) - Híbrido
- Firebase como backend principal
- SQLite como cache local
- Sincronización automática
- Migración de datos de usuarios existentes

#### Fase 3 (V3.0) - Cloud-first
- Funciones avanzadas en Firebase
- Analytics centralizados
- Colaboración en tiempo real

## Beneficios de esta Estrategia

✅ **Desarrollo rápido**: SQLite es más simple para empezar
✅ **Sin bloqueos**: No dependes de configurar Firebase desde el día 1
✅ **Migración suave**: Los usuarios no pierden datos
✅ **Flexibilidad**: Puedes cambiar de backend si es necesario
✅ **Testing fácil**: SQLite es más fácil para testing unitario
