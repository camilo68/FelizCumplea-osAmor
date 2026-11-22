import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { gift } from '../data/gift'
import { registerVisit } from '../lib/api'
import { AmbientSynth } from '../lib/ambient'
import { getMoment, type Moment } from '../lib/moments'
import { GalaxyEngine } from './galactic/engine'
import { SCENES, type SceneId } from './galactic/scenes'
import { useTypewriter } from './galactic/useTypewriter'

const FULL_LETTER = [
  gift.letter.greeting,
  ...gift.letter.paragraphs,
  gift.letter.signature,
  gift.letter.ps,
].join('\n\n')

const SIGNATURE_INDEX = gift.letter.paragraphs.length + 1
const PS_INDEX = gift.letter.paragraphs.length + 2

const LETTER_STORAGE_KEY = 'karen-mensaje-galactico'
const FACE_STORAGE_KEY = 'karen-foto-rostro'

function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStoredValue(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Si el navegador no deja guardar, el regalo sigue funcionando.
  }
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Algunos navegadores no permiten vibrar; no es imprescindible.
  }
}

export function GalacticHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GalaxyEngine | null>(null)
  const synthRef = useRef<AmbientSynth | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const mailRef = useRef<HTMLButtonElement>(null)
  const asideCloseRef = useRef<HTMLButtonElement>(null)
  const letterEditorRef = useRef<HTMLDivElement>(null)
  const closeModalRef = useRef<() => void>(() => undefined)
  const visitRef = useRef(false)
  const hintTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)
  const specialDone = useRef(false)
  const lastSecret = useRef(0)
  const lastArm = useRef(0)

  const [sceneId, setSceneId] = useState<SceneId>('galactic')
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [activeArm, setActiveArm] = useState<number | null>(null)
  const [moment, setMoment] = useState<Moment>(() => getMoment())
  const [toast, setToast] = useState<string | null>(null)
  const [letterPlayed, setLetterPlayed] = useState(false)
  const [customLetter, setCustomLetter] = useState<string | null>(() =>
    readStoredValue(LETTER_STORAGE_KEY),
  )
  const [editingLetter, setEditingLetter] = useState(false)
  const [facePhoto, setFacePhoto] = useState<string | null>(() =>
    readStoredValue(FACE_STORAGE_KEY),
  )

  const scene = SCENES[sceneId]
  const armMessage = gift.deepLove[activeArm ?? lastArm.current]
  const days = moment.days
  const letter = useTypewriter(
    FULL_LETTER,
    modalOpen && !letterPlayed && !customLetter && !editingLetter,
    9000,
  )
  const typed = letter.visible.split('\n\n')
  const letterComplete = Boolean(customLetter) || letter.done

  const showToast = useCallback((message: string, duration = 4600) => {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), duration)
  }, [])

  const openArm = useCallback((arm: number) => {
    lastArm.current = arm
    setActiveArm(arm)
    synthRef.current?.chime('open')
    vibrate(12)
  }, [])

  const closeArm = useCallback(() => {
    setActiveArm(null)
    synthRef.current?.chime('close')
  }, [])

  const showDays = useCallback(() => {
    engineRef.current?.celebrate(16)
    synthRef.current?.chime('open')
    vibrate(10)
    showToast(
      `${gift.moments.daysSince} · ${days} ${gift.moments.daysLabel}. ${gift.moments.daysMessage}`,
      7000,
    )
  }, [days, showToast])

  const savePostcard = useCallback(() => {
    const source = canvasRef.current
    if (!source) return

    const width = 1080
    const height = 1350
    const output = document.createElement('canvas')
    output.width = width
    output.height = height

    const ctx = output.getContext('2d')
    if (!ctx) return

    const background = ctx.createLinearGradient(0, 0, width, height)
    background.addColorStop(0, scene.simple ? '#0f2a4d' : '#2a0f4d')
    background.addColorStop(1, scene.simple ? '#02060d' : '#05010b')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)

    const scale = Math.max(width / source.width, height / source.height)
    const drawWidth = source.width * scale
    const drawHeight = source.height * scale
    ctx.drawImage(
      source,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    )

    const shade = ctx.createLinearGradient(0, 0, 0, height)
    shade.addColorStop(0, 'rgba(5,1,11,.55)')
    shade.addColorStop(0.5, 'rgba(5,1,11,.12)')
    shade.addColorStop(1, 'rgba(5,1,11,.9)')
    ctx.fillStyle = shade
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(255,77,141,.75)'
    ctx.shadowBlur = 26
    ctx.font = '400 96px "Great Vibes", "Brush Script MT", cursive'
    ctx.fillText(scene.title, width / 2, 1090)
    ctx.shadowBlur = 0

    ctx.font = '500 30px Georgia, serif'
    ctx.fillStyle = '#ffd1e3'
    ctx.fillText(`${days} ${gift.moments.daysLabel}`, width / 2, 1158)

    ctx.font = '400 26px Georgia, serif'
    ctx.fillStyle = 'rgba(255,255,255,.74)'
    ctx.fillText(gift.moments.postcardCaption, width / 2, 1210)
    ctx.fillText('23 · 11 · 2026', width / 2, 1254)

    const link = document.createElement('a')
    link.download = 'karen-corazon-galactico.png'
    link.style.display = 'none'

    output.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      link.href = url
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)

      showToast(gift.moments.postcardSaved)
      vibrate([8, 30, 12])
    }, 'image/png')
  }, [days, scene.simple, scene.title, showToast])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new GalaxyEngine(canvas, openArm)
    engineRef.current = engine
    engine.start()

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [openArm])

  useEffect(() => {
    engineRef.current?.setScene(sceneId)
    if (sceneId === 'simple') setActiveArm(null)
  }, [sceneId])

  useEffect(() => {
    if (!facePhoto) {
      engineRef.current?.setPortrait(null)
      return
    }

    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (!cancelled) engineRef.current?.setPortrait(image)
    }
    image.src = facePhoto

    return () => {
      cancelled = true
      image.onload = null
    }
  }, [facePhoto])

  useLayoutEffect(() => {
    if (!editingLetter) return
    const editor = letterEditorRef.current
    if (!editor) return

    editor.innerText = customLetter ?? FULL_LETTER
    editor.focus()

    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [editingLetter, customLetter])

  useEffect(() => {
    const timer = window.setInterval(() => setMoment(getMoment()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!started || !moment.isSpecialMinute || specialDone.current) return

    specialDone.current = true
    engineRef.current?.celebrate(64)
    synthRef.current?.chime('open')
    vibrate([12, 60, 18, 60, 24])
    showToast(gift.moments.specialMinuteToast, 8000)
  }, [started, moment.isSpecialMinute, showToast])

  useEffect(() => {
    if (!started) return

    let buffer = ''

    const onKey = (event: KeyboardEvent) => {
      if (event.key.length !== 1) return

      const target = event.target as HTMLElement | null
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return

      buffer = `${buffer}${event.key.toLowerCase()}`.slice(-12)
      if (!buffer.endsWith(gift.moments.secretWord)) return

      const now = Date.now()
      if (now - lastSecret.current < 8000) return

      lastSecret.current = now
      buffer = ''
      engineRef.current?.celebrate(56)
      synthRef.current?.chime('open')
      vibrate([10, 40, 14])
      showToast(gift.moments.secretToast, 6000)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, showToast])

  useEffect(() => {
    if (modalOpen && letterComplete) setLetterPlayed(true)
  }, [modalOpen, letterComplete])

  useEffect(() => {
    if (activeArm === null) return

    const focusTimer = window.setTimeout(() => {
      asideCloseRef.current?.focus()
    }, 120)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeArm()
    }

    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
    }
  }, [activeArm, closeArm])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
      if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    const onVisibility = () => {
      synthRef.current?.setVisibility(document.hidden)
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (!modalOpen) return

    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModalRef.current()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const begin = useCallback(() => {
    if (started) return

    setStarted(true)

    const synth = new AmbientSynth()
    synthRef.current = synth
    void synth.start()

    if (!visitRef.current) {
      visitRef.current = true
      void registerVisit()
    }

    hintTimer.current = window.setTimeout(() => setHintVisible(false), 7000)
  }, [started])

  const toggleMusic = useCallback(() => {
    setMuted((previous) => {
      const next = !previous
      synthRef.current?.setMuted(next)
      return next
    })
  }, [])

  const persistLetter = useCallback((text: string) => {
    const clean = text.replace(/\r\n/g, '\n').trim()
    const original = FULL_LETTER.replace(/\r\n/g, '\n').trim()

    if (!clean || clean === original) {
      setCustomLetter(null)
      writeStoredValue(LETTER_STORAGE_KEY, null)
      return
    }

    setCustomLetter(clean)
    writeStoredValue(LETTER_STORAGE_KEY, clean)
  }, [])

  const saveLetter = useCallback(() => {
    const editor = letterEditorRef.current
    if (editor) persistLetter(editor.innerText)

    setEditingLetter(false)
    synthRef.current?.chime('close')
    vibrate(8)
    showToast(
      'Mensaje guardado. Toca la carta cuando quieras volver a escribirlo.',
      5600,
    )
  }, [persistLetter, showToast])

  const startEditingLetter = useCallback(() => {
    if (editingLetter) return
    setEditingLetter(true)
    synthRef.current?.chime('open')
    vibrate(8)
  }, [editingLetter])

  const resetLetter = useCallback(() => {
    setCustomLetter(null)
    setEditingLetter(false)
    setLetterPlayed(false)
    writeStoredValue(LETTER_STORAGE_KEY, null)
    showToast('Volvió el mensaje original de la galaxia.')
  }, [showToast])

  const closeModal = useCallback(() => {
    if (editingLetter) {
      const editor = letterEditorRef.current
      if (editor) persistLetter(editor.innerText)
      setEditingLetter(false)
    }

    setModalOpen(false)
    mailRef.current?.focus()
  }, [editingLetter, persistLetter])

  closeModalRef.current = closeModal

  const onFiles = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []).slice(0, 12)
      event.target.value = ''

      if (files.length === 0) return

      for (const file of files) {
        const url = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => {
          engineRef.current?.addPhoto(image)
          URL.revokeObjectURL(url)
        }
        image.onerror = () => URL.revokeObjectURL(url)
        image.src = url
      }

      if (sceneId !== 'simple') {
        setSceneId('simple')
        showToast('Tus fotos ahora giran en la Galaxia simple.')
      } else {
        showToast('Fotos agregadas a la galaxia.')
      }
    },
    [sceneId, showToast],
  )

  const onFaceFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      const url = URL.createObjectURL(file)
      const image = new Image()

      image.onload = () => {
        const side = Math.min(
          720,
          Math.max(1, Math.max(image.width, image.height)),
        )
        const canvas = document.createElement('canvas')
        canvas.width = side
        canvas.height = side
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          URL.revokeObjectURL(url)
          return
        }

        ctx.fillStyle = '#12051f'
        ctx.fillRect(0, 0, side, side)

        const scale = Math.max(side / image.width, side / image.height)
        const drawWidth = image.width * scale
        const drawHeight = image.height * scale
        const offsetX = (side - drawWidth) / 2
        const offsetY = (side - drawHeight) / 2
        const faceBias =
          drawHeight > side ? Math.min(side * 0.08, -offsetY) : 0

        ctx.drawImage(
          image,
          offsetX,
          offsetY - faceBias,
          drawWidth,
          drawHeight,
        )

        const data = canvas.toDataURL('image/jpeg', 0.86)
        setFacePhoto(data)
        writeStoredValue(FACE_STORAGE_KEY, data)
        URL.revokeObjectURL(url)
        synthRef.current?.chime('open')
        vibrate(12)
        showToast(
          'Foto del rostro guardada. Ahora vive en el centro del corazón.',
          5600,
        )
      }

      image.onerror = () => URL.revokeObjectURL(url)
      image.src = url
    },
    [showToast],
  )

  const clearFacePhoto = useCallback(() => {
    setFacePhoto(null)
    writeStoredValue(FACE_STORAGE_KEY, null)
    showToast('Foto del rostro quitada.')
  }, [showToast])

  const paragraphClass = (index: number) => {
    if (index === 0) return 'galactic__letter-greeting'
    if (index === SIGNATURE_INDEX) return 'galactic__letter-sign'
    if (index === PS_INDEX) return 'galactic__letter-ps'
    return undefined
  }

  return (
    <div
      className={[
        'galactic',
        scene.simple ? 'galactic--simple' : '',
        moment.isBirthday ? 'galactic--birthday' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <canvas
        ref={canvasRef}
        className="galactic__canvas"
        aria-hidden="true"
      />

      <nav className="galactic__switch" aria-label="Versión">
        {(Object.keys(SCENES) as SceneId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={sceneId === id ? 'is-on' : undefined}
            onClick={() => setSceneId(id)}
          >
            {SCENES[id].label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="galactic__fab galactic__mute"
        onClick={toggleMusic}
        aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        aria-pressed={muted}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <h1 className="galactic__title">{scene.title}</h1>

      <div className="galactic__topmeta">
        {moment.isBirthday ? (
          <p className="galactic__birthday">
            <span>{gift.moments.birthdayRibbon}</span>
            <small>{gift.moments.birthdaySub}</small>
          </p>
        ) : null}

        <button
          type="button"
          className="galactic__days"
          onClick={showDays}
          aria-label={`${days} ${gift.moments.daysLabel}. Toca para ver el mensaje`}
        >
          <strong>{days}</strong> {gift.moments.daysLabel}
        </button>
      </div>

      <button
        ref={mailRef}
        type="button"
        className="galactic__fab galactic__mail"
        onClick={() => setModalOpen(true)}
        aria-label="Abrir mensaje"
        aria-haspopup="dialog"
      >
        💌
      </button>

      <label
        className="galactic__fab galactic__photo"
        htmlFor="galactic-photo"
        aria-label="Agregar fotos de la galaxia"
      >
        📷 <span>Fotos de la galaxia</span>
      </label>
      <input
        id="galactic-photo"
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onFiles}
      />

      <p
        className={`galactic__hint ${hintVisible ? '' : 'is-hidden'}`.trim()}
      >
        Arrastra para girar · toca un brazo de luz · rueda para acercar
      </p>

      {!scene.simple ? (
        <div className="sr-only">
          {gift.deepLove.map((message, arm) => (
            <button
              key={message.badge}
              type="button"
              onClick={() => openArm(arm)}
            >
              Abrir mensaje del {message.badge}: {message.title}
            </button>
          ))}
        </div>
      ) : null}

      <aside
        className={`galactic__aside ${activeArm !== null ? 'is-open' : ''}`.trim()}
        aria-hidden={activeArm === null}
        aria-labelledby="galactic-aside-title"
        inert={activeArm === null}
      >
        <button
          ref={asideCloseRef}
          type="button"
          className="galactic__aside-close"
          onClick={closeArm}
          aria-label="Cerrar el mensaje del brazo"
        >
          ✕
        </button>
        <p className="galactic__aside-badge">{armMessage.badge}</p>
        <p className="galactic__aside-meta">{armMessage.meta}</p>
        <h2 id="galactic-aside-title">{armMessage.title}</h2>
        <p className="galactic__aside-text">{armMessage.text}</p>
        <p className="galactic__aside-sign">Te amo, Karen. Siempre.</p>
      </aside>

      <div
        className={`galactic__toast ${toast ? 'is-on' : ''}`.trim()}
        role="status"
        aria-live="polite"
      >
        {toast ?? ''}
      </div>

      <button
        type="button"
        className={`galactic__start ${started ? 'is-gone' : ''}`.trim()}
        onClick={begin}
        aria-label={scene.start}
      >
        <span className="galactic__start-heart" aria-hidden="true">
          ❤️
        </span>
        <span className="galactic__start-text">{scene.start}</span>
      </button>

      <div
        className={`galactic__modal ${modalOpen ? 'is-open' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="galactic-letter-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}
      >
        <div className="galactic__card">
          <button
            ref={closeRef}
            type="button"
            className="galactic__card-close"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <h2 id="galactic-letter-title">{scene.letterTitle}</h2>

          <div className="galactic__portrait">
            <label
              className="galactic__portrait-pick"
              htmlFor="galactic-face"
              title={
                facePhoto
                  ? 'Cambiar la foto del rostro'
                  : 'Agregar la foto del rostro'
              }
            >
              <span className="galactic__portrait-frame">
                {facePhoto ? (
                  <img src={facePhoto} alt="Foto del rostro" />
                ) : (
                  <span
                    className="galactic__portrait-empty"
                    aria-hidden="true"
                  >
                    🙂
                  </span>
                )}
              </span>
              <span className="galactic__portrait-label">
                {facePhoto ? 'Cambiar foto del rostro' : 'Foto del rostro'}
              </span>
            </label>
            <input
              id="galactic-face"
              type="file"
              accept="image/*"
              hidden
              onChange={onFaceFile}
            />
            {facePhoto ? (
              <button
                type="button"
                className="galactic__portrait-clear"
                onClick={clearFacePhoto}
              >
                Quitar
              </button>
            ) : null}
          </div>

          {editingLetter ? (
            <div
              ref={letterEditorRef}
              className="galactic__letter galactic__letter--editing"
              contentEditable
              suppressContentEditableWarning
              spellCheck
              role="textbox"
              aria-multiline="true"
              aria-label="Escribe tu mensaje"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation()
                  saveLetter()
                }

                if (
                  event.key === 'Enter' &&
                  (event.metaKey || event.ctrlKey)
                ) {
                  event.preventDefault()
                  saveLetter()
                }
              }}
            />
          ) : (
            <div
              className="galactic__letter"
              onClick={startEditingLetter}
              title="Toca el texto para escribir tu propio mensaje"
            >
              {customLetter ? (
                <div className="galactic__letter-custom">{customLetter}</div>
              ) : (
                <>
                  <div className="sr-only">
                    <p>{gift.letter.greeting}</p>
                    {gift.letter.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                    <p>{gift.letter.signature}</p>
                    <p>{gift.letter.ps}</p>
                  </div>

                  <div className="galactic__letter-typed" aria-hidden="true">
                    {typed.map((chunk, index) => (
                      <p className={paragraphClass(index)} key={index}>
                        {chunk}
                        {!letterComplete && index === typed.length - 1 ? (
                          <span className="galactic__caret" />
                        ) : null}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <p className="galactic__letter-hint">
            {editingLetter
              ? 'Escribe tu mensaje. Se guarda en este dispositivo.'
              : 'Toca el texto para escribir tu propio mensaje'}
          </p>

          <div className="galactic__card-actions">
            {!letterComplete ? (
              <button
                type="button"
                className="galactic__ghost"
                onClick={letter.finish}
              >
                {gift.letter.typingLabel}
              </button>
            ) : null}
            {editingLetter ? (
              <button
                type="button"
                className="galactic__ghost"
                onClick={saveLetter}
              >
                Guardar mensaje
              </button>
            ) : (
              <button
                type="button"
                className="galactic__ghost"
                onClick={startEditingLetter}
              >
                Editar mensaje
              </button>
            )}
            {customLetter && !editingLetter ? (
              <button
                type="button"
                className="galactic__ghost"
                onClick={resetLetter}
              >
                Restaurar mensaje
              </button>
            ) : null}
            <button
              type="button"
              className="galactic__ghost"
              onClick={savePostcard}
            >
              {gift.moments.postcardLabel}
            </button>
          </div>

          <small>23 · 11 · 2026 · Hecho con el corazón</small>
        </div>
      </div>
    </div>
  )
}
