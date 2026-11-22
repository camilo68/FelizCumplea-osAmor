/**
 * Música ambiental sintetizada, sin archivos.
 *
 * Es la misma progresión del diseño original: acordes lentos con un filtro
 * pasa-bajos y notas suaves que aparecen al azar.
 */

const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [130.81, 164.81, 196],
  [196, 246.94, 293.66],
]

export class AmbientSynth {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private timer: number | null = null
  private tick = 0
  private muted = false
  private volume = 0.16

  async start() {
    if (this.context) {
      if (this.context.state === 'suspended') await this.context.resume()
      return
    }

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!Ctor) return

    try {
      const context = new Ctor()
      const master = context.createGain()
      master.gain.value = this.muted ? 0 : this.volume

      const filter = context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1800

      master.connect(filter)
      filter.connect(context.destination)

      this.context = context
      this.master = master
      this.timer = window.setInterval(() => this.step(), 420)
      this.step()
    } catch {
      this.context = null
      this.master = null
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (!this.context || !this.master) return
    this.master.gain.setTargetAtTime(
      muted ? 0 : this.volume,
      this.context.currentTime,
      0.05,
    )
  }

  setVisibility(hidden: boolean) {
    if (!this.context) return
    if (hidden) {
      void this.context.suspend()
    } else {
      void this.context.resume()
    }
  }

  /** Campanita suave al abrir o cerrar un mensaje de la galaxia. */
  chime(kind: 'open' | 'close' = 'open') {
    if (!this.context || this.muted || this.context.state !== 'running') return

    const now = this.context.currentTime + 0.02
    const base = kind === 'open' ? 523.25 : 392

    this.note(base, now, 1.5, 0.11, 'triangle')
    this.note(base * 1.5, now + 0.09, 1.1, 0.07, 'sine')
    if (kind === 'open') this.note(base * 2, now + 0.18, 0.9, 0.045, 'sine')
  }

  dispose() {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    if (this.context) {
      void this.context.close()
      this.context = null
      this.master = null
    }
  }

  private note(
    frequency: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
  ) {
    const context = this.context
    const master = this.master
    if (!context || !master) return

    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(
      volume,
      start + Math.min(0.6, duration * 0.3),
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain)
    gain.connect(master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  private step() {
    const context = this.context
    if (!context || context.state !== 'running') return

    const time = context.currentTime + 0.05
    const chord = CHORDS[Math.floor(this.tick / 12) % CHORDS.length]

    if (this.tick % 12 === 0) {
      chord.forEach((frequency) => this.note(frequency, time, 5.6, 0.2))
      this.note(chord[0] / 2, time, 5.6, 0.25)
    }

    if (this.tick % 2 === 0 || Math.random() < 0.3) {
      const frequency = chord[Math.floor(Math.random() * 3)]
      const octave = Math.random() < 0.5 ? 4 : 2
      this.note(frequency * octave, time, 1.6, 0.1, 'triangle')
    }

    this.tick += 1
  }
}
