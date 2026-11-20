# Valores con secuencias de luz

## Alcance y plan de movimiento

Pedido del usuario: pulir y animar las imágenes de valores con el efecto de la hero. La intervención queda en `/nosotros/` y `/en/about/`. Se conservan contenido, composición, marca, retratos y navbar; los archivos de la hero no se editan.

La aclaración posterior del usuario define tres acciones concretas: dos cosas que se combinan y producen algo, una forma que se revela bajo el blur y una tercera escena del mismo lenguaje con luces. Esto reemplaza los blobs sólidos anteriores por tres relatos ópticos.

- Combinar miradas: dos fuentes, una cobalto y otra celeste, se acercan, se fusionan con una luz de contacto y generan un contorno nuevo de cuatro lóbulos.
- Entender el problema: una apertura elíptica empieza desenfocada y una luz la revela progresivamente hasta mostrar su contorno y núcleo con nitidez.
- Articular soluciones: tres arcos luminosos separados se alinean y cierran una forma continua, con un núcleo común al completar la unión.

Por pedido posterior, las escenas se activan exclusivamente con hover. En reposo muestran el inicio sin movimiento. Al entrar el cursor, la transformación se completa en unos 3,3 segundos y sostiene el resultado; al salir vuelve al estado inicial y detiene el render continuo. Una nueva entrada reproduce la escena desde el comienzo. En móvil, un toque reproduce una pasada y otro permite repetirla. Salir de pantalla o activar movimiento reducido cancela la reproducción. El texto permanece fuera de la deformación.

Presupuesto: tres canvas pequeños, creados solo cuando sus imágenes están visibles, hasta 1,5 DPR y 30 dibujos por segundo. Un primer paso calcula la luz y la transformación narrativa; un segundo paso conserva el material óptico de la hero. Las animaciones se suspenden fuera de pantalla y con la pestaña oculta. No se agrega el control de pausa que el usuario ya había pedido retirar.

## Implementación

`about-value-blobs.ts` construye luz con campos analíticos, contornos y blur variable, sin archivos de imagen nuevos. El segundo paso importa, sin modificar, `vertex` y `fragment` de `warp-text-shaders.ts`. Es el mismo shader de la hero, incluidas su lente, distorsión fluida, refracción cromática y las ondas de `hero-click-shader.ts`, con menor intensidad para dar protagonismo a cada relato.

El seguimiento del cursor usa interpolación exponencial; cada clic o toque introduce una onda que se extingue. No se intercepta el desplazamiento táctil y el canvas no captura eventos. La posición de títulos y descripciones no se anima.

Cada escena tiene una alternativa SVG estática que representa la forma resuelta con contornos luminosos. Se muestra con movimiento reducido, colores forzados, sin JavaScript, sin WebGL2 y ante pérdida de contexto. El desmontaje retira observadores, eventos, programas, textura, framebuffer y canvas.

## Validación

`scripts/audit-value-blobs.mjs` revisa español e inglés, claro/oscuro y anchos de 390, 768 y 1440 px. Comprueba los tres visuales, lente, ondas con clic/toque, retorno al flujo ambiental, movimiento reducido, pérdida de contexto, accesibilidad y desbordes. También comprueba alternativas iniciales sin JavaScript, sin WebGL, con movimiento reducido y colores forzados. Evidencia en `artifacts/about-value-blobs/`.

`scripts/audit-value-light-stories.mjs` captura inicio, transformación y resultado de las escenas en escritorio, tablet y móvil. `scripts/audit-value-hover.mjs` comprueba reposo sin autoplay, activación individual por hover, resultado, reinicio al salir y volver a entrar, reproducción por toque y repetición en móvil, y movimiento reducido. Evidencia del comportamiento actual en `artifacts/value-hover/`.

La extensión conserva los tokens y tipografías de `DESIGN.md`, sin reescribir el sistema ni reparar su sidecar. No hay nuevos rasters que requieran atribución; todos los gráficos se construyen con geometría y shaders del proyecto.

La auditoría narrativa final aprobó seis variantes de escritorio, tablet y móvil, incluyendo las tres escenas individuales en teléfono, sin errores de página o shader, infracciones de Axe ni desbordes. Las cuatro alternativas iniciales aprobaron en `report-fallbacks.json`. La compilación final terminó correctamente: Astro sin errores y 16 páginas HTML verificadas. No hay cambios en los archivos de la hero ni en sus shaders compartidos.

## Revisión final

Disposition final: ship. La revisión independiente confirmó la legibilidad de las tres transformaciones, los contornos completos sin cortes ni uniones oscuras en escritorio y móvil y los textos estables. Revisó las capturas finales de escritorio, tablet, móvil y las alternativas estáticas, el código y los informes. No indicó correcciones materiales. La evidencia de interacción proviene de Chromium automatizado, no de dispositivos físicos ni de una comprobación independiente en otros navegadores.

El ajuste posterior de activación por hover conserva estos gráficos. La auditoría específica aprobó las tres escenas en escritorio y móvil: sin autoplay, reproducción individual, resultado completo, reinicio y repetición por hover/toque y alternativa con movimiento reducido. Astro y la compilación completa aprobaron nuevamente.
