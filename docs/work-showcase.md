# Portfolio con índice y fichas de proyecto

Implementación del 20 de noviembre de 2026 a partir de las referencias elegidas: [Studio Size](https://studio-size.com/work/) para el índice y [Granola de Ragged Edge](https://raggededge.com/partnerships/granola) para la ficha y la curvatura inferior de las imágenes. Alcance corregido explícitamente por el usuario: únicamente `/trabajos/`, `/en/work/` y sus fichas. La landing conserva intactos su recorrido Trionn, Coverflow táctil y equipo. No se alteran sus componentes, escenas ni animaciones, ni los tokens globales.

El índice comparte `WorkGallery.astro` entre `/trabajos/` y `/en/work/`. Usa tres columnas en escritorio, dos en tablet y una en móvil, con filtros de contenido, web y sistemas. Cada proyecto muestra rubro y servicios. Sin JavaScript se ven todos y los enlaces siguen funcionando. No se importa desde la landing.

Las seis fichas estáticas se generan desde `src/lib/projects.ts`, en `/trabajos/[project]/` y `/en/work/[project]/`. `WorkDetailPage.astro` presenta contexto, problema, propuesta, visuales y alcance, con capítulos y navegación al siguiente proyecto. La vuelta guarda un enlace a la posición del proyecto de origen. El selector de idioma conserva la ficha y el fragmento. Los títulos y subtítulos no llevan punto final.

## Contenido

Los tres ejemplos existentes siguen siendo estudios conceptuales. No se publican identidades de clientes, resultados, testimonios ni destinos externos inventados. Los enlaces web, Instagram y otros se añaden a `projectDetails[type].links` únicamente con destinos reales suministrados. El bloque de enlaces no se muestra cuando está vacío.

`public/work/` contiene capturas de los mockups HTML/CSS originales y paneles tipográficos en español e inglés. No contienen imágenes de las agencias de referencia. `scripts/generate-work-previews.mjs` los vuelve a generar usando el servidor local en el puerto 4321 y elimina sus rutas temporales al finalizar. Cada PNG lleva su origen en metadatos; al regenerarlos debe conservarse ese origen.

## Movimiento y respaldos

La imagen del índice y la portada de su ficha comparten un nombre de View Transition. Los navegadores compatibles expanden el preview al navegar entre documentos; el resto conserva navegación HTML normal. La navegación de proyectos evita la transición circular del menú, que sigue disponible para las demás rutas.

`work-curve.ts` presenta las imágenes visibles mediante OGL. El fragment shader desplaza el muestreo horizontal progresivamente en el borde inferior del viewport. El scroll sigue siendo nativo y solo programa un dibujo cuando cambia la posición, el tamaño, la visibilidad o el filtro. El canvas compone por encima de las barras fijas y recorta esa zona explícitamente para evitar cortes por oclusión del compositor. El botón de WhatsApp permanece encima. No hay un bucle permanente de renderizado.

Las imágenes HTML conservan espacio, texto alternativo y carga nativa. Movimiento reducido, colores forzados, entrada táctil, falta o pérdida de WebGL, y ausencia de JavaScript muestran las imágenes normales. Los recursos gráficos y observadores se liberan al salir; la caché de navegación los restaura al volver.

## Validación

`tests/e2e/portfolio-reveal.spec.ts` comprueba filtros y teclado, las tres composiciones responsivas, navegación de fichas e idiomas, View Transitions en Chromium, pérdida de contexto y movimiento reducido, navegación sin JavaScript y reversibilidad del hold del equipo. Los respaldos se prueban también en Firefox; no se atribuye a Firefox una comprobación del zoom nativo ni de WebGL.

`scripts/work-showcase-audit.mjs` captura escritorio de 1440 px, tablet de 820 px y móvil de 390 px, detalle, filtros, hover, tema oscuro y efecto real. Las capturas completas usan las imágenes HTML para no confundir una capa fija de un viewport con el documento entero. La curvatura se verifica en una captura independiente del viewport. Evidencia en `.impeccable/review/work-showcase/`. La antigua captura `desktop-home-work.png` fue invalidada por la corrección de alcance y no representa el resultado final.

El build genera y verifica las 16 páginas públicas de la navegación y del portfolio. El test unitario preexistente de favicon espera un azul que el SVG actual no contiene; ni ese SVG ni ese test se modificaron en este trabajo.
