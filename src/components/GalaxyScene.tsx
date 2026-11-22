import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import {
  ARM_COUNT,
  buildGalaxyClouds,
  type CloudData,
  type SceneQuality,
} from './galaxyClouds'
import {
  CAMERA_DISTANCE,
  CAMERA_FOV,
  MAX_ELEVATION,
  MIN_ELEVATION,
  TAU,
  galaxyView,
  spiralAngleAt,
  spiralRadiusAt,
} from '../lib/galaxy3d'

type GalaxySceneProps = {
  born: boolean
  bornAt: number | null
}

const STAR_VERTEX = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aDelay;
  attribute float aAlpha;

  uniform float uTime;
  uniform float uBirth;
  uniform float uSizeScale;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float appear = smoothstep(aDelay, min(1.0, aDelay + 0.45), uBirth);
    float grow = mix(0.1, 1.0, smoothstep(aDelay, min(1.0, aDelay + 0.7), uBirth));

    vec3 transformed = position * grow;
    transformed.y += sin(uTime * 0.32 + aPhase * 6.28318) * 0.0007;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float twinkle = 0.76 + 0.24 * sin(uTime * (0.55 + aPhase * 0.8) + aPhase * 6.28318);
    gl_PointSize = max(
      1.0,
      aSize * uSizeScale * (0.82 + 0.34 * twinkle) / max(0.22, -mvPosition.z)
    );

    vColor = aColor;
    vAlpha = appear * uOpacity * aAlpha * (0.7 + 0.3 * twinkle);
  }
`

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float d2 = dot(offset, offset) * 4.0;
    if (d2 > 1.0) discard;

    float core = exp(-d2 * 7.5);
    float halo = exp(-d2 * 2.2) * 0.55;
    float alpha = (core + halo) * vAlpha;

    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`

function createStarMaterial(opacity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBirth: { value: 0 },
      uSizeScale: { value: 900 },
      uOpacity: { value: opacity },
    },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
}

function createPoints(data: CloudData, material: THREE.ShaderMaterial) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(data.colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(data.phases, 1))
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(data.delays, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(data.alphas, 1))

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return points
}

function makeGlowTexture(
  stops: Array<[number, string]>,
  size = 256,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const half = size / 2
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
    for (const [offset, color] of stops) gradient.addColorStop(offset, color)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

type FadingMaterial = {
  material: THREE.Material & { opacity: number }
  baseOpacity: number
}

function createArmGlow(arm: number, color: string) {
  const curvePoints: THREE.Vector3[] = []
  const offset = (arm * TAU) / ARM_COUNT

  for (let step = 0; step <= 160; step += 1) {
    const progress = step / 160
    const radius = spiralRadiusAt(progress)
    const angle = spiralAngleAt(progress) + offset
    curvePoints.push(
      new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
    )
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints)
  const geometry = new THREE.TubeGeometry(curve, 180, 0.0032, 5, false)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })

  return new THREE.Mesh(geometry, material)
}

const CORE_STOPS: Array<[number, string]> = [
  [0, 'rgba(255, 253, 245, 1)'],
  [0.12, 'rgba(255, 242, 210, 0.92)'],
  [0.3, 'rgba(255, 203, 176, 0.5)'],
  [0.55, 'rgba(214, 160, 235, 0.2)'],
  [0.78, 'rgba(130, 110, 220, 0.06)'],
  [1, 'rgba(60, 50, 140, 0)'],
]

const DISC_STOPS: Array<[number, string]> = [
  [0, 'rgba(255, 236, 214, 0.78)'],
  [0.24, 'rgba(255, 188, 190, 0.34)'],
  [0.52, 'rgba(196, 150, 232, 0.13)'],
  [0.8, 'rgba(120, 110, 220, 0.04)'],
  [1, 'rgba(40, 30, 100, 0)'],
]

