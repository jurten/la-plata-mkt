import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';

const pageFiles = [
  { path: 'dist/client/index.html', pathname: '/' },
  { path: 'dist/client/privacidad/index.html', pathname: '/privacidad/' },
];
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const htmlNamespace = 'http://www.w3.org/1999/xhtml';

function trimHtmlWhitespace(value) {
  return value.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, '');
}

function parseTrustedSite(value) {
  if (!value) return undefined;

  const url = new URL(value);
  const isLocalHttp = url.protocol === 'http:' && localHosts.has(url.hostname);
  if (url.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('PUBLIC_SITE_URL debe ser HTTPS o un origen HTTP local.');
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_URL debe contener solo el origen.');
  }
  return url;
}

function duplicateAttributeName(html, offset) {
  let end = offset;
  while (end > 0 && /\s/.test(html[end - 1])) end -= 1;
  let start = end;
  while (start > 0 && !/[\s<=>/]/.test(html[start - 1])) start -= 1;
  return html.slice(start, end).toLowerCase() || 'HTML';
}

function metadataFromHtml(html, path) {
  const parseErrors = [];
  const document = parse(html, {
    scriptingEnabled: true,
    onParseError: (error) => parseErrors.push(error),
  });
  const duplicate = parseErrors.find((error) => error.code === 'duplicate-attribute');
  if (duplicate) {
    const name = duplicateAttributeName(html, duplicate.startOffset);
    throw new Error(`${path} tiene el atributo ${name} duplicado.`);
  }

  const canonicalHrefs = [];
  const robotsDirectives = [];
  const hasDoctype = (document.childNodes ?? []).some((node) => node.nodeName === '#documentType');
  let hasTitle = false;

  const findHead = (node) => {
    if (node.namespaceURI === htmlNamespace && node.tagName === 'head') return node;
    for (const child of node.childNodes ?? []) {
      const head = findHead(child);
      if (head) return head;
    }
    return undefined;
  };
  const head = findHead(document);

  const visit = (node) => {
    const isHtml = node.namespaceURI === htmlNamespace;
    if (isHtml && node.tagName === 'template') return;

    if (isHtml && node.tagName === 'title') hasTitle = true;
    if (isHtml && node.tagName === 'link') {
      const attributes = new Map((node.attrs ?? []).map((attribute) => [attribute.name, attribute.value]));
      const relTokens = (attributes.get('rel') ?? '')
        .toLowerCase()
        .split(/[\t\n\f\r ]+/)
        .filter(Boolean);
      if (relTokens.includes('canonical')) {
        const href = attributes.get('href');
        if (href === undefined || !trimHtmlWhitespace(href)) {
          throw new Error(`El canonical de ${path} no tiene un atributo href válido.`);
        }
        canonicalHrefs.push(href);
      }
    }

    if (isHtml && node.tagName === 'meta') {
      const attributes = new Map((node.attrs ?? []).map((attribute) => [attribute.name, attribute.value]));
      if ((attributes.get('name') ?? '').toLowerCase() === 'robots') {
        const content = attributes.get('content');
        if (content === undefined || !trimHtmlWhitespace(content)) {
          throw new Error(`El meta robots de ${path} no tiene content válido.`);
        }
        robotsDirectives.push(content);
      }
    }

    for (const child of node.childNodes ?? []) visit(child);
  };

  if (head) visit(head);

  if (canonicalHrefs.length > 1) {
    throw new Error(`${path} tiene ${canonicalHrefs.length} canonical; se esperaba exactamente un canonical.`);
  }
  if (robotsDirectives.length > 1) throw new Error(`${path} tiene más de un meta robots.`);

  return {
    canonical: canonicalHrefs[0],
    robots: robotsDirectives[0],
    hasDoctype,
    hasTitle,
  };
}

export function verifyPrerenderedHtmlPages(renderedPages, explicitPublicSiteValue) {
  const explicitPublicSite = parseTrustedSite(explicitPublicSiteValue);
  let artifactMode;
  let discoveredOrigin;

  for (const { path, pathname, html } of renderedPages) {
    if (html.length < 1_000 || /Misdirected Request/i.test(html)) {
      throw new Error(`${path} no contiene una página HTML válida.`);
    }

    const { canonical, robots, hasDoctype, hasTitle } = metadataFromHtml(html, path);
    if (!hasDoctype) throw new Error(`${path} no contiene doctype.`);
    if (!hasTitle) throw new Error(`${path} no contiene title.`);

    const directives = (robots ?? '')
      .split(',')
      .map((directive) => trimHtmlWhitespace(directive).toLowerCase());
    const noindex = directives.includes('noindex') || directives.includes('none');
    const expectedFromExplicit = explicitPublicSite
      ? new URL(pathname, explicitPublicSite).toString()
      : undefined;
    let pageMode;

    if (expectedFromExplicit) {
      if (canonical !== expectedFromExplicit) {
        throw new Error(`${path} tiene canonical ${canonical ?? 'ausente'}; se esperaba ${expectedFromExplicit}.`);
      }
      if (noindex) throw new Error(`${path} está configurada pero publica noindex.`);
      pageMode = 'configured';
    } else if (canonical) {
      const canonicalUrl = new URL(canonical);
      const canonicalSite = parseTrustedSite(canonicalUrl.origin);
      const expected = new URL(pathname, canonicalSite).toString();
      if (canonical !== expected) {
        throw new Error(`${path} tiene canonical ${canonical}; se esperaba ${expected}.`);
      }
      if (noindex) throw new Error(`${path} publica canonical y noindex al mismo tiempo.`);
      if (discoveredOrigin && discoveredOrigin !== canonicalUrl.origin) {
        throw new Error('Las páginas prerenderizadas publican orígenes canonical diferentes.');
      }
      discoveredOrigin = canonicalUrl.origin;
      pageMode = 'configured';
    } else {
      if (!noindex) throw new Error(`${path} no está configurada y debe publicar noindex.`);
      pageMode = 'unconfigured';
    }

    if (artifactMode && artifactMode !== pageMode) {
      throw new Error('Las páginas prerenderizadas mezclan modos configured y unconfigured.');
    }
    artifactMode = pageMode;
  }

  return artifactMode;
}

export async function verifyBuild() {
  const generatedConfig = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));
  if (generatedConfig.keep_vars !== true) {
    throw new Error('El config generado de Wrangler debe conservar keep_vars=true.');
  }

  const renderedPages = await Promise.all(
    pageFiles.map(async (page) => ({ ...page, html: await readFile(page.path, 'utf8') })),
  );
  const artifactMode = verifyPrerenderedHtmlPages(renderedPages, process.env.PUBLIC_SITE_URL);
  console.log(`Verified ${renderedPages.length} prerendered HTML pages (${artifactMode}).`);
}

const entrypoint = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entrypoint === import.meta.url) await verifyBuild();
