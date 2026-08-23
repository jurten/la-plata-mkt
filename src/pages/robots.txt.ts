import type { APIRoute } from 'astro';
import { parsePublicSiteUrl } from '../lib/site-origin';

const publicSite = parsePublicSiteUrl(import.meta.env.PUBLIC_SITE_URL);

export const GET: APIRoute = () => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (publicSite) {
    lines.push(`Sitemap: ${new URL('/sitemap.xml', publicSite)}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': publicSite ? 'public, max-age=3600' : 'no-store',
    },
  });
};
