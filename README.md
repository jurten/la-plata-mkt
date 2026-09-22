# La Plata Marketing

Sitio one-page en español para conectar marketing, tecnología y ventas, presentar caminos de solución, mostrar experiencia autorizada y recibir consultas.

La dirección visual porta el mockup aprobado `lpm-home-mockup`: papel cálido cuadriculado, cobalto, secciones nocturnas, tipografía grotesca condensada, acentos editoriales y módulos de sistema. El HTML de referencia se reinterpretó como Astro semántico; no se importaron sus placeholders, Google Fonts, formulario decorativo ni enlaces de contacto inseguros.

## Estado

- Sitio responsive terminado.
- Formulario, validación, honeypot, límite de 16 KiB, rate limit, Turnstile y adaptador de correo implementados.
- Sin credenciales, el formulario funciona en **modo demo** y declara de forma explícita que no envió el email.
- Con las cuatro variables requeridas, el formulario usa Turnstile y envía una notificación más una respuesta automática mediante Resend.
- Los casos se publican anonimizados por defecto. Los nombres y la narrativa suministrados se muestran únicamente con `PUBLIC_CASE_STUDIES_APPROVED=true`; no se incluyen métricas inventadas.
- Aviso de privacidad: responsable, proveedores y criterio de conservación completados.

## Stack

- Astro sobre Cloudflare Workers; `/` y `/privacidad` se prerenderizan como assets estáticos
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

## Identidad visual de producción

Los tokens base de la identidad LPM son:

- Tinta: `#111318`
- Tinta atenuada: `#56595F`
- Papel cálido: `#F3EFE5`
- Superficie clara: `#FFFDF7`
- Azul cobalto: `#1536F1`
- Azul cielo: `#B7D7EE`
- Amarillo señal: `#F4C430`
- Rojo pulso: `#F0442D`
- Fondo nocturno: `#111318`

Sin una elección guardada, la interfaz sigue automáticamente `prefers-color-scheme`. El selector visible ofrece únicamente los íconos de sol y luna para fijar modo claro u oscuro; esa elección explícita se guarda localmente en `lpm-theme`. Las familias Bricolage Grotesque, Newsreader e IBM Plex se sirven desde Fontsource, sin peticiones a Google Fonts.

## Verificación

```bash
npm run test          # unitarias e integración
npm run test:e2e      # recorridos reales en Chromium + axe
npm run build         # astro check + build para Cloudflare Workers
npm run verify        # las tres puertas anteriores, en serie
```

Para auditar el build real:

```bash
npm run build
npm run start -- --host 127.0.0.1 --port 4322
npm run visual:audit
```

`visual:audit` captura desktop y mobile en `artifacts/`, comprueba overflow, consola, red, menú móvil y envío demo. La carpeta no se versiona.

## Formulario y correo real

Configurar primero el origen público confiable. Para correo live, completar además los **cuatro valores requeridos**; `CONTACT_TO` es opcional porque ya tiene como destino predeterminado `ceo@laplatamarketing.com`:

```dotenv
PUBLIC_SITE_URL=https://www.tu-dominio.com
PUBLIC_CASE_STUDIES_APPROVED=false
RESEND_API_KEY=
CONTACT_FROM="La Plata Marketing <hola@tu-dominio.com>"
CONTACT_TO=ceo@laplatamarketing.com # opcional
TURNSTILE_SECRET=
PUBLIC_TURNSTILE_SITE_KEY=
```

Condiciones:

1. `PUBLIC_SITE_URL` debe ser el origen HTTPS exacto que verá el público, sin ruta, consulta ni fragmento. Sin esta variable, las páginas usan `noindex`, omiten canonical/OG absolutos y `/sitemap.xml` responde 503.
2. Mantener `PUBLIC_CASE_STUDIES_APPROVED=false` hasta contar con autorización de nombres y narrativa; cambiarlo a `true` exige reconstruir.
3. `CONTACT_FROM` debe pertenecer a un dominio verificado en Resend.
4. Las claves pública y secreta deben corresponder al mismo sitio de Turnstile.
5. `CONTACT_TO` es el destino interno; si no se define, el código usa `ceo@laplatamarketing.com`.
6. Si falta cualquiera de los cuatro valores de correo requeridos, el endpoint permanece en modo demo y no simula un envío real.

