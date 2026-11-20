# Trabajos y detalle de proyecto

Modo: Experience. Referencias elegidas por el usuario: Studio Size /work/ para el índice y Ragged Edge /partnerships/granola para el detalle. La selección más reciente fija la grilla visual de Studio Size, con una columna en móvil. Se conservan marca, fuentes y los tres estudios conceptuales existentes, sin publicar identidades ni resultados de clientes.

ALCANCE CORREGIDO POR EL USUARIO: únicamente `/trabajos/`, `/en/work/` y sus fichas. La landing `/` y `/en/` queda intacta, incluidos PortfolioReveal, ConceptPreview, sus estilos, animaciones, Trionn, Coverflow y el equipo. Los cambios iniciales que afectaban a la landing se revirtieron. No compartir el nuevo WorkGallery con HomePage o PortfolioReveal.

## Direction contract

THESIS: Explorar trabajos por su imagen y servicio, y entrar en una ficha editorial completa desde el mismo preview.

OWN-WORLD: Fondo y tipografía de LPM, azul cobalto, cielo y tinta de los tres conceptos. Imágenes abiertas, sin contenedores anidados. Filtros discretos y lectura amplia.

STORY: Identificar el rubro y los servicios, abrir el concepto, entender el problema y la propuesta, y seguir los enlaces disponibles o volver al índice.

FIRST VIEWPORT: Título amplio a la izquierda, filtros a la derecha, tres previews del mismo tamaño debajo; nombre, rubro y servicios visibles. En detalle, nombre y título grandes seguidos de un preview a todo el ancho y capítulos de lectura.

FORM: Composición elegida por referencias explícitas, construida directamente. Zoom entre documentos con View Transitions nativas; navegación convencional como respaldo. seed: none (unavailable). La captura del usuario identifica la curvatura de las imágenes en el borde inferior del viewport. Se reproduce con un fragment shader WebGL que transforma el muestreo de cada imagen en coordenadas del viewport, sin intervenir el scroll. Se desactiva con movimiento reducido, colores forzados y entrada táctil, conservando las imágenes HTML.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Cierre de la revisión

Veredicto del finish reviewer: ship, después de corregir la indicación de hover y volver a capturar el filtro asentado. Se revisaron las referencias y las once capturas de escritorio, tablet y móvil. El efecto real se verificó por separado de las capturas completas del flujo HTML.

La condición documental de FINISH se resuelve como extensión local del sistema existente: se conserva DESIGN.md y sus tokens globales, y la documentación de esta sección queda en docs/work-showcase.md y en esta surface brief. La elección actual aplica solo al índice independiente de Trabajos; Trionn y Coverflow continúan en la landing. Los doce PNG publicados contienen el origen de los visuales propios de LPM. No hay un nuevo mundo visual ni un nuevo sistema global que documentar. La captura previa desktop-home-work.png queda invalidada por la corrección de alcance.
