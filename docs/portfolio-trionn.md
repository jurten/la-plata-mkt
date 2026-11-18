# Portfolio inspirado en Trionn

## Alcance

Rediseño del portfolio con tres ejemplos conceptuales y transición final a Nosotros. Experiencia de exploración dentro de la identidad existente de LPM. Referencia confirmada: https://trionn.com/.

## Direction contract

THESIS: Una banda horizontal editorial convierte el scroll vertical en un recorrido de ejemplos. El cierre se desplaza hacia la izquierda y descubre al equipo.

OWN-WORLD: Radio Canada Big, fondo e tinta del tema activo, azul cobalto y cielo existentes. Paneles abiertos separados por una línea; cada ejemplo conserva su composición visual y su divulgación conceptual.

STORY: El visitante entiende cómo se conectan las piezas, recorre tres ejemplos y conoce al equipo. WhatsApp sigue disponible como acción comercial.

FIRST VIEWPORT: Título y explicación en la mitad izquierda; primer proyecto en la derecha. Los siguientes dos proyectos y un cierre ocupan medio viewport cada uno.

FORM: Referencia elegida explícitamente por el usuario, implementada directamente. seed: none (unavailable). Una sola secuencia de scroll reversible, sin scroll artificial. La salida revela Nosotros en reposo. En móvil, pantallas bajas, movimiento reducido y sin JavaScript, el contenido se muestra verticalmente.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Contenido y revisión

Los dos primeros ejemplos provienen del contenido conceptual existente. El tercero es una demostración ilustrativa de CRM y automatización, sin clientes ni resultados inventados. No se incorporan imágenes externas ni material de Trionn.

Verificación visual: apertura, recorrido, cierre y transición final en escritorio; móvil y movimiento reducido con lectura vertical. Pruebas de reversibilidad, navegación por anclas y contenido sin JavaScript en `tests/e2e/portfolio-reveal.spec.ts`.

## Nosotros fijo durante la salida

La sección del equipo usa una fijación nativa con `position: sticky`. Su contenedor comienza al iniciar la salida del portfolio y reserva el recorrido restante mediante un espaciador en flujo; al terminar, el equipo continúa con el desplazamiento normal de la página. No se compensan los desplazamientos verticales del navegador con transformaciones de JavaScript en cada frame. Las anclas se calculan respecto del contenido fijo, manteniendo su destino al final de la salida.

En Firefox 160, a 1920 × 966 px, el retrato mantuvo su borde superior en 144 px al 25%, 55% y 90% de la salida. La prueba de scroll real comprueba su estabilidad durante el recorrido. Las capturas están en `.impeccable/review/team/portfolio-sticky-{25,55,90,100}.png`.

Resultado: revisión visual aprobada en 1440 × 1000, 1366 × 768 y 390 × 844, incluidos ambos temas. Sin desbordes horizontales ni excepciones de página en el recorrido capturado. Las cinco pruebas específicas del portfolio pasan y el build termina correctamente. La ejecución ampliada detectó dos fallos en pruebas existentes fuera de este alcance: expectativa antigua del color del favicon y estado de encendido de la navegación.

## Enlaces de la referencia

Los enlaces trasladan el texto letra por letra, sustituyen la flecha derecha por una flecha entrante a la izquierda y redibujan el subrayado. El foco de teclado comparte ese estado; movimiento reducido elimina la transición. El área clickeable permanece estable. Un panel queda inerte solamente al salir completamente del viewport, conservando sus enlaces durante la salida. Los controles de Nosotros se habilitan cuando el portfolio desaparece al 100%; si se invierte el scroll, vuelven a bloquearse en cuanto reaparece el portfolio. El render conserva exactamente `exit = 1` cuando ScrollTrigger termina: recalcular ese cociente con alturas como 966 px producía `0.9999999999999999` y mantenía bloqueadas tanto las flechas como la rueda. La capa anterior se oculta al terminar y cada control del equipo respeta `data-team-locked`, con botones deshabilitados y estado accesible del selector; no se bloquean eventos en el contenedor completo ni se cancela el scroll nativo. La llegada inicial a una sección espera al evento `load` y luego resuelve su posición, evitando que el ajuste nativo del fragmento con `scroll-padding-top: 120px` deje el recorrido incompleto. Los destinos se redondean hacia arriba para completar la salida. Las versiones sin transición permanecen disponibles en flujo normal.

Tiempos cotejados con el JavaScript y los valores del componente público de Trionn: letras con base de 300 ms, desfase y aumento de duración de 30 ms; orden inverso al entrar y directo al salir. La flecha sale en 200 ms y entra en 320 ms tras `max(120, (300 + (n − 1) × 60) × 0.5)` ms. El subrayado sale en 1000 ms y vuelve a dibujarse en 500 ms con el mismo retraso de reentrada. Se elimina la espera adicional hasta el asentamiento completo de todas las letras.