> **Importante:** `PUBLIC_SITE_URL`, `PUBLIC_CASE_STUDIES_APPROVED` y `PUBLIC_TURNSTILE_SITE_KEY` deben estar disponibles **durante el build**, porque `/` y `/privacidad` se prerenderizan. `PUBLIC_SITE_URL` y `PUBLIC_TURNSTILE_SITE_KEY` también se definen como variables del Worker. `RESEND_API_KEY` y `TURNSTILE_SECRET` son secretos de runtime: no deben estar en el build, Git ni `wrangler.jsonc`.

Flujo live:

1. El navegador valida los campos requeridos.
2. El servidor aplica 10 intentos por cliente cada 10 minutos y limita el cuerpo a 16 KiB.
3. El servidor vuelve a validar y rechaza el honeypot.
4. Turnstile verifica el token.
5. Resend notifica a La Plata Marketing con `Reply-To` del contacto.
6. Resend envía la confirmación automática en español.
7. Si la confirmación falla después de que la notificación interna fue aceptada, la consulta se conserva como recibida y se registra una advertencia sin exponer datos en el navegador.
8. El widget Turnstile se reinicia después de cada intento porque sus tokens son de un solo uso.

## Producción en Cloudflare Workers

Squarespace conserva la **registración y renovación** del dominio. Cloudflare administra los DNS autoritativos, HTTPS, assets estáticos, el Worker y Turnstile. Resend conserva el correo transaccional.

### Build y prueba local del runtime real

```bash
cp .dev.vars.example .dev.vars
PUBLIC_SITE_URL=http://127.0.0.1:4322 npm run build
npm run start -- --host 127.0.0.1 --port 4322
npx wrangler deploy --dry-run
```

`astro preview` usa `workerd`; no simula un servidor Node. `wrangler deploy --dry-run` debe mostrar la configuración redirigida generada en `dist/server/wrangler.json`, el binding `ASSETS` y terminar sin publicar.

### Variables de Cloudflare

En **Workers & Pages → la-plata-mkt → Settings → Variables and Secrets**:

- Variables: `PUBLIC_SITE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `CONTACT_FROM`, `CONTACT_TO`.
- Secretos cifrados: `RESEND_API_KEY`, `TURNSTILE_SECRET`.
- Mantener `PUBLIC_CASE_STUDIES_APPROVED=false` salvo autorización editorial expresa.

En **Builds → Settings → Variables and secrets**, repetir como variables de build `PUBLIC_SITE_URL`, `PUBLIC_TURNSTILE_SITE_KEY` y `PUBLIC_CASE_STUDIES_APPROVED`. No agregar las claves secretas al build.

Como resguardo exclusivo de Workers Builds, `astro.config.mjs` aplica esos mismos tres valores públicos cuando `WORKERS_CI=1` y Cloudflare no los inyecta. Una variable de build explícita siempre prevalece sobre el valor predeterminado. Este resguardo no contiene ni aplica credenciales, secretos o destinos de correo.

`wrangler.jsonc` mantiene `keep_vars: true`: los despliegues preservan las variables de runtime cargadas en el dashboard. Wrangler también conserva los secretos cifrados salvo que se eliminen explícitamente.

Para una publicación manual:

```bash
npx wrangler login
PUBLIC_SITE_URL=https://tu-dominio.example \
PUBLIC_TURNSTILE_SITE_KEY=tu-clave-publica \
PUBLIC_CASE_STUDIES_APPROVED=false \
npm run deploy
```

Para el primer alta manual, publicar primero el Worker en modo demo, cargar los secretos desde el dashboard o con `npx wrangler secret put NOMBRE`, y volver a desplegar. En un Worker ya creado, cargar los secretos antes del siguiente despliegue. Nunca se pasan en la línea de comandos ni se guardan en `.dev.vars.example`.

### Dominio de Squarespace y DNS de Cloudflare

1. Agregar el dominio al plan Free de Cloudflare y anotar los dos nameservers asignados.
2. Copiar y comparar **todos** los registros vigentes antes de cambiar nameservers: MX, SPF, DKIM, DMARC, Google Workspace, verificaciones y cualquier subdominio. El escaneo automático no reemplaza esta comparación.
3. En Squarespace Domains → dominio → DNS → Domain Nameservers, elegir nameservers personalizados y cargar exactamente los dos de Cloudflare. Squarespace desactiva su DNSSEC al usar nameservers personalizados.
4. Esperar a que Cloudflare marque la zona como activa y confirmar que el correo sigue resolviendo antes de eliminar cualquier registro.
5. Cuando estén confirmados el dominio y la variante canónica, declararla en `wrangler.jsonc` dentro de `routes` con `custom_domain: true` y definir `workers_dev: false`. Wrangler debe ser la fuente de verdad; no dejar la ruta configurada únicamente en el dashboard.
6. Crear `www` como registro `A` proxied hacia la dirección reservada `192.0.2.0` y una Redirect Rule permanente hacia `https://laplatamarketing.com`, conservando ruta y consulta. No servir ambos hostnames como copias independientes.
7. Configurar Turnstile y el dominio verificado de Resend para los hostnames finales.

