import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, resetPassword, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 User already authenticated, redirecting to tabs...');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  const handleLogin = async () => {
    // Limpiar errores
    setErrors({});
    console.log('🚀 Starting login process');

    // Validaciones básicas
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }    try {
      console.log('🔑 Signing in with Supabase...');
      const result = await signIn(
        formData.email.trim(),
        formData.password
      );

      if (result.success) {
        console.log('✅ Login successful!');
        Alert.alert(
          'Inicio de sesión exitoso', 
          '¡Bienvenido de vuelta a StudyVault!',
          [{ 
            text: 'Continuar', 
            onPress: () => router.replace('/(tabs)') 
          }]
        );
      } else {
        console.log('❌ Login failed:', result.error);
        Alert.alert(
          'Error al iniciar sesión',
          result.error || 'Credenciales incorrectas. Verifica tu email y contraseña.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      Alert.alert(
        'Email requerido',
        'Por favor ingresa tu email para recuperar tu contraseña.',
        [{ text: 'OK' }]
      );
      return;
    }    try {
      const result = await resetPassword(formData.email.trim());
      
      if (result.success) {
        Alert.alert(
          'Email enviado',
          'Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo enviar el email de recuperación.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Ocurrió un error al intentar enviar el email de recuperación.',
        [{ text: 'OK' }]
      );
    }
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
                title={isLoading ? "Iniciando sesión..." : "🔑 Iniciar Sesión"}
                variant="primary"
                size="large"
                onPress={handleLogin}
                disabled={isLoading}
                style={{ marginTop: theme.spacing.md }}
              />

              {/* Forgot Password Link */}
              <View style={{ alignItems: 'center', marginTop: theme.spacing.sm }}>
                <ThemedButton
                  title="¿Olvidaste tu contraseña?"
                  variant="ghost"
                  size="small"
                  onPress={handleForgotPassword}
                />
              </View>

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
