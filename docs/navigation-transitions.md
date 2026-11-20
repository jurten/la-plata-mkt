# Transición circular entre páginas

El usuario eligió Circle como transición definitiva. Mantiene la navegación por documentos de Astro: cierra una apertura circular centrada, espera la respuesta y abre el círculo sobre el destino.

Se retiraron Overlay y los controles de comparación. Las preferencias de la prueba anterior se descartan y los parámetros de comparación ya no alteran la transición.

La cobertura de salida termina antes de iniciar la navegación nativa. Una marca de sesión asociada al destino activa la cobertura de llegada mediante un script externo síncrono en el head. El contenido se revela después de preparar el DOM, las fuentes y las imágenes visibles no diferidas; al volver al inicio también se espera la escena 3D. La preparación visual tiene un máximo de dos segundos, y el script inicial libera la cobertura a los cuatro segundos si el módulo no funciona. Una respuesta de navegación lenta permanece cubierta en el documento de origen, con recuperación a los doce segundos.

Los enlaces a fragmentos de la página actual usan scroll suave y los resolutores de las escenas existentes. La detección incluye URLs absolutas. Los enlaces de teclado y menú conservan el foco, el hash y los anuncios accesibles. Movimiento reducido, colores forzados y almacenamiento deshabilitado mantienen la navegación nativa. No se interceptan destinos externos, descargas, nuevas pestañas ni clics modificados.

El cambio de idioma sigue guardando el borrador del formulario y coordina su feedback con la transición. Se limpian las coberturas al salir o restaurar una página desde el historial.

Fuentes de referencia: [Swup Overlay](https://swup-demos.onrender.com/overlay/) y [Swup Reveal](https://swup-demos.onrender.com/reveal/). Los patrones se adaptaron al CRT existente mediante Web Animations API, sin incorporar otro router.

Validación: `tests/e2e/page-transitions.spec.ts`, `tests/e2e/tv-navigation.spec.ts` y capturas de carga y apertura en `artifacts/navigation-transitions/`. Las capturas de apertura pausan la animación para inspeccionar su máscara, sin modificar la implementación.
