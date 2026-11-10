# Limpieza de la identidad alien

Fecha: 9 de noviembre de 2026.

Dirección autorizada: conservar la identidad extraterrestre y sus interacciones, ordenar el choque de estilos y acortar la lectura inicial. Referencia: https://zentry.com/.

## Cambios implementados

- Se conservan el alien 3D real, el colapso CRT, el rayo, el cursor retro, la navegación por canales y la interacción del equipo.
- Tras la corrección solicitada con una captura del usuario, la interferencia 2D y el rayo vuelven a cubrir toda la hero, incluido el fondo del lado del texto. Se retiraron el recorte parcial y el fondo sólido agregado a la barra superior; la navegación comienza transparente y conserva sus estados oscuros al desplazar y abrir el menú.
- Los tres pilares comparten filas abiertas y motivos de ojo/apertura. Servicios, capacidades y caminos de inicio permanecen disponibles en desplegables nativos.
- Las secciones de lectura comparten fondo; la perspectiva conserva su escena oscura dentro de la sección. Equipo, portfolio y contacto comparten tipografía, geometría y acento azul.
- La explicación de portada y las introducciones se acortaron sin agregar servicios, clientes ni resultados.
- Las pruebas existentes se actualizaron para desplegar capacidades y comprobar teclado, CRT en el lado izquierdo y transparencia inicial de la navegación.

## Comprobaciones ejecutadas

La revisión estática en `artifacts/verify-alien-cleanup.mjs` pasó sin errores:

- Transformación de los tres componentes Astro modificados.
- Análisis sintáctico de las tres hojas CSS modificadas.
- Sintaxis de TypeScript de los archivos modificados y tipos del controlador de transmisión.
- Respuesta HTTP 200 del servidor de desarrollo existente para `/` y `/privacidad/`.
- HTML servido sin IDs duplicados ni destinos de anclas faltantes; la home contiene un alien y los tres desplegables de servicios.
- `git diff --check` sin errores de espacios.

El resultado detallado está en `artifacts/alien-cleanup/source-check.json`, excluido de Git como evidencia local.

## Corrección de la hero verificada

- La prueba de regresión en Chromium confirmó CRT en el lado izquierdo, ausencia de recorte, rayo activo sobre esa zona y barra superior transparente.
- Se capturó el alien realmente cargado en 1920 × 960, 1440 × 1000 y 390 × 844. El canvas contiene señal en el lado izquierdo y no hubo desbordes horizontales ni excepciones de página.
- Capturas y resultado: `artifacts/hero-restored/`. La revisión visual independiente aprobó este alcance concreto: cobertura del efecto y transparencia de la barra.
- Pasaron las 16 pruebas de transmisión CRT y navegación por canales, incluidos colapso/recuperación, rayo, gestos móviles, historial, teclado y navegación sin JavaScript.
- `npm run build` terminó correctamente: comprobación de Astro sin errores y salida de producción verificada. Persisten el aviso habitual del chunk 3D grande y un hint de una captura histórica sin relación con la corrección.

## Validación general pendiente

La primera entrega no pudo ejecutar pruebas, compilación ni capturas porque el servicio de revisión automática de permisos alcanzó un límite de uso. Ese bloqueo posteriormente dejó de ocurrir y permitió verificar la corrección de la hero. Los resultados de esa corrección se documentan arriba; no equivalen a una revisión visual completa del resto de la página.

El servidor de desarrollo ya estaba en ejecución y sirvió el código actualizado. Las comprobaciones de código y HTTP no equivalen a verificar la composición renderizada ni las interacciones en un navegador.

La primera revisión independiente fue de código y pidió `recapture`. La nueva revisión visual aprueba la corrección de la hero en su alcance concreto. Las capturas de `.impeccable/review/` pertenecen al intento anterior rechazado y no validan estos cambios.

Para una validación general del resto de la limpieza quedan la suite unitaria, las pruebas e2e de contacto, servicios y layout, y capturas completas de las demás secciones. La corrección de la hero ya tiene pruebas de navegador, capturas actuales y compilación verificadas.
