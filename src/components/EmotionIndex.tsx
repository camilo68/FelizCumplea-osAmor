import type { CSSProperties } from 'react'
import { gift, type Emotion } from '../data/gift'
import { pad } from '../lib/time'
import { CheckIcon, SparkleIcon } from './icons'
import { Reveal } from './Reveal'

type EmotionIndexProps = {
  visited: ReadonlySet<number>
  onSelect: (emotion: Emotion) => void
}

const GROUPS = [
  { label: 'Núcleo', hint: 'Lo que sostiene todo', from: 0, to: 8 },
  { label: 'Órbita media', hint: 'Lo que nos mueve', from: 8, to: 16 },
  { label: 'Borde exterior', hint: 'Lo que se expande', from: 16, to: 23 },
] as const

export function EmotionIndex({ visited, onSelect }: EmotionIndexProps) {
  const { emotions, galaxy } = gift
  const total = emotions.length
  const percentage = Math.round((visited.size / total) * 100)

  return (
    <section id="emociones" className="section emotion-map" aria-labelledby="emotion-map-title">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">El mapa de la espiral</p>
          <h2 id="emotion-map-title" className="section-title">
            Las <em>23</em> emociones
          </h2>
          <p className="section-sub">
            Cada parte de la espiral guarda una emoción distinta. Las que ya visitaste brillan más
            fuerte; las demás te están esperando. Toca cualquiera para volver a leerla.
          </p>

          <div className="emotion-map__status">
            <span className="emotion-map__status-label">
              <SparkleIcon className="emotion-map__status-icon" />
              {galaxy.progressLabel}
            </span>
            <span className="emotion-map__status-count">
              {pad(visited.size)} / {pad(total)}
            </span>
            <span className="emotion-map__status-bar" aria-hidden="true">
              <span style={{ width: `${percentage}%` }} />
            </span>
          </div>
        </Reveal>

        <div className="emotion-map__groups">
          {GROUPS.map((group, groupIndex) => {
            const items = emotions.slice(group.from, group.to)

            return (
              <Reveal
                key={group.label}
                className="emotion-map__group"
                delay={groupIndex * 90}
              >
                <div className="emotion-map__group-head">
                  <h3>{group.label}</h3>
                  <span>{group.hint}</span>
                  <span className="emotion-map__group-range">
                    {pad(items[0]?.number ?? 0)}—{pad(items[items.length - 1]?.number ?? 0)}
                  </span>
                </div>

                <div className="emotion-map__grid">
                  {items.map((emotion) => (
                    <button
                      key={emotion.number}
                      type="button"
                      className={`emotion-card ${
                        visited.has(emotion.number) ? 'is-visited' : ''
                      }`.trim()}
                      style={{ '--star': emotion.color } as CSSProperties}
                      onClick={() => onSelect(emotion)}
                      aria-haspopup="dialog"
                      aria-label={`Emoción ${emotion.number}: ${emotion.name}. ${emotion.oneLiner}`}
                    >
                      <span className="emotion-card__num" aria-hidden="true">
                        {pad(emotion.number)}
                      </span>
                      <span className="emotion-card__body">
                        <span className="emotion-card__name">{emotion.name}</span>
                        <span className="emotion-card__hint">{emotion.oneLiner}</span>
                      </span>
                      <span className="emotion-card__mark" aria-hidden="true">
                        {visited.has(emotion.number) ? <CheckIcon /> : <span />}
                      </span>
                    </button>
                  ))}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
