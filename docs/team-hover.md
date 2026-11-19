# Nosotros con retrato flotante

Documento histórico: la versión actual utiliza [Flowing Menu con banda blob](team-flowing.md), según el prompt posterior suministrado por el usuario.

La dirección aprobada el 19 de noviembre de 2026 reemplaza OptionWheel por tres filas horizontales basadas en [Rapid Image Hover Menu de Codrops](https://tympanus.net/Tutorials/RapidImageHoverMenu/). Cada nombre y cargo permanece visible. Un retrato compartido ocupa el espacio entre ambos y cambia por hover, clic, foco o toque, con máscaras que se desplazan en sentidos opuestos. El movimiento del puntero aporta seguimiento amortiguado e inclinación breve, dentro de una zona que protege el texto.

## Altura y recorrido

Con JavaScript y espacio suficiente, `#nosotros` mide visualmente `100svh`, incluyendo sus márgenes internos. El portfolio conserva su revelado anterior. La aclaración final del usuario requiere que, después de descubrir Nosotros, la escena permanezca visualmente quieta mientras se recorre un tramo largo de scroll. La envoltura sticky reserva `250svh` adicionales de recorrido antes de liberar la escena y dar paso al footer. Nombres, cargos y retrato mantienen exactamente su posición durante ese tramo; la selección solo cambia al interactuar con las personas.

Se eliminó por completo `team-glide.ts` y cualquier interceptación, resistencia o suavizado propio de la rueda. El desplazamiento de la ventana es nativo y conserva su velocidad; es la presentación sticky la que se mantiene quieta. Al agotar el recorrido, la escena sale en flujo normal. Volver hacia arriba reconstruye la misma permanencia. El enlace al contacto y la navegación por teclado permiten ir al footer directamente.

## Dispositivos y accesibilidad

- En escritorio, la foto flota en el espacio central de las filas; no cubre nombres ni cargos
- En pantallas de hasta 1100 px, el retrato ocupa una zona debajo de las tres filas, dentro de la misma pantalla
- La permanencia se aplica donde el portfolio ya usa su presentación horizontal: más de 700 px de ancho, al menos 600 px de alto y movimiento permitido; en móvil compacto y movimiento reducido se mantiene el flujo directo
- Tab, flechas, Inicio, Fin, Enter y Espacio permiten explorar las personas y anunciar su cargo
- Sin JavaScript y en colores forzados, los enlaces y los tres retratos quedan en flujo normal
- Las ventanas de hasta 600 px de alto permiten crecer al contenido para evitar recortes al ampliar texto o usar orientación horizontal

El enlace directo a `#nosotros` se resuelve después de la carga y del ajuste inicial de las escenas anteriores, también cuando el portfolio usa flujo normal. Cambiar de persona no modifica el fragmento de la URL ni desplaza la página. El bloqueo durante el revelado impide seleccionar perfiles antes de que termine de retirarse el portfolio.

## Información y recursos

Los datos siguen en `src/lib/team.ts`. Se conservan los nombres, cargos y el orden confirmados. Los retratos continúan usando el recurso provisorio autorizado y su etiqueta explícita; no se inventaron fotografías ni biografías. La atribución del efecto y su licencia están en `public/licenses/codrops-rapid-image-hover.txt`.

Se conserva el sistema visual existente: Radio Canada Big, IBM Plex Sans, azul de marca, superficies clara y oscura, logo y cursor. No se agregan dependencias ni se modifica el hero, los servicios, las piezas del portfolio o los canales de contacto.

## Verificación

`tests/e2e/team-roster.spec.ts` comprueba elección por clic, teclado y toque; retratos decodificados; una pantalla de altura visual; ausencia de solapamientos; velocidad nativa de la rueda incluso con impulsos de un píxel; posición inmóvil del retrato y de la sección durante 1920 px de scroll; liberación al footer; vuelta al tramo quieto; movimiento reducido; colores forzados y contenido sin JavaScript. `portfolio-reveal.spec.ts` conserva los controles del relevo y adapta la selección al nuevo índice.

`node scripts/capture-team.mjs` guarda capturas y mediciones en `artifacts/team-hover/`: 320, 390, 768, 1100, 1440 y 1920 px, ambos temas, estados de hover y teclado. El informe incluye desbordes, recortes, errores del navegador y auditoría axe de Nosotros.

### Resultado del 19 de noviembre de 2026

La compilación de producción y la verificación de las dos páginas prerenderizadas pasaron. Las doce combinaciones de tamaño y tema no mostraron desbordes, recortes de texto ni errores de navegador; axe no encontró infracciones en Nosotros en ninguno de los dos temas. En la versión final, el footer queda después del tramo quieto de 250svh: en 1440 × 1000, su inicio pasa de 3499 px a 1099 px al recorrer 2400 px, mientras tanto la sección sigue en y=0 y el retrato mantiene exactamente su posición. La rueda conserva la relación 1:1, incluso para impulsos de un píxel. Las pruebas de equipo y portfolio se verifican en Chromium y Firefox.

La suite unitaria general dio 87 pruebas aprobadas y una falla existente en `brand-assets.test.ts`: espera azul en el favicon actual, que es blanco. No se modificaron ese recurso ni su prueba. La suite global de navegador se interrumpió después de dos fallas de `alien-spatial.spec.ts`, que todavía busca el antiguo retrato del hero; ese hero no forma parte de este cambio. La validación de esta sección corresponde a la suite vigente de 38 pruebas y no implica que la suite global histórica esté aprobada.
