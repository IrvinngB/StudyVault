import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as CustomThemeProvider } from '@/hooks/useTheme';
import { initializeDatabase } from '@/lib/database';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [dbReady, setDbReady] = useState(false);

  // Initialize database
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔄 Inicializando base de datos...');
        await initializeDatabase();
        console.log('🎉 ¡Base de datos lista para usar!');
        setDbReady(true);
      } catch (error) {
        console.error('💥 Error al inicializar la base de datos:', error);
        // Continuar sin BD por ahora
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
    <CustomThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
