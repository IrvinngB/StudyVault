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
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { modalProps, showError, showSuccess } = useModal();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleResetPassword = async () => {
    // Limpiar errores
    setErrors({});
    
    // Validaciones básicas
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email.trim()
      });

      setEmailSent(true);
      showSuccess(
        'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.',
        'Email enviado'
      );
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      showError(
        'Hubo un problema al enviar el email. Inténtalo de nuevo.',
        'Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      showError('Por favor ingresa tu email primero', 'Email requerido');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/resend-confirmation', {
        email: email.trim()
      });

      showSuccess(
        'Si tu email está registrado y no confirmado, recibirás un nuevo enlace de confirmación.',
        'Email enviado'
      );
    } catch (error) {
      console.error('Error al reenviar confirmación:', error);
      showError(
        'Hubo un problema al enviar el email. Inténtalo de nuevo.',
        'Error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
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
                  📧
                </ThemedText>
                <ThemedText variant="h2" color="primary" style={{ marginBottom: theme.spacing.xs }}>
                  Email enviado
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.
                </ThemedText>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 24 horas.
                </ThemedText>

                <ThemedButton
                  title="Volver al login"
                  variant="primary"
                  size="large"
                  onPress={() => router.push('/login')}
                  style={{ marginTop: theme.spacing.lg }}
                />

                <ThemedButton
                  title="Reenviar email"
                  variant="secondary"
                  size="large"
                  onPress={() => setEmailSent(false)}
                />
              </View>
            </ThemedCard>
          </ScrollView>
        </ThemedView>
        <AppModal 
          {...modalProps}
          onClose={modalProps.onClose || (() => {})}
        />
      </>
    );
  }

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
                  🔑
                </ThemedText>
                <ThemedText variant="h2" color="primary" style={{ marginBottom: theme.spacing.xs }}>
                  Recuperar contraseña
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </ThemedText>
              </View>

              {/* Form */}
              <View style={{ gap: theme.spacing.md }}>
                <ThemedInput
                  label="Email"
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <ThemedButton
                  title={isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                  variant="primary"
                  size="large"
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  style={{ marginTop: theme.spacing.md }}
                />

                {/* Separator */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginVertical: theme.spacing.md 
                }}>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.colors.border 
                  }} />
                  <ThemedText 
                    variant="caption" 
                    color="secondary" 
                    style={{ 
                      paddingHorizontal: theme.spacing.md 
                    }}
                  >
                    O
                  </ThemedText>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.colors.border 
                  }} />
                </View>

                <ThemedButton
                  title={isLoading ? "Enviando..." : "Reenviar confirmación de email"}
                  variant="secondary"
                  size="large"
                  onPress={handleResendConfirmation}
                  disabled={isLoading}
                />

                <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
                  ¿Tu cuenta no está verificada? Usa el botón de arriba para reenviar el email de confirmación.
                </ThemedText>

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
