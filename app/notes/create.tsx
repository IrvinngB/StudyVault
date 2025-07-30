"use client"

import { useRouter } from "expo-router"
import { useEffect } from "react"

export default function CreateNoteRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la pantalla de edición con ID "new"
    router.replace("/notes/new")
  }, [router])

  return null
}