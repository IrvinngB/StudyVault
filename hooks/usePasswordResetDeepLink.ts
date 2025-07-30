"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Linking from "expo-linking"
import { router } from "expo-router"
import { useEffect } from "react"

export function usePasswordResetDeepLink() {
  useEffect(() => {
    // Handle initial URL when app is opened from a deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) {
          console.log("🚀 URL inicial detectada:", initialUrl)
          // Agregar un pequeño delay para asegurar que la app esté lista
          setTimeout(() => {
            handleDeepLink(initialUrl)
          }, 500)
        }
      } catch (error) {
        console.error("❌ Error getting initial URL:", error)
      }
    }

    // Handle URLs when app is already running
    const handleUrlChange = async (event: { url: string }) => {
      console.log("📱 Deep link recibido:", event.url)
      await handleDeepLink(event.url)
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
              
              // Navegar a la pantalla de actualización de contraseña usando replace para evitar problemas de navegación
              setTimeout(() => {
                router.replace("/(auth)/update-password" as any)
              }, 100)
            } catch (error) {
              console.error("❌ Error guardando token de recuperación:", error)
              // Si hay error, redirigir a forgot-password
              setTimeout(() => {
                router.replace("/(auth)/forgot-password" as any)
              }, 100)
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
              
              // Usar replace para evitar problemas de navegación
              setTimeout(() => {
                router.replace("/(auth)/update-password" as any)
              }, 100)
            } catch (error) {
              console.error("❌ Error guardando tokens:", error)
              setTimeout(() => {
                router.replace("/(auth)/forgot-password" as any)
              }, 100)
            }
          } else {
            console.log("❌ Tokens no encontrados en URL de recuperación")
            setTimeout(() => {
              router.replace("/(auth)/forgot-password" as any)
            }, 100)
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
            setTimeout(() => {
              router.replace({
                pathname: "/(auth)/confirm-email",
                params: {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
              } as any)
            }, 100)
          } else {
            console.log("❌ Tokens no encontrados en URL de confirmación")
            setTimeout(() => {
              router.replace("/(auth)/login" as any)
            }, 100)
          }
          return
        }

        // For any other unrecognized URLs, redirect to login instead of showing error
        console.log("ℹ️ URL no reconocida, redirigiendo a login:", url)
        setTimeout(() => {
          router.replace("/(auth)/login" as any)
        }, 100)
      } catch (error) {
        console.error("❌ Error procesando deep link:", error)
        // En caso de error, redirigir a login
        setTimeout(() => {
          router.replace("/(auth)/login" as any)
        }, 100)
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
