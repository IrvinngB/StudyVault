"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { usePathname, useRouter } from "expo-router"
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface NavItem {
  name: string
  icon: string
  activeIcon: string
  route: string
  badge?: boolean
}

const navItems: NavItem[] = [
  {
    name: "Inicio",
    icon: "house",
    activeIcon: "house.fill",
    route: "/",
  },
  {
    name: "Cursos",
    icon: "book",
    activeIcon: "book.fill",
    route: "/courses",
  },
  {
    name: "Notas",
    icon: "note.text",
    activeIcon: "note.text",
    route: "/notes",
  },
  {
    name: "Calendario",
    icon: "calendar",
    activeIcon: "calendar",
    route: "/calendar",
  },
  {
    name: "Tareas",
    icon: "checklist",
    activeIcon: "checklist",
    route: "/tasks",
    badge: true,
  },
]

export function BottomNavBar() {
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

  const handleNavigation = (route: string) => {
    if (route === "/") {
      router.push("/(tabs)")
    } else {
      router.push(route as any)
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom + 8,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 16,
            },
          }),
        },
      ]}
    >
      {navItems.map((item) => {
        const active = isActive(item.route)
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => handleNavigation(item.route)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconSymbol
                name={active ? item.activeIcon : item.icon}
                size={24}
                color={active ? theme.colors.primary : theme.colors.textMuted}
              />
              {item.badge && <View style={[styles.badge, { backgroundColor: theme.colors.error }]} />}
            </View>
            <ThemedText
              variant="caption"
              style={[
                styles.label,
                {
                  color: active ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: active ? "600" : "400",
                },
              ]}
            >
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
})
