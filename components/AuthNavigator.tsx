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
  const { isAuthenticated, isLoading, isTransitioning, user } = useAuth()
  const pathname = usePathname()
  const hasRedirected = useRef(false)
  const lastAuthState = useRef<boolean | null>(null)
  const lastPathname = useRef<string>("")
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Limpiar timeout previo si existe
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current)
      redirectTimeout.current = null
    }

    // Solo actuar cuando el estado de carga haya terminado y no esté en transición
    if (isLoading || isTransitioning) {
      return
    }

    // Evitar redirecciones múltiples si el estado no cambió y la ruta es la misma
    if (lastAuthState.current === isAuthenticated && lastPathname.current === pathname) {
      return
    }

    // Delay para evitar redirecciones muy rápidas que causan parpadeo
    redirectTimeout.current = setTimeout(() => {
      lastAuthState.current = isAuthenticated
      lastPathname.current = pathname

      console.log("🔐 AuthNavigator - Evaluando navegación:", {
        isAuthenticated,
        hasUser: !!user,
        pathname,
        hasRedirected: hasRedirected.current,
        isTransitioning,
      })

      // Rutas de autenticación que no requieren redirección
      const isAuthRoute = pathname.startsWith("/(auth)")

      // Rutas públicas que pueden accederse sin autenticación
      const isPublicRoute =
        pathname.includes("/confirm-email") ||
        pathname.includes("/update-password") ||
        pathname.includes("/reset-password") ||
        pathname.includes("/forgot-password")

      // Rutas especiales que no deben ser redirigidas (como +not-found)
      const isSpecialRoute = pathname.includes("+not-found")

      console.log("🔐 AuthNavigator - Análisis de ruta:", {
        pathname,
        isAuthRoute,
        isPublicRoute,
        isSpecialRoute,
        isAuthenticated
      })

      // Resetear flag si cambia la ruta
      if (lastPathname.current !== pathname) {
        hasRedirected.current = false
      }

      if (!isAuthenticated) {
        // Si no está autenticado y no está en una ruta de auth, redirigir a login
        if (!isAuthRoute && !isSpecialRoute && !hasRedirected.current) {
          console.log("🔄 Usuario NO autenticado - Redirigiendo a login desde:", pathname)
          hasRedirected.current = true
          router.replace("/(auth)/login")
          return // Importante: salir aquí para evitar más lógica
        }
      } else {
        // Si está autenticado y está en una ruta de auth (pero no pública), redirigir a tabs
        if (isAuthRoute && !isPublicRoute && !hasRedirected.current) {
          console.log("✅ Usuario autenticado - Redirigiendo a tabs desde:", pathname)
          hasRedirected.current = true
          router.replace("/(tabs)")
          return // Importante: salir aquí para evitar más lógica
        }
      }

      // Reset redirect flag when in correct location
      if ((!isAuthenticated && isAuthRoute) || (isAuthenticated && !isAuthRoute)) {
        hasRedirected.current = false
      }
    }, 150) // Delay de 150ms para evitar parpadeos

  }, [isAuthenticated, isLoading, isTransitioning, pathname, user])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current)
      }
    }
  }, [])

  // Reset redirect flag when auth state changes
  useEffect(() => {
    hasRedirected.current = false
  }, [isAuthenticated])

  // Mostrar loading mientras se verifica la autenticación o está en transición
  if (isLoading || isTransitioning) {
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
          {isTransitioning ? "Procesando..." : "Verificando autenticación..."}
        </ThemedText>
      </ThemedView>
    )
  }

  // Mostrar contenido siempre, dejar que el routing maneje la navegación
  return <>{children}</>
}
