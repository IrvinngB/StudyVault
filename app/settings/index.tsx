"use client"

import { AvatarSelector } from "@/components/ui/AvatarSelector"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { ThemeSelector } from "@/components/ui/ThemeSelector"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { clearCredentialsIfNeeded } from "@/utils/biometricAuth"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, Animated, Dimensions, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Switch, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function UnifiedSettingsScreen() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, updateProfile, loading } = useUserProfile()
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

  // Form state
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [university, setUniversity] = useState("")
  const [career, setCareer] = useState("")
  const [semester, setSemester] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  
  // Easter Egg Local State
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))

  // Developers data - local to this screen
  const developers = [
    {
      name: "Alison Vargas",
      role: "Project Manager",
      avatar: "👩‍💼",
      linkedin: "https://linkedin.com/in/alisonvargas-pm"
    },
    {
      name: "Jean Solano", 
      role: "Frontend Developer",
      avatar: "👨‍💻",
      linkedin: "https://www.linkedin.com/in/jean-luis-solano-ng-319727377/"
    },
    {
      name: "Ivan Nuñez",
      role: "Frontend Developer", 
      avatar: "👨‍🎨",
      linkedin: "https://www.linkedin.com/in/ivan-nu%C3%B1ez-694197271?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app "
    },
    {
      name: "Irvin Benitez",
      role: "FullStack Developer",
      avatar: "👨‍🔧", 
      linkedin: "https://www.linkedin.com/in/irvin-benitez-11313231b/"
    }
  ]



  // Easter Egg Modal Animation Effects
  useEffect(() => {
    if (showEasterEgg) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showEasterEgg, fadeAnim, scaleAnim])

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setSelectedAvatar(profile.avatar_url || "")

      // Leer datos desde preferences si existen
      const preferences = profile.preferences || {}
      setBio(preferences.bio || "")
      setUniversity(preferences.university || "")
      setCareer(preferences.career || "")
      setSemester(preferences.semester ? preferences.semester.toString() : "")
      
      // Load notification settings
      setNotificationsEnabled(profile.notification_settings?.push_notifications ?? true)
    }
  }, [profile])

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        full_name: fullName.trim() || undefined,
        avatar_url: selectedAvatar || undefined,
        preferences: {
          bio: bio.trim() || undefined,
          university: university.trim() || undefined,
          career: career.trim() || undefined,
          semester: semester ? Number.parseInt(semester) : undefined,
        },
      }

      const success = await updateProfile(updateData)
      if (success) {
        Alert.alert("Éxito", "Perfil actualizado correctamente")
      } else {
        Alert.alert("Error", "No se pudo actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Ocurrió un error al actualizar el perfil")
    }
  }

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            const currentEmail = user?.email || null
            await signOut()
            await clearCredentialsIfNeeded(currentEmail)
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error al cerrar sesión:", error)
          }
        },
      },
    ])
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled)
      
      const updateData = {
        notification_settings: {
          push_notifications: enabled,
          study_session_reminders: enabled,
          grade_notifications: enabled,
          calendar_reminders: enabled,
        },
      }

      const success = await updateProfile(updateData)
      if (success) {
        console.log("✅ Notification settings updated successfully")
      } else {
        // Revert the change if update failed
        setNotificationsEnabled(!enabled)
        Alert.alert("Error", "No se pudo actualizar la configuración de notificaciones")
      }
    } catch (error) {
      // Revert the change if update failed
      setNotificationsEnabled(!enabled)
      console.error("Error updating notification settings:", error)
      Alert.alert("Error", "Ocurrió un error al actualizar las notificaciones")
    }
  }

  // Easter Egg Logic - Local Implementation
  const handleSettingsCardTap = useCallback(() => {
    const newCount = tapCount + 1
    setTapCount(newCount)
    
    if (newCount >= 10) {
      setShowEasterEgg(true)
      setTapCount(0) // Reset counter after activation
    }
  }, [tapCount])

  const handleCloseEasterEgg = useCallback(() => {
    setShowEasterEgg(false)
    setTapCount(0) // Reset counter when closing
  }, [])



  // Easter Egg Modal Component
  const EasterEggModalLocal = () => (
    <Modal
      visible={showEasterEgg}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCloseEasterEgg}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            maxWidth: screenWidth * 0.9,
            maxHeight: screenHeight * 0.8,
            width: '100%',
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <ThemedView style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <View style={{
              backgroundColor: theme.colors.primary + '20',
              borderRadius: theme.borderRadius.full,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}>
              <IconSymbol name="star.fill" size={48} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h1" style={{ 
              fontSize: 28, 
              fontWeight: '800', 
              color: theme.colors.primary,
              textAlign: 'center',
              marginBottom: theme.spacing.sm 
            }}>
              Easter Egg
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
              ¡Gracias por usar StudyVault! Conoce al increíble equipo que hizo esto posible.
            </ThemedText>
          </ThemedView>

          {/* Developers List */}
          <ScrollView 
            style={{ maxHeight: screenHeight * 0.4 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: theme.spacing.sm }}
          >
            {developers.map((dev, index) => (
                                <TouchableOpacity
                    key={index}
                    onPress={() => Linking.openURL(dev.linkedin)}
                    style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: theme.borderRadius.lg,
                      padding: theme.spacing.lg,
                      marginBottom: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    activeOpacity={0.7}
                  >
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: theme.colors.primary + '20',
                    borderRadius: theme.borderRadius.full,
                    width: 60,
                    height: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: theme.spacing.md,
                  }}>
                    <ThemedText style={{ fontSize: 28 }}>{dev.avatar}</ThemedText>
                  </View>
                  
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="h3" style={{ 
                      fontWeight: '700',
                      marginBottom: 4,
                      color: theme.colors.text 
                    }}>
                      {dev.name}
                    </ThemedText>
                    <ThemedText variant="body" color="secondary" style={{ 
                      fontSize: 14,
                      lineHeight: 20 
                    }}>
                      {dev.role}
                    </ThemedText>
                  </ThemedView>
                  
                  <IconSymbol 
                    name="arrow.up.right" 
                    size={20} 
                    color={theme.colors.primary} 
                    style={{ opacity: 0.7 }}
                  />
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleCloseEasterEgg}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.lg,
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              alignItems: 'center',
              marginTop: theme.spacing.lg,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.8}
          >
            <ThemedText variant="button" style={{ 
              color: 'white', 
              fontWeight: '600',
              fontSize: 16 
            }}>
              ¡Gracias por descubrirnos! ⭐
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )

  const userName = user?.email?.split("@")[0] || "Usuario"

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background }} />
        <ThemedView variant="background" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.spacing.xl,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginRight: theme.spacing.sm,
                }}
              >
                <IconSymbol name="gear" size={24} color={theme.colors.primary} />
              </View>
              <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
                Configuración
              </ThemedText>
            </ThemedView>

            {/* Profile Section */}
            <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.lg }}>
                <IconSymbol name="person.circle" size={24} color={theme.colors.primary} />
                <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                  Perfil
                </ThemedText>
              </ThemedView>

              {/* Avatar Selection */}
              <ThemedView style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
                <AvatarSelector selectedAvatar={selectedAvatar} onAvatarSelect={setSelectedAvatar} size={80} />
                <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, textAlign: "center" }}>
                  Toca para cambiar tu avatar
                </ThemedText>
              </ThemedView>

              {/* Profile Form */}
              <ThemedView style={{ gap: theme.spacing.md }}>
                <ThemedView>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                    Nombre completo
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      color: theme.colors.text,
                      fontSize: 16,
                    }}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Tu nombre completo"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </ThemedView>

                <ThemedView>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                    Biografía
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      color: theme.colors.text,
                      fontSize: 16,
                      height: 80,
                      textAlignVertical: "top",
                    }}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Cuéntanos sobre ti..."
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                  />
                </ThemedView>

                <ThemedView style={{ flexDirection: "row", gap: theme.spacing.md }}>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                      Universidad
                    </ThemedText>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        color: theme.colors.text,
                        fontSize: 16,
                      }}
                      value={university}
                      onChangeText={setUniversity}
                      placeholder="Tu universidad"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </ThemedView>

                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                      Semestre
                    </ThemedText>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        color: theme.colors.text,
                        fontSize: 16,
                      }}
                      value={semester}
                      onChangeText={setSemester}
                      placeholder="Ej: 5"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                    />
                  </ThemedView>
                </ThemedView>

                <ThemedView>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                    Carrera
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      color: theme.colors.text,
                      fontSize: 16,
                    }}
                    value={career}
                    onChangeText={setCareer}
                    placeholder="Tu carrera"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={loading}
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingVertical: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  alignItems: "center",
                  marginTop: theme.spacing.lg,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <ThemedText variant="button" style={{ color: "white", fontWeight: "600" }}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedCard>

            {/* Theme Selector */}
            <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="paintbrush" size={24} color={theme.colors.primary} />
                <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                  Tema
                </ThemedText>
              </ThemedView>
              <ThemeSelector />
            </ThemedCard>

            {/* Notifications */}
            <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="bell" size={24} color={theme.colors.primary} />
                <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                  Notificaciones
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={{ gap: theme.spacing.sm }}>
                <ThemedView
                  style={{
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.primary + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name="bell" size={20} color={theme.colors.primary} />
                  </View>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Notificaciones del Sistema
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Habilita o deshabilita todas las notificaciones de la app
                    </ThemedText>
                  </ThemedView>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textMuted}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedCard>

            {/* Help & Support */}
            <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="questionmark.circle" size={24} color={theme.colors.primary} />
                <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                  Ayuda y Soporte
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={{ gap: theme.spacing.sm }}>
                <TouchableOpacity
                  onPress={() => router.push("/settings/help")}
                  style={{
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.info + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name="questionmark.circle" size={20} color={theme.colors.info} />
                  </View>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Centro de Ayuda
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Preguntas frecuentes, guías y contacto
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/settings/privacy")}
                  style={{
                    backgroundColor: theme.colors.surface,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.warning + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name="lock.shield" size={20} color={theme.colors.warning} />
                  </View>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Privacidad y Seguridad
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Configuración de privacidad y gestión de datos
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedCard>

            {/* Account Card - Easter Egg Trigger */}
            <TouchableOpacity onPress={handleSettingsCardTap} activeOpacity={0.7}>
              <ThemedCard 
                variant="elevated" 
                padding="large" 
                style={{ 
                  marginBottom: theme.spacing.lg,
                }}
              >
                <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                  <IconSymbol name="person.circle" size={24} color={theme.colors.primary} />
                  <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                    Cuenta
                  </ThemedText>
                </ThemedView>

                <ThemedView style={{ gap: theme.spacing.sm }}>
                  <ThemedView
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: theme.spacing.sm,
                    }}
                  >
                    <ThemedText variant="body" style={{ fontWeight: "600" }}>
                      Email
                    </ThemedText>
                    <ThemedText variant="body" color="secondary">
                      {user?.email}
                    </ThemedText>
                  </ThemedView>

                  <ThemedView
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: theme.spacing.sm,
                    }}
                  >
                    <ThemedText variant="body" style={{ fontWeight: "600" }}>
                      Usuario
                    </ThemedText>
                    <ThemedText variant="body" color="secondary">
                      {userName}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedCard>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: theme.colors.error + "20",
                paddingVertical: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.error + "40",
                marginBottom: theme.spacing.md,
              }}
            >
              <ThemedText variant="button" style={{ color: theme.colors.error, fontWeight: "600" }}>
                Cerrar Sesión
              </ThemedText>
            </TouchableOpacity>


          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>

      {/* Local Easter Egg Modal */}
      <EasterEggModalLocal />
    </>
  )
}