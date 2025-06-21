import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText, ThemedView } from './ui/ThemedComponents';

export function AuthNavigator({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    // No redirigir si todavía se está cargando    if (isLoading) return;

    // Obtener información de la ruta actual
    const isAuthRoute = pathname.startsWith('/(auth)') || pathname.startsWith('/login') || pathname.startsWith('/register');
    const isTabsRoute = pathname.startsWith('/(tabs)');

    if (isAuthenticated && isAuthRoute) {
      // El usuario está autenticado pero está en una pantalla de autenticación, redirigir a tabs
      router.replace('/(tabs)');    } else if (!isAuthenticated && isTabsRoute) {
      // El usuario no está autenticado pero está en una pantalla de tabs, redirigir a login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <ThemedView variant="background" style={{ flex: 1 }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: theme.spacing.md 
        }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" color="secondary">
            Verificando autenticación...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
