import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useNotes } from "@/hooks/useNotes"
import { useTheme } from "@/hooks/useTheme"
import { StyleSheet, View } from "react-native"

export default function TestDataCreator() {
  const { theme } = useTheme()
  const { createNote } = useNotes()

  const createSampleNotes = async () => {
    const sampleNotes = [
      {
        title: "Literatura de la Antigüedad",
        content: "La literatura antigua abarca las obras escritas desde los primeros registros hasta la caída del Imperio Romano. Incluye textos épicos como la Ilíada y la Odisea, obras teatrales de Sófocles y Eurípides, y escritos filosóficos de Platón y Aristóteles. Características principales: - Temática heroica y mitológica - Estructura en verso - Transmisión oral inicial - Valores culturales de la época",
        ai_summary: "La literatura antigua comprende obras desde los primeros registros hasta la caída del Imperio Romano, destacando textos épicos, teatrales y filosóficos con temática heroica, estructura en verso y transmisión oral inicial.",
        tags: ["literatura", "antigüedad", "épica", "teatro", "filosofía"],
        is_favorite: false,
      },
      {
        title: "Matemáticas: Álgebra Básica",
        content: "El álgebra es una rama de las matemáticas que utiliza símbolos y letras para representar números y cantidades en fórmulas y ecuaciones. Conceptos fundamentales: - Variables (x, y, z) - Ecuaciones lineales - Factorización - Productos notables - Sistemas de ecuaciones. Ejemplo: Si x + 5 = 12, entonces x = 7",
        ai_summary: "El álgebra utiliza símbolos para representar números en fórmulas y ecuaciones, incluyendo variables, ecuaciones lineales, factorización y sistemas de ecuaciones.",
        tags: ["matemáticas", "álgebra", "ecuaciones", "variables"],
        is_favorite: true,
      },
      {
        title: "Física Cuántica: Conceptos Básicos",
        content: "La física cuántica estudia el comportamiento de la materia y la energía a escala atómica y subatómica. Principios clave: - Dualidad onda-partícula - Principio de incertidumbre de Heisenberg - Superposición cuántica - Entrelazamiento cuántico. Los fotones pueden comportarse como ondas y partículas simultáneamente.",
        ai_summary: "La física cuántica examina el comportamiento de materia y energía a escala atómica, destacando la dualidad onda-partícula, incertidumbre, superposición y entrelazamiento cuántico.",
        tags: ["física", "cuántica", "fotones", "Heisenberg"],
        is_favorite: false,
      },
      {
        title: "Ideas para Proyecto Final",
        content: "Lluvia de ideas para el proyecto final del semestre: 1. App de gestión de tareas estudiantiles 2. Sistema de notas con IA 3. Plataforma de intercambio de libros 4. Red social académica 5. Herramienta de estudio colaborativo. Considerar: tecnologías a usar, tiempo disponible, recursos necesarios.",
        tags: ["proyecto", "ideas", "aplicación", "estudio"],
        is_favorite: true,
      }
    ]

    for (const noteData of sampleNotes) {
      try {
        await createNote(noteData)
      } catch (error) {
        console.error("Error creando nota de ejemplo:", error)
      }
    }
  }

  return (
    <ThemedView variant="background" style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primary + "20" }]}>
          <IconSymbol name="flask" size={32} color={theme.colors.primary} />
        </View>
        
        <ThemedText variant="h2" style={styles.title}>
          Datos de Prueba
        </ThemedText>
        
        <ThemedText variant="body" color="secondary" style={styles.description}>
          Crea algunas notas de ejemplo para probar las nuevas funcionalidades como emojis, resúmenes de IA y clasificación por materias.
        </ThemedText>

        <ThemedButton
          title="Crear Notas de Ejemplo"
          variant="primary"
          icon={<IconSymbol name="plus" size={18} color="white" />}
          onPress={createSampleNotes}
          style={styles.button}
        />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    alignSelf: "stretch",
    paddingVertical: 16,
  },
})
