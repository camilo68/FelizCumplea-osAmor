import { useNow } from '../hooks/useNow'
import { gift } from '../data/gift'
import { pad, splitDuration } from '../lib/time'

type TogetherCounterProps = {
  variant?: 'compact' | 'full'
  className?: string
}

function daysUntilBirthday(now: Date, birthday: string) {
  const target = new Date(`${birthday}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const diff = Math.round((targetDay.getTime() - today.getTime()) / 86400000)

  return diff
}

/** Contador en vivo desde el 17 de mayo de 2026. */
export function TogetherCounter({ variant = 'compact', className = '' }: TogetherCounterProps) {
  const now = useNow(1000)
  const { days, hours, minutes, seconds } = splitDuration(gift.us.startedAt, now)
  const untilBirthday = daysUntilBirthday(now, gift.her.birthday)

  const cells = [
    { label: 'días', value: pad(days, 3) },
    { label: 'horas', value: pad(hours) },
    { label: 'min', value: pad(minutes) },
    { label: 'seg', value: pad(seconds) },
  ]

  if (variant === 'compact') {
    return (
      <div className={`counter counter--compact ${className}`.trim()} aria-label="Tiempo juntos">
        <p className="counter__label">{gift.galaxy.counterLabel}</p>
        <div className="counter__row">
          {cells.map((cell) => (
            <span key={cell.label} className="counter__unit">
              <strong>{cell.value}</strong>
              <small>{cell.label}</small>
            </span>
          ))}
        </div>
        <p className="counter__hint">{gift.galaxy.counterHint}</p>
      </div>
    )
  }

  const birthdayLine =
    untilBirthday === null
      ? ''
      : untilBirthday === 0
        ? 'Hoy es el día, mi amor.'
        : untilBirthday > 0
          ? `Faltan ${untilBirthday} días para tus 23.`
          : 'Celebrando que naciste.'

  return (
    <div className={`counter counter--full ${className}`.trim()}>
      <div className="counter__head">
        <p className="counter__label">{gift.galaxy.counterLabel}</p>
        <p className="counter__hint">{gift.galaxy.counterHint}</p>
      </div>

      <div className="counter__grid">
        {cells.map((cell) => (
          <div key={cell.label} className="counter__cell">
            <strong>{cell.value}</strong>
            <span>{cell.label}</span>
          </div>
        ))}
      </div>

      <p className="counter__birthday">
        {birthdayLine} <span>{gift.her.birthdayLabel}</span>
      </p>
    </div>
  )
}
