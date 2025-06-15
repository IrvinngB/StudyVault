# Database Sync - StudyVault

## Sistema de Sincronización (V2.0+)

Esta carpeta contiene la lógica de sincronización entre SQLite local y Firebase.

## Archivos que se crearán:

### Core Sync
- **`sync.manager.ts`** - Gestor principal de sincronización
- **`conflict.resolver.ts`** - Resolución de conflictos de datos
- **`sync.queue.ts`** - Cola de operaciones de sincronización

### Strategies
- **`offline-first.strategy.ts`** - Estrategia offline-first
- **`real-time.strategy.ts`** - Sincronización en tiempo real
- **`batch.sync.ts`** - Sincronización por lotes

### Status & Monitoring
- **`sync.status.ts`** - Estado de sincronización
- **`sync.monitor.ts`** - Monitoreo y métricas de sync

## Estrategia de Sincronización

### Offline-First Approach
```
1. Usuario hace cambios → SQLite local (inmediato)
2. Marca cambios como "pendientes de sync"
3. Cuando hay conexión → Sincroniza con Firebase
4. Actualiza estado local
```

### Resolución de Conflictos

#### Estrategias de Conflicto
- **Last Write Wins**: El último cambio gana
- **User Choice**: Mostrar conflicto al usuario
- **Merge**: Combinar cambios cuando es posible
- **Versioning**: Mantener múltiples versiones

#### Tipos de Conflicto
```typescript
enum ConflictType {
  UPDATE_UPDATE = 'update_update',  // Ambos editaron
  UPDATE_DELETE = 'update_delete',  // Uno editó, otro borró
  DELETE_UPDATE = 'delete_update',  // Uno borró, otro editó
}
```

### Estado de Sincronización

#### Estados Posibles
```typescript
enum SyncStatus {
  SYNCED = 'synced',           // Todo sincronizado
  PENDING = 'pending',         // Cambios por sincronizar
  SYNCING = 'syncing',         // Sincronizando ahora
  CONFLICT = 'conflict',       // Hay conflictos
  ERROR = 'error',             // Error de sincronización
  OFFLINE = 'offline',         // Sin conexión
}
```

## Implementación Técnica

### SQLite → Firebase
```typescript
// Tabla de sync tracking
CREATE TABLE sync_status (
  entity_type TEXT,
  entity_id TEXT,
  last_synced DATETIME,
  local_updated DATETIME,
  sync_status TEXT,
  conflict_data TEXT
);
```

### Firebase → SQLite
```typescript
// Firestore listener para cambios remotos
firestore().collection('tasks')
  .where('userId', '==', currentUserId)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      handleRemoteChange(change);
    });
  });
```

## Flujo de Sincronización

### Cambio Local
```
1. Usuario edita tarea
2. Guardar en SQLite inmediatamente
3. Marcar como "pending sync"
4. Mostrar UI actualizada
5. En background: intentar sync con Firebase
```

### Cambio Remoto
```
1. Firebase notifica cambio
2. Verificar si hay conflicto con cambios locales
3. Si no hay conflicto: aplicar a SQLite
4. Si hay conflicto: aplicar estrategia de resolución
5. Actualizar UI
```

## Ventajas de esta Arquitectura

✅ **Experiencia fluida**: App siempre responde rápido
✅ **Offline robusto**: Funciona sin internet
✅ **Multi-dispositivo**: Sync automático entre dispositivos
✅ **Resolución de conflictos**: Manejo inteligente de conflictos
✅ **Escalable**: Funciona con muchos usuarios y datos

## Métricas de Sync

- **Tiempo de sincronización**
- **Número de conflictos**
- **Éxito/fallo de operaciones**
- **Tamaño de datos sincronizados**
- **Frecuencia de uso offline vs online**
