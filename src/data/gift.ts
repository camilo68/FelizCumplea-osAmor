/**
 * ─────────────────────────────────────────────────────────────
 *  KM-23 · «La galaxia de lo que siento»
 *  ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS EDITAR PARA PERSONALIZAR
 *  EL REGALO. Todo lo demás es diseño y funciona solo.
 * ─────────────────────────────────────────────────────────────
 */

export type Emotion = {
  number: number
  /** Nombre corto de la emoción. */
  name: string
  /** Color con el que brilla en la galaxia. */
  color: string
  /** Frase que resume la emoción. */
  oneLiner: string
  /** Lo que quieres decirle. */
  text: string
}

export type Orbit = {
  number: string
  date: string
  title: string
  text: string
}

export type Credit = {
  role: string
  value: string
}

export const gift = {
  /* ── Ella ─────────────────────────────────────────────────── */
  her: {
    name: 'Karen',
    nicknames: ['mi amor', 'mi vida hermosa', 'mami', 'mamacita hermosa'],
    age: 23,
    birthYear: 2003,
    // Fecha del cumpleaños que celebra esta galaxia (formato AAAA-MM-DD).
    birthday: '2026-11-23',
    birthdayLabel: '23 de noviembre',
  },

  /* ── Ustedes ──────────────────────────────────────────────── */
  us: {
    // Si sabes la hora exacta, cámbiala aquí: '2026-05-17T19:30:00'.
    startedAt: '2026-05-17T00:00:00',
    startedLabel: '17 de mayo de 2026',
    // Firma de la carta. Escribe tu nombre o cómo te gusta que te llame.
    signatureName: '',
  },

  /* ── Momentos vivos ───────────────────────────────────────── */
  moments: {
    daysLabel: 'días eligiéndonos',
    daysSince: 'Desde el 17 de mayo de 2026',
    daysMessage:
      'Cada uno de estos días te volví a elegir. Y pienso seguir sumando.',
    daysToast: 'Desde el 17 de mayo de 2026, sin saltarme un solo día.',
    birthdayRibbon: 'Feliz cumpleaños, mi amor',
    birthdaySub: '23 · 11 · 2026 · El universo celebra que naciste',
    specialMinute: '23:23 · la hora en que todo se alinea',
    specialMinuteToast:
      '23:23. La misma hora, el mismo día, la misma persona: tú. Te amo, Karen.',
    secretWord: 'karen',
    secretToast:
      'Escribiste mi nombre favorito. El universo entero se encendió. Te amo, Karen.',
    postcardLabel: 'Guardar postal',
    postcardCaption: 'Para Karen, desde nuestra galaxia',
    postcardSaved: 'Postal guardada en tu galería',
    daysTitle: 'Lo que llevamos',
  },

  /* ── La galaxia ───────────────────────────────────────────── */
  galaxy: {
    designation: 'KM-23',
    name: 'La galaxia de lo que siento',
    year: '2026',
    kicker: 'Un regalo hecho de polvo de estrellas para',
    nameLine: 'Karen',
    ageLine: '23',
    gateNote:
      'No es un álbum, ni una carta, ni una página con secciones. Es una galaxia entera: 23 emociones girando alrededor de ti, y un núcleo que late con todo lo que no sé decir en voz alta.',
    gateTeaser: 'TOCA EL CORAZÓN',
    gateHint: 'Al tocarlo, todo empieza a girar.',
    withMusic: 'Encender con música',
    silent: 'Entrar en silencio',
    heroEyebrow: 'KM-23 · Galaxia de Karen',
    heroTitle: 'La espiral de lo que siento',
    heroSub:
      'Cada estrella es una emoción. Tócala y la galaxia te va a contar por qué te amo.',
    heroHint: 'Empieza por el centro: ahí vive todo lo demás.',
    scroll: 'Desciende por la espiral',
    progressLabel: 'Emociones descubiertas',
    counterLabel: 'Tiempo en órbita',
    counterHint: 'Desde el 17 de mayo de 2026, todo gira distinto.',
    resetLabel: 'Reiniciar la galaxia',
    resetConfirm: 'Se apagarán las estrellas descubiertas. ¿Empezar de nuevo?',
    resetDone: 'La galaxia volvió a empezar.',
    completeTitle: 'Galaxia completa',
    completeText:
      'Descubriste las 23 emociones. En el borde de la espiral se encendió una última estrella.',
    bonusLabel: 'Estrella 24',
    bonusLocked: 'Se enciende al descubrir las 23 emociones',
    bonusOpen: 'Ir a la estrella 24',
    rulerNote: '23 emociones · 1 espiral · 1 persona',
  },

  /* ── Brazos de la galaxia (aside de amor profundo) ────────── */
  deepLove: [
    {
      badge: 'Brazo 01 · Núcleo',
      meta: '17 · 05 · 2026 · donde empezó todo',
      title: 'Lo que no cabe en una vida',
      text: 'Hay un amor mío que no sabe de distancias ni de relojes. Es el que se queda cuando todo se apaga, el que te elige sin pedir nada a cambio. Karen, si algún día dudas de cuánto te quiero, mira esta galaxia: cada brazo de luz es una forma de decirte que te amo, y aun así se queda corta.',
    },
    {
      badge: 'Brazo 02 · Órbita',
      meta: 'Todos los días · elegirte otra vez',
      title: 'El centro de todo',
      text: 'Antes de ti mi mundo era una colección de días sueltos. Llegaste y les diste un centro. Ahora todo gira alrededor de lo que siento por ti: mi calma, mis planes, mis ganas de ser mejor. No eres una parte de mi vida; eres la razón por la que las partes tienen sentido.',
    },
    {
      badge: 'Brazo 03 · Borde',
      meta: '23 · 11 · 2026 · hoy y siempre',
      title: 'Sin fecha de caducidad',
      text: 'Te amo en los días bonitos y en los difíciles, cuando reímos y cuando el silencio pesa. Te amo sin condiciones, sin medida y sin fecha de caducidad. Mi amor por ti es lo más grande que he construido, y lo único que quiero seguir construyendo todos los días de mi vida.',
    },
  ],

  /* ── Las 23 emociones de la espiral ───────────────────────── */
  emotions: [
    {
      number: 1,
      name: 'Amor',
      color: '#ff8fa8',
      oneLiner: 'El origen de todo',
      text: 'Antes de ti yo era un montón de estrellas sueltas. Llegaste y les diste una órbita. Si esta galaxia existe, es porque tú decidiste quedarte en el medio.',
    },
    {
      number: 2,
      name: 'Alegría',
      color: '#ffd166',
      oneLiner: 'Tu risa, mi gravedad',
      text: 'Hay una versión de mí que solo aparece cuando te ríes: la que no necesita nada más. Tu risa es la luz más joven de esta galaxia, la que nunca termina de nacer.',
    },
    {
      number: 3,
      name: 'Calma',
      color: '#8de8d4',
      oneLiner: 'El silencio que descansa',
      text: 'Contigo el silencio dejó de ser un lugar vacío. Es donde apoyo la cabeza, donde el mundo baja el volumen y todo, por fin, está bien.',
    },
    {
      number: 4,
      name: 'Nostalgia',
      color: '#b79bff',
      oneLiner: 'Los días que ya extraño',
      text: 'Extraño cosas que todavía no han pasado y cosas que acaban de pasar. Contigo hasta la nostalgia es una forma rara de la gratitud.',
    },
    {
      number: 5,
      name: 'Admiración',
      color: '#ffb07a',
      oneLiner: 'Tu fuerza, sin ruido',
      text: 'Te he visto levantarte en días que a mí me habrían tumbado. No haces ruido cuando eres fuerte, y por eso admiro todavía más cómo sigues.',
    },
    {
      number: 6,
      name: 'Ternura',
      color: '#f7a8c8',
      oneLiner: 'La forma en que cuidas',
      text: 'Tienes una manera de cuidar que se nota en los detalles pequeños. Aprendí a querer mejor viéndote querer a los tuyos.',
    },
    {
      number: 7,
      name: 'Deseo',
      color: '#ff6b8a',
      oneLiner: 'Querer verte otra vez',
      text: 'No es solo querer estar contigo: es que, cuando no estás, el día tiene una parte que falta. Y no hay distancia que no quiera acortar por ti.',
    },
    {
      number: 8,
      name: 'Gratitud',
      color: '#ffd479',
      oneLiner: '17 de mayo',
      text: 'Ese día no sabía que le estaba dando la vuelta a mi vida. Gracias por aparecer sin avisar y por hacerlo tan bien.',
    },
    {
      number: 9,
      name: 'Paciencia',
      color: '#9ad1ff',
      oneLiner: 'La tuya conmigo',
      text: 'Me has tenido paciencia en mis días raros, en mis silencios, en mis vueltas. Y nunca me has hecho sentir que sobro.',
    },
    {
      number: 10,
      name: 'Orgullo',
      color: '#c9f07d',
      oneLiner: 'Verte crecer',
      text: 'Me enorgullece quién eres y quién estás siendo. Verte crecer es una de las cosas más bonitas que me ha tocado ver de cerca.',
    },
    {
      number: 11,
      name: 'Confianza',
      color: '#7fe0c3',
      oneLiner: 'Mi persona',
      text: 'Eres la primera persona a la que quiero contarle las cosas buenas. Y la única a la que no me da miedo contarle las malas.',
    },
    {
      number: 12,
      name: 'Ilusión',
      color: '#ffc2e2',
      oneLiner: 'Todo lo que viene',
      text: 'Me emocionan los planes que todavía no tienen fecha. Contigo el futuro no asusta: se antoja.',
    },
    {
      number: 13,
      name: 'Juego',
      color: '#ffa94d',
      oneLiner: 'Lo tonto de nosotros',
      text: 'Nuestras tonterías tienen idioma propio. Nadie más entendería por qué nos reímos, y eso es justo lo que más me gusta.',
    },
    {
      number: 14,
      name: 'Refugio',
      color: '#a8c6ff',
      oneLiner: 'Donde se está bien',
      text: 'No necesito un lugar en el mundo: necesito el lugar que haces tú cuando te acercas. Contigo todo se siente casa.',
    },
    {
      number: 15,
      name: 'Valentía',
      color: '#ff9f68',
      oneLiner: 'La que no se rinde',
      text: 'Admiro cómo te levantas cuando el día viene torcido. Y aunque a veces no veas tu propia fuerza, yo la veo todos los días.',
    },
    {
      number: 16,
      name: 'Perdón',
      color: '#d3b8ff',
      oneLiner: 'Sin rencor',
      text: 'Sabes perdonar sin guardar la cuenta. Eso, que parece pequeño, es de las cosas más grandes que tiene tu corazón.',
    },
    {
      number: 17,
      name: 'Esperanza',
      color: '#9be8ff',
      oneLiner: 'Todo lo que falta',
      text: 'Hay tanto que todavía no hemos vivido. Y solo de pensarlo me dan ganas de tener razón en esto: quiero vivirlo contigo.',
    },
    {
      number: 18,
      name: 'Pertenencia',
      color: '#ffb3c7',
      oneLiner: 'Mi lugar',
      text: 'No es que te necesite para estar completo: es que contigo me reconozco. Eres el lugar donde soy yo sin tener que explicarme.',
    },
    {
      number: 19,
      name: 'Desvelo',
      color: '#8f9bff',
      oneLiner: 'Nuestras madrugadas',
      text: 'Se nos va la hora hablando de todo y de nada. Esas madrugadas son mi parte favorita del día, aunque al día siguiente duela.',
    },
    {
      number: 20,
      name: 'Melancolía',
      color: '#c0a3ff',
      oneLiner: 'La distancia',
      text: 'Hay días en que la distancia pesa más de lo que digo. Pero incluso a kilómetros, siempre encuentro la forma de volver a ti.',
    },
    {
      number: 21,
      name: 'Curiosidad',
      color: '#ffd98a',
      oneLiner: 'Tu cabeza',
      text: 'Me encanta cómo piensas, las ideas que se te ocurren, la forma en que ves el mundo. Contigo nunca termino de conocerte, y eso es un regalo.',
    },
    {
      number: 22,
      name: 'Devoción',
      color: '#ff7aa8',
      oneLiner: 'Te elijo',
      text: 'No es una promesa de día bonito: es la decisión de quedarme también en los otros. Te elijo, y lo volvería a hacer todos los días.',
    },
    {
      number: 23,
      name: 'Infinito',
      color: '#f5ecd9',
      oneLiner: 'Lo que no cabe',
      text: 'No existen 23 emociones: existen infinitas. Estas son solo las que alcancé a dibujar en una espiral. Las demás se las dejo al tiempo, contigo.',
    },
  ] satisfies Emotion[],

  /* ── Órbitas / momentos ───────────────────────────────────── */
  orbits: {
    eyebrow: 'Coordenadas de la galaxia',
    title: 'Las órbitas que nos trajeron aquí',
    subtitle:
      'No todos los momentos tienen fecha exacta, pero todos movieron algo. Esta es la ruta que sigue la espiral cuando la recuerdo.',
    notes: [
      {
        number: '01',
        date: '17 de mayo de 2026',
        title: 'El Big Bang',
        text: 'No sabía que una conversación podía cambiarme el calendario para siempre. Ese día empezó todo, sin hacer ruido.',
      },
      {
        number: '02',
        date: 'El primer «mi amor»',
        title: 'La primera órbita',
        text: 'No lo planeé. Simplemente salió, y contigo sonó como si siempre hubiera estado ahí.',
      },
      {
        number: '03',
        date: 'Nuestras madrugadas',
        title: 'Cuando el mundo se apaga',
        text: 'Esas horas en las que todo duerme y nosotros seguimos hablando de la vida, de miedos y de todo lo que viene.',
      },
      {
        number: '04',
        date: 'Sin fecha exacta',
        title: 'La certeza',
        text: 'No hubo una frase ni un momento épico. Solo una certeza tranquila de que quería que estuvieras en todos mis planes.',
      },
      {
        number: '05',
        date: 'Todos los días',
        title: 'Mantener la órbita',
        text: 'Incluso en los días grises, en la distancia y en las diferencias, sigues aquí. Eso lo cambia todo.',
      },
      {
        number: '06',
        date: '23 de noviembre de 2026',
        title: 'Tus 23',
        text: 'El día que el universo celebra que naciste. Y yo celebro la suerte enorme de tenerte.',
      },
    ] satisfies Orbit[],
    footNote:
      'Esta galaxia no tiene fotos. Tiene memoria, paciencia y todo lo que no supe decir en voz alta.',
  },

  /* ── Núcleo / carta ───────────────────────────────────────── */
  letter: {
    eyebrow: 'El corazón de la espiral',
    title: 'El núcleo',
    intro:
      'Hay cosas que se dicen mejor despacio. Abre el núcleo de la galaxia, tómate tu tiempo: esto también se escribió despacio.',
    openLabel: 'Abrir el núcleo',
    greeting: 'Mi Karen, mi amor, mi vida hermosa:',
    paragraphs: [
      'Hoy cumples 23 años y llevo días pensando cómo decirte todo esto sin que suene pequeño. Porque lo que siento por ti no cabe en una nota, ni en una galaxia, ni en 23 emociones; pero quería intentarlo.',
      'Este regalo no tiene fotos nuestras. Y aun así, tengo mil recuerdos tuyos guardados: tu risa, tus buenos días, la forma en que dices mi nombre, esas conversaciones de madrugada en las que se nos va la hora sin darnos cuenta. No necesito una foto para recordarte; te tengo presente todo el tiempo.',
      'Gracias por llegar el 17 de mayo y por quedarte. Gracias por elegirme incluso cuando no soy fácil, por tu paciencia, por tu ternura y por esa forma tan tuya de hacerme sentir en casa.',
      'No sé qué nos depare el futuro, pero sí sé que quiero construirlo contigo: los días ordinarios, los planes grandes, las peleas tontas y las reconciliaciones. Quiero estar en tus 24, en tus 25 y en todos los cumpleaños que vengan.',
      'Hoy solo quiero verte sonreír. Quiero que sepas que eres lo mejor que me ha pasado y que este regalo, aunque hecho con código, está hecho con el corazón.',
      'Feliz cumpleaños, mami. Te amo con todo lo que soy y con todo lo que todavía quiero ser.',
    ],
    signature: 'Tuyo, siempre',
    ps: 'P.D. Vuelve a esta galaxia cada vez que necesites recordar cuánto te amo. Y si quieres, enciende la música mientras la lees.',
    typingLabel: 'Mostrar toda la carta',
    completeLabel: 'La carta llegó al final de la espiral.',
  },

  /* ── Estrella oculta ──────────────────────────────────────── */
  secret: {
    badge: 'Estrella 24 · Oculta',
    label: 'La estrella que no tenía nombre',
    title: '«Para ti»',
    text: 'Si llegaste hasta aquí, ya descubriste las 23 emociones. Pero hay una que no cabe en ninguna estrella: te amo completa, con tus días buenos y los difíciles, con tu risa y tus silencios. No hay lista que alcance ni galaxia que te contenga. Feliz cumpleaños, mi amor. Te amo infinito.',
    signature: 'Siempre tuyo.',
    hint: 'Esta estrella está escondida en el borde de la espiral, pero es tuya. Vuelve a ella cuando quieras.',
    locked: 'Se enciende al descubrir las 23 emociones',
    unlocked: 'Encender la estrella 24',
    complete: 'Galaxia completa',
    completeText:
      'Descubriste las 23 emociones. En el borde de la espiral se encendió una última estrella.',
    close: 'Volver a la galaxia',
  },

  /* ── Borde exterior / final ───────────────────────────────── */
  finale: {
    eyebrow: 'Borde exterior · Fin de la espiral',
    title: 'Sigue orbitando',
    name: 'Feliz cumpleaños, Karen',
    subtitle: 'Esto no termina aquí. La galaxia sigue girando todos los días.',
    quote:
      'Si tuviera que elegir un lugar en el universo, elegiría siempre el que esté contigo.',
    restart: 'Volver a encender la galaxia',
    secretLabel: 'Ir a la estrella oculta',
    madeWith: 'Hecho a mano, con amor y un poco de polvo de estrellas.',
    backNote: 'Hecho para volver a mirarse.',
    creditsTitle: 'Créditos de la galaxia',
    credits: [
      { role: 'Gravedad', value: 'Karen' },
      { role: 'Luz', value: 'Tu risa' },
      { role: 'Materia oscura', value: 'Todo lo que no digo' },
      { role: 'Órbitas', value: '17 de mayo — 23 de noviembre' },
      { role: 'Paciencia', value: 'La tuya, sobre todo' },
      { role: 'Agradecimientos', value: 'Por existir y dejarte querer' },
    ] satisfies Credit[],
    coordinate: '23° 17′ 05″ · 2026',
    visitsLabel: 'Visita número',
    visitsFirst: 'Primera vez en esta galaxia',
    barcodeNote: 'KM-23 · 1 de 1 · Hecho en casa',
  },
} as const
