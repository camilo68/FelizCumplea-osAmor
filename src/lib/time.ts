export type DurationParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Descompone el tiempo transcurrido entre dos fechas. */
export function splitDuration(startedAt: string, now: Date): DurationParts {
  const start = new Date(startedAt)
  const elapsed = Math.max(0, now.getTime() - start.getTime())
  const totalSeconds = Math.floor(elapsed / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function pad(value: number, length = 2) {
  return String(value).padStart(length, '0')
}

export function formatLongDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
