import { useActiveSection } from '../hooks/useActiveSection'
import { StarIcon } from './icons'

const SECTIONS = [
  { id: 'galaxia', label: 'Galaxia' },
  { id: 'emociones', label: 'Emociones' },
  { id: 'orbitas', label: 'Órbitas' },
  { id: 'nucleo', label: 'Núcleo' },
  { id: 'final', label: 'Final' },
] as const

const SECTION_IDS = SECTIONS.map((section) => section.id)

type TopBarProps = {
  playing: boolean
  onToggleMusic: () => void
}

export function TopBar({ playing, onToggleMusic }: TopBarProps) {
  const active = useActiveSection(SECTION_IDS)

  return (
    <header className="topbar">
      <a href="#galaxia" className="topbar__brand" aria-label="Volver a la galaxia">
        KM-23
        <small>Galaxia</small>
      </a>

      <nav className="topbar__nav" aria-label="Secciones de la galaxia">
        {SECTIONS.map((section) => {
          const isActive = active === section.id
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`topbar__link ${isActive ? 'is-active' : ''}`.trim()}
              aria-current={isActive ? 'page' : undefined}
            >
              {section.label}
            </a>
          )
        })}
      </nav>

      <button
        type="button"
        className={`music-btn ${playing ? 'is-playing' : ''}`.trim()}
        onClick={onToggleMusic}
        aria-pressed={playing}
        aria-label={playing ? 'Pausar la música' : 'Reproducir la música'}
        title={playing ? 'Pausar la música' : 'Reproducir la música'}
      >
        <StarIcon className="music-btn__star" />
        <span className="music-btn__text">{playing ? 'Sonando' : 'Música'}</span>
      </button>
    </header>
  )
}