/** Escena WebGL: una galaxia espiral inclinada que nace al tocar el corazón. */
export function GalaxyScene({ born, bornAt }: GalaxySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bornRef = useRef(born)
  const bornAtRef = useRef(bornAt)

  useEffect(() => {
    bornRef.current = born
    bornAtRef.current = bornAt
  }, [born, bornAt])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const quality: SceneQuality =
      window.matchMedia('(max-width: 720px)').matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900)
        ? 'mobile'
        : 'desktop'

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.06, 60)
    const galaxy = new THREE.Group()
    const backdrop = new THREE.Group()
    scene.add(galaxy)
    scene.add(backdrop)

    const clouds = buildGalaxyClouds(quality)
    const starMaterial = createStarMaterial(1)
    const backgroundMaterial = createStarMaterial(0.5)
    backgroundMaterial.uniforms.uBirth.value = 1

    galaxy.add(createPoints(clouds.arms, starMaterial))
    galaxy.add(createPoints(clouds.disc, starMaterial))
    galaxy.add(createPoints(clouds.bulge, starMaterial))
    galaxy.add(createPoints(clouds.halo, starMaterial))
    galaxy.add(createPoints(clouds.dust, starMaterial))
    galaxy.add(createPoints(clouds.knots, starMaterial))
    backdrop.add(createPoints(clouds.background, backgroundMaterial))

    const coreTexture = makeGlowTexture(CORE_STOPS)
    const discTexture = makeGlowTexture(DISC_STOPS)

    const fadingMaterials: FadingMaterial[] = []

    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    )
    coreGlow.scale.setScalar(0.78)
    galaxy.add(coreGlow)

    const coreHeart = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreTexture,
        color: 0xffd9e2,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    )
    coreHeart.scale.setScalar(0.36)
    galaxy.add(coreHeart)

    const discGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.05, 1.05),
      new THREE.MeshBasicMaterial({
        map: discTexture,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    )
    discGlow.rotation.x = -Math.PI / 2
    discGlow.position.y = -0.004
    galaxy.add(discGlow)

    const armGlowColors = ['#ffa9c0', '#c9aeff', '#a4f2e4']
    for (let arm = 0; arm < ARM_COUNT; arm += 1) {
      const glow = createArmGlow(arm, armGlowColors[arm % armGlowColors.length])
      galaxy.add(glow)
      fadingMaterials.push({ material: glow.material, baseOpacity: 0.3 })
    }
    fadingMaterials.push({ material: coreGlow.material, baseOpacity: 0.9 })
    fadingMaterials.push({ material: coreHeart.material, baseOpacity: 0.75 })
    fadingMaterials.push({ material: discGlow.material, baseOpacity: 0.62 })

    const wave = new THREE.Mesh(
      new THREE.RingGeometry(0.96, 1, 180),
      new THREE.MeshBasicMaterial({
        color: 0xffd8e2,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    )
    wave.rotation.x = -Math.PI / 2
    wave.position.y = 0.001
    galaxy.add(wave)

    const flash = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreTexture,
        color: 0xfff2f6,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    )
    flash.scale.setScalar(0.1)
    galaxy.add(flash)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      quality === 'mobile' ? 0.82 : 0.95,
      0.72,
      0.12,
    )
    composer.addPass(bloomPass)

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      quality === 'mobile' ? 1.5 : 1.75,
    )
    renderer.setPixelRatio(pixelRatio)

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth)
      const height = Math.max(1, canvas.clientHeight)
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      const sizeScale =
        renderer.domElement.height /
        (2 * Math.tan((CAMERA_FOV * Math.PI) / 360))
      starMaterial.uniforms.uSizeScale.value = sizeScale
      backgroundMaterial.uniforms.uSizeScale.value = sizeScale
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    let frame = 0
    let elapsed = 0
    let last = performance.now()
    let visible = true
    let dragging = false
    let lastX = 0
    let lastY = 0

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
      },
      { rootMargin: '140px' },
    )
    visibilityObserver.observe(canvas)

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.classList.add('is-dragging')
      try {
        canvas.setPointerCapture(event.pointerId)
      } catch {
        // Sin captura el arrastre sigue funcionando dentro del lienzo.
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const deltaX = event.clientX - lastX
      const deltaY = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY

      galaxyView.yaw += deltaX * 0.0052
      galaxyView.elevation = Math.min(
        MAX_ELEVATION,
        Math.max(MIN_ELEVATION, galaxyView.elevation + deltaY * 0.0042),
      )
    }

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      canvas.classList.remove('is-dragging')
      try {
        canvas.releasePointerCapture(event.pointerId)
      } catch {
        // La captura puede haberse liberado antes.
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)

    const animate = () => {
      frame = window.requestAnimationFrame(animate)

      const now = performance.now()
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now

      if (document.hidden || !visible) return

      elapsed += delta

      if (!reducedMotion) {
        galaxyView.spin = Math.sin(elapsed * 0.055) * 0.085
      } else {
        galaxyView.spin = 0
      }
      galaxy.rotation.y = galaxyView.spin

      const elevation = galaxyView.elevation
      const yaw = galaxyView.yaw
      const radius = CAMERA_DISTANCE
      camera.position.set(
        radius * Math.cos(elevation) * Math.sin(yaw),
        radius * Math.sin(elevation),
        radius * Math.cos(elevation) * Math.cos(yaw),
      )
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()

      const sinceBirth =
        bornRef.current && bornAtRef.current !== null
          ? Math.max(0, Date.now() - bornAtRef.current)
          : 0
      const rawBirth = bornRef.current
        ? Math.min(1, sinceBirth / 2400)
        : 0
      const birth = reducedMotion ? rawBirth : 1 - Math.pow(1 - rawBirth, 2.4)

      starMaterial.uniforms.uTime.value = elapsed
      starMaterial.uniforms.uBirth.value = birth
      backgroundMaterial.uniforms.uTime.value = elapsed

      for (const entry of fadingMaterials) {
        entry.material.opacity = entry.baseOpacity * birth
      }

      const breathe = 0.9 + 0.1 * Math.sin(elapsed * 1.1)
      coreGlow.material.opacity = 0.9 * birth * breathe
      coreHeart.material.opacity = 0.75 * birth * (1.05 - breathe * 0.35)
      coreGlow.scale.setScalar(0.72 + 0.08 * Math.sin(elapsed * 0.8))
      coreHeart.scale.setScalar(0.33 + 0.035 * Math.sin(elapsed * 1.35 + 1))

      if (rawBirth > 0 && rawBirth < 1 && !reducedMotion) {
        const eased = 1 - Math.pow(1 - rawBirth, 3)
        wave.scale.setScalar(0.04 + eased * 0.72)
        wave.material.opacity = Math.pow(1 - rawBirth, 2) * 0.6
        flash.scale.setScalar(0.12 + eased * 0.95)
        flash.material.opacity = Math.pow(1 - rawBirth, 2.2) * 0.9
      } else {
        wave.material.opacity = 0
        flash.material.opacity = 0
      }

      composer.render()
    }

    frame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.classList.remove('is-dragging')

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const material = (object as THREE.Mesh).material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else if (material) {
          material.dispose()
        }
      })

      coreTexture.dispose()
      discTexture.dispose()
      composer.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="galaxy__canvas" aria-hidden="true" />
}
