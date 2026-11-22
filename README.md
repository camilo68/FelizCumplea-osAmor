# TE AMO ❤️ · Corazón Galáctico

Un regalo a pantalla completa para Karen: un corazón de partículas late dentro de una galaxia 3D, rodeado de frases que orbitan, una carta, música y dos versiones de la misma escena.

- **Corazón Galáctico**: 3 brazos espirales reales. Al tocar cualquiera de ellos se abre un panel lateral con un mensaje de amor profundo.
- **Galaxia simple**: la misma escena en tonos azules, con tarjetas de fotos que se pueden subir desde el dispositivo.
- **Frases en órbita** alrededor del corazón, con giro por arrastre, zoom con la rueda y corazones al tocar.
- **Carta** con efecto de escritura, firma y botón para guardar una postal PNG de la galaxia.
- **Música ambiental** sintetizada en el navegador (sin archivos) y botón de silencio.
- **Contador vivo**: los días desde el 17 de mayo de 2026, calculados en hora local.
- **Modo cumpleaños**: el 23 de noviembre la portada se viste de celebración; a las 23:23 se dispara una lluvia de corazones.
- **Huevo de pascua**: escribe `karen` con el teclado y la galaxia celebra.

## Personalizar

Casi todo el contenido vive en [`src/data/gift.ts`](src/data/gift.ts):

- `her`: nombre, apodos, edad y fecha del cumpleaños.
- `us`: fecha en que empezó todo y firma de la carta.
- `deepLove`: los 3 mensajes de los brazos (título, fecha y texto).
- `letter`: saludo, párrafos, firma y posdata.
- `moments`: textos del contador, cumpleaños, postal y huevo de pascua.
- `music.src`: opcional. Si algún día quieres una canción real, colócala en `public/music/` y escribe la ruta; si se deja vacío suena el ambiente generado.

Los títulos y frases de cada versión están en [`src/components/galactic/scenes.ts`](src/components/galactic/scenes.ts).

Las tipografías manuscritas (`Great Vibes` y `Caveat`) están autoalojadas en `public/fonts/`, así que el regalo funciona sin internet.

No hay fotos fijas: en la versión simple las fotos se suben desde el propio móvil y giran alrededor del corazón.

## Ver el cumpleaños antes de tiempo

La escena cambia sola el 23 de noviembre, pero se puede previsualizar:

- `http://localhost:5173/?momento=cumple` — cinta de cumpleaños y 190 días.
- `http://localhost:5173/?momento=2323` — además, el minuto especial con lluvia de corazones.

## Desarrollo

```powershell
npm install
npm run dev
```

Abre `http://localhost:5173`.

El backend (opcional, solo para el contador de visitas) vive en `..\FelizCumplea-osAmor-app` y se ejecuta en `http://localhost:5080`. Vite ya tiene el proxy `/api` configurado; sin backend, el regalo funciona igual.

```powershell
npm run build
```

Genera `dist/`.

## Servir todo desde el backend

```powershell
npm run build
Remove-Item -Recurse -Force "..\FelizCumplea-osAmor-app\regaloAmor\regaloAmor\wwwroot\*" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force ".\dist\*" "..\FelizCumplea-osAmor-app\regaloAmor\regaloAmor\wwwroot"
```

Después, desde la carpeta del backend:

```powershell
dotnet run --project regaloAmor/regaloAmor/regaloAmor.csproj
```

Y abre `http://localhost:5080`.

## Detalles técnicos

- Vite + React 19 + TypeScript. El build se verifica con `tsc -b && vite build`.
- Motor de canvas en [`src/components/galactic/engine.ts`](src/components/galactic/engine.ts): proyección 3D, brazos espirales, corazón de partículas, órbitas y detección del brazo tocado.
- Interfaz y estados en [`src/components/GalacticHeart.tsx`](src/components/GalacticHeart.tsx).
- Fechas y modo cumpleaños en [`src/lib/moments.ts`](src/lib/moments.ts); efecto de escritura en [`src/components/galactic/useTypewriter.ts`](src/components/galactic/useTypewriter.ts).
- Música en [`src/lib/ambient.ts`](src/lib/ambient.ts): acordes, campanillas y filtro pasa-bajos con Web Audio API.
- La postal se genera desde el propio canvas y se descarga como PNG de 1080 × 1350.
- Accesibilidad: `Escape` cierra el panel y la carta, el foco se mueve al botón de cerrar, los 3 brazos tienen botones ocultos para teclado y lectores de pantalla, y se respeta `prefers-reduced-motion`.
- Los componentes antiguos de KM-23 siguen en `src/` pero ya no se importan; la entrada es solo `GalacticHeart`.
