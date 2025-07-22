import { convertUTCToLocal, debugTimezone, formatDateWithTimezone, formatTimeWithPreferences } from "./timezoneHelpers"

export function parseDbDateTimeToLocal(dbDateTimeString: string): Date {
  console.log("🔄 Parsing DB string with timezone support:", dbDateTimeString)

  try {
    // Usar la nueva función de conversión con soporte de zona horaria
    const localDate = convertUTCToLocal(dbDateTimeString)

    // Debug para verificar la conversión
    debugTimezone(dbDateTimeString)

    return localDate
  } catch (error) {
    console.error("❌ Error parsing date with timezone:", error)
    console.error("❌ Original string:", dbDateTimeString)

    // Fallback: devolver fecha actual
    const fallbackDate = new Date()
    console.warn("⚠️ Using fallback date:", fallbackDate.toLocaleString())
    return fallbackDate
  }
}

export function formatTimeForDisplay(date: Date, use24Hour = false): string {
  try {
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error("❌ Invalid date passed to formatTimeForDisplay:", date)
      return "Hora inválida"
    }

    // Usar la nueva función con soporte de zona horaria
    return formatTimeWithPreferences(date, use24Hour)
  } catch (error) {
    console.error("❌ Error formatting time:", error)
    return "Hora inválida"
  }
}

export function formatDateForDisplay(date: Date): string {
  try {
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error("❌ Invalid date passed to formatDateForDisplay:", date)
      return "Fecha inválida"
    }

    // Usar la nueva función con soporte de zona horaria
    return formatDateWithTimezone(date, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("❌ Error formatting date:", error)
    return "Fecha inválida"
  }
}

// Función adicional para validar fechas
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

// Función para convertir fecha UTC a local de forma segura
export function safeParseDate(dateString: string): Date {
  try {
    const date = parseDbDateTimeToLocal(dateString)
    return isValidDate(date) ? date : new Date()
  } catch (error) {
    console.error("❌ Error in safeParseDate:", error)
    return new Date()
  }
}

// Nueva función para formatear fecha y hora completa
export function formatDateTimeForDisplay(date: Date, use24Hour = false): string {
  try {
    if (!isValidDate(date)) {
      return "Fecha y hora inválida"
    }

    return formatDateWithTimezone(date, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24Hour,
    })
  } catch (error) {
    console.error("❌ Error formatting datetime:", error)
    return "Fecha y hora inválida"
  }
}
