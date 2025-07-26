/**
 * Configuración de Supabase
 * 
 * INSTRUCCIONES PARA CONFIGURAR:
 * 
 * 1. Ve a https://supabase.com y crea un nuevo proyecto
 * 2. Copia la URL del proyecto y la clave anónima (anon key) desde el dashboard
 * 3. Reemplaza las variables de abajo con tus credenciales reales
 * 
 * Para desarrollo local:
 * - Si tienes Supabase CLI instalado y quieres usar una instancia local, 
 *   descomenta y configura las variables locales
 * - De lo contrario, usa las credenciales de tu proyecto en la nube para desarrollo
 */

// ========================================
// CONFIGURACIÓN PARA DESARROLLO
// ========================================

// Opción 1: Usar proyecto en la nube para desarrollo (RECOMENDADO)
export const SUPABASE_URL = 'https://llnmvrxgiykxeiinycbt.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsbm12cnhnaXlreGVpaW55Y2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMDA0NjIsImV4cCI6MjA2NTg3NjQ2Mn0.TCuyoJagBgoOhVnsCQabuXmeFy1o0QeEMR6e1gL40MI';

// Opción 2: Usar Supabase local (descomenta si usas CLI local)
// export const SUPABASE_URL = 'http://localhost:54321';
// export const SUPABASE_ANON_KEY = 'your-local-anon-key';

// ========================================
// CONFIGURACIÓN PARA PRODUCCIÓN
// ========================================
export const SUPABASE_URL_PROD = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY_PROD = 'your-anon-key-here';

// ========================================
// CONFIGURACIÓN DINÁMICA
// ========================================
export const getSupabaseConfig = () => {
  if (__DEV__) {
    return {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
    };
  } else {
    return {
      url: SUPABASE_URL_PROD,
      anonKey: SUPABASE_ANON_KEY_PROD,
    };
  }
};

// ========================================
// INSTRUCCIONES ADICIONALES
// ========================================

/**
 * PASOS PARA OBTENER TUS CREDENCIALES:
 * 
 * 1. Ve a https://supabase.com/dashboard
 * 2. Selecciona tu proyecto o crea uno nuevo
 * 3. Ve a Settings > API
 * 4. Copia:
 *    - Project URL (será algo como https://abcdefg.supabase.co)
 *    - anon/public key (será una cadena muy larga que empieza con "eyJ...")
 * 
 * 5. Reemplaza los valores de arriba
 * 
 * CONFIGURACIÓN DE TABLAS:
 * 
 * También necesitarás configurar las tablas en tu proyecto de Supabase.
 * Ve al archivo SUPABASE_CONFIG.md en la raíz del proyecto para ver
 * los scripts SQL necesarios.
 */
