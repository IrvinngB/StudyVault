import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthNavigator } from '@/components/AuthNavigator';
import { ModalProvider } from '@/hooks/ModalProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as CustomThemeProvider } from '@/hooks/useTheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ModalProvider>
          <CustomThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AuthNavigator>
                <Stack>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </AuthNavigator>
              <StatusBar style="auto" />
            </ThemeProvider>
          </CustomThemeProvider>
        </ModalProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
