import {
    ThemedButton,
    ThemedCard,
    ThemedInput,
    ThemedText,
    ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async () => {
    // Limpiar errores
    setErrors({});

    // Validaciones
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Intentar registro
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password
    });
    
    if (result.success) {
      Alert.alert(
        'Registro exitoso', 
        '¡Bienvenido a StudyVault!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Error', result.error || 'Error desconocido');
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
                Crear Cuenta
              </ThemedText>
            </View>

            {/* Form */}
            <View style={{ gap: theme.spacing.md }}>
              <ThemedInput
                label="Nombre completo"
                placeholder="Tu nombre"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                error={errors.name}
              />

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

              <ThemedInput
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry
                error={errors.confirmPassword}
              />

              <ThemedButton
                title={isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                variant="primary"
                size="large"
                onPress={handleRegister}
                disabled={isLoading}
                style={{ marginTop: theme.spacing.md }}
              />

              {/* Login Link */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginTop: theme.spacing.lg,
                gap: theme.spacing.xs
              }}>
                <ThemedText variant="body" color="secondary">
                  ¿Ya tienes cuenta?
                </ThemedText>
                <ThemedButton
                  title="Iniciar Sesión"
                  variant="ghost"
                  size="small"
                  onPress={() => router.push('/login')}
                />
              </View>
            </View>
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
