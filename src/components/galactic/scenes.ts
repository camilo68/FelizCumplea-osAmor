/**
 * Las dos versiones del corazón galáctico.
 *
 * Los valores de cámara, colores y órbitas son los del diseño original.
 */

export type RGB = readonly [number, number, number]

export type SceneConfig = {
  readonly label: string
  readonly start: string
  readonly title: string
  readonly simple: boolean
  readonly phrases: readonly string[]
  readonly ring: number
  readonly photos: boolean
  readonly photoRing: number
  readonly arms: number
  readonly twist: number
  readonly stars: number
  readonly radius: number
  readonly spin: number
  readonly galaxy: readonly RGB[]
  readonly heart: readonly RGB[]
  readonly glow: RGB
  readonly letterTitle: string
}

export const SCENES = {
  galactic: {
    label: 'Corazón Galáctico',
    start: 'Toca para iniciar',
    title: 'TE AMO ❤️',
    simple: false,
    phrases: [
      'Eres mi universo',
      'Te amo hasta las estrellas',
      'Contigo todo brilla',
      'Mi corazón es tuyo',
      'Eres mi lugar favorito',
      'Nuestro amor es infinito',
      'Te elegiría en todas las galaxias',
      'Gracias por existir',
      'Eres mi razón de sonreír',
      'Siempre tú',
      'Mi estrella favorita',
      'Amarte es fácil',
    ],
    ring: 250,
    photos: false,
    photoRing: 0,
    arms: 3,
    twist: 5.2,
    stars: 2800,
    radius: 380,
    spin: 0.55,
    galaxy: [
      [255, 240, 225],
      [255, 150, 200],
      [190, 100, 255],
      [90, 80, 230],
    ],
    heart: [
      [200, 20, 70],
      [255, 70, 130],
      [255, 150, 190],
      [255, 225, 235],
    ],
    glow: [255, 60, 130],
    letterTitle: 'Para ti 💗',
  },
  simple: {
    label: 'Galaxia simple',
    start: 'Toca para entrar',
    title: 'Te Amo❤️',
    simple: true,
    phrases: [
      'Te amo',
      'Eres mi todo',
      'Mi persona favorita',
      'Contigo, siempre',
      'Mi hogar eres tú',
      'Gracias por ser tú',
      'Eres mi sueño favorito',
      'Te quiero más cada día',
    ],
    ring: 320,
    photos: true,
    photoRing: 215,
    arms: 2,
    twist: 4.2,
    stars: 2200,
    radius: 400,
    spin: 0.45,
    galaxy: [
      [255, 245, 215],
      [255, 190, 150],
      [150, 170, 255],
      [80, 110, 230],
    ],
    heart: [
      [210, 30, 60],
      [255, 80, 100],
      [255, 160, 170],
      [255, 230, 230],
    ],
    glow: [255, 90, 110],
    letterTitle: 'Para ti 💗',
  },
} as const satisfies Record<string, SceneConfig>

export type SceneId = keyof typeof SCENES

export const PHOTO_PLACEHOLDERS = [
  ['#ff7eb3', '#ff758c'],
  ['#a18cd1', '#fbc2eb'],
  ['#fad0c4', '#ff9a9e'],
  ['#89f7fe', '#66a6ff'],
  ['#fccb90', '#d57eeb'],
  ['#ffecd2', '#fcb69f'],
] as const
