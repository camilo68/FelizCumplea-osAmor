import {
  PHOTO_PLACEHOLDERS,
  SCENES,
  type RGB,
  type SceneConfig,
  type SceneId,
} from './scenes'

const TAU = Math.PI * 2
const DEPTH = 620
const HEART_SCALE = 7

type Star = {
  x: number
  y: number
  r: number
  ph: number
  sp: number
}

type GalaxyParticle = {
  r: number
  a0: number
  y: number
  om: number
  sz: number
  b: number
}

type HeartParticle = {
  x: number
  y: number
  z: number
  sz: number
  ph: number
  b: number
}

type SceneData = {
  gal: GalaxyParticle[]
  gcol: string[]
  heart: HeartParticle[]
  hcol: string[]
  glowA: HTMLCanvasElement
  glowB: HTMLCanvasElement
}

type PhraseItem = {
  kind: 0
  text: string
  x: number
  y: number
  s: number
  z: number
  zr: number
}

type PhotoItem = {
  kind: 1
  index: number
  img: HTMLImageElement | null
  x: number
  y: number
  s: number
  z: number
  zr: number
}

type OrbitItem = PhraseItem | PhotoItem

type Floater = {
  x: number
  y: number
  vy: number
  t: number
  life: number
  ph: number
  sz: number
  emoji: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function gaussian() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t =
    lengthSquared === 0
      ? 0
      : clamp(((px - ax) * dx + (py - ay) * dy) / lengthSquared, 0, 1)
  const x = ax + t * dx
  const y = ay + t * dy

  return Math.hypot(px - x, py - y)
}

function palette(stops: readonly RGB[], progress: number): RGB {
  const last = stops.length - 1
  const scaled = clamp(progress * last, 0, last - 1e-6)
  const index = Math.floor(scaled)
  const fraction = scaled - index
  const from = stops[index]
  const to = stops[index + 1]

  return [
    lerp(from[0], to[0], fraction),
    lerp(from[1], to[1], fraction),
    lerp(from[2], to[2], fraction),
  ]
}

function glowSprite(color: RGB) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')

  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(
      0,
      `rgba(${color[0]},${color[1]},${color[2]},.9)`,
    )
    gradient.addColorStop(
      0.35,
      `rgba(${color[0]},${color[1]},${color[2]},.28)`,
    )
    gradient.addColorStop(
      1,
      `rgba(${color[0]},${color[1]},${color[2]},0)`,
    )
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }

  return canvas
}

function buildScene(config: SceneConfig): SceneData {
  const colorBuckets = 14
  const gcol: string[] = []

  for (let index = 0; index < colorBuckets; index += 1) {
    const color = palette(config.galaxy, index / (colorBuckets - 1))
    gcol.push(
      `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},.85)`,
    )
  }
  gcol.push('rgba(255,255,255,.9)')

  const gal: GalaxyParticle[] = []
  for (let index = 0; index < config.stars; index += 1) {
    const arm = index % config.arms
    const progress = Math.pow(Math.random(), 0.7)
    const radius = 15 + progress * config.radius
    const spread = 0.5 * (1 - progress) + 0.12
    const angle =
      (arm * TAU) / config.arms +
      progress * config.twist +
      gaussian() * spread

    gal.push({
      r: radius,
      a0: angle,
      y: gaussian() * 26 * (1 - progress * 0.7),
      om: config.spin / (1 + radius / 90),
      sz: 0.8 + Math.random() * 1.7 * (1 - progress * 0.4),
      b:
        Math.random() < 0.08
          ? colorBuckets
          : Math.min(colorBuckets - 1, Math.floor(progress * colorBuckets)),
    })
  }
  gal.sort((a, b) => a.b - b.b)

  const heartBuckets = 10
  const hcol: string[] = []
  for (let index = 0; index < heartBuckets; index += 1) {
    const color = palette(config.heart, index / (heartBuckets - 1))
    hcol.push(
      `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},.9)`,
    )
  }

  const heart: HeartParticle[] = []
  for (let index = 0; index < 1700; index += 1) {
    const angle = Math.random() * TAU
    const surface = Math.random() < 0.45
    const radius = surface ? 1 - Math.random() * 0.04 : Math.pow(Math.random(), 0.45)
    const hx = 16 * Math.pow(Math.sin(angle), 3)
    const hy =
      13 * Math.cos(angle) -
      5 * Math.cos(2 * angle) -
      2 * Math.cos(3 * angle) -
      Math.cos(4 * angle)

    heart.push({
      x: hx * radius,
      y: (hy + 2.5) * radius,
      z: gaussian() * 5.5 * (1.05 - radius * 0.5),
      sz: 1.6 + Math.random() * 2.2,
      ph: Math.random() * TAU,
      b: Math.min(
        heartBuckets - 1,
        Math.floor(Math.pow(Math.random(), 0.8) * heartBuckets),
      ),
    })
  }
  heart.sort((a, b) => a.b - b.b)

  return {
    gal,
    gcol,
    heart,
    hcol,
    glowA: glowSprite(config.glow),
    glowB: glowSprite(config.galaxy[2]),
  }
}

