import {
    ThemedButton,
    ThemedCard,
    ThemedInput,
    ThemedText,
    ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Limpiar errores
    setErrors({});

    // Validaciones básicas
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular login (sin base de datos)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Login exitoso', 
        '¡Bienvenido a StudyVault!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView variant="background" style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center',
            padding: theme.spacing.lg 
          }}
        >
          <ThemedCard variant="elevated" padding="large">
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
              <ThemedText variant="h1" color="primary" style={{ marginBottom: theme.spacing.xs }}>
                📚 StudyVault
              </ThemedText>
              <ThemedText variant="h3" color="secondary">
                Iniciar Sesión
              </ThemedText>
            </View>

            {/* Form */}
            <View style={{ gap: theme.spacing.md }}>
              <ThemedInput
                label="Email"
                placeholder="tu@email.com"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <ThemedInput
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry
                error={errors.password}
              />

              <ThemedButton
                title={isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                variant="primary"
                size="large"
                onPress={handleLogin}
                disabled={isLoading}
                style={{ marginTop: theme.spacing.md }}
              />

              {/* Register Link */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginTop: theme.spacing.lg,
                gap: theme.spacing.xs
              }}>
                <ThemedText variant="body" color="secondary">
                  ¿No tienes cuenta?
                </ThemedText>
                <ThemedButton
                  title="Registrarse"
                  variant="ghost"
                  size="small"
                  onPress={() => router.push('/register')}
                />
              </View>
            </View>
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
