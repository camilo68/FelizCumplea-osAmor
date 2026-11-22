import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

export type ConfettiHandle = {
  burst: (options?: BurstOptions) => void
}

type BurstOptions = {
  /** 0 = izquierda, 1 = derecha */
  x?: number
  /** 0 = arriba, 1 = abajo */
  y?: number
  count?: number
  /** Multiplica la velocidad inicial. */
  spread?: number
}

type Shape = 'rect' | 'strip' | 'circle' | 'star'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  flutter: number
  life: number
  shape: Shape
  color: string
}

const COLORS = ['#f6f1e7', '#ff8fa8', '#b79bff', '#8de8d4', '#ffd166', '#9ad1ff']
const SHAPES: Shape[] = ['rect', 'strip', 'circle', 'star']

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const spikes = 5
  const outer = size
  const inner = size * 0.42
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (i * Math.PI) / spikes - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

export const ConfettiCanvas = forwardRef<ConfettiHandle, Record<never, never>>(
  function ConfettiCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particles = useRef<Particle[]>([])
    const raf = useRef(0)
    const running = useRef(false)
    const size = useRef({ width: 0, height: 0, dpr: 1 })

    const resize = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      size.current = { width, height, dpr }
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }, [])

    const render = useCallback(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) {
        running.current = false
        return
      }

      const { width, height } = size.current
      ctx.clearRect(0, 0, width, height)

      const alive: Particle[] = []
      for (const particle of particles.current) {
        particle.vx *= 0.994
        particle.vy = particle.vy * 0.994 + 0.09
        particle.x += particle.vx + Math.sin(particle.life * 0.08) * particle.flutter
        particle.y += particle.vy
        particle.rotation += particle.spin
        particle.life -= 1

        if (particle.life <= 0) continue
        if (particle.y > height + 60) continue

        alive.push(particle)

        const alpha = Math.min(1, particle.life / 45)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillStyle = particle.color

        if (particle.shape === 'star') {
          drawStar(ctx, particle.size * 0.9)
        } else if (particle.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, particle.size * 0.38, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.shape === 'strip') {
          ctx.fillRect(-particle.size * 0.9, -particle.size * 0.12, particle.size * 1.8, particle.size * 0.24)
        } else {
          ctx.fillRect(-particle.size * 0.4, -particle.size * 0.3, particle.size * 0.8, particle.size * 0.6)
        }

        ctx.restore()
      }

      particles.current = alive

      if (alive.length > 0) {
        raf.current = window.requestAnimationFrame(render)
      } else {
        running.current = false
      }
    }, [])

    const burst = useCallback(
      (options: BurstOptions = {}) => {
        const { width, height } = size.current
        if (!width || !height) return

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const count = Math.round((options.count ?? 110) * (reducedMotion ? 0.3 : 1))
        const originX = (options.x ?? 0.5) * width
        const originY = (options.y ?? 0.4) * height
        const spread = options.spread ?? 1

        for (let i = 0; i < count; i += 1) {
          const angle = Math.random() * Math.PI * 2
          const speed = (3.5 + Math.random() * 8.5) * spread

          particles.current.push({
            x: originX + (Math.random() - 0.5) * 24,
            y: originY + (Math.random() - 0.5) * 24,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.4,
            size: 6 + Math.random() * 10,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.24,
            flutter: Math.random() * 0.6,
            life: 120 + Math.random() * 100,
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          })
        }

        if (!running.current) {
          running.current = true
          raf.current = window.requestAnimationFrame(render)
        }
      },
      [render],
    )

    useImperativeHandle(ref, () => ({ burst }), [burst])

    useEffect(() => {
      resize()
      window.addEventListener('resize', resize)

      return () => {
        window.removeEventListener('resize', resize)
        window.cancelAnimationFrame(raf.current)
        particles.current = []
        running.current = false
      }
    }, [resize])

    return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
  },
)
