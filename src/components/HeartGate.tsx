import { gift } from '../data/gift'
import { HeartIcon } from './icons'

type HeartGateProps = {
  leaving: boolean
  onStart: (withMusic: boolean) => void
}

/**
 * La puerta de entrada: un corazón enorme que, al tocarlo, enciende la
 * galaxia. Mientras está abierta, el resto de la página queda inerte.
 */
export function HeartGate({ leaving, onStart }: HeartGateProps) {
  const { galaxy, her, us } = gift

  return (
    <div
      className={`gate ${leaving ? 'is-leaving' : ''}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label="Portada de la galaxia"
    >
      <div className="gate__aura" aria-hidden="true" />
      <div className="gate__inner">
        <p className="gate__meta">
          {galaxy.designation} · {galaxy.year} · 1 de 1
        </p>

        <p className="gate__kicker">{galaxy.kicker}</p>
        <h1 className="gate__name">
          {galaxy.nameLine}
          <em>{galaxy.ageLine}</em>
        </h1>

        <p className="gate__note">{galaxy.gateNote}</p>

        <button
          type="button"
          className="gate__heart"
          onClick={() => onStart(true)}
          aria-label="Tocar el corazón y encender la galaxia con música"
        >
          <span className="gate__halo" aria-hidden="true" />
          <HeartIcon className="gate__heart-icon" />
          <span className="gate__heart-label">{galaxy.gateTeaser}</span>
        </button>

        <p className="gate__hint">{galaxy.gateHint}</p>

        <div className="gate__actions">
          <button type="button" className="btn btn--rose" onClick={() => onStart(true)}>
            {galaxy.withMusic}
          </button>
          <button type="button" className="gate__silent" onClick={() => onStart(false)}>
            {galaxy.silent}
          </button>
        </div>
      </div>

      <p className="gate__edge">
        {her.name} · {us.startedLabel} · {galaxy.rulerNote}
      </p>
    </div>
  )
}
