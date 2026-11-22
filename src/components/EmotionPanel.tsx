import { useEffect, useRef, type CSSProperties } from 'react'
import { gift, type Emotion } from '../data/gift'
import { pad } from '../lib/time'
import { spiralPoint } from '../lib/spiral'
import { ArrowIcon, CheckIcon, HeartIcon } from './icons'

type EmotionPanelProps = {
  emotion: Emotion | null
  visited: ReadonlySet<number>
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const SPIRAL_PATH = Array.from({ length: 150 }, (_, index) => {
  const point = spiralPoint(index, 149)
  const x = 50 + point.x * 100
  const y = 50 + point.y * 100
  return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
}).join(' ')

export function EmotionPanel({ emotion, visited, onClose, onPrev, onNext }: EmotionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const open = emotion !== null

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose, onPrev, onNext])

  if (!emotion) return null

  const total = gift.emotions.length
  const index = gift.emotions.findIndex((item) => item.number === emotion.number)
  const point = spiralPoint(index, total)
  const isVisited = visited.has(emotion.number)

  return (
    <div className="emotion-modal" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="emotion-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emotion-title"
        style={{ '--star': emotion.color } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="emotion-panel__rail" aria-hidden="true" />

        <button
          ref={closeRef}
          type="button"
          className="emotion-panel__close"
          onClick={onClose}
          aria-label="Cerrar la emoción y volver a la espiral"
        >
          ×
        </button>

        <div className="emotion-panel__head">
          <span className="emotion-panel__kicker">
            Emoción {pad(emotion.number)} · {gift.galaxy.designation}
          </span>
          <span className={`emotion-panel__state ${isVisited ? 'is-on' : ''}`.trim()}>
            {isVisited ? (
              <>
                <CheckIcon /> Descubierta
              </>
            ) : (
              'Nueva'
            )}
          </span>
        </div>

        <div className="emotion-panel__visual" aria-hidden="true">
          <span className="emotion-panel__watermark">{pad(emotion.number)}</span>
          <svg className="emotion-panel__spiral" viewBox="0 0 100 100" role="presentation">
            <path d={SPIRAL_PATH} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.55" />
            <circle
              cx={50 + point.x * 100}
              cy={50 + point.y * 100}
              r="2.6"
              fill={emotion.color}
            />
            <circle
              cx={50 + point.x * 100}
              cy={50 + point.y * 100}
              r="5.4"
              fill="none"
              stroke={emotion.color}
              strokeOpacity="0.45"
              strokeWidth="0.5"
            />
          </svg>
          <span className="emotion-panel__star">
            <span />
          </span>
        </div>

        <p className="emotion-panel__one-liner">{emotion.oneLiner}</p>
        <h2 id="emotion-title" className="emotion-panel__title">
          {emotion.name}
        </h2>
        <p className="emotion-panel__text">{emotion.text}</p>

        <div className="emotion-panel__signature">
          <HeartIcon className="emotion-panel__heart" />
          <span>Una de las 23 partes de la espiral</span>
        </div>

        <div className="emotion-panel__nav">
          <button type="button" className="emotion-panel__nav-btn" onClick={onPrev}>
            <ArrowIcon className="emotion-panel__nav-icon is-up" />
            Anterior
          </button>
          <span className="emotion-panel__count">
            {pad(index + 1)} <i>/</i> {pad(total)}
          </span>
          <button type="button" className="emotion-panel__nav-btn" onClick={onNext}>
            Siguiente
            <ArrowIcon className="emotion-panel__nav-icon is-down" />
          </button>
        </div>
      </div>
    </div>
  )
}
