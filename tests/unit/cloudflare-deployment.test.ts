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

    expect(wrangler.name).toBe('la-plata-marketing');
    expect(wrangler.keep_vars).toBe(true);
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

  it('excluye secretos locales y protege los assets estáticos', () => {
    expect(text('.gitignore')).toMatch(/^\.dev\.vars$/m);
    expect(text('.gitignore')).toMatch(/^\.wrangler\/$/m);
    expect(text('public/.assetsignore')).toBe('_worker.js\n_routes.json\n');

    const headers = text('public/_headers');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('X-Frame-Options: DENY');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });
});
