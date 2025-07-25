import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';

export function usePasswordResetDeepLink() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('📱 Deep link recibido:', url);
      
      // Manejar enlaces de reset de contraseña de Supabase
      if (url.includes('reset-password') || url.includes('#type=recovery')) {
        console.log('🔑 Navegando a reset password');
        // Extraer tokens si están presentes
        const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Guardar tokens temporalmente si es necesario
          console.log('🔐 Tokens recibidos para reset');
        }
        
        // Navegar a la pantalla de actualización de contraseña
        router.push('/(auth)/update-password' as any);
      }
      
      // Manejar confirmación de email
      else if (url.includes('confirm-email') || url.includes('#type=signup')) {
        console.log('📧 Email confirmado, navegando a confirmación');
        const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
          console.log('✅ Email confirmado exitosamente');
          // Navegar primero a la pantalla de confirmación
          router.push('/(auth)/confirm-email' as any);
        } else {
          // Si no hay token, ir directamente al login
          router.push('/(auth)/login' as any);
        }
      }
    };

    // Manejar cuando la app se abre desde un enlace (app cerrada)
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('🚀 URL inicial detectada:', initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error al obtener URL inicial:', error);
      }
    };

    // Manejar cuando la app ya está abierta y recibe un enlace
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 URL recibida con app abierta:', event.url);
      handleDeepLink(event.url);
    });

    getInitialURL();

    return () => {
      subscription?.remove();
    };
  }, []);
}

export default usePasswordResetDeepLink;
