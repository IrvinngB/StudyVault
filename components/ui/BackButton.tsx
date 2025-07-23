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


  // Mejor condición para ocultar el botón en '/', '/(tabs)', '/(tabs)/index', y cualquier ruta de (auth)
  if (
    pathname === "/" ||
    pathname === "/(tabs)" ||
    pathname === "/(tabs)/index" ||
    pathname.startsWith("/(auth)") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <View style={{
      paddingTop: insets.top + 8, // Espacio extra para no superponerse
      paddingLeft: 16,
      backgroundColor: theme.colors.background, // Fondo para que no se superponga
      position: 'relative', // No absolute para que ocupe su espacio
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