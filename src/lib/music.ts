/**
 * Motor de música ambiental.
 *
 * Si hay una canción configurada en `gift.music.src`, la reproduce en bucle.
 * Si no, genera una melodía suave con la Web Audio API para que el regalo
 * tenga música sin depender de archivos externos.
 */

type AmbientMusicOptions = {
  src?: string
  volume?: number
}

const MIDI_A4 = 440

const CHORDS = [
  // Fmaj9
  { notes: [174.61, 220, 261.63, 329.63, 392], bass: 87.31 },
  // Cmaj9
  { notes: [130.81, 196, 261.63, 329.63, 392], bass: 65.41 },
  // Dm9
  { notes: [146.83, 220, 261.63, 349.23, 440], bass: 73.42 },
  // Bbmaj7
  { notes: [116.54, 174.61, 233.08, 293.66, 349.23], bass: 58.27 },
]

// Escala pentatónica de Fa mayor: siempre suena bien sobre los acordes.
const MELODY = [349.23, 392, 440, 523.25, 587.33, 698.46, 783.99, 880]

export class AmbientMusic {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private wet: GainNode | null = null
  private audio: HTMLAudioElement | null = null
  private chordTimer: number | null = null
  private melodyTimer: number | null = null
  private nextChordTime = 0
  private chordIndex = 0
  private started = false
  private readonly src: string
  private readonly volume: number

  constructor({ src = '', volume = 0.3 }: AmbientMusicOptions = {}) {
    this.src = src
    this.volume = Math.min(Math.max(volume, 0), 1)
  }

  async start() {
    if (this.started) {
      if (this.ctx?.state === 'suspended') await this.ctx.resume()
      return
    }
    this.started = true

    if (this.src) {
      this.startAudioFile()
      return
    }

    const ctx = new AudioContext()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.master = master

    const convolver = ctx.createConvolver()
    convolver.buffer = this.createImpulse(ctx, 3.4, 2.6)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    wet.connect(convolver)
    convolver.connect(master)
    this.wet = wet

    this.startCrackle(ctx, master)

    await ctx.resume()
    master.gain.setTargetAtTime(this.volume, ctx.currentTime, 1.6)

    this.chordIndex = 0
    this.nextChordTime = ctx.currentTime + 0.2
    this.scheduleChords()
    this.chordTimer = window.setInterval(() => this.scheduleChords(), 250)

    this.playMelodyNote()
    this.melodyTimer = window.setInterval(() => this.playMelodyNote(), 1250)
  }

  stop() {
    if (!this.started) return
    this.started = false

    if (this.audio) {
      const audio = this.audio
      this.audio = null
      const fade = window.setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume = Math.max(0, audio.volume - 0.03)
        } else {
          audio.pause()
          window.clearInterval(fade)
        }
      }, 60)
    }

    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer)
      this.chordTimer = null
    }
    if (this.melodyTimer !== null) {
      window.clearInterval(this.melodyTimer)
      this.melodyTimer = null
    }

    const ctx = this.ctx
    const master = this.master
    this.ctx = null
    this.master = null
    this.wet = null

    if (ctx && master) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
      window.setTimeout(() => {
        void ctx.close().catch(() => undefined)
      }, 1400)
    }
  }

  private startAudioFile() {
    const audio = new Audio(this.src)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    this.audio = audio
    void audio.play().catch(() => undefined)
    const target = this.volume
    const fade = window.setInterval(() => {
      if (audio.volume < target - 0.01) {
        audio.volume = Math.min(target, audio.volume + 0.02)
      } else {
        window.clearInterval(fade)
      }
    }, 80)
  }

  /** Hiss + pops de vinilo para que el disco suene gastado, no digital. */
  private startCrackle(ctx: AudioContext, master: GainNode) {
    const seconds = 2
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.05
    }

    for (let pop = 0; pop < 34; pop += 1) {
      const at = Math.floor(Math.random() * (length - 80))
      const amplitude = 0.25 + Math.random() * 0.55
      for (let i = 0; i < 40; i += 1) {
        data[at + i] += (Math.random() * 2 - 1) * amplitude * (1 - i / 40)
      }
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 900

    const gain = ctx.createGain()
    gain.gain.value = 0.035

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start()
  }

  private scheduleChords() {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.wet) return

    const horizon = ctx.currentTime + 1.2
    while (this.nextChordTime < horizon) {
      const chord = CHORDS[this.chordIndex % CHORDS.length]
      this.chordIndex += 1
      this.playChord(chord.notes, this.nextChordTime, 9.5)
      this.playBass(chord.bass, this.nextChordTime, 9.5)
      this.nextChordTime += 8
    }
  }

  private playChord(frequencies: readonly number[], at: number, duration: number) {
    const ctx = this.ctx
    const master = this.master
    const wet = this.wet
    if (!ctx || !master || !wet) return

    frequencies.forEach((frequency, index) => {
      const osc = ctx.createOscillator()
      osc.type = index < 2 ? 'triangle' : 'sine'
      osc.frequency.value = frequency
      osc.detune.value = index % 2 === 0 ? -3 : 3

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1400
      filter.Q.value = 0.4

      const gain = ctx.createGain()
      const peak = 0.05 / (index + 1.4)
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(peak, at + 2.4)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

      osc.connect(gain)
      gain.connect(filter)
      filter.connect(master)
      filter.connect(wet)
      osc.start(at)
      osc.stop(at + duration + 0.2)
    })
  }

  private playBass(frequency: number, at: number, duration: number) {
    const ctx = this.ctx
    const master = this.master
    const wet = this.wet
    if (!ctx || !master || !wet) return

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 260

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.05, at + 2)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

    osc.connect(gain)
    gain.connect(filter)
    filter.connect(master)
    filter.connect(wet)
    osc.start(at)
    osc.stop(at + duration + 0.2)
  }

  private playMelodyNote() {
    const ctx = this.ctx
    const master = this.master
    const wet = this.wet
    if (!ctx || !master || !wet || Math.random() < 0.28) return

    const frequency = MELODY[Math.floor(Math.random() * MELODY.length)]
    const at = ctx.currentTime + 0.02
    const duration = 2.8 + Math.random() * 1.6

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency

    const shimmer = ctx.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.value = frequency * 2
    const shimmerGain = ctx.createGain()
    shimmerGain.gain.value = 0.22

    const gain = ctx.createGain()
    const peak = 0.028 + Math.random() * 0.02
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

    osc.connect(gain)
    shimmer.connect(shimmerGain)
    shimmerGain.connect(gain)
    gain.connect(master)
    gain.connect(wet)

    osc.start(at)
    shimmer.start(at)
    osc.stop(at + duration + 0.1)
    shimmer.stop(at + duration + 0.1)
  }

  private createImpulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate
    const length = Math.floor(rate * seconds)
    const impulse = ctx.createBuffer(2, length, rate)

    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel)
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }

    return impulse
  }
}

/** Convierte una nota MIDI a frecuencia. Útil si quieres ampliar la melodía. */
export function midiToFrequency(note: number) {
  return MIDI_A4 * Math.pow(2, (note - 69) / 12)
}
