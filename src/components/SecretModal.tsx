import { useEffect, useRef } from 'react'
import { gift } from '../data/gift'
import { HeartIcon, StarIcon } from './icons'

type SecretModalProps = {
  open: boolean
  onClose: () => void
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function SecretModal({ open, onClose }: SecretModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

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

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
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
  }, [open, onClose])

  if (!open) return null

  const { secret, galaxy, her } = gift

  return (
    <div className="secret-modal" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className="secret-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="secret-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="secret-card__watermark" aria-hidden="true">
          24
        </span>

        <button
          ref={closeRef}
          type="button"
          className="secret-card__close"
          onClick={onClose}
          aria-label="Cerrar la estrella oculta"
        >
          ×
        </button>

        <div className="secret-card__head">
          <span className="secret-card__badge">{secret.badge}</span>
          <span className="secret-card__catalog">{galaxy.designation} · {her.name}</span>
        </div>

        <div className="secret-card__sky" aria-hidden="true">
          <span className="secret-card__orbit secret-card__orbit--1" />
          <span className="secret-card__orbit secret-card__orbit--2" />
          <span className="secret-card__star">
            <StarIcon />
          </span>
          <span className="secret-card__spark secret-card__spark--1" />
          <span className="secret-card__spark secret-card__spark--2" />
          <span className="secret-card__spark secret-card__spark--3" />
        </div>

        <p className="secret-card__label">{secret.label}</p>
        <h2 id="secret-title" className="secret-card__title">
          {secret.title}
        </h2>
        <p className="secret-card__text">{secret.text}</p>
        <p className="secret-card__signature">{secret.signature}</p>

        <div className="secret-card__hint">
          <HeartIcon className="secret-card__hint-icon" />
          <p>{secret.hint}</p>
        </div>

        <button type="button" className="btn btn--rose" onClick={onClose}>
          {secret.close}
        </button>
      </div>
    </div>
  )
}
