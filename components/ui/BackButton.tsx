import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Rutas donde no mostrar el botón de retroceso
  const hideBackButtonRoutes = [
    "/",
    "/(tabs)",
    "/(tabs)/index",
    "/login",
    "/register",
    ...pathname.startsWith("/(auth)") ? [pathname] : []
  ];

  // Si es una ruta donde no debe aparecer el botón
  if (hideBackButtonRoutes.includes(pathname)) {
    // Solo para la pantalla principal de tabs, añadimos un espacio seguro
    if (pathname === "/(tabs)/index") {
      return (
        <View style={{
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
        }} />
      );
    }
    return null;
  }

  return (
    <View style={{
      paddingTop: insets.top + 8,
      paddingLeft: 16,
      backgroundColor: theme.colors.background,
      position: 'relative',
      zIndex: 100,
    }}> 
      <TouchableOpacity 
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          borderRadius: 8,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        <Text style={{
          marginLeft: 8, 
          fontSize: 16, 
          color: theme.colors.primary,
          fontWeight: '500',
        }}>
          Volver
        </Text>
      </TouchableOpacity>
    </View>
  );
}