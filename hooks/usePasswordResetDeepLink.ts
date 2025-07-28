import { router } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';

export function usePasswordResetDeepLink() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('📱 Deep link recibido:', url);

      try {
        // Para URLs de tu app (studyvault://)
        if (url.startsWith('studyvault://')) {
          console.log('🔍 Procesando URL de la app:', url);

          // Remover el protocolo para parsear
          const urlWithoutProtocol = url.replace('studyvault://', 'https://temp.com/');
          const parsedUrl = new URL(urlWithoutProtocol);
          const pathname = parsedUrl.pathname;
          const params = parsedUrl.searchParams;

          console.log('🔍 Pathname:', pathname);
          console.log('🔍 Search params:', Object.fromEntries(params.entries()));

          // Confirm email
          if (pathname.includes('confirm-email')) {
            console.log('📧 Navegando a confirm email');
            router.replace('/(auth)/confirm-email' as any);
            return;
          }

          // Reset password  
          if (pathname.includes('reset-password')) {
            console.log('🔑 Navegando a reset password');
            router.replace('/(auth)/update-password' as any);
            return;
          }
        }

        // Para URLs de Supabase
        else if (url.includes('supabase.co')) {
          console.log('🔍 URL de Supabase detectada:', url);
          const parsedUrl = new URL(url);
          const params = parsedUrl.searchParams;
          const token = params.get('token');
          const type = params.get('type');
          const redirectTo = params.get('redirect_to');

          console.log('🔍 Token:', token ? 'presente' : 'ausente');
          console.log('🔍 Type:', type);
          console.log('🔍 Redirect to:', redirectTo);

          // Si hay redirect_to y token, navega a la ruta indicada
          if (redirectTo && token) {
            let route = '';
            if (redirectTo.startsWith('studyvault://')) {
              route = redirectTo.replace('studyvault://', '').replace(/^\/+/, '');
              if (route === 'confirm-email') {
                router.replace({
                  pathname: '/(auth)/confirm-email',
                  params: { token }
                } as any);
                return;
              }
              if (route === 'reset-password') {
                router.replace({
                  pathname: '/(auth)/update-password',
                  params: { token }
                } as any);
                return;
              }
            }
          }

          // Procesar según el tipo (fallback)
          if (type === 'signup' && token) {
            console.log('📧 Email signup confirmation');
            router.replace({
              pathname: '/(auth)/confirm-email',
              params: { token }
            } as any);
            return;
          }

          if (type === 'recovery' && token) {
            console.log('🔑 Password recovery');
            router.replace({
              pathname: '/(auth)/update-password',
              params: { token }
            } as any);
            return;
          }
        }

        // Si no coincide con ningún patrón, ir al login
        console.log('⚠️ URL no reconocida, redirigiendo a login');
        router.replace('/(auth)/login' as any);

      } catch (e) {
        console.error('❌ Error al parsear deep link:', e);
        router.replace('/(auth)/login' as any);
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
        console.error('❌ Error al obtener URL inicial:', error);
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