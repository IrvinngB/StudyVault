import { useAuth } from '@/hooks/useAuth';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

export function AuthNavigator({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // No realizar ninguna acción mientras se está cargando
    }

    // Obtener información de la ruta actual
    const isAuthRoute = pathname.startsWith('/(auth)') || pathname.startsWith('/login') || pathname.startsWith('/register');
    const isTabsRoute = pathname.startsWith('/(tabs)');

    if (isAuthenticated && isAuthRoute) {
      // El usuario está autenticado pero está en una pantalla de autenticación, redirigir a tabs
      router.replace('/(tabs)');
    } else if (!isAuthenticated && isTabsRoute) {
      // El usuario no está autenticado pero está en una pantalla de tabs, redirigir a login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Renderizar directamente los children sin pantalla de carga
  return <>{children}</>;
}
