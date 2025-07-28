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
    const isAuthRoute = pathname.startsWith('/(auth)') || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/register') || 
                       pathname.startsWith('/forgot-password') || 
                       pathname.startsWith('/confirm-email') || 
                       pathname.startsWith('/update-password');

    // Rutas que NO deben ser interceptadas por el AuthNavigator
    // Estas rutas pueden ser accedidas sin autenticación
    const isPublicAuthRoute = pathname.includes('/confirm-email') || 
                             pathname.includes('/update-password') ||
                             pathname.includes('/reset-password');

    // Si está autenticado y está en auth (pero no en rutas públicas), redirigir a tabs
    if (isAuthenticated && isAuthRoute && !isPublicAuthRoute) {
      router.replace('/(tabs)');
    }
    // Si NO está autenticado y NO está en auth Y NO está en ruta pública, redirigir a login
    else if (!isAuthenticated && !isAuthRoute && !isPublicAuthRoute) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, pathname]);

  return <>{children}</>;
}