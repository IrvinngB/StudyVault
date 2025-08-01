# Flujo de Autenticación - StudyVault

## Flujo Corregido

El flujo de autenticación ha sido corregido para evitar el parpadeo y proporcionar una experiencia más fluida:

### 1. Registro
- Usuario llena el formulario de registro
- Al enviar, se crea la cuenta en Supabase
- **NUEVO**: Se redirige a `/confirm-email` con el email como parámetro
- Se muestra un modal de éxito explicando que debe confirmar su email

### 2. Confirmación de Email
- **Pantalla de confirmación pendiente**: Muestra el email registrado y instrucciones
- Usuario recibe el email de confirmación
- Al hacer clic en el enlace del email, se confirma la cuenta
- **NUEVO**: Se puede redirigir de vuelta a la app con parámetros de confirmación

### 3. Login
- **NUEVO**: El email se pre-llena automáticamente si viene de confirmación
- Usuario ingresa su contraseña
- Al iniciar sesión exitosamente, se redirige a `/(tabs)`

### 4. Navegación Principal
- Usuario accede a la aplicación principal

## Cambios Técnicos Implementados

### 1. Estado de Transición
- Se agregó `isTransitioning` al hook `useAuth`
- Evita redirecciones múltiples durante las transiciones
- Muestra loading durante las operaciones de autenticación

### 2. Navegación Mejorada
- `AuthNavigator` ahora respeta el estado de transición
- Se evitan redirecciones automáticas durante transiciones
- Mejor manejo de rutas de transición

### 3. Parámetros de URL
- El email se pasa como parámetro entre pantallas
- Permite pre-llenar formularios automáticamente
- Mejora la experiencia del usuario

### 4. Animaciones Suaves
- Animaciones personalizadas para cada pantalla
- Transiciones más fluidas entre estados
- Evita el parpadeo durante las navegaciones

## Archivos Modificados

1. `app/(auth)/register.tsx` - Redirige a confirm-email
2. `app/(auth)/confirm-email.tsx` - Maneja ambos estados (pendiente y confirmado)
3. `app/(auth)/login.tsx` - Pre-llena email si viene como parámetro
4. `app/(auth)/_layout.tsx` - Animaciones mejoradas
5. `hooks/useAuth.tsx` - Estado de transición agregado
6. `components/AuthNavigator.tsx` - Mejor manejo de transiciones

## Beneficios

- ✅ Elimina el parpadeo después del registro
- ✅ Flujo más intuitivo y claro
- ✅ Mejor experiencia de usuario
- ✅ Transiciones suaves entre pantallas
- ✅ Pre-llenado automático de formularios
- ✅ Manejo robusto de estados de transición 