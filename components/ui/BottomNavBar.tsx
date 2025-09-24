"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { usePathname, useRouter } from "expo-router"
import { useCallback, useRef } from "react"
import { TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface NavItem {
  key: string
  label: string
  icon: string
  route: string
}

// Reducido a 5 tabs principales según mejores prácticas de UI/UX
const navItems: NavItem[] = [
  { key: "home", label: "Inicio", icon: "house.fill", route: "/" },
  { key: "notes", label: "Notas", icon: "note.text", route: "/notes" },
  { key: "tasks", label: "Tareas", icon: "checklist", route: "/tasks" },
  { key: "calendar", label: "Calendario", icon: "calendar", route: "/calendar" },
]

export default function BottomNavBar() {
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  
  // Ref para controlar el debounce
  const lastPressTime = useRef<number>(0)
  const DEBOUNCE_TIME = 500 // 500ms de debounce

  const isActive = useCallback((route: string) => {
    if (route === "/") {
      return pathname === "/" || pathname === "/(tabs)"
    }
    return pathname.startsWith(route)
  }, [pathname])

  const handlePress = useCallback((route: string) => {
    const now = Date.now()
    
    // Evitar navegación si ya estamos en esa ruta
    if (isActive(route)) {
      return
    }
    
    // Aplicar debounce para evitar múltiples navegaciones
    if (now - lastPressTime.current < DEBOUNCE_TIME) {
      return
    }
    
    lastPressTime.current = now
    router.push(route as any)
  }, [router, isActive])

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
                backgroundColor: active ? theme.colors.primary + "20" : "transparent",
                opacity: active ? 1 : 0.7,
              }}
              activeOpacity={0.6}
            >
              <IconSymbol
                name={item.icon as any}
                size={22}
                color={active ? theme.colors.primary : theme.colors.textMuted}
                style={{ marginBottom: 4 }}
              />
              <ThemedText
                variant="caption"
                style={{
                  fontSize: 11,
                  fontWeight: active ? "600" : "500",
                  color: active ? theme.colors.primary : theme.colors.textMuted,
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
