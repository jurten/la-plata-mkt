# Rediseño de Nosotros

Alcance: `/nosotros/` y `/en/about/`. Modo Persuade. La landing `/` y `/en/`, sus componentes, estilos y animaciones quedan intactos.

## Direction contract

THESIS: tres miradas que se encuentran, presentadas a través de valores compartidos y retratos con espacio propio. Sustituye el índice de marquesinas y los retratos duplicados exclusivamente en esta página.

OWN-WORLD: tipografías oficiales, cobalto y superficies de lectura existentes. Tres campos oscuros contienen geometrías blob azules; las fotos originales se conservan rectangulares y sin recortes orgánicos.

STORY: conocer los valores, reconocer a las tres personas, entender el método y abrir una conversación. Los valores definidos por el usuario son combinar miradas, entender el problema del cliente y articular distintas áreas para construir soluciones profesionales; se expresan en español e inglés.

FIRST VIEWPORT: apertura tipográfica, introducción a valores y tres imágenes geométricas en columnas. Texto fuera de las imágenes, como en Koto. Equipo con título lateral y dos columnas de retratos verticales, nombres y roles debajo, como en Monopo.

FORM: composición elegida explícitamente por el usuario, Koto para valores y Monopo para equipo; geometrías más blob por indicación posterior. Implementación directa en código. seed: none (user-selected references).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Fuentes

- https://koto.com/about: referencia de disposición visual. El contenido de valores fue sustituido posteriormente por la definición propia de LPM suministrada por el usuario.
- https://monopo.london/team/: título lateral, dos columnas de retratos rectangulares e información debajo.
- Fotos: archivos originales existentes en `public/team/`, sin edición ni generación de nuevas identidades.

## Implementación

`AboutPage.astro` deja de cargar el índice de marquesinas y su retención de scroll en estas rutas. Los componentes originales de la landing no se modifican. `about-page.css` concentra los estilos nuevos bajo nombres exclusivos; las excepciones a `.team-profile` están limitadas por `.about-page`. Las traducciones son entradas nuevas, sin cambios en textos existentes.

Los blobs actuales usan geometría procedural y el mismo shader de distorsión de la hero, sin imágenes descargadas, modelos ni bibliotecas nuevas. El flujo lento se suspende fuera de pantalla, al ocultar la pestaña y con movimiento reducido o colores forzados. El botón de pausa se eliminó por pedido del usuario. Sin JavaScript, los valores y fotos siguen presentes con blobs CSS estáticos. Detalle y validación del refinamiento en `docs/about-value-blobs.md`.

## Validación

- Auditoría `node scripts/audit-about-page.mjs`: 16 combinaciones de idioma, tema y ancho; español a 320, 390, 768, 1024, 1440 y 1920 px, inglés a 390 y 1440 px. Sin desbordes, títulos recortados, puntos finales en encabezados ni errores de página.
- Axe sobre el contenido a 390 y 1440 px en ambos temas e idiomas, sin infracciones.
- Flujo ambiental de valores sin controles, movimiento reducido, anclas de equipo, enlaces de perfiles directos y acceso a Contacto verificados. Contenido completo sin JavaScript.
- Las rutas `/` y `/en/` no incluyen el nuevo contenido ni sus recursos exclusivos.
- `npm run build`: comprobación Astro sin errores y 16 páginas HTML verificadas. Se mantienen avisos previos de tamaño de bundle e indicaciones sobre scripts históricos en artifacts.
- Prueba existente `visitor-journey.spec.ts`: aprobada después de actualizar su selector antiguo `.project-card` al atributo actual `[data-work-item]`. No se modifica la galería de Trabajos.

## Continuidad del sistema

Se contrastaron Radio Canada Big, IBM Plex Sans, cobalto, superficies de ambos temas y márgenes con `DESIGN.md`, `global.css` y `pages.css`. Esta extensión conserva el sistema y no modifica `DESIGN.md` ni su sidecar desactualizado. El carácter orgánico nuevo queda limitado a los valores de Nosotros, según pedido explícito.

## Revisión final

Disposition inicial: ship. La revisión independiente del rediseño examinó las referencias y capturas de valores, retratos y página completa, incluyendo móvil/escritorio, ambos temas, inglés, 320 px y 768 px. No solicitó correcciones materiales ni nuevas capturas. Confirmó la disposición de Koto, el tratamiento orgánico autorizado y la composición del equipo inspirada en Monopo. El alcance del veredicto fue visual y de código de `/nosotros/` y `/en/about/`.

La corrección posterior del usuario reemplaza los valores por Combinar miradas, Entender el problema y Articular soluciones y elimina el control de movimiento. Se conserva la composición y se revisan nuevamente textos, traducciones, responsive, accesibilidad y fin automático de las animaciones mediante la auditoría indicada arriba.

Por pedido posterior se eliminan de ambas versiones de Nosotros los bloques Cómo trabajamos y Conversemos sobre tu proyecto y el enlace local al método. El equipo pasa directamente al footer existente. La navbar queda intacta. El enlace del footer de páginas interiores a Cómo trabajamos ahora apunta a la sección existente de la landing en el idioma correspondiente, para evitar un destino eliminado; no se modifica la landing.

Se elimina también el índice local Valores / Equipo bajo la introducción, según la captura indicada por el usuario. Se conservan las secciones y sus anclas.

Por pedido posterior se elimina la apertura Tres miradas, un equipo y su párrafo. Nosotros comienza directamente en los valores, con Lo que nos mueve como encabezado principal, conservando su tamaño y estilo. Se mantiene un margen breve bajo la navbar.
