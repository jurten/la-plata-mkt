import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

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
