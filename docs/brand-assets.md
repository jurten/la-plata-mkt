# Logo y tipografías de LPM

Fuentes de la actualización: `LPM_Guia_de_marca.html` (edición 02, noviembre de 2026), `LPM_Foto_de_perfil.png` y el catálogo de referencia `LPM_Iconografia.xlsx`, suministrados por el usuario. El alcance solicitado es actualizar logo y tipografías de la web.

## Assets oficiales

- `public/brand/lpm-logo.svg`: trazado vectorial `lpm` extraído sin cambios del HTML de la guía; viewBox original `0 0 1154 752`. Incluye las siglas, los cortes interiores y el contorno como una unidad. No se redibujó ni se inclinó el dibujo.
- `public/brand/lpm-profile.png`: copia binaria intacta de la foto de perfil suministrada. SHA-256: `3022fa84bb2ca228d80b76b699bdf3fb09b7389beb3bcfec6c85ea7967d367e8`.
- `BrandLogo.astro`: firmas horizontal, apilada y compacta que usan el mismo vector. El descriptor es texto en IBM Plex Mono Medium. La firma del encabezado se compacta en móvil.
- `scripts/generate-favicon.py`: empaqueta la imagen de perfil en ICO de 16, 32, 48 y 64 px, y genera el favicon SVG con el mismo trazado oficial sobre azul. No conserva el monograma L/ anterior.
- `scripts/generate-og.mjs`: reproduce la vista previa de enlaces con el logo y las cuatro familias actuales mediante fuentes locales.

## Roles tipográficos

| Rol | Familia | Peso / estilo |
| --- | --- | --- |
| Titulares y mensajes principales | Radio Canada Big | Bold, 700 |
| Apoyos secundarios | Radio Canada Big | Medium, 500 |
| Lectura y controles | IBM Plex Sans | Regular / Semibold, 400 / 600 |
| Descriptor de marca | IBM Plex Mono | Medium, 500 |
| Etiquetas, estados y datos | IBM Plex Mono | Regular / Medium, 400 / 500 |
| Énfasis editorial | Newsreader | Itálica, 400 |

Los dos TTF de Radio Canada Big se extrajeron de los `@font-face` embebidos en la guía y se sirven desde `src/assets/fonts/`. El archivo de licencia conserva el copyright y la URL de licencia incluidos en sus metadatos. IBM Plex y Newsreader se sirven desde las dependencias Fontsource locales ya presentes; no se agregaron solicitudes a Google Fonts ni otra CDN.

La actualización conserva el alien 3D, el CRT de toda la hero, el rayo, la barra transparente y el funcionamiento existente.

## Verificación

- 79 pruebas unitarias y 21 de navegador pasaron, incluidas accesibilidad y contraste de home/privacidad en ambas apariencias, foco, navegación y layout.
- El chequeo visual cargó las fuentes reales y comprobó ausencia de desbordes en 320, 390, 768, 900, 1024, 1440 y 1920 px. La hero conserva su origen vertical y la navegación transparente.
- Evidencia local: `artifacts/brand-update/`. Las capturas de portada muestran el alien realmente cargado; los assets generados se inspeccionaron por separado.
