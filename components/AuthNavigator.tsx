"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { router, usePathname } from "expo-router"
import { useEffect, useRef } from "react"
import { ActivityIndicator } from "react-native"
import { ThemedText, ThemedView } from "./ui/ThemedComponents"

interface AuthNavigatorProps {
  children: React.ReactNode
}

export function AuthNavigator({ children }: AuthNavigatorProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()
  const hasRedirected = useRef(false)
  const lastAuthState = useRef<boolean | null>(null)

  useEffect(() => {
    // Solo actuar cuando el estado de carga haya terminado
    if (isLoading) {
      return
    }

    // Evitar redirecciones múltiples
    if (lastAuthState.current === isAuthenticated) {
      return
    }

    lastAuthState.current = isAuthenticated

    console.log("🔐 AuthNavigator - Evaluando navegación:", {
      isAuthenticated,
      hasUser: !!user,
      pathname,
      hasRedirected: hasRedirected.current,
    })

    // Rutas de autenticación que no requieren redirección
    const isAuthRoute =
      pathname.startsWith("/(auth)") ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/confirm-email" ||
      pathname === "/update-password"

    // Rutas públicas que pueden accederse sin autenticación
    const isPublicRoute =
      pathname.includes("/confirm-email") ||
      pathname.includes("/update-password") ||
      pathname.includes("/reset-password")

    if (!isAuthenticated) {
      // Si no está autenticado y no está en una ruta de auth (y no es pública)
      if (!isAuthRoute && !isPublicRoute && !hasRedirected.current) {
        console.log("🔄 Redirigiendo a login desde:", pathname)
        hasRedirected.current = true
        router.replace("/(auth)/login")
      }
    } else {
      // Si está autenticado y está en una ruta de auth (pero no pública)
      if (isAuthRoute && !isPublicRoute && !hasRedirected.current) {
        console.log("✅ Usuario autenticado, redirigiendo a tabs desde:", pathname)
        hasRedirected.current = true
        router.replace("/(tabs)")
      }
      // Reset redirect flag when authenticated and in correct location
      else if (!isAuthRoute) {
        hasRedirected.current = false
      }
    }
  }, [isAuthenticated, isLoading, pathname, user])

  // Reset redirect flag when auth state changes
  useEffect(() => {
    hasRedirected.current = false
  }, [isAuthenticated])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <ThemedView
        variant="background"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText variant="body" color="secondary">
          Verificando autenticación...
        </ThemedText>
      </ThemedView>
    )
  }

  // Mostrar contenido siempre, dejar que el routing maneje la navegación
  return <>{children}</>
}
