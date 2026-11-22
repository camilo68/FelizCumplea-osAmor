# Pingüino Galáctico 🐧✨ · Regalo para Karen

Una experiencia web interactiva 3D a pantalla completa: una huella que se escanea con el dedo, una galaxia que nace de ella, un pingüino guía (**Pingu**) y un final con carta, música y explosión de partículas en forma de corazón.

## Características

- **Escaneo de huella:** Al presionar y mantener la huella en pantalla, se inicia el viaje galáctico.
- **Pingu, el pingüino guía:** Un personaje 3D procedural creado con Three.js que acompaña el recorrido, habla con bocadillos y reacciona con distintas poses (saludo, corazón, entrega de carta).
- **Galaxia de partículas:** Miles de estrellas que orbitan suavemente en el espacio tridimensional.
- **Frases en órbita:** Textos románticos flotando alrededor del recorrido.
- **Música:** Reproduce `cancion.mp3` si está presente, o genera una melodía de cajita de música romántica.
- **Carta de amor y final:** Entrega de sobre y carta interactiva para Karen, culminando con un corazón gigante de partículas brillantes.

## Cómo personalizar

Todo el contenido y los textos se personalizan en el bloque `CONFIG` dentro de [`index.html`](index.html):

- `CONFIG.guide`: Nombre del guía (`Pingu`).
- `CONFIG.title`: Título principal (`Feliz Cumpleaños, Karen 💗`).
- `CONFIG.scanTitle`: Texto de inicio (`Pon tu dedo para entrar`).
- `CONFIG.phrases`: Lista de frases que flotan en la galaxia.
- `CONFIG.stops`: Diálogos y paradas del recorrido de Pingu.
- `CONFIG.letter`: El texto completo de la carta de amor.
- `CONFIG.song`: Letra y título de la canción.

## Desarrollo

```powershell
npm run dev
```

Abre `http://localhost:5173`.

## Producción

```powershell
npm run build
```

Genera los archivos listos para desplegar en `dist/`.
