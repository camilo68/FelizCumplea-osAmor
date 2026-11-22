/**
 * Fechas del regalo.
 *
 * Todo se calcula en hora local para que el 23 de noviembre y las 23:23
 * ocurran en el reloj de Karen, no en el del servidor.
 */

const DAY = 86_400_000
const START = { year: 2026, month: 4, day: 17 }
const BIRTHDAY = { year: 2026, month: 10, day: 23 }

function localDate(year: number, month: number, day: number) {
  return new Date(year, month, day)
}

function startOfDay(date: Date) {
  return localDate(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Días completos desde el 17 de mayo de 2026. El 23 de noviembre son 190. */
export function daysTogether(now = new Date()) {
  const from = localDate(START.year, START.month, START.day)
  const to = startOfDay(now)

  return Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY))
}

export type Moment = {
  /** Es 23 de noviembre de 2026. */
  isBirthday: boolean
  /** Es el minuto exacto 23:23 de ese día (o se está previsualizando). */
  isSpecialMinute: boolean
  /** Días desde el 17 de mayo de 2026. */
  days: number
  /** Cómo se activó el modo cumpleaños: fecha real o vista previa. */
  source: 'date' | 'preview' | null
}

/**
 * `?momento=cumple` previsualiza el modo cumpleaños y
 * `?momento=2323` el minuto especial. Sirve para revisarlo antes del día.
 */
export function getMoment(now = new Date()): Moment {
  const params =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search)
  const preview = params?.get('momento') ?? null

  const isBirthday =
    now.getFullYear() === BIRTHDAY.year &&
    now.getMonth() === BIRTHDAY.month &&
    now.getDate() === BIRTHDAY.day
  const isSpecialMinute =
    isBirthday && now.getHours() === 23 && now.getMinutes() === 23

  if (preview === '2323') {
    return {
      isBirthday: true,
      isSpecialMinute: true,
      days: daysTogether(localDate(BIRTHDAY.year, BIRTHDAY.month, BIRTHDAY.day)),
      source: 'preview',
    }
  }

  if (preview === 'cumple') {
    return {
      isBirthday: true,
      isSpecialMinute: false,
      days: daysTogether(localDate(BIRTHDAY.year, BIRTHDAY.month, BIRTHDAY.day)),
      source: 'preview',
    }
  }

  return {
    isBirthday,
    isSpecialMinute,
    days: daysTogether(now),
    source: isBirthday ? 'date' : null,
  }
}
