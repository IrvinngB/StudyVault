"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { usePathname, useRouter } from "expo-router"
import { Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native"

interface NavItem {
  route: string
  icon: string
  activeIcon: string
  label: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    route: "/",
    icon: "house",
    activeIcon: "house.fill",
    label: "Inicio",
  },
  {
    route: "/courses",
    icon: "book",
    activeIcon: "book.fill",
    label: "Cursos",
  },
  {
    route: "/notes",
    icon: "note.text",
    activeIcon: "note.text",
    label: "Notas",
  },
  {
    route: "/calendar",
    icon: "calendar",
    activeIcon: "calendar",
    label: "Calendario",
  },
  {
    route: "/tasks",
    icon: "checklist",
    activeIcon: "checklist",
    label: "Tareas",
  },
  {
    route: "/settings/unified",
    icon: "gear",
    activeIcon: "gear.fill",
    label: "Perfil",
  },
  {
    route: "/thdemes-demo",
    icon: "person",
    activeIcon: "person.fill",
    label: "prototipos",
  },
]

export function BottomNavBar() {
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (route: string) => {
    if (route === "/") {
      return pathname === "/" || pathname === "/index"
    }
    return pathname.startsWith(route)
  }

  const handleNavigation = (route: string) => {
    router.push(route as any)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.navbar, { backgroundColor: theme.colors.surface }]}>
        {navItems.map((item) => {
          const active = isActive(item.route)
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconSymbol
                  name={active ? (item.activeIcon as any) : (item.icon as any)}
                  size={24}
                  color={active ? theme.colors.primary : theme.colors.textMuted}
                />
                {item.badge && item.badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                    <ThemedText variant="caption" style={styles.badgeText}>
                      {item.badge > 99 ? "99+" : item.badge.toString()}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText
                variant="caption"
                style={[styles.navLabel, { color: active ? theme.colors.primary : theme.colors.textMuted }]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navbar: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 0 : 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
})
