# Nosotros con Flowing Menu y retratos blob

La actualización del 19 de noviembre de 2026 toma como base el prompt completo de FlowingMenu (React Bits, variante JavaScript + CSS) suministrado por el usuario. Reemplaza la presentación de retrato flotante de Codrops por un menú de tres filas con banda azul compartida, nombres, cargos y retratos repetidos en movimiento horizontal. Los nombres, cargos, orden y retratos provisorios etiquetados siguen en `src/lib/team.ts`.

## Motor y forma

`team-roster.ts` adapta el motor del prompt a Astro sin incorporar React: conserva la integración de resortes independientes para los bordes superior e inferior, `speed=60`, `duration=.5`, `stretch=.6`, `magnet=.25` y `followCursor=.4`. Las filas alternan su dirección y el contenido se repite según el ancho medido. Se usa el modo de contenido por fila, sin introducción automática. El icono opcional utiliza el componente Icon existente.

El blob está en el contorno de los retratos, cuya forma base es una pastilla con laterales semicirculares. Curvas cúbicas deforman suavemente sus bordes según el tiempo, el resorte y la velocidad del cursor. La banda azul conserva sus bordes rectos. La máscara se actualiza dentro del mismo ciclo de animación; no hay filtros de ruido, blur, otra escena gráfica ni imágenes nuevas. La banda usa el azul cobalto de LPM y texto blanco, sobre las superficies clara y oscura existentes.

## Reinicio al salir

Cuando Trabajos vuelve a cubrir Nosotros, `data-team-locked` deshabilita la interacción. El controlador cancela el frame pendiente y restablece inmediatamente bordes, velocidades, deformación, selección, posición de todos los marquees y región de estado. También oculta las bandas y elimina sus estilos de animación. No conserva una pose pausada ni reanuda automáticamente el estado anterior al volver a Nosotros: espera una nueva interacción.

Se aplica el mismo reinicio al ocultar el documento, salir de la vista, abrir la navegación que vuelve inerte el contenido, pausar efectos, cambiar de tamaño o desmontar el componente. El puntero inmóvil no selecciona otras filas por efecto del scroll. Teclado, clic y toque permiten activar las mismas bandas; la llegada por fragmento comprueba la posición actual ante una nueva interacción y procesa el último aviso de visibilidad disponible. Movimiento reducido conserva la selección estática sin ejecutar el bucle continuo. Colores forzados y ausencia de JavaScript muestran los perfiles completos en flujo normal.

## Recorrido y navegación

Se mantiene la escena de una pantalla y la permanencia de 250svh ya aprobada: el scroll es nativo y Nosotros queda quieto durante ese tramo antes de salir hacia el footer. El nombre público de Portfolio pasa a Trabajos en la navegación principal, el menú de canales y el footer. Se conserva el fragmento `#trabajo` para no romper enlaces existentes.

## Verificación

Las pruebas de `team-roster.spec.ts` cubren los nombres y cargos, imágenes decodificadas, bandas y máscaras, avance horizontal, teclado, toque, tamaños de 320 a 1920px, permanencia, rueda nativa, colores forzados, ausencia de JavaScript y reinicio completo al volver a Trabajos. Las pruebas del recorrido horizontal conservan el control del relevo y los enlaces.

La integración inicial completó 44 pruebas en Chromium y Firefox y la compilación de producción. La revisión visual independiente de esa integración emitió `ship` sin correcciones materiales. Se contrastaron los colores, tipografía y superficies con `DESIGN.md`; sus archivos se conservaron por tratarse de una extensión del sistema vigente.

`node scripts/capture-team.mjs` guarda 26 capturas en `artifacts/team-flowing/`: seis tamaños en ambos temas, dos estados de hover, foco, toque en 320 y 390px, salida a Trabajos y reentrada limpia. El informe registra accesibilidad, geometría y ausencia de estilos animados después del reinicio. La atribución de React Bits está en `public/licenses/react-bits-flowing-menu.txt`.
