import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useModal } from '@/hooks/modals';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuth();
  const { modalProps, showSuccess, showError } = useModal();
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
    console.log('🚀 Starting registration process');

    // Validaciones
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
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
    
    try {
      console.log('📝 Creating user account with Supabase...');
      const result = await signUp(
        formData.email.trim(), 
        formData.password,
        { name: formData.name.trim() }
      );

      if (result.success) {
        console.log('✅ Registration successful!');
        showSuccess(
          `¡Bienvenido ${formData.name}! Tu cuenta ha sido creada exitosamente. Revisa tu email para confirmar tu cuenta antes de iniciar sesión. El enlace se abrirá automáticamente en esta app.`,
          'Registro exitoso',
          () => router.replace('/login')
        );
      } else {
        console.log('❌ Registration failed:', result.error);
        showError(
          result.error || 'No se pudo crear la cuenta. Intenta nuevamente.',
          'Error en el registro'
        );
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      showError(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        'Error de conexión'
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
                Crear Cuenta
              </ThemedText>
              <ThemedText variant="bodySmall" color="muted" style={{ textAlign: 'center', marginTop: theme.spacing.sm }}>
                Únete a StudyVault y organiza tu vida académica
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
                title={isLoading ? "Creando cuenta..." : "🚀 Crear Cuenta"}
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
        
        <AppModal {...modalProps} />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
