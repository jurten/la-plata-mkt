# Implementación del refactor de navegación

Fecha: 20 de noviembre de 2026

Implementa la estructura de [navigation-refactor-plan.md](navigation-refactor-plan.md). El usuario autorizó ejecutar el plan y confirmó que las URLs deben seguir los nombres de las secciones.

## Alcance corregido

La corrección explícita del usuario prevalece sobre la propuesta del plan: la landing no debía cambiar; solo había que agregar las URLs nuevas.

La landing original se restauró desde la versión anterior: HomePage, ServicesSection, PortfolioReveal, TeamRoster, sus controladores de animación y los estilos originales. Conserva hero, Enfoque, sistema, galeria completa, equipo, método, footer y fragmentos. No usa vistas previas nuevas ni redirecciones de sus fragmentos. Los únicos cambios de sus componentes de navegación y footer son los destinos de Trabajos, Nosotros y Contacto.

Las páginas adicionales usan SiteLayout, PageFooter, WorkGallery y AboutRoster, con escenas propias. A pedido posterior del usuario, toda la web comparte TelevisionNavigation, sus estilos originales y su controlador: logo, cuatro enlaces, idioma, ojo activo, comportamiento sticky y menú televisivo móvil. Las versiones duplicadas de navbar se eliminaron. En interiores se fija el estado activo por ruta y se utiliza el fondo opaco; el logo y Enfoque llevan al inicio localizado y a su sección original, respectivamente.

| Página | Español | Inglés |
| --- | --- | --- |
| Landing original | `/` | `/en/` |
| Trabajos | `/trabajos/` | `/en/work/` |
| Nosotros | `/nosotros/` | `/en/about/` |
| Contacto | `/contacto/` | `/en/contact/` |
| Privacidad | `/privacidad/` | `/en/privacy/` |

## Contacto

El formulario usa el endpoint existente, Turnstile y Resend. Nombre, email, mensaje y privacidad son obligatorios; empresa y teléfono son opcionales. La validación del navegador reutiliza el esquema del servidor. Los errores mantienen los valores y enfocan el primer campo inválido. El flujo diferencia envío, recepción real, demostración, verificación fallida, límite de intentos y fallo de proveedor. El fallo de la autorespuesta no revierte una consulta recibida.

La confirmación automática utiliza el idioma del formulario. Sin empresa, el asunto utiliza el nombre de contacto. El cambio de idioma conserva los valores en un borrador de `sessionStorage` de la misma pestaña, asociado a la ruta de destino, que se consume al recuperar los datos y expira a los treinta minutos.

El modo demostración declara que no se envió email. Sin JavaScript, el envío queda deshabilitado y están disponibles los canales directos. Contacto omite el botón flotante; las otras páginas lo despejan al abrir el menú, llegar al footer y pasar sobre controles del equipo o proyectos.

Privacidad describe los campos, proveedores y borrador. Las rutas sin barra se normalizan. Sitemap y verificador de build incluyen las diez páginas. La página 404 conserva el idioma de rutas inglesas y devuelve estado 404. Los fragmentos originales de Inicio permanecen en la landing; no se redirigen.

## Validación

- Corrección de alcance: 19 pruebas de preservación de la landing y navegación aprobadas en Chromium; las diez piezas originales de contenido, estilos y animación de Inicio coinciden byte a byte con la versión anterior. La revisión visual de escritorio y móvil no encontró diferencias fuera de los destinos de los enlaces.
- Validación anterior a la corrección de alcance: 41 pruebas E2E del refactor y 90 de 91 pruebas unitarias/integración aprobadas. La corrección se verifica con landing-preservation.spec.ts y tv-navigation.spec.ts, además del build. El único fallo unitario es el del favicon previo, descrito debajo. No se ejecutó la totalidad de las pruebas históricas ajenas a este alcance.
- `npm run build` comprueba tipos, genera el artefacto de Cloudflare y verifica las diez páginas prerenderizadas, protegiéndolas con `noindex` si falta el origen público.
- Las pruebas actualizadas cubren rutas, idioma, menú, foco, historial, fragmentos antiguos, formulario, privacidad, Coverflow, perfiles, indicador táctil y ausencia de avance automático.
- La revisión de rutas comprueba anchos de 320, 390, 768, 1024, 1440 y 1920 px, ambos idiomas y temas; axe comprueba accesibilidad de las diez páginas.
- `scripts/navigation-audit.mjs` genera capturas en `artifacts/navigation-refactor/`: escritorio, móvil, inglés oscuro, menú y formulario inválido. Las capturas de la landing restaurada están en `artifacts/landing-restoration/`. Las capturas de composición usan movimiento reducido; los efectos se verifican mediante sus pruebas de interacción.
- La revisión visual independiente pidió aumentar el contraste de los bordes del formulario y corregir la especificidad del borde inválido. La segunda revisión puntuó ambas correcciones como resueltas y devolvió `ship` para esos ajustes. Los bordes alcanzan al menos 5,81:1 frente a las superficies adyacentes en claro y 7,87:1 en oscuro.

## Pendientes de material y entorno

- Faltan biografías y aportes personales confirmados de los tres integrantes. Los perfiles muestran nombre, rol y retrato; no se inventan antecedentes ni textos personales.
- Faltan URLs reales de sitios/demos y autorizaciones de publicación. Los conceptos permanecen identificados como ilustrativos y no tienen botones con destinos inventados.
- El entorno local no tiene las credenciales requeridas de correo y Turnstile. La recepción en la casilla real y la autorespuesta deben comprobarse en un entorno configurado; la implementación no se presenta como una entrega real verificada.
- La suite unitaria conserva un fallo previo en `tests/unit/brand-assets.test.ts`: exige cobalto en `public/favicon.svg`, mientras el SVG versionado usa blanco. Este refactor no modifica el favicon ni relaja esa prueba.

El plan original se conserva como fuente de la propuesta. No se realizó despliegue ni publicación.
