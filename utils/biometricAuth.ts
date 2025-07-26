import * as LocalAuthentication from "expo-local-authentication"
import * as SecureStore from "expo-secure-store"

const EMAIL_KEY = "biometric_email"
const PASSWORD_KEY = "biometric_password"

export async function isBiometricAvailable() {
  return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync())
}

export async function saveCredentials(email: string, password: string) {
  try {
    await SecureStore.setItemAsync(EMAIL_KEY, email)
    await SecureStore.setItemAsync(PASSWORD_KEY, password)
    console.log("Credenciales guardadas para:", email)
  } catch (error) {
    console.error("Error guardando credenciales:", error)
    throw error
  }
}

export async function getCredentials() {
  try {
    const email = await SecureStore.getItemAsync(EMAIL_KEY)
    const password = await SecureStore.getItemAsync(PASSWORD_KEY)
    if (email && password) {
      return { email, password }
    }
    return null
  } catch (error) {
    console.error("Error obteniendo credenciales:", error)
    return null
  }
}

export async function clearCredentialsIfNeeded(newEmail: string | null) {
  try {
    const currentCredentials = await getCredentials()

    // Si no hay credenciales guardadas, no hacer nada
    if (!currentCredentials) return

    // Si el nuevo correo es diferente al actual, eliminar credenciales
    if (newEmail && currentCredentials.email !== newEmail) {
      await SecureStore.deleteItemAsync(EMAIL_KEY)
      await SecureStore.deleteItemAsync(PASSWORD_KEY)
      console.log("Credenciales eliminadas para el usuario anterior.")
    }
  } catch (error) {
    console.error("Error eliminando credenciales:", error)
  }
}

export async function authenticateBiometric() {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Autenticación biométrica para iniciar sesión",
      fallbackLabel: "Usar código",
      cancelLabel: "Cancelar",
    })
    return result.success
  } catch (error) {
    console.error("Error en autenticación biométrica:", error)
    return false
  }
}

export async function updateCredentialsIfNeeded(newEmail: string, newPassword: string) {
  try {
    const currentCredentials = await getCredentials()

    // Si no hay credenciales guardadas o el email es diferente, guardar las nuevas
    if (!currentCredentials || currentCredentials.email !== newEmail) {
      await saveCredentials(newEmail, newPassword)
      console.log("Credenciales actualizadas para nuevo usuario:", newEmail)
      return true
    }

    // Si el email es el mismo pero la contraseña cambió, actualizar
    if (currentCredentials.password !== newPassword) {
      await saveCredentials(newEmail, newPassword)
      console.log("Contraseña actualizada para:", newEmail)
      return true
    }

    return false
  } catch (error) {
    console.error("Error actualizando credenciales:", error)
    return false
  }
}
