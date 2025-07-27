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

    // Rutas de autenticación
    const isAuthRoute = pathname.startsWith('/(auth)') || pathname.startsWith('/login') || pathname.startsWith('/register');

    // Si está autenticado y está en auth, redirigir a tabs
    if (isAuthenticated && isAuthRoute) {
      router.replace('/(tabs)');
    }
    // Si NO está autenticado y NO está en auth, redirigir SIEMPRE a login
    else if (!isAuthenticated && !isAuthRoute) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Renderizar directamente los children sin pantalla de carga
  return <>{children}</>;
}
