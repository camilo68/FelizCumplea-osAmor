import { gift } from '../data/gift'
import type { VisitInfo } from '../lib/api'
import { formatLongDate } from '../lib/time'
import { HeartIcon, LockIcon, SparkleIcon, UnlockIcon } from './icons'
import { Reveal } from './Reveal'
import { TogetherCounter } from './TogetherCounter'

type FinaleProps = {
  visits: VisitInfo | null
  allVisited: boolean
  onSecret: () => void
  onRestart: () => void
}

export function Finale({ visits, allVisited, onSecret, onRestart }: FinaleProps) {
  const { finale, galaxy, her, us, secret } = gift
  const firstVisit = formatLongDate(visits?.firstVisit)

  return (
    <footer id="final" className="section finale" aria-labelledby="finale-title">
      <div className="finale__stars" aria-hidden="true" />
      <div className="container">
        <div className="finale__panel">
          <div className="finale__head">
            <span>{galaxy.designation} · {finale.eyebrow}</span>
            <span>{galaxy.year} · 1 de 1</span>
          </div>

          <div className="finale__grid">
            <div className="finale__main">
              <Reveal>
                <p className="eyebrow">{finale.eyebrow}</p>
              </Reveal>

              <Reveal delay={70}>
                <h2 id="finale-title" className="finale__title">
                  {finale.title}
                </h2>
                <p className="finale__name">{finale.name}</p>
                <p className="finale__subtitle">{finale.subtitle}</p>
              </Reveal>

              <Reveal delay={140}>
                <blockquote className="finale__quote">
                  <span aria-hidden="true">“</span>
                  {finale.quote}
                  <span aria-hidden="true">”</span>
                </blockquote>
              </Reveal>

              <Reveal delay={200}>
                <div className="finale__actions">
                  <button type="button" className="btn btn--rose" onClick={onRestart}>
                    <SparkleIcon className="btn__icon" />
                    {finale.restart}
                  </button>

                  <button
                    type="button"
                    className={`finale__secret ${allVisited ? 'is-unlocked' : 'is-locked'}`.trim()}
                    onClick={onSecret}
                    disabled={!allVisited}
                    aria-label={allVisited ? 'Abrir la estrella oculta 24' : secret.locked}
                  >
                    {allVisited ? (
                      <UnlockIcon className="finale__secret-icon" />
                    ) : (
                      <LockIcon className="finale__secret-icon" />
                    )}
                    <span>{allVisited ? finale.secretLabel : secret.locked}</span>
                  </button>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <p className="finale__made">
                  {finale.madeWith} Desde el {us.startedLabel}, para {her.name}.
                </p>
              </Reveal>
            </div>

            <Reveal className="finale__aside" delay={120}>
              <TogetherCounter variant="full" />

              <div className="finale__credits">
                <h3>{finale.creditsTitle}</h3>
                <dl>
                  {finale.credits.map((credit) => (
                    <div key={credit.role}>
                      <dt>{credit.role}</dt>
                      <dd>{credit.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {visits ? (
                <div className="finale__visits">
                  <p className="finale__visits-count">
                    {finale.visitsLabel} <strong>{visits.count}</strong>
                  </p>
                  {firstVisit ? (
                    <p className="finale__visits-date">
                      {finale.visitsFirst}: {firstVisit}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Reveal>
          </div>

          <div className="finale__foot">
            <span className="finale__barcode" aria-hidden="true" />
            <p className="finale__coordinate">{finale.coordinate}</p>
            <p className="finale__catalog-line">{finale.barcodeNote}</p>
            <p className="finale__back-note">
              <HeartIcon className="finale__heart" />
              {finale.backNote}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
