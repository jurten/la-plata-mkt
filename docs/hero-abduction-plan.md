# Transición del semiovalo de marca: hero → servicios

Fecha: 2026-11-10. Estado: implementado en `HeroReveal.astro`, `hero-reveal.ts` y `hero-reveal.css`. Este documento conserva la dirección y registra las decisiones finales.

## Refinamiento posterior: espacio y cursor

La última indicación reduce la separación anterior de 90% del viewport: el título de servicios queda inmediatamente debajo del punto de cierre del semiovalo. Se consideran la altura de la navegación, el padding existente de servicios y 16px de seguridad para que los últimos cuadros no se solapen con el texto. Servicios sigue en flujo normal y los enlaces directos llegan a su posición real.

El seguimiento es ahora 2.5D: una cámara CSS de 1000px proyecta la ventana, que gira hasta 10,8° alrededor de X e Y según el cursor. La posición cambia hasta 30px horizontalmente y 20px verticalmente, mientras una capa interior compensa el 60% de ese desplazamiento para que la imagen acompañe al 40% del movimiento del marco. `gsap.quickTo()` suaviza la rotación en 500ms y la posición en 650ms. El pivote sigue al semiovalo durante su contracción. El efecto vuelve al centro al salir el puntero y no se activa con entrada táctil o movimiento reducido.

