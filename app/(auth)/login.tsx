"use client"

import { AppModal } from "@/components/ui/AppModal"
import { ThemedButton, ThemedCard, ThemedInput, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useModal } from "@/hooks/modals"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import {
  authenticateBiometric,
  getCredentials,
  isBiometricAvailable,
  updateCredentialsIfNeeded,
} from "@/utils/biometricAuth"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"

export default function LoginScreen() {
  const { theme } = useTheme()
  const { signIn, signOut, isLoading, isAuthenticated } = useAuth()
  const { modalProps, showError, showSuccess, showWarning, showInfo } = useModal()
  const params = useLocalSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  // Estado para biometría
  const [biometricReady, setBiometricReady] = useState(false)

  useEffect(() => {
    // Pre-llenar el email si viene como parámetro
    const emailParam = params.email as string;
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }

    if (isAuthenticated) {
      router.replace("/(tabs)")
    }
    // Verificar si biometría está disponible
    ;(async () => {
      const available = await isBiometricAvailable()
      setBiometricReady(available)
    })()
  }, [isAuthenticated, params.email])
  // Login normal
  const handleLogin = async () => {
    setErrors({})
    const newErrors: { [key: string]: string } = {}
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    try {
      const result = await signIn(formData.email.trim(), formData.password)
      if (result.success) {
        // Actualizar credenciales biométricas con la nueva cuenta
        await updateCredentialsIfNeeded(formData.email.trim(), formData.password)
        showSuccess("¡Bienvenido de vuelta a StudyVault!", "Inicio de sesión exitoso")
        setTimeout(() => {
          router.replace("/(tabs)") // Redirigir después de mostrar el modal
        }, 1500)
      } else {
        showError(
          result.error || "Credenciales incorrectas. Verifica tu email y contraseña.",
          "Error al iniciar sesión",
        )
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      showError("No se pudo conectar con el servidor. Verifica tu conexión a internet.", "Error de conexión")
    }
  }

  // Login biométrico
  const handleBiometricLogin = async () => {
    try {
      const canAuth = await isBiometricAvailable()
      if (!canAuth) {
        showWarning("Tu dispositivo no soporta autenticación biométrica.", "Biometría no disponible")
        return
      }
      const success = await authenticateBiometric()
      if (!success) return
      const creds = await getCredentials()
      if (!creds) {
        showInfo(
          "Primero inicia sesión con email y contraseña para habilitar el acceso biométrico.",
          "No hay credenciales guardadas",
        )
        return
      }
      setFormData({ email: creds.email, password: creds.password })
      // Login automático
      const result = await signIn(creds.email, creds.password)
      if (result.success) {
        showSuccess("¡Bienvenido de vuelta a StudyVault!", "Inicio de sesión biométrico exitoso")
        setTimeout(() => router.replace("/(tabs)"), 1200)
      } else {
        showError(result.error || "No se pudo iniciar sesión con biometría.", "Error al iniciar sesión")
      }
    } catch {
      showError("Ocurrió un error con la autenticación biométrica.", "Error")
    }
  }

  const handleLogout = async () => {
    try {
      const currentEmail = formData.email.trim()
      await signOut() // Lógica para cerrar sesión
      // Eliminar credenciales solo si es necesario
      showSuccess("Has cerrado sesión correctamente.", "Sesión cerrada")
      setTimeout(() => router.replace("/login"), 1200)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      showError("No se pudo cerrar sesión. Intenta nuevamente.", "Error al cerrar sesión")
    }
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ThemedView variant="background" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: theme.spacing.lg,
            }}
          >
            <ThemedCard variant="elevated" padding="large">
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: theme.spacing.xl }}>
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
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <ThemedInput
                  label="Contraseña"
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
                  secureTextEntry
                  error={errors.password}
                />

                {/* Forgot password link */}
                {/* <View style={{ alignItems: "flex-end" }}>
                  <ThemedButton
                    title="¿Olvidaste tu contraseña?"
                    variant="ghost"
                    size="small"
                    onPress={() => {
                      console.log("Navegando a forgot-password") // Para debug
                      router.push("/(auth)/forgot-password")
                    }}
                  />
                </View> */}

                <ThemedButton
                  title={isLoading ? "Iniciando sesión..." : "🔑 Iniciar Sesión"}
                  variant="primary"
                  size="large"
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={{ marginTop: theme.spacing.md }}
                />

                {/* Botón biométrico */}
                {biometricReady && (
                  <ThemedButton
                    title="Iniciar sesión con biometría"
                    variant="secondary"
                    size="large"
                    onPress={handleBiometricLogin}
                    style={{ marginTop: theme.spacing.sm }}
                  />
                )}

                {/* Botones para probar modales */}
               

                {/* Register Link */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: theme.spacing.lg,
                    gap: theme.spacing.xs,
                  }}
                >
                  <ThemedText variant="body" color="secondary">
                    ¿No tienes cuenta?
                  </ThemedText>
                  <ThemedButton
                    title="Registrarse"
                    variant="ghost"
                    size="small"
                    onPress={() => router.push("/register")}
                  />
                </View>
              </View>
            </ThemedCard>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
      {/* Modal usando useModal hook */}
      <AppModal {...modalProps} onClose={modalProps.onClose || (() => {})} />
    </>
  )
}
