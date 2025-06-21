/**
 * Configuración de API para diferentes entornos
 */

// Obtener la IP local automáticamente (para desarrollo)
const getLocalIP = () => {
  // En desarrollo, puedes cambiar esta IP manualmente si es necesario
  return "192.168.1.175"; // Tu IP local actual
};

export const API_CONFIG = {
  development: {
    baseURL: `http://${getLocalIP()}:8000`,
    timeout: 10000,
  },
  production: {
    baseURL: "https://your-api-domain.com",
    timeout: 15000,
  },
};

export const getApiConfig = () => {
  return __DEV__ ? API_CONFIG.development : API_CONFIG.production;
};

// URLs específicas para testing
export const API_URLS = {
  local: "http://localhost:8000",           // Para testing en navegador
  localIP: `http://${getLocalIP()}:8000`,   // Para emulador/dispositivo
  production: "https://your-api-domain.com", // Para producción
};

// Helper para logs
export const logApiConfig = () => {
  const config = getApiConfig();
  console.log('🌐 API Configuration:', {
    environment: __DEV__ ? 'development' : 'production',
    baseURL: config.baseURL,
    timeout: config.timeout,
  });
};
