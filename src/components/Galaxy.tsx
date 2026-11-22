import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gift, type Emotion } from '../data/gift'
import { pad } from '../lib/time'
import { projectBonusStar, projectEmotion } from '../lib/galaxy3d'
import { GalaxyScene } from './GalaxyScene'
import { TogetherCounter } from './TogetherCounter'
import { SparkleIcon, StarIcon } from './icons'

type GalaxyProps = {
  born: boolean
  bornAt: number | null
  visited: ReadonlySet<number>
  activeNumber: number | null
  allVisited: boolean
  onSelect: (emotion: Emotion) => void
  onSecret: () => void
  onReset: () => void
}

/**
 * Mantiene las estrellas-botón pegadas a la proyección 3D del lienzo.
 * El lienzo actualiza `galaxyView`; este bucle solo lee y coloca el DOM.
 */
function useProjectedNodes() {
  const nodesRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = nodesRef.current
    if (!container) return

    const total = gift.emotions.length
    let width = container.clientWidth
    let height = container.clientHeight

    const observer = new ResizeObserver(() => {
      width = container.clientWidth
      height = container.clientHeight
    })
    observer.observe(container)

    let frame = 0
    const place = () => {
      frame = window.requestAnimationFrame(place)
      if (width === 0 || height === 0) return

      const nodes = container.querySelectorAll<HTMLElement>('[data-galaxy-node]')
      for (const node of nodes) {
        const index = Number(node.dataset.galaxyNode)
        const point = index < 0 ? projectBonusStar() : projectEmotion(index, total)

        node.style.setProperty('--node-x', `${(point.x * width).toFixed(2)}px`)
        node.style.setProperty('--node-y', `${(point.y * height).toFixed(2)}px`)
        node.style.setProperty('--node-depth', point.scale.toFixed(3))
        node.style.zIndex = String(Math.round(point.scale * 60))
        node.dataset.side = point.x < 0.5 ? 'left' : 'right'
      }
    }

    frame = window.requestAnimationFrame(place)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return nodesRef
}

export function Galaxy({
  born,
  bornAt,
  visited,
  activeNumber,
  allVisited,
  onSelect,
  onSecret,
  onReset,
}: GalaxyProps) {
  const { galaxy, emotions } = gift
  const total = emotions.length
  const progress = Math.round((visited.size / total) * 100)
  const nodesRef = useProjectedNodes()

  return (
    <section id="galaxia" className="galaxy" aria-labelledby="galaxy-title">
      <div className="galaxy__copy">
        <p className="eyebrow">{galaxy.heroEyebrow}</p>
        <h1 id="galaxy-title" className="galaxy__title">
          {galaxy.heroTitle}
        </h1>
        <p className="galaxy__sub">{galaxy.heroSub}</p>
      </div>

      <div className="galaxy__stage">
        <GalaxyScene born={born} bornAt={bornAt} />

        <div className="galaxy__nodes" ref={nodesRef}>
          {emotions.map((emotion, index) => {
            return (
              <button
                key={emotion.number}
                type="button"
                className={`star-node ${
                  visited.has(emotion.number) ? 'is-visited' : ''
                } ${activeNumber === emotion.number ? 'is-active' : ''}`.trim()}
                style={{ '--star': emotion.color } as CSSProperties}
                onClick={() => onSelect(emotion)}
                data-galaxy-node={index}
                aria-haspopup="dialog"
                aria-label={`Emoción ${emotion.number}: ${emotion.name}. ${emotion.oneLiner}`}
              >
                <span className="star-node__core" aria-hidden="true">
                  <span className="star-node__spark" />
                  <span className="star-node__num">{pad(emotion.number)}</span>
                </span>
                <span className="star-node__name" aria-hidden="true">
                  {emotion.name}
                </span>
              </button>
            )
          })}

          {allVisited ? (
            <button
              type="button"
              className="star-node star-node--bonus"
              style={{ '--star': '#f6f1e7' } as CSSProperties}
              onClick={onSecret}
              data-galaxy-node={-1}
              aria-haspopup="dialog"
              aria-label="Estrella 24: la estrella oculta"
            >
              <span className="star-node__core" aria-hidden="true">
                <StarIcon className="star-node__star" />
                <span className="star-node__num">24</span>
              </span>
              <span className="star-node__name" aria-hidden="true">
                {galaxy.bonusLabel}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="galaxy__dock">
        <TogetherCounter variant="compact" />

        <div className="galaxy__progress">
          <div className="galaxy__progress-top">
            <span>{galaxy.progressLabel}</span>
            <strong>
              {pad(visited.size)} / {pad(total)}
            </strong>
          </div>
          <div
            className="galaxy__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={visited.size}
            aria-label={galaxy.progressLabel}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="galaxy__progress-bottom">
            <span>{galaxy.heroHint}</span>
            <button type="button" className="galaxy__reset" onClick={onReset}>
              {galaxy.resetLabel}
            </button>
          </div>
        </div>

        {allVisited ? (
          <div className="galaxy__complete">
            <div className="galaxy__complete-copy">
              <p className="galaxy__complete-title">
                <SparkleIcon className="galaxy__complete-icon" />
                {galaxy.completeTitle}
              </p>
              <p className="galaxy__complete-text">{galaxy.completeText}</p>
            </div>
            <button type="button" className="btn btn--rose" onClick={onSecret}>
              {galaxy.bonusOpen}
            </button>
          </div>
        ) : null}
      </div>

      <a href="#emociones" className="galaxy__scroll">
        <span>{galaxy.scroll}</span>
        <span className="galaxy__scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
