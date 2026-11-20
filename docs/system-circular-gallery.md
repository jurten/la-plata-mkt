# Circular Gallery para teléfono y tablet

En anchos de hasta 1250 px, «El sistema completo» usa el CircularGallery de React Bits suministrado por el usuario. Las tarjetas recorren un arco abierto: entran por la derecha, atraviesan el centro y salen por la izquierda. En escritorio se conserva la órbita existente.

`src/lib/circular-gallery-engine.js` conserva los shaders WebGL2, la geometría del arco, el recorrido infinito, la inercia, el ajuste al centro y los gestos del código recibido. `src/scripts/system-circular-gallery.ts` adapta el montaje a Astro y produce texturas locales de las siete tarjetas actuales usando las fuentes de la marca. El HTML original conserva títulos, descripciones y acciones para lectores de pantalla. No se descargan fotografías, fuentes externas ni nuevas dependencias.

El avance automático viaja de derecha a izquierda y se detiene con el foco de teclado, la interacción, el documento oculto, el componente fuera de pantalla o la pausa global. El usuario pidió eliminar todos los controles visibles: no hay flechas, contador, indicación ni botón de pausa. El arrastre horizontal y el teclado permiten recorrer las siete etapas. El scroll vertical permanece nativo.

El encuadre calcula la altura completa de las tarjetas rotadas en el extremo más bajo del arco. Reserva 24 px arriba y abajo y eleva la curva para que las tarjetas se recorten únicamente por los laterales al entrar o salir. El alto de cada tarjeta tiene un máximo de 460 px.

Movimiento reducido, colores forzados, JavaScript deshabilitado o WebGL2 no disponible conservan todas las tarjetas en una lista normal. Cambiar entre teléfono, tablet y escritorio destruye los recursos y eventos de la presentación anterior. El límite de densidad de píxeles es 2.

Fuente: https://reactbits.dev/components/circular-gallery y código adjunto por el usuario. Licencia incluida en `public/licenses/react-bits-circular-gallery.txt`.

Validación: `tests/e2e/system-circular-gallery.spec.ts` cubre ausencia de controles visibles, siete etapas, teclado, gesto táctil real mediante CDP, scroll vertical, cambios de tamaño y alternativas accesibles. Las pruebas de órbita y portafolio cubren las regresiones de escritorio y la transición a Nosotros.
