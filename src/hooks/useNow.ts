import { useEffect, useState } from 'react'

/** Devuelve la fecha actual y se actualiza cada `interval` milisegundos. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), interval)
    return () => window.clearInterval(id)
  }, [interval])

  return now
}
