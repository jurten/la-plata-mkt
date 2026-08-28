import type { APIRoute } from 'astro';
import { readRuntimeEnv } from '../lib/runtime-env';
import { parsePublicSiteUrl } from '../lib/site-origin';

const publicSite = parsePublicSiteUrl(
  readRuntimeEnv('PUBLIC_SITE_URL', import.meta.env.PUBLIC_SITE_URL),
);

export const GET: APIRoute = () => {
  if (!publicSite) {
    return new Response('PUBLIC_SITE_URL is not configured.\n', {
      status: 503,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }

  const locations = [new URL('/', publicSite), new URL('/privacidad/', publicSite)];
  const urls = locations.map((location) => `  <url><loc>${location}</loc></url>`).join('\n');
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
