import { Link, Stack, router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  const handleGoHome = () => {
    // Intentar navegar a la pantalla principal, si falla ir a login
    try {
      router.replace('/(tabs)' as any);
    } catch (error) {
      router.replace('/(auth)/login' as any);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Esta pantalla no existe.</ThemedText>
        <Link href="/(auth)/login" style={styles.link}>
          <ThemedText type="link">Ir al inicio de sesión</ThemedText>
        </Link>
        <Link href="/(tabs)" style={styles.link}>
          <ThemedText type="link">Ir a la aplicación</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
