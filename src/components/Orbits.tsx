import { gift } from '../data/gift'
import { TogetherCounter } from './TogetherCounter'
import { HeartIcon } from './icons'
import { Reveal } from './Reveal'

export function Orbits() {
  const { orbits, galaxy } = gift

  return (
    <section id="orbitas" className="section orbits" aria-labelledby="orbits-title">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{orbits.eyebrow}</p>
          <h2 id="orbits-title" className="section-title">
            Las órbitas que <em>nos trajeron</em> aquí
          </h2>
          <p className="section-sub">{orbits.subtitle}</p>
        </Reveal>

        <div className="orbits__layout">
          <ol className="orbits__timeline">
            {orbits.notes.map((orbit, index) => (
              <li key={orbit.number} className="orbit">
                <Reveal className="orbit__inner" delay={index * 70}>
                  <div className="orbit__marker" aria-hidden="true">
                    <span className="orbit__dot" />
                    <span className="orbit__line" />
                  </div>

                  <div className="orbit__card">
                    <div className="orbit__meta">
                      <span className="orbit__number">{orbit.number}</span>
                      <span className="orbit__date">{orbit.date}</span>
                    </div>
                    <h3 className="orbit__title">{orbit.title}</h3>
                    <p className="orbit__text">{orbit.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="orbits__aside" delay={140}>
            <TogetherCounter variant="full" />

            <div className="orbits__note">
              <HeartIcon className="orbits__note-icon" />
              <p>
                Mientras lees esto, la galaxia sigue girando. Y yo sigo queriéndote en cada vuelta.
              </p>
            </div>

            <p className="orbits__foot">{orbits.footNote}</p>
            <p className="orbits__ruler">{galaxy.rulerNote}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
