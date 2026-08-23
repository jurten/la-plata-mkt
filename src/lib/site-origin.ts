const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function parsePublicSiteUrl(value: string | undefined): URL | undefined {
  const configured = value?.trim();
  if (!configured) return undefined;

  const url = new URL(configured);
  const isLocalHttp = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);

  if (url.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('PUBLIC_SITE_URL must use HTTPS outside local development.');
  }
  if (url.username || url.password) {
    throw new Error('PUBLIC_SITE_URL must not include credentials.');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_URL must be an origin without path, query, or fragment.');
  }

  return url;
}

export function isTrustedHostHeader(hostHeader: string | null, site: URL | undefined): boolean {
  if (!site) return true;
  if (!hostHeader) return false;

  try {
    const authority = new URL(`${site.protocol}//${hostHeader.trim()}`);
    return (
      !authority.username &&
      !authority.password &&
      authority.pathname === '/' &&
      !authority.search &&
      !authority.hash &&
      authority.hostname === site.hostname &&
      authority.port === site.port
    );
  } catch {
    return false;
  }
}
