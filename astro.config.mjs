import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

const workersCiPublicDefaults =
  process.env.WORKERS_CI === '1'
    ? {
        PUBLIC_SITE_URL: 'https://laplatamarketing.com',
        PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAEfYYiehIWCSolqV',
        PUBLIC_CASE_STUDIES_APPROVED: 'false',
      }
    : {};

for (const [name, value] of Object.entries(workersCiPublicDefaults)) {
  if (!process.env[name]) process.env[name] = value;
}

const publicSite = process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL) : undefined;
const allowedDomains = publicSite
  ? [
      {
        hostname: publicSite.hostname,
        ...(publicSite.port ? { port: publicSite.port } : {}),
      },
    ]
  : [];

export default defineConfig({
  site: publicSite?.origin,
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1' },
  security: { allowedDomains },
});
