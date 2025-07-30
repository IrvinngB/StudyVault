"use client"

import * as Linking from "expo-linking"
import { router } from "expo-router"
import { useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export function usePasswordResetDeepLink() {
  useEffect(() => {
    // Handle initial URL when app is opened from a deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) {
          console.log("🚀 URL inicial detectada:", initialUrl)
          handleDeepLink(initialUrl)
        }
      } catch (error) {
        console.error("❌ Error getting initial URL:", error)
      }
    }

    // Handle URLs when app is already running
    const handleUrlChange = (event: { url: string }) => {
      console.log("📱 Deep link recibido:", event.url)
      handleDeepLink(event.url)
    }

    const handleDeepLink = async (url: string) => {
      try {
        // Ignore development URLs and local IPs
        if (
          url.includes("exp://") ||
          url.includes("localhost") ||
          url.includes("127.0.0.1") ||
          url.includes("192.168.") ||
          url.includes("172.") ||
          url.includes("10.") ||
          url.includes(":8081") ||
          url.includes(":19000") ||
          url.includes(":19001") ||
          url.includes(":19002")
        ) {
          console.log("🔧 URL de desarrollo ignorada:", url)
          return
        }

        // Handle Supabase verification URLs (like the one you're getting)
        if (url.includes("supabase.co/auth/v1/verify")) {
          console.log("🔑 Detectado enlace de verificación de Supabase")
          
          const urlObj = new URL(url)
          const token = urlObj.searchParams.get("token")
          const type = urlObj.searchParams.get("type")
          
          if (token && type === "recovery") {
            console.log("✅ Token de recuperación encontrado en URL de Supabase")
            
            // Guardar el token de recuperación en AsyncStorage
            try {
              await AsyncStorage.setItem('recovery_token', token)
              console.log("💾 Token de recuperación guardado en AsyncStorage")
              
              // Navegar a la pantalla de actualización de contraseña
              router.push("/(auth)/update-password")
            } catch (error) {
              console.error("❌ Error guardando token de recuperación:", error)
            }
            return
          }
        }

        const parsedUrl = Linking.parse(url)
        console.log("🔗 URL parseada:", parsedUrl)

        // Handle password reset URLs (your app's deep links)
        if (parsedUrl.path?.includes("reset-password") || parsedUrl.queryParams?.type === "recovery") {
          console.log("🔑 Detectado enlace de recuperación de contraseña")

          const accessToken = parsedUrl.queryParams?.access_token as string
          const refreshToken = parsedUrl.queryParams?.refresh_token as string

          if (accessToken && refreshToken) {
            console.log("✅ Tokens encontrados, guardando en AsyncStorage y navegando a update-password")
            
            // Guardar tokens temporalmente en AsyncStorage
            try {
              await AsyncStorage.setItem('temp_access_token', accessToken)
              await AsyncStorage.setItem('temp_refresh_token', refreshToken)
              console.log("💾 Tokens guardados en AsyncStorage")
            } catch (error) {
              console.error("❌ Error guardando tokens:", error)
            }
            
            router.push("/(auth)/update-password")
          } else {
            console.log("❌ Tokens no encontrados en URL de recuperación")
            router.push("/(auth)/forgot-password")
          }
          return
        }

        // Handle email confirmation URLs
        if (parsedUrl.path?.includes("confirm-email") || parsedUrl.queryParams?.type === "signup") {
          console.log("📧 Detectado enlace de confirmación de email")

          const accessToken = parsedUrl.queryParams?.access_token as string
          const refreshToken = parsedUrl.queryParams?.refresh_token as string

          if (accessToken && refreshToken) {
            console.log("✅ Tokens encontrados, navegando a confirm-email")
            router.push({
              pathname: "/(auth)/confirm-email",
              params: {
                access_token: accessToken,
                refresh_token: refreshToken,
              },
            })
          } else {
            console.log("❌ Tokens no encontrados en URL de confirmación")
          }
          return
        }

        // For any other unrecognized URLs, just log them but don't redirect
        console.log("ℹ️ URL no reconocida, manteniendo navegación actual:", url)
      } catch (error) {
        console.error("❌ Error procesando deep link:", error)
      }
    }

    // Set up listeners
    handleInitialURL()
    const subscription = Linking.addEventListener("url", handleUrlChange)

    return () => {
      subscription?.remove()
    }
  }, [])
}
