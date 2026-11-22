/**
 * Datos de la galaxia 3D.
 *
 * Genera nubes de puntos (brazos, disco, bulbo, halo, polvo y estrellas de
 * fondo) con atributos listos para el shader de `GalaxyScene`.
 */

import * as THREE from 'three'
import { TAU, spiralAngleAt, spiralRadiusAt } from '../lib/galaxy3d'

export const ARM_COUNT = 3

export type CloudData = {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  phases: Float32Array
  delays: Float32Array
  alphas: Float32Array
}

export type SceneQuality = 'mobile' | 'desktop'

export type GalaxyClouds = {
  arms: CloudData
  disc: CloudData
  bulge: CloudData
  halo: CloudData
  dust: CloudData
  knots: CloudData
  background: CloudData
}

const DISC_LIMIT = 0.455

const COLORS = {
  warmWhite: new THREE.Color('#fff4e2'),
  gold: new THREE.Color('#ffe0ac'),
  cream: new THREE.Color('#fff8ef'),
  ice: new THREE.Color('#dbe9ff'),
  blue: new THREE.Color('#a7c8ff'),
  paleBlue: new THREE.Color('#c8dcff'),
  rose: new THREE.Color('#ff9fb8'),
  hotPink: new THREE.Color('#ff7fa8'),
  lilac: new THREE.Color('#c3a8ff'),
  mint: new THREE.Color('#9cefdd'),
  dustRose: new THREE.Color('#8f4d78'),
  dustViolet: new THREE.Color('#6b4f9c'),
  deepBlue: new THREE.Color('#5f6fb8'),
}

const ARM_PALETTE = [
  { color: COLORS.ice, weight: 0.3 },
  { color: COLORS.warmWhite, weight: 0.28 },
  { color: COLORS.blue, weight: 0.2 },
  { color: COLORS.rose, weight: 0.12 },
  { color: COLORS.lilac, weight: 0.1 },
]

const CORE_PALETTE = [
  { color: COLORS.cream, weight: 0.32 },
  { color: COLORS.warmWhite, weight: 0.28 },
  { color: COLORS.gold, weight: 0.24 },
  { color: COLORS.rose, weight: 0.1 },
  { color: COLORS.lilac, weight: 0.06 },
]

const DUST_PALETTE = [
  { color: COLORS.dustRose, weight: 0.42 },
  { color: COLORS.dustViolet, weight: 0.34 },
  { color: COLORS.deepBlue, weight: 0.24 },
]

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function gaussian() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v)
}

function pick(palette: Array<{ color: THREE.Color; weight: number }>) {
  let roll = Math.random()
  for (const entry of palette) {
    roll -= entry.weight
    if (roll <= 0) return entry.color
  }
  return palette[palette.length - 1].color
}

class Builder {
  private positions: number[] = []
  private colors: number[] = []
  private sizes: number[] = []
  private phases: number[] = []
  private delays: number[] = []
  private alphas: number[] = []

  add(
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
    size: number,
    delay: number,
    alpha = 1,
  ) {
    this.positions.push(x, y, z)
    this.colors.push(color.r, color.g, color.b)
    this.sizes.push(size)
    this.phases.push(Math.random())
    this.delays.push(delay)
    this.alphas.push(alpha)
  }

  build(): CloudData {
    return {
      positions: new Float32Array(this.positions),
      colors: new Float32Array(this.colors),
      sizes: new Float32Array(this.sizes),
      phases: new Float32Array(this.phases),
      delays: new Float32Array(this.delays),
      alphas: new Float32Array(this.alphas),
    }
  }
}

function addArms(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const arm = index % ARM_COUNT
    const progress = Math.pow(Math.random(), 1.22)
    const radius = spiralRadiusAt(progress) * (1 + gaussian() * 0.018)
    const scatter = 0.2 - progress * 0.09 + Math.random() * 0.03
    const angle =
      spiralAngleAt(progress) + (arm * TAU) / ARM_COUNT + gaussian() * scatter
    const thickness = 0.0045 + 0.013 * Math.pow(1 - progress, 2.2)
    const glow = Math.random() < 0.04

    builder.add(
      Math.cos(angle) * radius,
      gaussian() * thickness,
      Math.sin(angle) * radius,
      pick(ARM_PALETTE),
      glow ? randomBetween(0.004, 0.0075) : randomBetween(0.0014, 0.0036),
      randomBetween(0, 0.55),
      glow ? 1 : randomBetween(0.55, 1),
    )
  }
}

