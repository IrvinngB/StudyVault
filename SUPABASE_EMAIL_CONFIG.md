# Configuración de Supabase para Email y Reset de Contraseña

## 📧 Configuración de Emails

### 1. Configurar el Provider de Email

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication > Settings**
4. En la sección **SMTP Settings**, configura:

```
SMTP Host: smtp.gmail.com (para Gmail)
SMTP Port: 587
SMTP User: tu-email@gmail.com
SMTP Pass: tu-app-password
```

**Para Gmail:**
- Necesitas generar una "App Password" en tu cuenta de Google
- Ve a: Google Account > Security > 2-Step Verification > App passwords
- Genera una contraseña específica para la aplicación

### 2. Configurar Templates de Email

En **Authentication > Email Templates**, personaliza:

#### Template de Confirmación de Email:
```html
<h1>Confirma tu cuenta en StudyVault</h1>
<p>Hola,</p>
<p>Gracias por registrarte en StudyVault. Haz clic en el enlace de abajo para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
<p>¡Gracias!<br>El equipo de StudyVault</p>
```

#### Template de Reset de Contraseña:
```html
<h1>Restablecer tu contraseña de StudyVault</h1>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de StudyVault.</p>
<p>Haz clic en el enlace de abajo para crear una nueva contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer mi contraseña</a></p>
<p>Este enlace expirará en 24 horas.</p>
<p>Si no solicitaste este cambio, puedes ignorar este email.</p>
<p>¡Gracias!<br>El equipo de StudyVault</p>
```

## 🔗 Configuración de Redirect URLs

### 1. URLs de Redirect para la App

En **Authentication > URL Configuration**, configura:

#### Site URL:
```
https://tu-dominio.com
```

#### Redirect URLs:
```
https://tu-dominio.com/auth/callback
studyvault://reset-password
studyvault://confirm-email
exp://localhost:19000/--/(auth)/login
exp://localhost:19000/--/(auth)/confirm-email
exp://localhost:19000/--/(auth)/update-password
```

### 2. Para Desarrollo Local (Expo)

Agrega estas URLs adicionales:

```
exp://127.0.0.1:19000/--/(auth)/login
exp://192.168.1.100:19000/--/(auth)/login  (tu IP local)
studyvault://reset-password
studyvault://confirm-email
```

## ⚙️ Configuración de Políticas de Seguridad

### 1. Habilitar Email Confirmations

En **Authentication > Settings**:
- ✅ **Enable email confirmations**: ON
- ✅ **Enable password recovery**: ON
- ⚠️ **Disable new user signups**: OFF (para permitir registro)

### 2. Configurar Row Level Security (RLS)

```sql
-- Para la tabla user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir insertar perfiles después del registro
CREATE POLICY "Enable insert for authenticated users only" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## 📱 Configuración de Deep Links

### 1. En tu app.json/expo.json

```json
{
  "expo": {
    "scheme": "studyvault",
    "platforms": ["ios", "android"],
    "web": {
      "bundler": "metro"
    }
  }
}
```

### 2. URLs que manejará tu app:

- **Confirmación de email**: `studyvault://confirm-email`
- **Reset de contraseña**: `studyvault://reset-password`

## 🚀 Configuración del Backend

### 1. Variables de entorno necesarias

Crea un archivo `.env` en tu directorio `Api-Study` con:

```env
SUPABASE_URL=https://llnmvrxgiykxeiinycbt.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 2. Instalar dependencias para requests (opcional)

Si quieres usar requests para llamadas HTTP directas:

```bash
pip install requests
```

O usa el cliente de Supabase que ya tienes configurado.

## 🧪 Testing

### 1. Probar Email de Confirmación

1. Registra un nuevo usuario
2. Revisa el email recibido
3. Haz clic en el enlace de confirmación
4. Debería redirigir a la app y mostrar login

### 2. Probar Reset de Contraseña

1. Ve a "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Revisa el email recibido
4. Haz clic en el enlace
5. Debería abrir la app en la pantalla de nueva contraseña

## 🔍 Troubleshooting

### Emails no llegan:

1. Verifica la configuración SMTP
2. Revisa la carpeta de spam
3. Confirma que el email template está configurado
4. Verifica los logs en Supabase Dashboard > Logs

### Deep links no funcionan:

1. Verifica que el scheme esté configurado en app.json
2. Confirma las redirect URLs en Supabase
3. Para desarrollo, usa `expo start --tunnel`

### Errores de autenticación:

1. Verifica que RLS esté configurado correctamente
2. Confirma que las políticas permiten las operaciones necesarias
3. Revisa los logs de errores en Supabase

## 🚀 Siguiente Paso

Después de configurar todo esto en Supabase:

1. Actualiza las credenciales en `config/supabase.ts`
2. Testa el flujo completo de registro y confirmación
3. Testa el flujo de reset de contraseña
4. Configura los templates de email con tu branding

¡Listo! Ahora tu app tiene confirmación de email y reset de contraseña completamente funcional.
