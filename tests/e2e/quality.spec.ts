import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la home publica metadata social, canonical y datos estructurados verificables', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Marketing, sitios web, CRM y automatizaciones | La Plata Marketing');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /inmobiliarias y estudios jurídicos/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^http:\/\/127\.0\.0\.1:4321\/$/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_AR');
  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute('content', /og-la-plata-marketing\.png$/);
  const ogImageUrl = await ogImage.getAttribute('content');
  expect(ogImageUrl).not.toBeNull();
  const ogImageResponse = await page.request.get(ogImageUrl!);
  expect(ogImageResponse.status()).toBe(200);
  expect(ogImageResponse.headers()['content-type']).toContain('image/png');

  const structuredData = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}');
  expect(structuredData).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'La Plata Marketing',
    email: 'laplatamarketing@gmail.com',
  });
  expect(structuredData.hasOfferCatalog.itemListElement).toHaveLength(4);

  const robotsResponse = await page.request.get('/robots.txt');
  expect(robotsResponse.status()).toBe(200);
  expect(await robotsResponse.text()).toContain('Sitemap: http://127.0.0.1:4321/sitemap.xml');

  const sitemapResponse = await page.request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  expect(sitemapResponse.headers()['content-type']).toContain('application/xml');
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain('<loc>http://127.0.0.1:4321/</loc>');
  expect(sitemap).toContain('<loc>http://127.0.0.1:4321/privacidad</loc>');
});

test('las páginas publican cabeceras de seguridad compatibles con el formulario y Turnstile', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response?.headers() ?? {};

  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['content-security-policy']).toContain('https://challenges.cloudflare.com');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
});

test('rechaza un Host no confiable antes de generar URLs públicas', async ({ request }) => {
  const response = await request.get('/', { headers: { Host: 'attacker.example' } });

  expect([403, 421]).toContain(response.status());
  const body = await response.text();
  expect(body).not.toContain('rel="canonical"');
  expect(body).not.toContain('<urlset');
});

for (const path of ['/', '/privacidad']) {
  test(`${path} no tiene violaciones detectadas por axe`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('la composición también cabe a 320px sin ocultar desborde', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const dimensions = await page.evaluate(() => {
    const processList = document.querySelector<HTMLElement>('.process-list');
    return {
      documentClient: document.documentElement.clientWidth,
      documentScroll: document.documentElement.scrollWidth,
      bodyClient: document.body.clientWidth,
      bodyScroll: document.body.scrollWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      processClient: processList?.clientWidth ?? 0,
      processScroll: processList?.scrollWidth ?? 0,
    };
  });

  expect(dimensions.documentScroll).toBeLessThanOrEqual(dimensions.documentClient);
  expect(dimensions.bodyScroll).toBeLessThanOrEqual(dimensions.bodyClient);
  expect(dimensions.bodyOverflowX).not.toBe('hidden');
  expect(dimensions.processScroll).toBeLessThanOrEqual(dimensions.processClient);
});

test('privacidad cabe a 320px y 390px sin ocultar desborde', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/privacidad');

    const dimensions = await page.evaluate(() => ({
      documentClient: document.documentElement.clientWidth,
      documentScroll: document.documentElement.scrollWidth,
      bodyClient: document.body.clientWidth,
      bodyScroll: document.body.scrollWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
    }));

    expect(dimensions.documentScroll).toBeLessThanOrEqual(dimensions.documentClient);
    expect(dimensions.bodyScroll).toBeLessThanOrEqual(dimensions.bodyClient);
    expect(dimensions.bodyOverflowX).not.toBe('hidden');
  }
});

test('la composición móvil no desborda y el menú funciona con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Menú' });
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(menu).toBeVisible();
  await expect(nav).not.toBeVisible();

  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);

  const automationHeading = page.locator('.service-automation h3');
  const automationWidth = await automationHeading.evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(automationWidth.scroll).toBeLessThanOrEqual(automationWidth.client);

  await expect(page.locator('.marquee-track')).toHaveCSS('animation-iteration-count', '1');
});
