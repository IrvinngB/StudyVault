import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { apiClient } from '@/database/api/client';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function UpdatePasswordScreen() {
  const { theme } = useTheme();
  const { modalProps, showError, showSuccess } = useModal();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true);
  const [hasValidRecoveryTokens, setHasValidRecoveryTokens] = useState(false);
  const [recoveryTokens, setRecoveryTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  }>({ accessToken: null, refreshToken: null });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    // Revisar el tipo de acción en el deep link
    if (params?.type === 'signup') {
      // Si es signup, redirigir al login
      router.replace('/login' as any);
      return;
    }
    // Si es recovery, continuar con el flujo normal
    validateRecoveryTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateRecoveryTokens = async () => {
    try {
      console.log('🔍 Checking for recovery tokens...');
      console.log('URL params:', params);
      
      // Verificar si tenemos tokens temporales del deep link
      const accessToken = await AsyncStorage.getItem('temp_access_token');
      const refreshToken = await AsyncStorage.getItem('temp_refresh_token');
      
      if (!accessToken || !refreshToken) {
        console.error('❌ No recovery tokens found in AsyncStorage');
        Alert.alert(
          'Enlace Inválido', 
          'Este enlace de restablecimiento no es válido o ha expirado. Solicita un nuevo enlace.',
          [
            { 
              text: 'Solicitar nuevo enlace', 
              onPress: () => router.replace('/forgot-password' as any) 
            }
          ]
        );
        return;
      }

      console.log('🔑 Recovery tokens found!');
      console.log('Access token length:', accessToken.length);
      console.log('Refresh token length:', refreshToken.length);

      // Guardar tokens en estado para usarlos después
      setRecoveryTokens({ accessToken, refreshToken });
      setHasValidRecoveryTokens(true);

    } catch (error) {
      console.error('❌ Error checking recovery tokens:', error);
      Alert.alert(
        'Error', 
        'Hubo un problema al validar el enlace. Inténtalo de nuevo.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/forgot-password' as any) 
          }
        ]
      );
    } finally {
      setIsValidatingSession(false);
    }
  };

  const clearRecoveryTokens = async () => {
    try {
      await AsyncStorage.multiRemove(['temp_access_token', 'temp_refresh_token']);
      console.log('🧹 Recovery tokens cleared');
    } catch (error) {
      console.error('Error clearing recovery tokens:', error);
    }
  };

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

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength < 2) return { level: 'Muy débil', color: theme.colors.error };
    if (strength < 3) return { level: 'Débil', color: '#FF9500' };
    if (strength < 4) return { level: 'Media', color: '#FF9500' };
    return { level: 'Fuerte', color: theme.colors.success };
  };

  const handleUpdatePassword = async () => {
    if (!hasValidRecoveryTokens || !recoveryTokens.accessToken) {
      showError('No se encontraron tokens de recuperación válidos. Solicita un nuevo enlace.', 'Error');
      return;
    }

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
      console.log('🔄 Updating password via FastAPI...');
      
      // Llamar a FastAPI con el token de autorización
      const response = await apiClient.post('/auth/update-password', 
        {
          password: formData.password,
          // Si necesitas enviar el token, inclúyelo en el body o modifica el apiClient para aceptar headers
          // accessToken: recoveryTokens.accessToken
        }
      );

      const typedResponse = response as { data: any };
      console.log('✅ Password updated successfully:', typedResponse.data);

      // Limpiar tokens de recovery
      await clearRecoveryTokens();

      showSuccess(
        'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
        '🎉 ¡Contraseña actualizada!'
      );

      // Redirigir al login después de un pequeño delay
      setTimeout(() => {
        router.replace('/login' as any);
      }, 2500);

    } catch (error: any) {
      console.error('❌ Error updating password:', error);
      
      let errorMessage = 'Hubo un problema al actualizar tu contraseña. Inténtalo de nuevo.';
      
      // Manejar errores específicos de la API
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            errorMessage = 'El enlace de restablecimiento ha expirado. Solicita un nuevo enlace.';
            // Ofrecer solicitar nuevo enlace
            setTimeout(() => {
              Alert.alert(
                'Enlace Expirado',
                errorMessage,
                [
                  { 
                    text: 'Solicitar nuevo enlace', 
                    onPress: () => router.replace('/forgot-password' as any) 
                  }
                ]
              );
            }, 100);
            return;
            
          case 400:
            if (data?.detail) {
              if (data.detail.includes('weak_password') || data.detail.includes('contraseña')) {
                errorMessage = data.detail;
              } else if (data.detail.includes('same_password')) {
                errorMessage = 'La nueva contraseña debe ser diferente a la actual.';
              } else if (data.detail.includes('session')) {
                errorMessage = 'La sesión ha expirado. Solicita un nuevo enlace de restablecimiento.';
              } else {
                errorMessage = data.detail;
              }
            }
            break;
            
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            break;
            
          default:
            if (data?.detail) {
              errorMessage = data.detail;
            }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras validamos los tokens
  if (isValidatingSession) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', padding: theme.spacing.xl }}>
          <ThemedText variant="h1" style={{ fontSize: 48, marginBottom: theme.spacing.md }}>
            🔒
          </ThemedText>
          <ThemedText variant="h3" color="primary" style={{ marginBottom: theme.spacing.sm }}>
            Validando enlace de seguridad
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Verificando que el enlace de restablecimiento sea válido...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Si no hay tokens válidos, no mostrar el formulario
  if (!hasValidRecoveryTokens) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', padding: theme.spacing.xl }}>
          <ThemedText variant="h1" style={{ fontSize: 48, marginBottom: theme.spacing.md }}>
            ❌
          </ThemedText>
          <ThemedText variant="h3" color="error" style={{ marginBottom: theme.spacing.sm }}>
            Enlace no válido
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            Este enlace de restablecimiento no es válido o ha expirado.
          </ThemedText>
          <ThemedButton
            title="Solicitar nuevo enlace"
            variant="primary"
            onPress={() => router.replace('/forgot-password' as any)}
          />
        </View>
      </ThemedView>
    );
  }

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

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
                  Tu enlace de restablecimiento es válido. Crea una contraseña segura para tu cuenta.
                </ThemedText>
              </View>

              {/* Token info para debugging (remover en producción) */}
              {__DEV__ && recoveryTokens.accessToken && (
                <View style={{ 
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.sm,
                  marginBottom: theme.spacing.md
                }}>
                  <ThemedText variant="caption" color="secondary">
                    🔑 Token válido encontrado ({recoveryTokens.accessToken.substring(0, 20)}...)
                  </ThemedText>
                </View>
              )}

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

                {/* Password strength indicator */}
                {passwordStrength && formData.password.length > 0 && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: theme.spacing.sm,
                    marginTop: -theme.spacing.sm 
                  }}>
                    <View style={{
                      height: 4,
                      flex: 1,
                      backgroundColor: theme.colors.border,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <View style={{
                        height: '100%',
                        width: `${(Object.values({
                          length: formData.password.length >= 8,
                          lowercase: /[a-z]/.test(formData.password),
                          uppercase: /[A-Z]/.test(formData.password),
                          numbers: /\d/.test(formData.password),
                        }).filter(Boolean).length / 4) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }} />
                    </View>
                    <ThemedText variant="caption" style={{ color: passwordStrength.color }}>
                      {passwordStrength.level}
                    </ThemedText>
                  </View>
                )}

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
                  
                  {[
                    { check: formData.password.length >= 8, text: 'Al menos 8 caracteres' },
                    { check: /[A-Z]/.test(formData.password), text: 'Una letra mayúscula' },
                    { check: /[a-z]/.test(formData.password), text: 'Una letra minúscula' },
                    { check: /\d/.test(formData.password), text: 'Un número' }
                  ].map((requirement, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <ThemedText 
                        variant="caption" 
                        style={{ 
                          color: requirement.check ? theme.colors.success : theme.colors.textSecondary,
                          marginRight: theme.spacing.xs 
                        }}
                      >
                        {requirement.check ? '✓' : '•'}
                      </ThemedText>
                      <ThemedText 
                        variant="caption" 
                        style={{ 
                          color: requirement.check ? theme.colors.success : theme.colors.textSecondary 
                        }}
                      >
                        {requirement.text}
                      </ThemedText>
                    </View>
                  ))}
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
                    onPress={() => router.push('/login' as any)}
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