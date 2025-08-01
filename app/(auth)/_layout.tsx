import { useTheme } from "@/hooks/useTheme"
import { Stack } from "expo-router"

export default function AuthLayout() {
  const { theme } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Iniciar Sesión",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Registrarse",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Recuperar Contraseña",
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="confirm-email"
        options={{
          title: "Confirmar Email",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="update-password"
        options={{
          title: "Actualizar Contraseña",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
