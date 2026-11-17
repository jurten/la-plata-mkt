# Equipo con OptionWheel

La sección Nosotros presenta el equipo en este orden:

- Justina Guiñazú — Cofundadora y directora creativa
- Santiago Laumann — Asistente creativo
- Joaquín Laumann — Cofundador y director general

`src/lib/team.ts` concentra los nombres, cargos y rutas de retratos. Un retrato nulo reutiliza el alien azul existente con la etiqueta «Retrato provisorio», según la autorización del usuario. No se generaron imágenes nuevas. Para incorporar una foto real, completar `portrait` con una ruta local y, opcionalmente, `portraitPosition`.

`OptionWheel.astro` y `option-wheel.ts` adaptan el componente React Bits suministrado al ciclo de vida de Astro, conservando su disposición circular, suavizado exponencial, arrastre y selección por scroll. El nombre del centro determina el perfil visible. La rueda inicia en el integrante central para mostrar los tres nombres completos. No se incorpora React ni otra dependencia.

La selección funciona con clic, arrastre, rueda, flechas del teclado, Inicio/Fin y botones anterior/siguiente. Los eventos de rueda expresados en líneas avanzan una persona por paso; los eventos en píxeles conservan el suavizado con una sensibilidad independiente del tamaño del texto. El receptor escucha en captura sobre el documento y comprueba el elemento realmente bajo el puntero. Esto permite continuar desde el portfolio sin mover el mouse cuando Firefox conserva el destinatario anterior durante una transacción de rueda; véase [Mozilla 1168182](https://bugzilla.mozilla.org/show_bug.cgi?id=1168182). Solo consume eventos si el puntero está dentro de la rueda y el equipo ya está habilitado. En los extremos la rueda libera el desplazamiento de la página. Los enlaces no disparan el arrastre nativo del navegador. El movimiento reducido elimina el suavizado y el desenfoque. La animación termina al asentarse y se suspende cuando el documento se oculta. Los observadores y eventos se limpian antes de una navegación Astro.

Un listbox con `aria-activedescendant` comunica la selección; el cargo se anuncia en una región viva. Sin JavaScript y con colores forzados, todos los perfiles y enlaces se muestran en flujo normal. A pedido del usuario, Nosotros contiene únicamente los nombres, cargos y retratos: se retiraron ambos encabezados introductorios, «Las miradas que conectamos», los pasos del método y el bloque de problemas digitales. La región conserva la etiqueta accesible «Equipo».

El componente conserva la paleta, fuentes y superficies existentes. No modifica el sistema de diseño ni sus archivos históricos. La atribución y licencia upstream están en `public/licenses/react-bits-option-wheel.txt`, verificadas contra https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md.

## Validación

Diez pruebas Playwright en `tests/e2e/team-roster.spec.ts` cubren perfiles e imágenes decodificadas, teclado y botones, arrastre, scroll real del mouse y pasos de una línea, paso continuo desde el portfolio sin mover el cursor, celular, ausencia de JavaScript, cambios de colores forzados y visibilidad completa de los nombres en los extremos. El proyecto `firefox` ejecuta las pruebas del equipo y del portfolio; por defecto usa el Firefox de Playwright. Definir `$env:LPM_FIREFOX_CHANNEL = 'moz-firefox'` en PowerShell antes de ejecutar las pruebas selecciona el ejecutable instalado para comprobar su versión real. La regresión de 1920 × 966 px reprodujo en Firefox 160 el bloqueo simultáneo de flechas y rueda: recalcular el final daba `0.9999999999999999`. El render ahora conserva el valor exacto de finalización de ScrollTrigger. El equipo recibe ese estado y habilita sus controles; la capa anterior se oculta y deja de recibir entradas al salir por completo. La altura de la rueda considera los límites de las etiquetas rotadas, además de la distancia entre filas. Capturas de la sección a 320, 390, 768 y 1440 px, ambos extremos de selección y la apariencia oscura se regeneran con `node scripts/capture-team.mjs`. Las capturas se guardan en `.impeccable/review/team/`.

La compilación Astro pasó. El chequeo global de tipos detectó dos errores previos de nulabilidad en `tests/e2e/hero-click-ripple.spec.ts`, ajenos a esta sección.

## Verificación del Firefox instalado

La prueba de 1920 × 966 px falló antes de corregir el final exacto, con el portfolio fuera de pantalla pero la flecha siguiente aún deshabilitada. Después pasó con Firefox 160 instalado: clic real en la flecha, cambio a Joaquín y scroll real de regreso a Santiago. También pasaron las pruebas de teclado, bloqueo durante la transición y scroll continuo desde el portfolio en ese navegador.

El intento de ejecutar toda la suite con el canal `moz-firefox` dejó siete fallos en casos que utilizan emulación de movimiento reducido, JavaScript desactivado, tacto o colores forzados. No se cuentan como pruebas aprobadas del Firefox instalado. Esos modos se verifican por separado con el Firefox gestionado por Playwright, cuyo controlador aplica las opciones utilizadas por la suite.
