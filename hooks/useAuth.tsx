"use client"

import type React from "react"

import { apiClient } from "@/database/api/client"
import type { AuthSession, UserProfile } from "@/database/models/types"
import { authService } from "@/database/services/authService"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

interface AuthContextType {
  user: UserProfile | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isTransitioning: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    userData?: { name?: string },
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isInitialized = useRef(false)
  const initializationPromise = useRef<Promise<void> | null>(null)

  const initialize = useCallback(async () => {
    // Si ya hay una inicialización en progreso, esperar a que termine
    if (initializationPromise.current) {
      console.log("⏳ Esperando inicialización en progreso...")
      return initializationPromise.current
    }

    // Si ya está inicializado, no hacer nada
    if (isInitialized.current) {
      console.log("✅ Auth ya inicializado, saltando...")
      return
    }

    console.log("🚀 Inicializando AuthProvider...")
    setIsLoading(true)

    // Crear la promesa de inicialización
    initializationPromise.current = (async () => {
      try {
        // Initialize auth service
        await authService.initialize()

        // Get current session
        const currentSession = await authService.getCurrentSession()
        console.log("📱 Sesión actual:", currentSession ? "encontrada" : "no encontrada")

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          console.log("✅ Usuario autenticado:", currentSession.user?.email)
        } else {
          console.log("❌ No hay sesión activa")
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error)
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
        isInitialized.current = true
        initializationPromise.current = null
        console.log("✅ Auth initialization completada")
      }
    })()

    return initializationPromise.current
  }, [])

  useEffect(() => {
    initialize()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((session) => {
      console.log("🔄 Auth state cambió:", session ? "autenticado" : "no autenticado")
      setSession(session)
      setUser(session?.user || null)
    })

    // Listen for auth invalidation from API client (403/401 errors)
    const unregisterAuthInvalidation = apiClient.onAuthInvalidation(() => {
      console.log("🚨 Invalidación de autenticación detectada por API client")
      setSession(null)
      setUser(null)
      setIsLoading(false)
      setIsTransitioning(false)
      // Forzar reinicialización
      isInitialized.current = false
      initializationPromise.current = null
    })

    return () => {
      subscription?.unsubscribe()
      unregisterAuthInvalidation()
    }
  }, [initialize])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("🔑 Intentando iniciar sesión para:", email)
    setIsLoading(true)
    setIsTransitioning(true)
    try {
      const result = await authService.signIn(email, password)

      if (result.success && result.data) {
        console.log("✅ Inicio de sesión exitoso")
        setSession(result.data)
        setUser(result.data.user)
        // Pequeño delay para evitar parpadeo
        setTimeout(() => {
          setIsTransitioning(false)
        }, 500)
      } else {
        console.log("❌ Error en inicio de sesión:", result.error)
        setIsTransitioning(false)
      }

      return result
    } catch (error) {
      console.error("💥 Sign in error:", error)
      setIsTransitioning(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al iniciar sesión",
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData?: { name?: string }) => {
    console.log("📝 Intentando registrar usuario:", email)
    setIsLoading(true)
    setIsTransitioning(true)
    try {
      const result = await authService.signUp(email, password, userData)

      if (result.success) {
        console.log("✅ Registro exitoso - NO estableciendo sesión automáticamente")
        // NO establecer sesión automáticamente para que el usuario confirme su email primero
        // Pequeño delay para evitar parpadeo
        setTimeout(() => {
          setIsTransitioning(false)
        }, 500)
      } else {
        console.log("❌ Error en registro:", result.error)
        setIsTransitioning(false)
      }

      return result
    } catch (error) {
      console.error("💥 Sign up error:", error)
      setIsTransitioning(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear la cuenta",
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log("🚪 Cerrando sesión...")
    setIsLoading(true)
    try {
      await authService.signOut()
      setSession(null)
      setUser(null)
      console.log("✅ Sesión cerrada exitosamente")
    } catch (error) {
      console.error("❌ Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      return await authService.resetPassword(email)
    } catch (error) {
      console.error("❌ Reset password error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al restablecer la contraseña",
      }
    }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    try {
      return await authService.updatePassword(password)
    } catch (error) {
      console.error("❌ Update password error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar la contraseña",
      }
    }
  }, [])

  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      return await authService.resendConfirmationEmail(email)
    } catch (error) {
      console.error("❌ Resend confirmation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al reenviar email de confirmación",
      }
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        const result = await authService.updateProfile(updates)

        if (result.success && result.data) {
          setUser(result.data)
          // Update session user as well
          if (session) {
            setSession({
              ...session,
              user: result.data,
            })
          }
        }

        return result
      } catch (error) {
        console.error("❌ Update profile error:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error al actualizar el perfil",
        }
      }
    },
    [session],
  )

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user && isInitialized.current,
    isTransitioning,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
