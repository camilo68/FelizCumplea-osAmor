import { useEffect, useRef, useState } from 'react'
import { gift } from '../data/gift'
import { HeartIcon, SparkleIcon, StarIcon } from './icons'
import { Reveal } from './Reveal'

type LetterProps = {
  onComplete: () => void
}

export function Letter({ onComplete }: LetterProps) {
  const { letter, her, us } = gift
  const fullText = [letter.greeting, ...letter.paragraphs].join('\n\n')
  const [started, setStarted] = useState(false)
  const [visible, setVisible] = useState(0)
  const [done, setDone] = useState(false)
  const celebrated = useRef(false)

  useEffect(() => {
    if (!started || done) return

    const id = window.setInterval(() => {
      setVisible((current) => Math.min(current + 3, fullText.length))
    }, 16)

    return () => window.clearInterval(id)
  }, [started, done, fullText.length])

  useEffect(() => {
    if (started && !done && visible >= fullText.length) setDone(true)
  }, [visible, fullText.length, started, done])

  useEffect(() => {
    if (done && !celebrated.current) {
      celebrated.current = true
      onComplete()
    }
  }, [done, onComplete])

  const open = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(fullText.length)
      setDone(true)
    }
    setStarted(true)
  }

  const skip = () => setVisible(fullText.length)

  const replay = () => {
    celebrated.current = false
    setVisible(0)
    setDone(false)
    setStarted(true)
  }

  const shown = fullText.slice(0, visible)
  const chunks = shown.split('\n\n')

  return (
    <section id="nucleo" className="section nucleus" aria-labelledby="nucleus-title">
      <div className="nucleus__glow" aria-hidden="true" />
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{letter.eyebrow}</p>
          <h2 id="nucleus-title" className="section-title">
            El <em>núcleo</em>
          </h2>
          <p className="section-sub">{letter.intro}</p>
        </Reveal>

        {!started ? (
          <Reveal className="nucleus__closed" delay={80}>
            <div className="nucleus__orb" aria-hidden="true">
              <span className="nucleus__ring nucleus__ring--1" />
              <span className="nucleus__ring nucleus__ring--2" />
              <span className="nucleus__ring nucleus__ring--3" />
              <span className="nucleus__core">
                <HeartIcon className="nucleus__heart" />
              </span>
              <span className="nucleus__spark nucleus__spark--1" />
              <span className="nucleus__spark nucleus__spark--2" />
              <span className="nucleus__spark nucleus__spark--3" />
            </div>

            <p className="nucleus__closed-text">
              Todo lo que siento está guardado aquí, en el centro de la espiral. Abre el núcleo y
              léelo despacio.
            </p>

            <button type="button" className="btn btn--rose" onClick={open}>
              <SparkleIcon className="btn__icon" />
              {letter.openLabel}
            </button>
          </Reveal>
        ) : (
          <Reveal className="nucleus__wrap">
            <article className="nucleus__letter" aria-label="Carta de cumpleaños">
              <div className="nucleus__letter-head">
                <span>{gift.galaxy.designation} · Núcleo</span>
                <span>Para {her.name}</span>
              </div>

              <div className="nucleus__body">
                {chunks.map((chunk, index) => (
                  <p key={index} className={index === 0 ? 'nucleus__greeting' : undefined}>
                    {chunk}
                    {index === chunks.length - 1 && !done && (
                      <span className="nucleus__caret" aria-hidden="true" />
                    )}
                  </p>
                ))}
              </div>

              <div className={`nucleus__footer ${done ? 'is-visible' : ''}`.trim()}>
                <div className="nucleus__signature">
                  <p>{letter.signature}</p>
                  {us.signatureName ? (
                    <p className="nucleus__signature-name">{us.signatureName}</p>
                  ) : null}
                </div>
                <p className="nucleus__ps">{letter.ps}</p>
              </div>

              <div className="nucleus__actions">
                {!done ? (
                  <button type="button" className="link-button" onClick={skip}>
                    {letter.typingLabel} <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button type="button" className="link-button" onClick={replay}>
                    Leerla otra vez
                  </button>
                )}
              </div>

              <span className="nucleus__stamp" aria-hidden="true">
                KM-23
              </span>
              <StarIcon className="nucleus__star" />
              <HeartIcon className="nucleus__letter-heart" />
            </article>
          </Reveal>
        )}
      </div>
    </section>
  )
}
