import { defineMiddleware } from 'astro:middleware';
import { isTrustedHostHeader, parsePublicSiteUrl } from './lib/site-origin';

const publicSite = parsePublicSiteUrl(import.meta.env.PUBLIC_SITE_URL);
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  'frame-src https://challenges.cloudflare.com',
].join('; ');

function secure(response: Response): Response {
  response.headers.set('content-security-policy', contentSecurityPolicy);
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('cross-origin-opener-policy', 'same-origin');
  response.headers.set('cross-origin-resource-policy', 'same-origin');
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isTrustedHostHeader(context.request.headers.get('host'), publicSite)) {
    return secure(
      new Response('Misdirected Request\n', {
        status: 421,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      }),
    );
  }

  return secure(await next());
});
