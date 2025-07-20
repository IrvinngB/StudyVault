import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const EMAIL_KEY = 'biometric_email';
const PASSWORD_KEY = 'biometric_password';

export async function isBiometricAvailable() {
  return await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
}

export async function saveCredentials(email: string, password: string) {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
  await SecureStore.setItemAsync(PASSWORD_KEY, password);
}

export async function getCredentials() {
  const email = await SecureStore.getItemAsync(EMAIL_KEY);
  const password = await SecureStore.getItemAsync(PASSWORD_KEY);
  if (email && password) {
    return { email, password };
  }
  return null;
}

export async function authenticateBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autenticación biométrica para iniciar sesión',
    fallbackLabel: 'Usar código',
    cancelLabel: 'Cancelar',
  });
  return result.success;
}