Se inspeccionaron directamente los módulos públicos de Zentry [Intro](https://zentry.com/_nuxt/Intro.C1pKIlUR.js), [Frame](https://zentry.com/_nuxt/Frame.DV6SP5CI.js), [proyección de máscara](https://zentry.com/_nuxt/useCssClipMask.vEx_hQM1.js) y [amortiguación](https://zentry.com/_nuxt/useDamp.Ceo-dK5U.js). Allí el marco combina posición, rotación Euler y proyección, con desplazamiento más leve del contenido. La implementación propia adapta esas relaciones a la forma de LPM mediante CSS. Las copias de referencia, fechadas por esta revisión, quedan en `artifacts/zentry-source/`; los nombres públicos de sus bundles pueden cambiar.

## Dirección

Al bajar, la hero pasa de pantalla completa a una ventana con el semiovalo de la identidad de LPM. Esa ventana se aleja y se achica mientras revela detrás la sección real «Miramos distinto. Conectamos todo.». La superficie negra, el texto, el alien y las estrellas se contraen como una misma escena. El visitante controla la secuencia con el scroll y puede recorrerla en sentido inverso.

La referencia de movimiento sigue siendo [Zentry](https://zentry.com/) y la captura aportada por el usuario: desprendimiento de la superficie, profundidad y contracción continua. La silueta pasa a ser el semiovalo del logo oficial. La última instrucción elimina el platillo, el haz de abducción y el panel de cuatro bordes oblicuos; reemplaza la preferencia previa por un ovni visible.

Usar el contorno exterior de `public/brand/lpm-logo.svg`: su primer subtrazado cerrado es la silueta exterior del semiovalo inclinado, en un viewBox de 1154 × 752. Crear una máscara derivada de esa silueta, sin las letras ni el hueco interior, conservando las proporciones y la inclinación nativas. El recurso canónico del logo queda intacto. Esta figura es distinta del motivo de ojo usado en servicios y de una elipse genérica.

## Bibliotecas y fuentes revisadas

| Opción | Capacidad documentada | Decisión para LPM |
| --- | --- | --- |
| [GSAP + ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Una línea de tiempo puede ligarse al progreso del scroll y fijar un contenedor durante el tramo. | Recomendada para coordinar máscara de marca, profundidad, contracción y revelación en una única secuencia. |
| [Motion: scroll](https://motion.dev/docs/scroll) y [transformaciones 3D](https://motion.dev/docs/3d-transforms) | Vinculación al scroll y controles de profundidad, rotación y perspectiva, mediante JavaScript sin exigir React. | Alternativa viable; para esta secuencia habría que componer la fijación con CSS y coordinar las fases. |
| [Anime.js: onScroll](https://animejs.com/documentation/events/onscroll/) y [modos de sincronización](https://animejs.com/documentation/events/onscroll/scrollobserver-synchronisation-modes/) | Sincroniza animaciones y líneas de tiempo con el scroll, con distintos modos de seguimiento. | Alternativa viable. No se descarta por falta de capacidad; GSAP queda elegido por el ajuste entre su pinning y esta escena. |
| [Lenis](https://github.com/darkroomengineering/lenis) | Suavizado del desplazamiento e integración con animación y WebGL. | Complemento opcional de scroll; no construye por sí solo el recorte ni la coreografía. Evaluarlo únicamente si las mediciones justifican modificar la sensación de desplazamiento. |

Referencias oficiales para la siguiente implementación: [GSAP Scroll](https://gsap.com/scroll/), [GSAP Demo Hub](https://demos.gsap.com/) (categoría ScrollTrigger) y [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) para variantes y restauración al cambiar preferencias.

Esta revisión reemplaza la recomendación inicial de un controlador de progreso artesanal por GSAP + ScrollTrigger. La dependencia se justifica por la coordinación e interrupción de varias fases, la fijación y su restauración responsive. No se incorporarán simultáneamente Motion o Anime.js.

Se leyó la página pública de Zentry, pero el navegador de inspección visual no estuvo disponible. La captura del usuario es la referencia del movimiento propuesto; el SVG oficial es la autoridad para la forma. No se afirma haber reproducido la animación en vivo ni se atribuye una biblioteca a Zentry sin verificarla. Profundidad más máscara es la técnica propuesta para LPM, no una afirmación sobre el código original.

## Storyboard

Porcentajes del recorrido de transición, posteriores a la lectura de la hero. Valores iniciales para ajustar en navegador.

| Recorrido | Escena |
| --- | --- |
| 0–15% | La máscara, inicialmente mayor que el viewport, empieza a cerrarse. Aparecen las primeras curvas del semiovalo y los márgenes de servicios detrás. |
| 15–40% | La silueta completa del semiovalo queda reconocible, todavía grande. La hero contenida se aleja con continuidad y conserva el alien, las estrellas y el texto dentro de la figura. Este es el momento protagonista. |
| 40–80% | La escena y su máscara se contraen juntas hasta aproximadamente el 15% de su encuadre intermedio y se desplazan suavemente hacia arriba. El título y las primeras filas de servicios quedan progresivamente expuestos. |
| 80–90% | El semiovalo se reduce hasta una marca pequeña y se desvanece al final del movimiento. El cierre evita un punto brillante o un destello. |
| 90–100% | Servicios ocupa el espacio y continúa el scroll normal, sin superposiciones ni espacio residual. |

Recorrido de partida: aproximadamente 110–130% de una pantalla en escritorio y 65–85% en móvil. El avance depende de la distancia recorrida, sin una espera de duración fija. Al subir se reconstruye la escena desde la misma posición.

La sección siguiente debe existir detrás de la hero desde el principio de la transición. La revelación será consecuencia de reducir y retirar la ventana de marca. El menú permanece fuera de la superficie que se contrae.

Separar el contenedor estable, la máscara y el contenido. Usar un `clipPath` SVG derivado del contorno oficial y una transformación uniforme para reducir su tamaño. Comenzar con el semiovalo lo bastante grande como para cubrir todas las esquinas del viewport y cerrarlo hasta el encuadre elegido; así no hace falta inventar un morph desde un rectángulo ni incorporar MorphSVG.

La máscara necesita compensar la relación entre el contenedor y el viewBox de origen para que el semiovalo conserve su proporción 1154:752 en escritorio y móvil. Evitar un `objectBoundingBox` que estire la figura a la relación de aspecto de la pantalla. Coordinar el cierre de máscara y la escala del contenido para que se perciba una misma escena en contracción, sin recortar prematuramente el rostro. Crear profundidad mediante escala y alejamiento; preservar la inclinación nativa de la marca y evitar rotaciones adicionales que la conviertan de nuevo en un panel deformado. La técnica exacta de máscara se verificará en Chromium, Firefox y WebKit con el canvas real.

## Integración con el sitio actual

- Punto de integración: `#inicio` y `#soluciones` en `src/pages/index.astro`. Mantener el contenido semántico y los servicios reales de `ServicesSection.astro`.
- Crear un contenedor estable para medir y sostener la transición, con una superficie interior transformable que contenga la hero. Conservar el menú fuera de esa transformación. La fijación temporal y la escala necesitan capas distintas.
- GSAP y ScrollTrigger se incorporan en un módulo TypeScript dedicado. Un único ScrollTrigger controla las fases de desprendimiento, semiovalo, contracción y revelación. Cada pose se deriva del progreso absoluto con las curvas de GSAP: esto evita que abrir un desplegable o recalcular el layout convierta un estado intermedio en el nuevo inicio. El seguimiento es directo, sin inercia adicional.
- Fijar el contenedor estable y transformar solamente la superficie interior, como indica la documentación de ScrollTrigger. Integrar servicios como contenido real de fondo y resolver su continuidad con el flujo de lectura al terminar; no fijar la sección completa de servicios, cuya altura puede variar al abrir disclosures.
- Usar `gsap.matchMedia()` para recorridos responsive y movimiento reducido, con limpieza y restauración completas de estilos y fijación. Recalcular con `ScrollTrigger.refresh()` después de cambios relevantes de medidas; no medir layout en cada actualización.
- Derivar la máscara desde el contorno exterior del SVG oficial. No agregar objetos 3D ni un segundo contexto WebGL para esta transición.
- Mantener el texto como HTML vivo y el canvas real dentro de la superficie transformada. Evitar capturar una imagen de la página o duplicar encabezados, enlaces e identificadores.
- Coordinar la interferencia CRT y el rayo del cursor durante la contracción: estabilizar la transmisión y suspender la interacción del puntero al comenzar. Restaurar sus estados anteriores al volver arriba, respetando pausa y preferencias. La contracción dentro del semiovalo debe ser la acción visual dominante durante este tramo; el rayo interactivo existente puede seguir funcionando en la hero inicial.
- Revisar los cálculos de coordenadas del rayo, la detección de visibilidad del alien y la selección de canal activo; hoy dependen de los límites de elementos que se moverán o se superpondrán.
- La navegación actual intercepta enlaces internos y aplica una transición de canal antes de `scrollIntoView`. Los clics en «Enfoque», «Conocé nuestro enfoque» y la indicación de scroll conservarán la llegada directa a servicios, completando el estado de contracción al aterrizar. Evitar reproducir dos secuencias consecutivas. Las entradas por hash y el historial deben resolver el mismo estado.

## Móvil, accesibilidad y fallos

- La hero móvil actualmente tiene texto, acciones y retrato en flujo y puede superar una pantalla. Permitir recorrer todo ese contenido antes de iniciar la contracción. Medir su altura real y definir el encuadre de salida; no fijar una hero alta desde el primer píxel dejando sus acciones inaccesibles.
- Mantener la hero y los servicios utilizables sin JavaScript. Habilitar superposición, espacio de transición y fijación sólo cuando la mejora esté lista.
- Con movimiento reducido o colores forzados, usar el flujo normal sin contracción espacial ni tramo vacío reservado.
- Mientras la hero se contrae, gestionar sus enlaces para que el teclado no enfoque controles diminutos o tapados. No retirar el foco de un control activo de forma inesperada. Servicios se vuelve interactiva conforme quede expuesta; no mover el foco por hacer scroll.
- Recalcular medidas al cargar fuentes, cambiar tamaño u orientación, sin saltar de escena. Detener trabajo al ocultar la pestaña o salir del tramo.
- Evitar filtros grandes sobre la pantalla. La animación debe seguir funcionando aunque el alien 3D no cargue.

## Secuencia de implementación y aceptación

1. Probar la transición con GSAP: pantalla completa → semiovalo de marca → miniatura ascendente → revelación completa. Usar el contenido real, en escritorio y móvil. Resolver altura de la hero, final del tramo y anclas.
2. Ajustar la escala de la máscara y del contenido, y la coordinación con CRT, cursor y navegación. Comprobar que el semiovalo se reconozca antes de achicarse demasiado.
3. Revisar visualmente inicio, 25%, 50%, 75% y final, más un recorrido continuo hacia abajo y arriba. Comparar la silueta con el contorno del SVG oficial, conservando proporciones e inclinación. La referencia de Zentry orienta la continuidad y la profundidad, no la forma. Validar ambas apariencias y al menos 390px y 1440px, comprobando también el mínimo de 320px.
4. Comprobar scroll rápido, trackpad, táctil, teclado, menú, hash directo, volver atrás, resize, movimiento reducido, ausencia de JavaScript y fallo de WebGL. Asegurar que no haya desbordamiento horizontal, saltos ni enlaces ocultos que retengan foco.
5. Ejecutar los chequeos del proyecto y regresiones de navegador pertinentes tras implementar. Medir fluidez y coste gráfico en el tramo; no considerar capturas estáticas como prueba de rendimiento.

## Decisiones verificadas durante la implementación

- La geometría proviene del primer subtrazado del SVG oficial, importado en compilación. La máscara conserva escala uniforme y no requiere MorphSVG.
- Se mantienen dos contenedores sticky nativos: uno para la hero y otro para el fondo de servicios. El inicio se calcula después del recorrido natural de la hero alta. El contenido completo de servicios permanece en su flujo y se reajusta al abrir sus desplegables.
- El texto se desvanece antes de quedar cortado por el semiovalo. En móvil, el contenido se desplaza dentro de la máscara para conservar los ojos del alien, corrigiendo un primer encuadre que mostraba sólo la frente.
- El retorno al flujo al cambiar preferencias espera a que termine la restauración interna de scroll de GSAP. Los destinos semánticos conservan la sección que se estaba leyendo.
- Se agregaron pruebas de navegador para reversión, móvil, navegación por hash, historial, movimiento reducido, Tab y ausencia de JavaScript. Las capturas y los informes de la revisión visual quedan en `artifacts/hero-reveal/`.

Validación final: 81 pruebas unitarias aprobadas; 50 casos de navegador verificados entre la ejecución principal y la repetición de dos casos que necesitaron corregir el entorno de Host y el encuadre de una prueba previa de CRT; compilación de producción y verificador de HTML aprobados. La inspección visual cubrió 320, 390 y 1440 px, ambas apariencias y el recorrido hacia abajo y arriba. Las regresiones de layout también cubrieron diez anchos entre 320 y 1920 px. No se detectaron errores de página ni desbordamiento en las capturas.

Límites de la verificación: navegador Chromium automatizado; Firefox, WebKit y dispositivos físicos no se probaron en esta sesión. El recorrido sintético de 90 cuadros, concurrente con la compilación, registró intervalos medios de 22,4 ms en escritorio y 17,4 ms en el viewport móvil. Es una observación del entorno de pruebas, no una medición de rendimiento en un teléfono real.
