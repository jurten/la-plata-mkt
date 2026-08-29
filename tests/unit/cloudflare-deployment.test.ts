import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function text(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

describe('Cloudflare Workers deployment contract', () => {
  it('usa el adaptador Cloudflare y no conserva el servidor standalone de Node', () => {
    const packageJson = JSON.parse(text('package.json'));
    const astroConfig = text('astro.config.mjs');

    expect(packageJson.dependencies['@astrojs/cloudflare']).toBeTruthy();
    expect(packageJson.dependencies['@astrojs/node']).toBeUndefined();
    expect(packageJson.devDependencies.wrangler).toBeTruthy();
    expect(packageJson.scripts.start).toBe('astro preview');
    expect(packageJson.scripts.deploy).toBe('npm run build && wrangler deploy');
    expect(astroConfig).toContain("import cloudflare from '@astrojs/cloudflare'");
    expect(astroConfig).toContain('adapter: cloudflare(');
    expect(astroConfig).toContain('session: false');
    expect(astroConfig).not.toContain("from '@astrojs/node'");

    const contactRoute = text('src/pages/api/contact.ts');
    expect(contactRoute).not.toContain('import.meta.env.RESEND_API_KEY');
    expect(contactRoute).not.toContain('import.meta.env.TURNSTILE_SECRET');
  });

  it('delega el entrypoint y los assets al adaptador Cloudflare actual', () => {
    const wrangler = JSON.parse(text('wrangler.jsonc'));

    expect(wrangler.name).toBe('la-plata-mkt');
    expect(wrangler.keep_vars).toBe(true);
    expect(wrangler.workers_dev).toBe(false);
    expect(wrangler.routes).toEqual([
      { pattern: 'laplatamarketing.com', custom_domain: true },
    ]);
    expect(wrangler.compatibility_date).toBe('2026-08-27');
    expect(wrangler.compatibility_flags).toContain('nodejs_compat');
    expect(wrangler.observability).toEqual({ enabled: true });
    expect(wrangler.main).toBeUndefined();
    expect(wrangler.assets).toBeUndefined();
  });

  it('prerenderiza las páginas públicas para no gastar CPU del Worker en cada visita', () => {
    expect(text('src/pages/index.astro')).toContain('export const prerender = true;');
    expect(text('src/pages/privacidad.astro')).toContain('export const prerender = true;');
    expect(text('src/pages/api/contact.ts')).not.toContain('export const prerender = true;');
  });

  it('publica el aviso de privacidad final sin marcadores de borrador', () => {
    const privacy = text('src/pages/privacidad.astro');
    const readme = text('README.md');
    const expectedContact = 'ceo@laplatamarketing.com';
    const contactSurfaces = [
      privacy,
      readme,
      text('src/pages/index.astro'),
      text('src/pages/api/contact.ts'),
      text('public/scripts/site.js'),
      text('.dev.vars.example'),
    ];

    expect(privacy).toContain('Justina Rosa Guiñazú');
    expect(privacy).toContain('Cloudflare, Turnstile, Resend y Google Workspace');
    expect(privacy).toContain('eliminamos o anonimizamos');
    expect(privacy).not.toContain('Borrador pendiente');
    expect(privacy).not.toContain('deben incorporarse a este aviso');
    expect(privacy).not.toContain('debe aprobarse antes de producción');
    for (const surface of contactSurfaces) {
      expect(surface).toContain(expectedContact);
    }
    expect(contactSurfaces.join('\n')).not.toContain('laplatamarketing@gmail.com');
    expect(readme).toContain(
      'Aviso de privacidad: responsable, proveedores y criterio de conservación completados.',
    );
    expect(readme).not.toMatch(
      /marcado como borrador|completar(?: los)? datos legales (?:de la persona responsable|del responsable)/,
    );
    expect(readme).not.toContain('## Contenido pendiente antes del lanzamiento');
    expect(readme).not.toContain(
      'Confirmar dominio final, definir `PUBLIC_SITE_URL` y configurar DNS, SPF, DKIM y DMARC.',
    );
    expect(readme).toContain(
      'Producción verificada: apex en Cloudflare Workers, redirección de `www`, Turnstile, Resend y DNS de correo con SPF, DKIM y DMARC.',
    );
  });

  it('aplica únicamente valores públicos predeterminados dentro de Workers Builds', () => {
    const astroConfig = text('astro.config.mjs');

    expect(astroConfig).toContain("process.env.WORKERS_CI === '1'");
    expect(astroConfig).toContain("PUBLIC_SITE_URL: 'https://laplatamarketing.com'");
    expect(astroConfig).toContain("PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAEfYYiehIWCSolqV'");
    expect(astroConfig).toContain("PUBLIC_CASE_STUDIES_APPROVED: 'false'");
    expect(astroConfig).not.toMatch(/RESEND_API_KEY|TURNSTILE_SECRET|CONTACT_FROM|CONTACT_TO/);
  });

  it('excluye secretos locales y protege los assets estáticos', () => {
    expect(text('.gitignore')).toMatch(/^\.dev\.vars$/m);
    expect(text('.gitignore')).toMatch(/^\.wrangler\/$/m);
    expect(text('public/.assetsignore').replaceAll('\r\n', '\n')).toBe(
      '_worker.js\n_routes.json\n',
    );

    const headers = text('public/_headers');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('X-Frame-Options: DENY');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });
});
