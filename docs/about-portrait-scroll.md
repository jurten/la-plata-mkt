# Efecto de scroll en los retratos

## Alcance

Pedido explícito: añadir el efecto de las imágenes al hacer scroll de https://monopo.london/team/ a los retratos de `/nosotros/` y `/en/about/`. Se mantienen fotos, textos, disposición, navbar y landing. Esta es una extensión del mundo visual existente, no un nuevo sistema.

## Referencia y comportamiento

Se inspeccionaron el comportamiento público y sus scripts: Monopo aplica una lente radial al conjunto de imágenes, centrada en el viewport, con radio equivalente a dos tercios de su ancho. La intensidad depende del retraso entre desplazamiento objetivo y suavizado, tiene límite 0,3 y vuelve a cero al detenerse. No es una simple inclinación del rectángulo ni un parallax interior.

`about-portrait-scroll.ts` implementa una lente radial equivalente con un shader propio y OGL, ya presente en el proyecto. Un único canvas transparente dibuja exclusivamente las tres fotos en sus posiciones del DOM. La deformación afecta tanto el contenido como los bordes de las imágenes. Nombres, roles y título lateral conservan su posición y forma. El encuadre respeta `object-fit: cover` y `object-position` de cada foto.

El scroll sigue siendo nativo en escritorio y móvil: no se interceptan wheel, touch ni teclado, y no se carga Lenis o Pixi. Una aproximación exponencial independiente de la frecuencia de pantalla gobierna la intensidad de la lente. El render se inicia solo cerca de los retratos y se detiene al quedar en reposo, salir de pantalla u ocultarse el documento. La resolución tiene un límite de 1,5 DPR.

## Alternativas y ciclo de vida

Las imágenes originales permanecen en el HTML y solo se ocultan visualmente después de un render válido. Se restauran con movimiento reducido, colores forzados, pérdida de contexto o error al crear WebGL. Sin JavaScript quedan intactas. Un cambio de tamaño actualiza el canvas y el encuadre. El desmontaje retira observadores, eventos, canvas y recursos de GPU. No se modifican ni se generan fotos.

## Verificación

`scripts/audit-portrait-scroll.mjs` comprueba ES/EN, temas claro/oscuro y anchos 390/1440: desplazamiento descendente y ascendente, diferencia visible entre movimiento y reposo, restauración de imágenes con movimiento reducido y pérdida de contexto, resize, aislamiento de la landing, desbordes y Axe. Incluye alternativas iniciales sin WebGL, sin JavaScript, movimiento reducido y colores forzados. Capturas e informe en `artifacts/about-portrait-scroll/`.

La inspección de referencia se reproduce con `scripts/inspect-monopo-scroll.mjs`; sus capturas se usan solo como evidencia local. El código nuevo conserva los tokens y fuentes establecidos en `DESIGN.md` y sus fotos originales en `public/team/`.

La auditoría final completó las ocho combinaciones y las cuatro alternativas iniciales sin errores de página, problemas de accesibilidad ni desbordes. `npm run build` terminó correctamente con Astro sin errores y las 16 páginas HTML verificadas. Los avisos preexistentes sobre tamaño de bundle y scripts históricos no cambian.

## Revisión final

Disposition: ship. La revisión independiente de código y capturas confirmó la deformación de contenido y bordes durante el scroll, el retorno al encuadre original, la estabilidad de nombres y roles y las alternativas estáticas. No indicó correcciones materiales. Su alcance es la animación de retratos y su integración local; no reevalúa el contenido ni otras áreas del sitio.
