# Database Migrations - StudyVault

## Sistema de Migraciones y Versionado

Esta carpeta maneja las migraciones de base de datos y el versionado de esquemas.

## Archivos que se crearán:

### SQLite Migrations (V1.0)
- **`001_initial_setup.sql`** - Creación inicial de todas las tablas
- **`002_add_tags_system.sql`** - Sistema de etiquetas
- **`003_add_analytics_tables.sql`** - Tablas de métricas
- **`004_add_notifications.sql`** - Sistema de notificaciones

### Migration Runner
- **`migration.runner.ts`** - Ejecutor de migraciones
- **`version.manager.ts`** - Gestión de versiones de DB

### Firebase Migration (V2.0)
- **`firebase-migration.ts`** - Migración de SQLite a Firebase
- **`data-export.ts`** - Exportación de datos de usuarios
- **`data-import.ts`** - Importación a Firebase

## Estrategia de Migraciones

### V1.0 - SQLite Local
```sql
-- 001_initial_setup.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### V2.0 - Migración a Firebase
```typescript
// Proceso de migración
1. Exportar datos de SQLite
2. Transformar estructura a Firestore
3. Subir datos a Firebase
4. Verificar integridad
5. Cambiar repositories a Firebase
6. Mantener SQLite como cache
```

## Versionado de Base de Datos

### Tabla de Versiones
```sql
CREATE TABLE schema_versions (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
```

### Control de Versiones
- **Version 1**: Esquema inicial básico
- **Version 2**: Sistema de etiquetas y categorías
- **Version 3**: Analytics y métricas
- **Version 4**: Notificaciones inteligentes
- **Version 5**: Migración a Firebase (preparación)

## Proceso de Migración SQLite → Firebase

### Fase 1: Preparación
- Normalizar datos en SQLite
- Agregar campos de sincronización
- Validar integridad de datos

### Fase 2: Exportación
- Script para exportar todos los datos
- Formato compatible con Firestore
- Validación de datos exportados

### Fase 3: Importación
- Crear estructura en Firestore
- Importar datos por lotes
- Verificar integridad

### Fase 4: Transición
- Cambiar repositories gradualmente
- Mantener sincronización
- Fallback a SQLite si hay problemas

## Beneficios

✅ **Versionado controlado**: Cambios incrementales seguros
✅ **Rollback posible**: Volver a versión anterior si hay problemas  
✅ **Migración suave**: Usuarios no pierden datos
✅ **Testing**: Cada migración se puede probar independientemente
