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
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuth();
  const { modalProps, showError } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Función para validar la fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      noSpaces: !/\s/.test(password)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      strength: passedChecks === 4 ? 'strong' : passedChecks >= 2 ? 'medium' : 'weak',
      score: passedChecks
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
    } else {
      const strength = getPasswordStrength(formData.password);
      if (!strength.checks.length) {
        newErrors.password = 'La contraseña debe tener entre 8 y 20 caracteres';
      } else if (!strength.checks.uppercase) {
        newErrors.password = 'La contraseña debe tener al menos una letra mayúscula';
      } else if (!strength.checks.number) {
        newErrors.password = 'La contraseña debe tener al menos un número';
      } else if (!strength.checks.noSpaces) {
        newErrors.password = 'La contraseña no debe contener espacios';
      }
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
        console.log('✅ Registration successful! Redirecting to email confirmation...');
        
        // Limpiar el formulario antes de redirigir
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
        
        // Redirigir inmediatamente a confirm-email con el email como parámetro
        router.replace({
          pathname: '/confirm-email',
          params: { email: formData.email.trim() }
        });
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

              <View>
                <ThemedInput
                  label="Contraseña"
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: theme.spacing.md, 
                    top: 35, 
                    padding: theme.spacing.xs 
                  }}
                >
                  <ThemedText color="primary" variant="bodySmall">
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}>
                  {/* Strength Bar */}
                  <View style={{ marginBottom: theme.spacing.sm }}>
                    <View style={{
                      height: 4,
                      backgroundColor: theme.colors.border,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <View style={{
                        height: '100%',
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: passwordStrength.strength === 'strong' ? theme.colors.success :
                                       passwordStrength.strength === 'medium' ? theme.colors.warning :
                                       theme.colors.error,
                        borderRadius: 2,
                      }} />
                    </View>
                    <ThemedText 
                      variant="caption" 
                      color={passwordStrength.strength === 'strong' ? 'success' : 
                            passwordStrength.strength === 'medium' ? 'warning' : 'error'}
                      style={{ marginTop: theme.spacing.xs, textAlign: 'center' }}
                    >
                      {passwordStrength.strength === 'strong' ? 'Fuerte' :
                       passwordStrength.strength === 'medium' ? 'Media' : 'Débil'}
                    </ThemedText>
                  </View>

                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
                    La contraseña debe incluir:
                  </ThemedText>

                  {/* Password Requirements */}
                  <View style={{ gap: theme.spacing.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedText color={passwordStrength.checks.length ? 'success' : 'error'} style={{ marginRight: theme.spacing.sm }}>
                        {passwordStrength.checks.length ? '✓' : '✗'}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={passwordStrength.checks.length ? 'success' : 'secondary'}>
                        8-20 caracteres
                      </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedText color={passwordStrength.checks.uppercase ? 'success' : 'error'} style={{ marginRight: theme.spacing.sm }}>
                        {passwordStrength.checks.uppercase ? '✓' : '✗'}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={passwordStrength.checks.uppercase ? 'success' : 'secondary'}>
                        Al menos una letra mayúscula
                      </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedText color={passwordStrength.checks.number ? 'success' : 'error'} style={{ marginRight: theme.spacing.sm }}>
                        {passwordStrength.checks.number ? '✓' : '✗'}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={passwordStrength.checks.number ? 'success' : 'secondary'}>
                        Al menos un número
                      </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedText color={passwordStrength.checks.noSpaces ? 'success' : 'error'} style={{ marginRight: theme.spacing.sm }}>
                        {passwordStrength.checks.noSpaces ? '✓' : '✗'}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={passwordStrength.checks.noSpaces ? 'success' : 'secondary'}>
                        Sin espacios
                      </ThemedText>
                    </View>
                  </View>
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
