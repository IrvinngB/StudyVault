import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import { apiClient } from '@/database/api/client';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function UpdatePasswordScreen() {
  const { theme } = useTheme();
  const { modalProps, showError, showSuccess } = useModal();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Verificar si tenemos los parámetros necesarios de la URL de reset
    console.log('URL params:', params);
  }, [params]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    return errors;
  };

  const handleUpdatePassword = async () => {
    // Limpiar errores
    setErrors({});
    
    // Validaciones
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join(', ');
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/update-password', {
        password: formData.password
      });

      showSuccess(
        'Tu contraseña ha sido actualizada exitosamente.',
        'Contraseña actualizada'
      );

      // Redirigir al login después de un pequeño delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      showError(
        'Hubo un problema al actualizar tu contraseña. Inténtalo de nuevo.',
        'Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                <ThemedText variant="h1" style={{ fontSize: 48, marginBottom: theme.spacing.md }}>
                  🔒
                </ThemedText>
                <ThemedText variant="h2" color="primary" style={{ marginBottom: theme.spacing.xs }}>
                  Nueva contraseña
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  Ingresa tu nueva contraseña. Debe ser segura y fácil de recordar.
                </ThemedText>
              </View>

              {/* Form */}
              <View style={{ gap: theme.spacing.md }}>
                <ThemedInput
                  label="Nueva contraseña"
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

                {/* Password requirements */}
                <View style={{ 
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}>
                  <ThemedText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                    Tu contraseña debe contener:
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    • Al menos 8 caracteres
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    • Una letra mayúscula
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    • Una letra minúscula
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    • Un número
                  </ThemedText>
                </View>

                <ThemedButton
                  title={isLoading ? "Actualizando..." : "Actualizar contraseña"}
                  variant="primary"
                  size="large"
                  onPress={handleUpdatePassword}
                  disabled={isLoading}
                  style={{ marginTop: theme.spacing.md }}
                />

                {/* Back to login */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginTop: theme.spacing.lg,
                  gap: theme.spacing.xs
                }}>
                  <ThemedText variant="body" color="secondary">
                    ¿Recordaste tu contraseña?
                  </ThemedText>
                  <ThemedButton
                    title="Volver al login"
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
      <AppModal 
        {...modalProps}
        onClose={modalProps.onClose || (() => {})}
      />
    </>
  );
}
