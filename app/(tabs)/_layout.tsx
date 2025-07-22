"use client"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { useTheme } from "@/hooks/useTheme"
import { Tabs } from "expo-router"
import { Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TabsLayout() {
  const { theme } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarStyle: [
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 0.5,
              height: Platform.OS === "ios" ? 85 : 65,
            },
          ],
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="themes-demo"
          options={{
            title: 'Temas',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paintpalette" color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}
