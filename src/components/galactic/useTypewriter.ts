import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/**
 * Escribe un texto letra a letra.
 *
 * La velocidad se calcula para que la carta completa tarde `duration` ms,
 * así un texto largo no obliga a esperar una eternidad. Si el sistema pide
 * menos movimiento, aparece de golpe.
 */
export function useTypewriter(text: string, active: boolean, duration = 9000) {
  const [count, setCount] = useState(0)
  const frame = useRef(0)

  const finish = useCallback(() => {
    window.cancelAnimationFrame(frame.current)
    setCount(text.length)
  }, [text.length])

  // Al abrir la carta de nuevo, empieza desde el principio sin parpadear
  // con el texto completo del intento anterior.
  useLayoutEffect(() => {
    if (active) setCount(0)
  }, [active, text])

  useEffect(() => {
    if (!active) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length)
      return
    }

    const step = Math.max(2, Math.min(16, Math.round(duration / Math.max(1, text.length))))
    let current = 0
    let last = performance.now()

    const tick = (now: number) => {
      const elapsed = now - last
      if (elapsed >= step) {
        const chars = Math.floor(elapsed / step)
        current = Math.min(text.length, current + chars)
        last += chars * step
        setCount(current)
      }

      if (current < text.length) frame.current = window.requestAnimationFrame(tick)
    }

    frame.current = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame.current)
  }, [text, active, duration])

  return useMemo(
    () => ({
      visible: text.slice(0, count),
      done: count >= text.length,
      finish,
      progress: text.length === 0 ? 1 : count / text.length,
    }),
    [text, count, finish],
  )
}
