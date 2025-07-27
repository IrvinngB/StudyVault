import { router } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';

export function usePasswordResetDeepLink() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('📱 Deep link recibido:', url);

      // Parsear la URL para extraer path y query params
      try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname; // e.g. /auth/reset-password
        const params = parsedUrl.searchParams;
        const token = params.get('token');
        const type = params.get('type');

        // Reset password
        if (pathname.includes('reset-password') && type === 'recovery' && token) {
          console.log('� Navegando a reset password con token:', token);
          router.push({
            pathname: '/(auth)/update-password',
            params: { token }
          } as any);
          return;
        }

        // Confirm email
        if (pathname.includes('confirm-email') && type === 'signup' && token) {
          console.log('📧 Navegando a confirm email con token:', token);
          router.push({
            pathname: '/(auth)/confirm-email',
            params: { token }
          } as any);
          return;
        }

        // Fallback: si no hay token o no coincide el tipo, ir al login
        router.push('/(auth)/login' as any);
      } catch (e) {
        console.error('Error al parsear deep link:', e);
        router.push('/(auth)/login' as any);
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
