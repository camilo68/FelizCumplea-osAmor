/**
 * Geometría de la espiral.
 *
 * Las 23 emociones se reparten sobre una sola espiral logarítmica que nace
 * en el núcleo y se abre hacia el borde exterior. El lienzo de la galaxia usa
 * la misma fórmula para que las estrellas dibujadas y los botones coincidan.
 */

export const SPIRAL_START = -1.2
export const SPIRAL_TURNS = 1.82
export const SPIRAL_RADIUS_MIN = 0.145
export const SPIRAL_RADIUS_MAX = 0.435

export type SpiralPoint = {
  /** Coordenada horizontal normalizada, respecto al radio del escenario. */
  x: number
  /** Coordenada vertical normalizada, achatada para dar perspectiva. */
  y: number
  /** Ángulo en radianes. */
  angle: number
  /** Fracción del recorrido, de 0 (núcleo) a 1 (borde). */
  progress: number
}

/** Punto de la emoción `index` (0-based) dentro de un total de `total` paradas. */
export function spiralPoint(index: number, total: number): SpiralPoint {
  const progress = total <= 1 ? 0 : index / (total - 1)
  const radius =
    SPIRAL_RADIUS_MIN +
    (SPIRAL_RADIUS_MAX - SPIRAL_RADIUS_MIN) * Math.pow(progress, 0.94)
  const angle = SPIRAL_START + progress * SPIRAL_TURNS * Math.PI * 2

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle) * 0.84,
    angle,
    progress,
  }
}

/** Punto de una partícula de polvo, con radio y ángulo libres. */
export function spiralPosition(radius: number, angle: number) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle) * 0.84,
  }
}
