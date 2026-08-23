import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

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
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: '127.0.0.1' },
  security: { allowedDomains },
});
