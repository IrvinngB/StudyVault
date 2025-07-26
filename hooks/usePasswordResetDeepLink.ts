import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';

export function usePasswordResetDeepLink() {
  useEffect(() => {
    const parseUrlParams = (url: string) => {
      // Manejar tanto URLs con # (hash) como con ? (query)
      const hashPart = url.split('#')[1];
      const queryPart = url.split('?')[1];
      
      if (hashPart) {
        return new URLSearchParams(hashPart);
      } else if (queryPart) {
        return new URLSearchParams(queryPart);
      }
      
      return new URLSearchParams();
    };

    const storeTokensTemporarily = async (accessToken: string, refreshToken?: string) => {
      try {
        await AsyncStorage.setItem('temp_access_token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('temp_refresh_token', refreshToken);
        }
        console.log('🔒 Tokens almacenados temporalmente');
      } catch (error) {
        console.error('Error al almacenar tokens:', error);
      }
    };

    const handleDeepLink = async (url: string) => {
      console.log('📱 Deep link recibido:', url);
      
      const urlParams = parseUrlParams(url);
      const type = urlParams.get('type');
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // Manejar errores en la URL
      if (error) {
        console.error('❌ Error en deep link:', error, errorDescription);
        router.push('/(auth)/login' as any);
        return;
      }

      // Manejar reset de contraseña - SOLO con type=recovery
      if (type === 'recovery') {
        console.log('🔑 Type=recovery detectado - Navegando a update password');
        
        if (accessToken && refreshToken) {
          // Almacenar tokens temporalmente para la pantalla de actualización
          await storeTokensTemporarily(accessToken, refreshToken);
          console.log('🔐 Tokens de recovery almacenados correctamente');
        } else {
          console.error('❌ No se encontraron tokens para recovery');
          // Redirigir a solicitar nuevo enlace si no hay tokens
          router.push('/(auth)/forgot-password' as any);
          return;
        }
        
        // Ir directamente a actualizar contraseña
        router.push('/(auth)/update-password' as any);
      }
      
      // Manejar enlace genérico de reset-password (fallback)
      else if (url.includes('reset-password') && !type) {
        console.log('🔗 Enlace reset-password sin tipo - verificando tokens');
        
        if (accessToken && refreshToken) {
          await storeTokensTemporarily(accessToken, refreshToken);
          router.push('/(auth)/update-password' as any);
        } else {
          console.warn('⚠️ Enlace de reset sin tokens válidos');
          router.push('/(auth)/forgot-password' as any);
        }
      }
      
      // Manejar confirmación de email (registro) - SOLO con type=signup
      else if (type === 'signup') {
        console.log('📧 Type=signup detectado - Email confirmado');
        
        if (accessToken) {
          await storeTokensTemporarily(accessToken, refreshToken || '');
          console.log('✅ Email confirmado exitosamente - tokens almacenados');
          router.push('/(auth)/confirm-email' as any);
        } else {
          console.warn('⚠️ No se encontró access token para confirmación');
          router.push('/(auth)/login' as any);
        }
      }
      
      // Manejar enlace genérico de confirm-email (fallback)
      else if (url.includes('confirm-email') && !type) {
        console.log('🔗 Enlace confirm-email sin tipo');
        
        if (accessToken) {
          await storeTokensTemporarily(accessToken, refreshToken || '');
          router.push('/(auth)/confirm-email' as any);
        } else {
          router.push('/(auth)/login' as any);
        }
      }
      
      // Manejar confirmación de cambio de email
      else if (type === 'email_change') {
        console.log('📬 Cambio de email confirmado');
        
        if (accessToken) {
          await storeTokensTemporarily(accessToken, refreshToken || '');
          // Navegar a pantalla de confirmación de cambio de email
          router.push('/(auth)/email-change-confirmed' as any);
        }
      }
      
      // Manejar invitaciones (si las usas)
      else if (type === 'invite') {
        console.log('🎫 Invitación recibida');
        
        if (accessToken) {
          await storeTokensTemporarily(accessToken, refreshToken || '');
          router.push('/(auth)/accept-invite' as any);
        }
      }
      
      // URL no reconocida
      else {
        console.warn('⚠️ Tipo de deep link no reconocido:', type || 'sin tipo');
        router.push('/(auth)/login' as any);
      }
    };

    // Manejar cuando la app se abre desde un enlace (app cerrada)
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && (initialUrl.includes('supabase') || initialUrl.includes('auth'))) {
          console.log('🚀 URL inicial detectada:', initialUrl);
          // Pequeño delay para asegurar que la navegación esté lista
          setTimeout(() => handleDeepLink(initialUrl), 100);
        }
      } catch (error) {
        console.error('❌ Error al obtener URL inicial:', error);
      }
    };

    // Manejar cuando la app ya está abierta y recibe un enlace
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 URL recibida con app abierta:', event.url);
      if (event.url && (event.url.includes('supabase') || event.url.includes('auth'))) {
        handleDeepLink(event.url);
      }
    });

    getInitialURL();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Función helper para obtener tokens temporales
  const getTemporaryTokens = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('temp_access_token');
      const refreshToken = await AsyncStorage.getItem('temp_refresh_token');
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error al obtener tokens temporales:', error);
      return { accessToken: null, refreshToken: null };
    }
  };

  // Función helper para limpiar tokens temporales
  const clearTemporaryTokens = async () => {
    try {
      await AsyncStorage.multiRemove(['temp_access_token', 'temp_refresh_token']);
      console.log('🧹 Tokens temporales limpiados');
    } catch (error) {
      console.error('Error al limpiar tokens temporales:', error);
    }
  };

  return {
    getTemporaryTokens,
    clearTemporaryTokens
  };
}

export default usePasswordResetDeepLink;