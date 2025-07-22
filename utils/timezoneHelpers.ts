/**
 * Utilidades para manejo de zonas horarias y conversión de fechas
 */

// Obtener la zona horaria del dispositivo
export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Obtener el offset de la zona horaria en minutos
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

// Obtener información completa de la zona horaria
export function getTimezoneInfo() {
  const timezone = getDeviceTimezone()
  const offset = getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(offset / 60))
  const offsetMinutes = Math.abs(offset % 60)
  const offsetSign = offset > 0 ? "-" : "+"

  return {
    timezone,
    offset,
    offsetString: `${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`,
    name:
      new Intl.DateTimeFormat("es-ES", {
        timeZoneName: "long",
        timeZone: timezone,
      })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value || timezone,
  }
}

// Convertir fecha UTC de la base de datos a la zona horaria local
export function convertUTCToLocal(utcDateString: string): Date {
  try {
    // Si la fecha ya incluye información de zona horaria
    if (utcDateString.includes("+") || utcDateString.includes("Z") || utcDateString.includes("-", 10)) {
      return new Date(utcDateString)
    }

    // Si no tiene zona horaria, asumimos que es UTC y agregamos 'Z'
    const utcString = utcDateString.endsWith("Z") ? utcDateString : `${utcDateString}Z`
    return new Date(utcString)
  } catch (error) {
    console.error("Error converting UTC to local:", error)
    return new Date()
  }
}

// Convertir fecha local a UTC para guardar en la base de datos
export function convertLocalToUTC(localDate: Date): string {
  return localDate.toISOString()
}

// Formatear fecha con la zona horaria del dispositivo
export function formatDateWithTimezone(
  date: Date,
  options: Intl.DateTimeFormatOptions = {},
  timezone?: string,
): string {
  const tz = timezone || getDeviceTimezone()

  return date.toLocaleString("es-ES", {
    timeZone: tz,
    ...options,
  })
}

// Formatear hora con preferencias del usuario
export function formatTimeWithPreferences(date: Date, use24Hour = false, timezone?: string): string {
  const tz = timezone || getDeviceTimezone()

  return date.toLocaleTimeString("es-ES", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24Hour,
  })
}

// Obtener la fecha actual en la zona horaria especificada
export function getCurrentTimeInTimezone(timezone?: string): Date {
  const tz = timezone || getDeviceTimezone()
  const now = new Date()

  // Crear una nueva fecha ajustada a la zona horaria
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const targetTime = new Date(utc + getTimezoneOffsetForZone(tz) * 60000)

  return targetTime
}

// Obtener el offset de una zona horaria específica
function getTimezoneOffsetForZone(timezone: string): number {
  const now = new Date()
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
  const target = new Date(now.toLocaleString("en-US", { timeZone: timezone }))

  return (target.getTime() - utc.getTime()) / (1000 * 60)
}

// Validar si una zona horaria es válida
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

// Obtener lista de zonas horarias comunes para Latinoamérica
export function getCommonTimezones() {
  return [
    { name: "Colombia", timezone: "America/Bogota", flag: "🇨🇴" },
    { name: "México", timezone: "America/Mexico_City", flag: "🇲🇽" },
    { name: "Argentina", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
    { name: "España", timezone: "Europe/Madrid", flag: "🇪🇸" },
    { name: "Chile", timezone: "America/Santiago", flag: "🇨🇱" },
    { name: "Perú", timezone: "America/Lima", flag: "🇵🇪" },
    { name: "Venezuela", timezone: "America/Caracas", flag: "🇻🇪" },
    { name: "Ecuador", timezone: "America/Guayaquil", flag: "🇪🇨" },
    { name: "Brasil", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
    { name: "Uruguay", timezone: "America/Montevideo", flag: "🇺🇾" },
    { name: "Paraguay", timezone: "America/Asuncion", flag: "🇵🇾" },
    { name: "Bolivia", timezone: "America/La_Paz", flag: "🇧🇴" },
  ]
}

// Función para debugging de zonas horarias
export function debugTimezone(dateString: string) {
  const info = getTimezoneInfo()
  const originalDate = new Date(dateString)
  const localDate = convertUTCToLocal(dateString)

  console.log("🌍 Timezone Debug Info:", {
    deviceTimezone: info.timezone,
    offsetString: info.offsetString,
    originalString: dateString,
    originalDate: originalDate.toISOString(),
    convertedLocal: localDate.toISOString(),
    displayLocal: formatDateWithTimezone(localDate, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  })

  return localDate
}