Al cambiar nameservers, los registros del panel DNS de Squarespace dejan de aplicarse. No borrar ni reemplazar MX/SPF/DKIM durante la migración. Squarespace sigue siendo el registrador; no se transfiere el dominio.

### Seguridad del borde

`PUBLIC_SITE_URL` fija el origen usado por canonical, Open Graph, `robots.txt` y `sitemap.xml`. El middleware responde 421 a Hosts no permitidos en rutas dinámicas; Cloudflare bloquea Hosts que no pertenecen a la zona antes del Worker. Las rutas dinámicas reciben CSP, anti-framing, referrer policy, permissions policy y MIME protection desde `src/middleware.ts`; los assets prerenderizados reciben la política equivalente desde `public/_headers`.

Cloudflare aporta el IP del visitante en `CF-Connecting-IP`; el endpoint valida esa cabecera y usa un único bucket `unknown` cuando el runtime local no ofrece una dirección. El rate limit actual vive por isolate y es una defensa complementaria a Turnstile. Si el tráfico exige garantía global, agregar un límite distribuido de Cloudflare o un Durable Object.

## Estado de producción y decisiones pendientes

- Producción verificada: apex en Cloudflare Workers, redirección de `www`, Turnstile, Resend y DNS de correo con SPF, DKIM y DMARC.
- Obtener autorización para publicar los nombres y la narrativa, y recién entonces definir `PUBLIC_CASE_STUDIES_APPROVED=true`.
- Incorporar resultados cuantitativos únicamente si existen y fueron aprobados.
- Confirmar enlaces sociales, si deben mostrarse.
- Elegir analítica; no se instaló tracking sin una decisión explícita.

## Recursos

- Favicon vectorial y fallback ICO: `public/favicon.svg`, `public/favicon.ico`
- Open Graph: `public/og-la-plata-marketing.png`
- Regenerar los recursos de marca:

```bash
npm run assets:favicon
npm run assets:og
# o ambos en serie:
npm run assets:brand
```

Ambos generadores usan Pillow. El generador Open Graph carga directamente estas fuentes de Windows: `C:\Windows\Fonts\impact.ttf` (Impact), `arial.ttf` y `arialbd.ttf` (Arial regular y negrita), `georgiai.ttf` (Georgia Italic) y `consola.ttf` (Consolas). No implementa fuentes de reemplazo: si alguno de esos archivos no está disponible, Pillow interrumpe la generación. Los archivos finales ya están versionados, por lo que Pillow y esas fuentes no son necesarios para ejecutar el sitio.
