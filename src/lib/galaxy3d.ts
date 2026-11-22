/**
 * Proyección compartida de la galaxia 3D.
 *
 * El lienzo WebGL dibuja un disco galáctico inclinado y las estrellas-botón
 * del DOM se colocan con esta misma cámara, así que ambas capas coinciden
 * aunque el disco gire o se arrastre.
 */

import { SPIRAL_START, SPIRAL_TURNS } from './spiral'

export const TAU = Math.PI * 2

/** Radios (en fracción del ancho del escenario) de las 23 emociones. */
export const NODE_INNER_RADIUS = 0.145
export const NODE_OUTER_RADIUS = 0.435

/** Cámara orbital. */
export const CAMERA_DISTANCE = 2.7
export const CAMERA_FOV = 42
export const DEFAULT_YAW = 0.34
export const DEFAULT_ELEVATION = 0.66
export const MIN_ELEVATION = 0.14
export const MAX_ELEVATION = 1.34

export type GalaxyView = {
  /** Giro manual de la cámara, en radianes. */
  yaw: number
  /** Altura de la cámara sobre el plano del disco, en radianes. */
  elevation: number
  /** Giro lento del propio disco, en radianes. */
  spin: number
}

/** Estado mutable único: lo escribe el lienzo y lo lee el DOM. */
export const galaxyView: GalaxyView = {
  yaw: DEFAULT_YAW,
  elevation: DEFAULT_ELEVATION,
  spin: 0,
}

const FOCAL = 1 / Math.tan((CAMERA_FOV * Math.PI) / 360)

export type ProjectedPoint = {
  /** Coordenada horizontal, en fracción del escenario (0 = borde izquierdo). */
  x: number
  /** Coordenada vertical, en fracción del escenario (0 = borde superior). */
  y: number
  /** Distancia a la cámara; menor es más cerca. */
  depth: number
  /** Escala relativa al centro del disco. */
  scale: number
}

/** Proyecta un punto del espacio (disco en el plano XZ) a fracciones del escenario. */
export function projectGalaxyPoint(
  x: number,
  y: number,
  z: number,
  view: GalaxyView = galaxyView,
): ProjectedPoint {
  const ce = Math.cos(view.elevation)
  const se = Math.sin(view.elevation)
  const cy = Math.cos(view.yaw)
  const sy = Math.sin(view.yaw)

  // Eje centro → cámara.
  const ax = ce * sy
  const ay = se
  const az = ce * cy

  // right = normalize(cross(up, axis))
  const nrx = cy
  const nrz = -sy

  // up2 = cross(axis, right)
  const ux = ay * nrz
  const uy = az * nrx - ax * nrz
  const uz = -ay * nrx

  const depth = CAMERA_DISTANCE - (x * ax + y * ay + z * az)
  const scale = FOCAL / depth

  return {
    x: 0.5 + (x * nrx + z * nrz) * scale,
    y: 0.5 - (x * ux + y * uy + z * uz) * scale,
    depth,
    scale: scale / (FOCAL / CAMERA_DISTANCE),
  }
}

/** Radio de la espiral emocional para un progreso 0..1. */
export function spiralRadiusAt(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress))
  return (
    NODE_INNER_RADIUS +
    (NODE_OUTER_RADIUS - NODE_INNER_RADIUS) * Math.pow(clamped, 0.94)
  )
}

/** Ángulo de la espiral emocional para un progreso 0..1. */
export function spiralAngleAt(progress: number) {
  return SPIRAL_START + progress * SPIRAL_TURNS * TAU
}

export function discPoint(radius: number, angle: number, spin: number) {
  const a = angle - spin
  return {
    x: Math.cos(a) * radius,
    y: 0,
    z: Math.sin(a) * radius,
  }
}

/** Posición proyectada de la emoción `index` (0-based). */
export function projectEmotion(index: number, total: number): ProjectedPoint {
  const progress = total <= 1 ? 0 : index / (total - 1)
  const radius = spiralRadiusAt(progress)
  const angle = spiralAngleAt(progress)
  const point = discPoint(radius, angle, galaxyView.spin)

  return projectGalaxyPoint(point.x, point.y, point.z)
}

/** Estrella 24: un poco más allá del final de la espiral. */
export function projectBonusStar(): ProjectedPoint {
  const radius = 0.305
  const angle = SPIRAL_START + SPIRAL_TURNS * TAU + 0.42
  const point = discPoint(radius, angle, galaxyView.spin)

  return projectGalaxyPoint(point.x, point.y, point.z)
}
