import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function ConfirmEmailScreen() {
  const { theme } = useTheme();
  const { modalProps, showSuccess } = useModal();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // Obtener el email de los parámetros de la URL
    const emailParam = params.email as string;
    const confirmedParam = params.confirmed as string;
    
    if (emailParam) {
      setEmail(emailParam);
    }

    // Si viene con el parámetro confirmed, significa que el usuario confirmó desde el email
    if (confirmedParam === 'true') {
      setIsConfirmed(true);
      showSuccess(
        '¡Tu email ha sido confirmado exitosamente! Ya puedes iniciar sesión.',
        'Email confirmado',
        undefined, // No callback
        undefined  // Sin autoClose
      );
    } else if (emailParam) {
      // Solo mostrar mensaje de éxito si viene de registro (tiene email pero no está confirmado)
      // No usar autoClose para que el usuario pueda leer el mensaje
      showSuccess(
        'Te hemos enviado un correo para confirmar tu email. Por favor, revisa tu bandeja de entrada.',
        'Registro exitoso',
        undefined, // No callback
        undefined  // Sin autoClose
      );
    }
  }, [params.email, params.confirmed, showSuccess]);

  const handleResendEmail = () => {
    // Aquí podrías implementar la lógica para reenviar el email
    showSuccess(
      'Se ha reenviado el correo de confirmación. Por favor, revisa tu bandeja de entrada.',
      'Email reenviado',
      undefined, // No callback
      3000       // Sí usar autoClose para reenvío
    );
  };

  // Si el email ya fue confirmado, mostrar pantalla de éxito
  if (isConfirmed) {
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
                  ✅
                </ThemedText>
                <ThemedText variant="h2" color="primary" style={{ marginBottom: theme.spacing.xs }}>
                  Email confirmado
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  ¡Perfecto! Tu email ha sido confirmado exitosamente.
                </ThemedText>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  Ya puedes iniciar sesión en StudyVault con tu email y contraseña.
                </ThemedText>

                <ThemedText variant="body" color="primary" style={{ 
                  textAlign: 'center', 
                  fontWeight: '600',
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  marginTop: theme.spacing.lg 
                }}>
                  Al hacer clic en el enlace del correo serás redirigido automáticamente al login para ingresar tus credenciales.
                </ThemedText>

                <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
                  Si tienes problemas para iniciar sesión, puedes usar la opción &quot;¿Olvidaste tu contraseña?&quot; en la pantalla de login.
                </ThemedText>
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

  // Pantalla de confirmación pendiente
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
                Confirma tu email
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                Hemos enviado un correo de confirmación a:
              </ThemedText>
              {email && (
                <ThemedText variant="body" color="primary" style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  marginTop: theme.spacing.sm 
                }}>
                  {email}
                </ThemedText>
              )}
            </View>

            <View style={{ gap: theme.spacing.md }}>
              <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
              </ThemedText>

              <ThemedText variant="body" color="primary" style={{ 
                textAlign: 'center', 
                fontWeight: '600',
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                marginTop: theme.spacing.sm 
              }}>
                Al hacer clic en el enlace del correo serás redirigido automáticamente al login para ingresar tus credenciales.
              </ThemedText>

              <ThemedText variant="bodySmall" color="muted" style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
                ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo envío.
              </ThemedText>

              <ThemedButton
                title="Reenviar correo"
                variant="primary"
                size="large"
                onPress={handleResendEmail}
                style={{ marginTop: theme.spacing.lg }}
              />

              <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
                Una vez confirmes tu email desde el enlace, podrás acceder a tu cuenta automáticamente.
              </ThemedText>
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
