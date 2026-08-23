# La Plata Marketing

Sitio one-page en español para presentar servicios de social media, sitios web, CRM y automatizaciones, mostrar dos casos y recibir consultas.

La dirección visual toma del proyecto de referencia su energía editorial, contraste y composición por capas, pero usa contenido, mockups y recursos originales.

## Estado

- Sitio responsive terminado.
- Formulario, validación, honeypot, límite de 16 KiB, rate limit, Turnstile y adaptador de correo implementados.
- Sin credenciales, el formulario funciona en **modo demo** y declara de forma explícita que no envió el email.
- Con las cuatro variables requeridas, el formulario usa Turnstile y envía una notificación más una respuesta automática mediante Resend.
- Los casos se publican anonimizados por defecto. Los nombres y la narrativa suministrados se muestran únicamente con `PUBLIC_CASE_STUDIES_APPROVED=true`; no se incluyen métricas inventadas.
- El aviso de privacidad está marcado como borrador y necesita revisión legal antes del lanzamiento público.

## Stack

- Astro con salida de servidor Node
- TypeScript y Zod
- CSS original, sin framework de componentes
- Fontsource para tipografías locales
- Resend para correo transaccional
- Cloudflare Turnstile para antispam
- Vitest, Playwright y axe-core para verificación

## Desarrollo local

Requisitos: Node.js 22.12 o superior y npm 9.6.5 o superior (requeridos por la versión de Astro resuelta en el lockfile).

```bash
npm install
npm run dev
```

El servidor de desarrollo abre por defecto en `http://127.0.0.1:4321`.

## Verificación

```bash
npm run test          # unitarias e integración
npm run test:e2e      # recorridos reales en Chromium + axe
npm run build         # astro check + build standalone
npm run verify        # las tres puertas anteriores, en serie
```

Para auditar el build real:

```bash
npm run build
HOST=127.0.0.1 PORT=4322 npm run start
npm run visual:audit
```

`visual:audit` captura desktop y mobile en `artifacts/`, comprueba overflow, consola, red, menú móvil y envío demo. La carpeta no se versiona.

## Formulario y correo real

Configurar primero el origen público confiable. Para correo live, completar además los **cuatro valores requeridos**; `CONTACT_TO` es opcional porque ya tiene como destino predeterminado `laplatamarketing@gmail.com`:

```dotenv
PUBLIC_SITE_URL=https://www.tu-dominio.com
PUBLIC_CASE_STUDIES_APPROVED=false
RESEND_API_KEY=
CONTACT_FROM="La Plata Marketing <hola@tu-dominio.com>"
CONTACT_TO=laplatamarketing@gmail.com # opcional
TURNSTILE_SECRET=
PUBLIC_TURNSTILE_SITE_KEY=
```

Condiciones:

1. `PUBLIC_SITE_URL` debe ser el origen HTTPS exacto que verá el público, sin ruta, consulta ni fragmento. Sin esta variable, las páginas usan `noindex`, omiten canonical/OG absolutos y `/sitemap.xml` responde 503.
2. Mantener `PUBLIC_CASE_STUDIES_APPROVED=false` hasta contar con autorización de nombres y narrativa; cambiarlo a `true` exige reconstruir.
3. `CONTACT_FROM` debe pertenecer a un dominio verificado en Resend.
4. Las claves pública y secreta deben corresponder al mismo sitio de Turnstile.
5. `CONTACT_TO` es el destino interno; si no se define, el código usa `laplatamarketing@gmail.com`.
6. Si falta cualquiera de los cuatro valores de correo requeridos, el endpoint permanece en modo demo y no simula un envío real.

> **Importante:** esta configuración usa `import.meta.env`, por lo que las variables deben estar disponibles **antes de ejecutar `npm run build`**. Cambiar credenciales requiere volver a construir y reiniciar el servidor; agregarlas únicamente al comando `npm start` no modifica un build existente.

Flujo live:

1. El navegador valida los campos requeridos.
2. El servidor aplica 10 intentos por cliente cada 10 minutos y limita el cuerpo a 16 KiB.
3. El servidor vuelve a validar y rechaza el honeypot.
4. Turnstile verifica el token.
5. Resend notifica a La Plata Marketing con `Reply-To` del contacto.
6. Resend envía la confirmación automática en español.
7. Si la confirmación falla después de que la notificación interna fue aceptada, la consulta se conserva como recibida y se registra una advertencia sin exponer datos en el navegador.
8. El widget Turnstile se reinicia después de cada intento porque sus tokens son de un solo uso.

## Producción

El proyecto genera un servidor standalone:

```bash
npm run build
HOST=0.0.0.0 PORT=4321 npm run start
```

Puede desplegarse en cualquier plataforma que ejecute Node y permita variables de entorno. Debe publicarse detrás de HTTPS. Las cabeceras CSP, anti-framing, referrer policy, permissions policy y MIME protection se agregan desde `src/middleware.ts`.

`PUBLIC_SITE_URL` fija el origen usado por canonical, Open Graph, `robots.txt` y `sitemap.xml`. El middleware responde 421 a Host no permitidos en páginas y API; los recursos estáticos pueden servirse antes del middleware, por lo que el proxy/CDN también debe rechazar Hosts ajenos.

El proxy debe preservar o sobrescribir `Host` con el dominio público, sobrescribir `X-Forwarded-For` (sin aceptar una cadena enviada por el cliente) y mantener el servidor Node inaccesible directamente desde Internet. `security.allowedDomains` permite a Astro usar ese IP reenviado solo para el dominio configurado. Configurar HSTS en el borde HTTPS cuando dominio y subdominios funcionen exclusivamente con TLS.

El rate limit incluido vive en cada proceso Node. En varias réplicas, o cuando no pueda garantizarse el manejo confiable del IP en el proxy, aplicar además un límite distribuido en el proxy/CDN.

## Contenido pendiente antes del lanzamiento

- Confirmar dominio final, definir `PUBLIC_SITE_URL` y configurar DNS, SPF, DKIM y DMARC.
- Obtener autorización para publicar los nombres y la narrativa, y recién entonces definir `PUBLIC_CASE_STUDIES_APPROVED=true`.
- Incorporar resultados cuantitativos únicamente si existen y fueron aprobados.
- Revisar jurídicamente `/privacidad` y completar datos legales del responsable.
- Confirmar enlaces sociales, si deben mostrarse.
- Elegir analítica; no se instaló tracking sin una decisión explícita.

## Recursos

- Favicon: `public/favicon.svg`
- Open Graph: `public/og-la-plata-marketing.png`
- Regenerar Open Graph:

```bash
npm run assets:og
```

El generador usa Pillow y fuentes instaladas en Windows (`Impact` y `Arial`). El PNG final ya está versionado, por lo que Pillow no es necesario para ejecutar el sitio.
