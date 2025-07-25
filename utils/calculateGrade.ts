import type { GradeData } from '@/database/services/gradesService'
import type { CategoryGradeData } from '@/database/services/categoryService'

export function calculateWeightedGrade(
  evaluaciones: GradeData[],
  categorias: CategoryGradeData[],
  escala: number
): number {
  if (!categorias.length || escala <= 0) return 0

  let total = 0
  let porcentajeTotal = 0

  for (const categoria of categorias) {
    const evaluacionesCat = evaluaciones.filter(e => e.category_id === categoria.id)
    if (!evaluacionesCat.length) continue // ✅ ignora categoría sin evaluaciones

    const totalMaxScore = evaluacionesCat.reduce((acc, e) => acc + e.max_score, 0)
    const totalScore = evaluacionesCat.reduce((acc, e) => acc + e.score, 0)

    const promedio = totalMaxScore > 0
      ? (totalScore / totalMaxScore) * escala
      : 0

    const ponderado = (promedio * categoria.percentage) / 100

    total += ponderado
    porcentajeTotal += categoria.percentage
  }

  if (porcentajeTotal === 0) return 0

  // ✅ Normaliza si el total ponderado es inferior a 100%
  const notaFinal = (total * 100) / porcentajeTotal

  return Number(notaFinal.toFixed(2))
}
