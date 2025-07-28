"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { usePathname, useRouter } from "expo-router"
import { TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface NavItem {
  key: string
  label: string
  icon: string
  route: string
}

const navItems: NavItem[] = [
  { key: "home", label: "Inicio", icon: "home", route: "/" },
  { key: "courses", label: "Clases", icon: "book", route: "/courses" },
  { key: "tasks", label: "Tareas", icon: "checkmark-square", route: "/tasks" },
  { key: "calendar", label: "Calendario", icon: "calendar", route: "/calendar" },
  { key: "notes", label: "Notas", icon: "note", route: "/notes" },
  { key: "settings", label: "Ajustes", icon: "settings", route: "/settings" },
]

export default function BottomNavBar() {
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const isActive = (route: string) => {
    if (route === "/") {
      return pathname === "/" || pathname === "/(tabs)"
    }
    return pathname.startsWith(route)
  }

  const handlePress = (route: string) => {
    router.push(route as any)
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingBottom: insets.bottom,
        paddingTop: 12,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.route)
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handlePress(item.route)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                paddingHorizontal: 4,
                borderRadius: 12,
                backgroundColor: active ? theme.colors.text : "transparent",
              }}
            >
              <IconSymbol
                name={item.icon as any}
                size={22}
                color={active ? theme.colors.background : theme.colors.textMuted}
                style={{ marginBottom: 4 }}
              />
              <ThemedText
                variant="caption"
                style={{
                  fontSize: 11,
                  fontWeight: active ? "600" : "500",
                  color: active ? theme.colors.background : theme.colors.textMuted,
                }}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
