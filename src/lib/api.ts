export type VisitInfo = {
  count: number
  firstVisit: string | null
  lastVisit: string | null
}

export type AlbumStats = {
  visits: VisitInfo
  tracks: Array<{ trackNumber: number; plays: number }>
  totalPlays: number
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit, timeoutMs = 9000): Promise<T | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

/**
 * Avisa al backend de que el regalo se abrió.
 * Si el backend no está disponible, devuelve null y el regalo sigue
 * funcionando normalmente (el contador de visitas es solo un extra).
 */
export async function registerVisit(): Promise<VisitInfo | null> {
  const data = await request<VisitInfo>('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'gift' }),
  })

  if (!data || typeof data.count !== 'number') return null
  return data
}

/** Guarda que una pista se escuchó. Silencioso si el backend no está. */
export async function registerTrackPlay(trackNumber: number): Promise<void> {
  await request<{ trackNumber: number; plays: number }>(`/api/tracks/${trackNumber}/play`, {
    method: 'POST',
  })
}

/** Estadísticas públicas del álbum (visitas y pistas más escuchadas). */
export async function getStats(): Promise<AlbumStats | null> {
  const data = await request<AlbumStats>('/api/stats')
  if (!data || typeof data.totalPlays !== 'number') return null
  return data
}
