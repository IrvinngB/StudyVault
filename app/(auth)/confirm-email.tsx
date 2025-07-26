import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

export default function ConfirmEmailScreen() {
  const { theme } = useTheme();
  const { modalProps, showSuccess } = useModal();

  useEffect(() => {
    // Mostrar mensaje de éxito al confirmar email
    showSuccess(
      'Tu email ha sido confirmado exitosamente. Ya puedes iniciar sesión.',
      'Email confirmado'
    );
  }, [showSuccess]);

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

              <ThemedButton
                title="Ir al login"
                variant="primary"
                size="large"
                onPress={() => router.replace('/login')}
                style={{ marginTop: theme.spacing.lg }}
              />

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
