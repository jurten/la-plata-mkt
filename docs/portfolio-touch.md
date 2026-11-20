# Trabajos en m?viles y tablets

El usuario eligi? Swiper Coverflow como ?nica opci?n. Se aplica hasta 1250 px o con entrada t?ctil, directamente en `/#trabajo`, sin par?metros de comparaci?n.

Deslizar lateralmente cambia de proyecto; el desplazamiento vertical sigue siendo nativo y permite continuar hacia Nosotros desde cualquier tarjeta. Se quitaron el selector de variantes, las flechas, el contador visible, la indicaci?n del gesto y el enlace inferior al equipo. Se conservan los textos y las acciones de cada proyecto. Desktop mantiene su recorrido horizontal editorial y su panel de cierre.

Las flechas del teclado funcionan con el foco en la galer?a. Los fragmentos de proyecto seleccionan su tarjeta y las dem?s quedan inertes. Movimiento reducido utiliza un slider instant?neo; colores forzados y ausencia de JavaScript conservan los proyectos en flujo normal. El carrusel se desmonta al cambiar de contexto.

La llegada al equipo se calcula respecto de su contenedor en flujo para evitar entrar a mitad de su permanencia. El recorrido independiente de Nosotros se mantiene.

Las pruebas del portfolio cubren gestos t?ctiles sintetizados mediante CDP en Chromium a 390 ? 844, 820 ? 1180 y 1180 ? 820, navegaci?n de teclado, anclas, cambio de tama?o, movimiento reducido y ausencia de JavaScript. No se realiz? validaci?n en dispositivos f?sicos ni Safari.

Referencia: [Swiper Coverflow](https://swiperjs.com/demos/240-effect-coverflow/core). Swiper 14.4.0 se incorpora como dependencia local, sin scripts de CDN.