function addDisc(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const radius = Math.pow(Math.random(), 0.82) * DISC_LIMIT
    const angle = Math.random() * TAU
    const thickness = 0.004 + 0.011 * Math.exp(-radius / 0.11)

    builder.add(
      Math.cos(angle) * radius,
      gaussian() * thickness,
      Math.sin(angle) * radius,
      pick(ARM_PALETTE),
      randomBetween(0.0012, 0.003),
      randomBetween(0.15, 0.9),
      randomBetween(0.25, 0.6),
    )
  }
}

function addBulge(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const tight = Math.random() < 0.34
    const sigma = tight ? 0.021 : 0.052
    const x = gaussian() * sigma
    const y = gaussian() * sigma * 0.52
    const z = gaussian() * sigma

    builder.add(
      x,
      y,
      z,
      pick(CORE_PALETTE),
      tight ? randomBetween(0.0018, 0.0036) : randomBetween(0.0014, 0.0042),
      randomBetween(0, 0.25),
      randomBetween(0.5, 0.95),
    )
  }
}

function addHalo(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const radius = 0.1 + Math.pow(Math.random(), 1.7) * 0.62
    const theta = Math.random() * TAU
    const phi = Math.acos(randomBetween(-1, 1))
    const flat = 0.72

    builder.add(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * flat,
      radius * Math.sin(phi) * Math.sin(theta),
      pick([
        { color: COLORS.gold, weight: 0.55 },
        { color: COLORS.ice, weight: 0.3 },
        { color: COLORS.rose, weight: 0.15 },
      ]),
      randomBetween(0.001, 0.0026),
      randomBetween(0.3, 1),
      randomBetween(0.18, 0.42),
    )
  }
}

function addDust(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const arm = index % ARM_COUNT
    const progress = Math.pow(Math.random(), 1.08)
    const radius = spiralRadiusAt(progress) * (1 - randomBetween(0.01, 0.05))
    const angle =
      spiralAngleAt(progress) +
      (arm * TAU) / ARM_COUNT +
      gaussian() * (0.13 - progress * 0.05)

    builder.add(
      Math.cos(angle) * radius,
      gaussian() * 0.012,
      Math.sin(angle) * radius,
      pick(DUST_PALETTE),
      randomBetween(0.028, 0.082),
      randomBetween(0, 0.7),
      randomBetween(0.055, 0.14),
    )
  }
}

function addKnots(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const arm = index % ARM_COUNT
    const progress = Math.pow(Math.random(), 0.9)
    const radius = spiralRadiusAt(progress) * randomBetween(0.97, 1.03)
    const angle =
      spiralAngleAt(progress) +
      (arm * TAU) / ARM_COUNT +
      gaussian() * (0.09 - progress * 0.04)

    builder.add(
      Math.cos(angle) * radius,
      gaussian() * 0.006,
      Math.sin(angle) * radius,
      pick([
        { color: COLORS.hotPink, weight: 0.5 },
        { color: COLORS.rose, weight: 0.3 },
        { color: COLORS.ice, weight: 0.2 },
      ]),
      randomBetween(0.005, 0.013),
      randomBetween(0.1, 0.65),
      0.9,
    )
  }
}

function addBackground(builder: Builder, count: number) {
  for (let index = 0; index < count; index += 1) {
    const radius = randomBetween(3.4, 9)
    const theta = Math.random() * TAU
    const phi = Math.acos(randomBetween(-1, 1))

    builder.add(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
      pick([
        { color: COLORS.cream, weight: 0.55 },
        { color: COLORS.ice, weight: 0.3 },
        { color: COLORS.rose, weight: 0.15 },
      ]),
      randomBetween(0.0025, 0.0065),
      Math.random(),
      randomBetween(0.12, 0.4),
    )
  }
}

export function buildGalaxyClouds(quality: SceneQuality): GalaxyClouds {
  const mobile = quality === 'mobile'

  const arms = new Builder()
  addArms(arms, mobile ? 17000 : 32000)

  const disc = new Builder()
  addDisc(disc, mobile ? 5000 : 10000)

  const bulge = new Builder()
  addBulge(bulge, mobile ? 5200 : 9800)

  const halo = new Builder()
  addHalo(halo, mobile ? 750 : 1400)

  const dust = new Builder()
  addDust(dust, mobile ? 90 : 150)

  const knots = new Builder()
  addKnots(knots, mobile ? 48 : 80)

  const background = new Builder()
  addBackground(background, mobile ? 900 : 1700)

  return {
    arms: arms.build(),
    disc: disc.build(),
    bulge: bulge.build(),
    halo: halo.build(),
    dust: dust.build(),
    knots: knots.build(),
    background: background.build(),
  }
}
