"use client"

import { AVAILABLE_AVATARS } from "@/database/models/userTypes"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native"
import { ThemedText, ThemedView } from "./ThemedComponents"

interface AvatarSelectorProps {
  selectedAvatar: string
  onAvatarSelect: (avatarId: string) => void
  size?: number
  showEditIcon?: boolean
}

export function AvatarSelector({
  selectedAvatar,
  onAvatarSelect,
  size = 60,
  showEditIcon = true,
}: AvatarSelectorProps) {
  const { theme } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)

  const selectedAvatarData = AVAILABLE_AVATARS.find((avatar) => avatar.id === selectedAvatar)

  const handleAvatarSelect = (avatarId: string) => {
    onAvatarSelect(avatarId)
    setModalVisible(false)
  }

  const handleRemoveAvatar = () => {
    onAvatarSelect("")
    setModalVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: selectedAvatarData ? "transparent" : theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: theme.colors.border,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {selectedAvatarData ? (
          <Image
            source={selectedAvatarData.path}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
            resizeMode="cover"
          />
        ) : (
          <ThemedText
            style={{
              color: "white",
              fontSize: size * 0.3,
              fontWeight: "700",
            }}
          >
            ?
          </ThemedText>
        )}

        {showEditIcon && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}
          >
            <Ionicons name="pencil" size={size * 0.15} color="white" />
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView variant="background" style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ThemedText style={{ color: theme.colors.primary, fontSize: 16 }}>Cancelar</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="h3" style={{ fontWeight: "600" }}>
              Seleccionar Avatar
            </ThemedText>
            <TouchableOpacity onPress={handleRemoveAvatar}>
              <ThemedText style={{ color: theme.colors.error, fontSize: 16 }}>Quitar</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: theme.spacing.md,
              }}
            >
              {AVAILABLE_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  onPress={() => handleAvatarSelect(avatar.id)}
                  style={{
                    width: "30%",
                    aspectRatio: 1,
                    alignItems: "center",
                    padding: theme.spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      overflow: "hidden",
                      borderWidth: selectedAvatar === avatar.id ? 3 : 1,
                      borderColor: selectedAvatar === avatar.id ? theme.colors.primary : theme.colors.border,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <Image source={avatar.path} style={{ width: 80, height: 80 }} resizeMode="cover" />
                  </View>
                  <ThemedText
                    variant="caption"
                    style={{
                      textAlign: "center",
                      color: selectedAvatar === avatar.id ? theme.colors.primary : theme.colors.textMuted,
                      fontWeight: selectedAvatar === avatar.id ? "600" : "400",
                    }}
                  >
                    {avatar.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </>
  )
}