/**
 * Motor de dibujo del corazón galáctico.
 *
 * Todo el estado de la escena vive aquí; React solo monta el lienzo y
 * reacciona a los controles.
 */
export class GalaxyEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private dpr = 1
  private cx = 0
  private cy = 0
  private focal = 500
  private time = 0
  private last = 0
  private yaw = 0
  private pitch = 0.42
  private velocityYaw = 0
  private zoom = 1
  private dragging = false
  private moved = 0
  private lastX = 0
  private lastY = 0
  private scene: SceneConfig = SCENES.galactic
  private data: SceneData
  private cache: Partial<Record<SceneId, SceneData>> = {}
  private photos: HTMLImageElement[] = []
  private portrait: HTMLImageElement | null = null
  private floaters: Floater[] = []
  private stars: Star[] = []
  private items: OrbitItem[] = []
  private reduceMotion = false
  private compact = false
  private onArmSelect?: (arm: number) => void
  private raf = 0

  // Coordenadas reutilizadas por la proyección.
  private rotatedX = 0
  private rotatedY = 0
  private rotatedZ = 0
  private screenX = 0
  private screenY = 0
  private screenScale = 0

  constructor(
    canvas: HTMLCanvasElement,
    onArmSelect?: (arm: number) => void,
  ) {
    this.canvas = canvas
    this.onArmSelect = onArmSelect
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D no disponible')

    this.ctx = context
    this.reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    this.data = buildScene(SCENES.galactic)
    this.cache.galactic = this.data
    this.resize()
    this.setScene('galactic')

    window.addEventListener('resize', this.resize)
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
  }

  start() {
    this.last = 0
    this.raf = window.requestAnimationFrame(this.animate)
  }

  setScene(id: SceneId) {
    this.scene = SCENES[id]
    const cached = this.cache[id]
    if (cached) {
      this.data = cached
    } else {
      const built = buildScene(SCENES[id])
      this.cache[id] = built
      this.data = built
    }
  }

  addPhoto(image: HTMLImageElement) {
    this.photos.push(image)
  }

  /** La foto del rostro vive en el centro del corazón. */
  setPortrait(image: HTMLImageElement | null) {
    this.portrait = image
  }

  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel)
    this.canvas.removeEventListener('wheel', this.onWheel)
  }

  private resize = () => {
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.cx = this.width / 2
    this.cy = this.height * 0.53
    this.focal = Math.min(this.width, this.height) * 1.15
    this.compact = Math.min(this.width, this.height) < 700

    const count = Math.round((this.width * this.height) / 5500)
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      ph: Math.random() * TAU,
      sp: 0.6 + Math.random() * 1.8,
    }))
  }

  private rotate(x: number, y: number, z: number) {
    const cosYaw = Math.cos(this.yaw)
    const sinYaw = Math.sin(this.yaw)
    const cosPitch = Math.cos(this.pitch)
    const sinPitch = Math.sin(this.pitch)

    const x1 = x * cosYaw + z * sinYaw
    const z1 = -x * sinYaw + z * cosYaw

    this.rotatedX = x1
    this.rotatedY = y * cosPitch + z1 * sinPitch
    this.rotatedZ = z1 * cosPitch - y * sinPitch
  }

  private project() {
    const denominator = DEPTH + this.rotatedZ
    if (denominator < 60) {
      this.screenScale = 0
      return false
    }

    this.screenScale = (this.focal * this.zoom) / denominator
    this.screenX = this.cx + this.rotatedX * this.screenScale
    this.screenY = this.cy - this.rotatedY * this.screenScale
    return true
  }

  /**
   * Devuelve el brazo espiral más cercano al punto, o null.
   * Solo aplica al Corazón Galáctico; en la versión simple no hay asides.
   */
  private hitTestArm(clientX: number, clientY: number): number | null {
    if (this.scene.simple) return null

    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const centerDistance = Math.hypot(x - this.cx, y - this.cy)
    if (centerDistance < Math.min(200, Math.min(this.width, this.height) * 0.2)) {
      return null
    }

    const threshold = this.compact ? 26 : 36
    let closestArm: number | null = null
    let closestDistance = threshold

    for (let arm = 0; arm < this.scene.arms; arm += 1) {
      let previousX = 0
      let previousY = 0
      let hasPrevious = false

      for (let step = 0; step <= 48; step += 1) {
        const progress = step / 48
        const radius = 15 + progress * this.scene.radius
        const angle =
          (arm * TAU) / this.scene.arms +
          progress * this.scene.twist +
          this.time * (this.scene.spin / (1 + radius / 90))

        this.rotate(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        )

        if (!this.project() || this.screenScale <= 0) {
          hasPrevious = false
          continue
        }

        if (hasPrevious) {
          const distance = distanceToSegment(
            x,
            y,
            previousX,
            previousY,
            this.screenX,
            this.screenY,
          )
          if (distance < closestDistance) {
            closestDistance = distance
            closestArm = arm
          }
        }

        previousX = this.screenX
        previousY = this.screenY
        hasPrevious = true
      }
    }

    return closestArm
  }

  private onPointerDown = (event: PointerEvent) => {
    this.dragging = true
    this.moved = 0
    this.lastX = event.clientX
    this.lastY = event.clientY
    this.velocityYaw = 0
    this.canvas.classList.add('is-dragging')
    try {
      this.canvas.setPointerCapture(event.pointerId)
    } catch {
      // La captura es opcional.
    }
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.dragging) {
      if (event.pointerType === 'mouse') {
        const arm = this.hitTestArm(event.clientX, event.clientY)
        this.canvas.classList.toggle('is-over-arm', arm !== null)
      }
      return
    }

    const deltaX = event.clientX - this.lastX
    const deltaY = event.clientY - this.lastY
    this.lastX = event.clientX
    this.lastY = event.clientY
    this.moved += Math.abs(deltaX) + Math.abs(deltaY)

    this.yaw += deltaX * 0.006
    this.velocityYaw = deltaX * 0.006
    this.pitch = clamp(this.pitch + deltaY * 0.004, -0.25, 1.15)
  }

  private onPointerUp = (event: PointerEvent) => {
    if (!this.dragging) return
    this.dragging = false
    this.canvas.classList.remove('is-dragging')

    if (this.moved < 8) {
      const arm = this.hitTestArm(event.clientX, event.clientY)
      if (arm !== null) this.onArmSelect?.(arm)
      this.burst(event.clientX, event.clientY)
    }
  }

  private onPointerCancel = () => {
    this.dragging = false
    this.canvas.classList.remove('is-dragging')
  }

  private onWheel = (event: WheelEvent) => {
    event.preventDefault()
    this.zoom = clamp(
      this.zoom * (event.deltaY > 0 ? 0.93 : 1.07),
      0.6,
      1.7,
    )
  }

  private burst(x: number, y: number) {
    const emojis = ['❤️', '💗', '💖', '💕', '✨']

    for (let index = 0; index < 9; index += 1) {
      this.floaters.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vy: 60 + Math.random() * 90,
        t: 0,
        life: 1.4 + Math.random() * 1.2,
        ph: Math.random() * TAU,
        sz: 16 + Math.random() * 18,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
  }

  /** Celebración grande: cumpleaños, 23:23 o el nombre secreto. */
  celebrate(count = 48) {
    const emojis = ['❤️', '💗', '💖', '💕', '💘', '✨']

    for (let index = 0; index < count; index += 1) {
      this.floaters.push({
        x: this.cx + (Math.random() - 0.5) * this.width * 0.82,
        y:
          this.cy +
          this.height * 0.22 +
          Math.random() * this.height * 0.16,
        vy: 55 + Math.random() * 140,
        t: 0,
        life: 2.4 + Math.random() * 2.4,
        ph: Math.random() * TAU,
        sz: 18 + Math.random() * 26,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      })
    }
  }

  private drawPhrase(item: PhraseItem, alpha: number) {
    const base = this.compact ? 13 : 17
    const size = clamp(base * item.s, this.compact ? 9 : 10, 28)
    const ctx = this.ctx
    const maxWidth = this.compact ? 100 : 620
    const lines: string[] = []

    if (this.compact) {
      const words = item.text.split(' ')
      let line = ''
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line)
          line = word
        } else {
          line = candidate
        }
      }
      if (line) lines.push(line)
    } else {
      lines.push(item.text)
    }

    const lineHeight = size * 1.08
    const startY = item.y - ((lines.length - 1) * lineHeight) / 2

    ctx.globalAlpha = alpha
    ctx.font = `600 ${size}px ui-rounded,"Segoe UI",system-ui,sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(2.4, size * 0.18)
    ctx.strokeStyle = 'rgba(10,3,22,.55)'
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(255,90,160,.9)'
    ctx.shadowBlur = 10

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight
      ctx.strokeText(line, item.x, lineY)
      ctx.fillText(line, item.x, lineY)
    })

    ctx.shadowBlur = 0
  }

  private roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    const ctx = this.ctx
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()
  }

  private drawCard(item: PhotoItem, alpha: number) {
    const ctx = this.ctx
    const scale = item.s
    const width = clamp(78 * scale, 36, 120)
    const height = width * 1.28

    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.rotate(Math.sin(this.time * 0.8 + item.index * 1.7) * 0.07)
    ctx.globalAlpha = alpha
    ctx.shadowColor = 'rgba(255,100,170,.7)'
    ctx.shadowBlur = 16
    this.roundedRect(-width / 2, -height / 2, width, height, width * 0.07)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.shadowBlur = 0

    const pad = width * 0.06
    const innerWidth = width - pad * 2
    const innerHeight = height - pad * 2 - width * 0.16
    const innerX = -width / 2 + pad
    const innerY = -height / 2 + pad

    ctx.save()
    this.roundedRect(
      innerX,
      innerY,
      innerWidth,
      innerHeight,
      width * 0.04,
    )
    ctx.clip()

    if (item.img) {
      const ratio = Math.max(
        innerWidth / item.img.width,
        innerHeight / item.img.height,
      )
      const drawWidth = item.img.width * ratio
      const drawHeight = item.img.height * ratio
      ctx.drawImage(
        item.img,
        innerX + (innerWidth - drawWidth) / 2,
        innerY + (innerHeight - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )
    } else {
      const placeholder =
        PHOTO_PLACEHOLDERS[item.index % PHOTO_PLACEHOLDERS.length]
      const gradient = ctx.createLinearGradient(
        innerX,
        innerY,
        innerX + innerWidth,
        innerY + innerHeight,
      )
      gradient.addColorStop(0, placeholder[0])
      gradient.addColorStop(1, placeholder[1])
      ctx.fillStyle = gradient
      ctx.fillRect(innerX, innerY, innerWidth, innerHeight)
      ctx.font = `${width * 0.34}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(
        '📷',
        innerX + innerWidth / 2,
        innerY + innerHeight / 2,
      )
    }
    ctx.restore()

    if (!item.img) {
      ctx.fillStyle = '#d4558a'
      ctx.font = `600 ${width * 0.1}px ui-rounded,system-ui,sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('tu foto', 0, height / 2 - width * 0.09)
    }

    ctx.restore()
  }

  private drawPortrait(beat: number) {
    const image = this.portrait
    if (!image) return

    const ctx = this.ctx
    const radius =
      clamp(Math.min(this.width, this.height) * 0.072, 40, 70) * beat
    const centerX = this.cx
    const centerY = this.cy - clamp(Math.min(this.width, this.height) * 0.012, 4, 14)

    ctx.save()
    ctx.globalCompositeOperation = 'source-over'

    const glow = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.55,
      centerX,
      centerY,
      radius * 1.8,
    )
    glow.addColorStop(0, 'rgba(255,160,195,.34)')
    glow.addColorStop(0.55, 'rgba(255,143,168,.14)')
    glow.addColorStop(1, 'rgba(255,143,168,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 1.8, 0, TAU)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, TAU)
    ctx.clip()

    const scale = Math.max(
      (radius * 2) / image.width,
      (radius * 2) / image.height,
    )
    const width = image.width * scale
    const height = image.height * scale
    ctx.drawImage(
      image,
      centerX - width / 2,
      centerY - height / 2 - radius * 0.08,
      width,
      height,
    )
    ctx.restore()

    ctx.save()
    ctx.lineWidth = Math.max(2, radius * 0.055)
    ctx.strokeStyle = 'rgba(255, 226, 176, .92)'
    ctx.shadowColor = 'rgba(255, 190, 120, .85)'
    ctx.shadowBlur = radius * 0.4
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  private drawItem(item: OrbitItem) {
    const depth = clamp((item.z + item.zr) / (2 * item.zr), 0, 1)
    const alpha = 1 - 0.65 * depth

    if (item.kind === 0) this.drawPhrase(item, alpha)
    else this.drawCard(item, alpha)

    this.ctx.globalAlpha = 1
  }

  private animate = (timestamp: number) => {
    this.raf = window.requestAnimationFrame(this.animate)

    const now = timestamp / 1000
    const delta = Math.min(0.05, now - (this.last || now))
    this.last = now
    this.time += delta

    if (document.hidden) return

    if (!this.dragging && !this.reduceMotion) {
      this.yaw += delta * 0.07 + this.velocityYaw
      this.velocityYaw *= 0.95
    }

    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)

    // Estrellas de fondo.
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#fff'
    for (const star of this.stars) {
      ctx.globalAlpha =
        0.25 + 0.6 * (0.5 + 0.5 * Math.sin(this.time * star.sp + star.ph))
      ctx.fillRect(star.x * this.width, star.y * this.height, star.r, star.r)
    }
    ctx.globalAlpha = 1

    // Brillo del núcleo.
    ctx.globalCompositeOperation = 'lighter'
    this.rotate(0, 0, 0)
    if (this.project()) {
      const size = 560 * this.screenScale
      ctx.globalAlpha = 0.4
      ctx.drawImage(
        this.data.glowB,
        this.screenX - size / 2,
        this.screenY - size / 2,
        size,
        size,
      )
      ctx.globalAlpha = 1
    }

    // Galaxia.
    let lastBucket = -1
    for (const particle of this.data.gal) {
      const angle = particle.a0 + this.time * particle.om
      this.rotate(
        Math.cos(angle) * particle.r,
        particle.y,
        Math.sin(angle) * particle.r,
      )
      if (!this.project()) continue

      if (particle.b !== lastBucket) {
        ctx.fillStyle = this.data.gcol[particle.b]
        lastBucket = particle.b
      }

      const size = particle.sz * this.screenScale * 1.1
      ctx.fillRect(
        this.screenX - size / 2,
        this.screenY - size / 2,
        size,
        size,
      )
    }

    // Frases y fotos en órbita.
    this.items.length = 0
    const orbitScale = this.compact ? 0.74 : 1
    const phrases = this.compact
      ? (this.scene.phrases.length > 8
          ? this.scene.phrases.filter((_, index) => index % 2 === 0)
          : this.scene.phrases
        ).slice(0, 5)
      : this.scene.phrases
    const phraseCount = phrases.length
    for (let index = 0; index < phraseCount; index += 1) {
      const angle =
        (index / phraseCount) * TAU +
        this.time * (this.reduceMotion ? 0 : 0.16)
      const radius = this.scene.ring * orbitScale
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const lane = ((index % 3) - 1) * (this.compact ? 46 : 56)
      const y =
        lane +
        Math.sin(angle * 3 + index) * (this.compact ? 24 : 22) +
        x * 0.1

      this.rotate(x, y, z)
      if (this.project() && this.screenScale > 0) {
        this.items.push({
          kind: 0,
          text: phrases[index],
          x: this.screenX,
          y: this.screenY,
          s: this.screenScale,
          z: this.rotatedZ,
          zr: radius + 50,
        })
      }
    }

    if (this.scene.photos) {
      const photoCount = Math.max(6, this.photos.length)
      const radius = this.scene.photoRing * orbitScale

      for (let index = 0; index < photoCount; index += 1) {
        const angle =
          -(index / photoCount) * TAU +
          this.time * (this.reduceMotion ? 0 : 0.12)
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(angle * 2) * 18 - x * 0.06

        this.rotate(x, y, z)
        if (this.project() && this.screenScale > 0) {
          this.items.push({
            kind: 1,
            index,
            img:
              this.photos.length > 0
                ? this.photos[index % this.photos.length]
                : null,
            x: this.screenX,
            y: this.screenY,
            s: this.screenScale,
            z: this.rotatedZ,
            zr: radius + 50,
          })
        }
      }
    }

    this.items.sort((a, b) => b.z - a.z)
    ctx.globalCompositeOperation = 'source-over'
    for (const item of this.items) {
      if (item.z >= 0) this.drawItem(item)
    }

    // Corazón latiendo.
    const beatPhase =
      this.reduceMotion ? 0 : (this.time * 1.15) % 1
    const beat =
      1 +
      0.1 * Math.exp(-beatPhase * 6) +
      0.05 * Math.exp(-Math.abs(beatPhase - 0.3) * 16)
    const heartYaw = this.reduceMotion ? 0 : Math.sin(this.time * 0.55) * 0.55
    const cosHeart = Math.cos(heartYaw)
    const sinHeart = Math.sin(heartYaw)

    ctx.globalCompositeOperation = 'lighter'
    this.rotate(0, 0, 0)
    if (this.project()) {
      const size = 330 * this.screenScale * beat
      ctx.globalAlpha = 0.55
      ctx.drawImage(
        this.data.glowA,
        this.screenX - size / 2,
        this.screenY - size / 2,
        size,
        size,
      )
      ctx.globalAlpha = 1
    }

    lastBucket = -1
    for (const particle of this.data.heart) {
      const x =
        (particle.x + (this.reduceMotion ? 0 : Math.sin(this.time * 2.1 + particle.ph) * 0.5)) *
        HEART_SCALE *
        beat
      const y =
        (particle.y + (this.reduceMotion ? 0 : Math.cos(this.time * 1.7 + particle.ph) * 0.5)) *
        HEART_SCALE *
        beat
      const z = particle.z * HEART_SCALE * beat

      this.rotate(
        x * cosHeart + z * sinHeart,
        y,
        -x * sinHeart + z * cosHeart,
      )
      if (!this.project()) continue

      if (particle.b !== lastBucket) {
        ctx.fillStyle = this.data.hcol[particle.b]
        lastBucket = particle.b
      }

      const size = particle.sz * this.screenScale
      ctx.fillRect(
        this.screenX - size / 2,
        this.screenY - size / 2,
        size,
        size,
      )
    }

    if (this.portrait) this.drawPortrait(beat)

    ctx.globalCompositeOperation = 'source-over'
    for (const item of this.items) {
      if (item.z < 0) this.drawItem(item)
    }

    // Corazoncitos al tocar.
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let index = this.floaters.length - 1; index >= 0; index -= 1) {
      const floater = this.floaters[index]
      floater.t += delta
      floater.y -= floater.vy * delta
      floater.x += Math.sin(floater.t * 3 + floater.ph) * 0.4

      const alpha = 1 - floater.t / floater.life
      if (alpha <= 0) {
        this.floaters.splice(index, 1)
        continue
      }

      ctx.globalAlpha = alpha
      ctx.font = `${floater.sz}px serif`
      ctx.fillText(floater.emoji, floater.x, floater.y)
    }
    ctx.globalAlpha = 1
  }
}
