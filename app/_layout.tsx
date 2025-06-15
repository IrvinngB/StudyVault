import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as CustomThemeProvider } from '@/hooks/useTheme';
import { initializeDatabase } from '@/lib/database';
import { AuthProvider, useAuth } from '@/lib/hooks/useAuth';

// Componente para proteger rutas
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Solo redirigir la primera vez para evitar loop infinito
      if (isFirstLoad) {
        setIsFirstLoad(false);
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, isFirstLoad]);

  if (isLoading) {
    // Se podría mostrar un splash screen o indicador de carga
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });  const [dbReady, setDbReady] = useState(false);

  // Initialize database
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        setDbReady(true);
      }
    };

    setupDatabase();
  }, []);

  if (!loaded || !dbReady) {
    // Show loading while fonts and database are loading
    return null;
  }
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
