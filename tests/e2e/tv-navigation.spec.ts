import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/trabajos/', '/nosotros/', '/contacto/', '/privacidad/', '/en/', '/en/work/', '/en/about/', '/en/contact/', '/en/privacy/'];
test.beforeEach(async ({ page }) => {
  await page.route(/hubspot|hs-scripts|hs-analytics|hs-banner|hscollectedforms/, route => route.abort());
});

for (const route of routes) {
  test(`${route} tiene contenido, navegación, idioma y márgenes accesibles`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.primary-nav a')).toHaveCount(3);
    await expect(page.locator('.primary-nav a[href*="#"]')).toHaveCount(0);
    await expect(page.locator('.language-switcher a[hreflang="en"]')).toHaveAttribute('href', /\/en\//);
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('el menú contiene el foco, cierra con Escape y navega a páginas reales', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/trabajos/');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  await toggle.click();
  await page.locator('.station-links a[href="/contacto/"]').click();
  await expect(page).toHaveURL(/\/contacto\/$/);
  await expect(page.locator('[data-floating-whatsapp]')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/trabajos\/$/);
});

for (const width of [1440, 390]) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`la navbar responde a la dirección del scroll a ${width}px con movimiento ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      for (const route of ['/', '/nosotros/']) {
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        const header = page.locator('header[data-tv-navigation]');
        await expect(header).toBeInViewport();
        await page.evaluate(() => scrollTo({ top: 400, behavior: 'instant' }));
        await expect(header).not.toBeInViewport();
        await page.evaluate(() => scrollTo({ top: 380, behavior: 'instant' }));
        await expect(header).toBeInViewport();
        await page.evaluate(() => scrollTo({ top: 382, behavior: 'instant' }));
        await expect(header).toHaveAttribute('data-scroll-hidden', 'false');
        await page.evaluate(() => scrollTo({ top: 500, behavior: 'instant' }));
        await expect(header).not.toBeInViewport();
        await page.locator('.brand').focus();
        await expect(header).toBeInViewport();
        if (width === 390) {
          await page.locator('.menu-toggle').click();
          await expect(header).toBeInViewport();
          await expect(page.locator('[data-station-menu]')).toBeVisible();
          await page.keyboard.press('Escape');
        }
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await expect(header).toBeInViewport();
      }
    });
  }
}

test('la landing no selecciona enlaces de subpáginas al recorrer sus secciones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const selected = page.locator('.primary-nav a[aria-current], [data-station-link][aria-current]');
  for (const route of ['/', '/en/']) {
    await page.goto(route);
    await expect(selected).toHaveCount(0);
    await page.locator('.hero-scroll-cue[href="#soluciones"]').click();
    await expect(page).toHaveURL(/#soluciones$/);
    await expect(selected).toHaveCount(0);
    for (const id of ['trabajo', 'nosotros', 'contacto', 'inicio']) {
      await page.locator(`#${id}`).evaluate(section => section.scrollIntoView({ behavior: 'instant' }));
      await expect(selected).toHaveCount(0);
      await expect(page.locator('.primary-nav [data-gooey-target]')).toHaveCount(0);
    }
  }
});

test('la navbar comparte geometría, destinos y estado activo entre páginas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    let baseline: unknown;
    for (const route of ['/', '/trabajos/', '/nosotros/', '/contacto/', '/privacidad/']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.locator('[data-tv-navigation]').evaluate(header => {
        const nav = header.querySelector('.nav')!;
        const logo = header.querySelector('.brand-logo__symbol')!;
        const link = header.querySelector('.primary-nav a')!;
        return { height: nav.getBoundingClientRect().height, logoWidth: logo.getBoundingClientRect().width, font: getComputedStyle(link).font, labels: [...header.querySelectorAll('.primary-nav a')].map(el => el.textContent) };
      });
      if (!baseline) baseline = geometry;
      expect(geometry).toEqual(baseline);
      await expect(page.locator('[data-channel-id="soluciones"]')).toHaveCount(0);
      if (route !== '/' && route !== '/privacidad/') {
        await expect(page.locator('.primary-nav [aria-current="page"]')).toHaveAttribute('href', route);
        await page.evaluate(() => scrollTo({ top: 500, behavior: 'instant' }));
        await expect(page.locator('.primary-nav [aria-current="page"]')).toHaveAttribute('href', route);
      }
      if (width === 390) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.locator('.menu-toggle').click();
        await expect(page.locator('[data-station-link]')).toHaveCount(4);
        await expect(page.locator('[data-station-menu]')).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  }
  await page.goto('/en/contact/');
  await expect(page.locator('.brand')).toHaveAttribute('href', '/en/');
  await expect(page.locator('[data-channel-id="soluciones"]')).toHaveCount(0);
});

test('cambiar de idioma preserva el borrador en la página equivalente', async ({ page }) => {
  await page.goto('/contacto/');
  await page.locator('[name="contactName"]').fill('Ana Pérez');
  await page.locator('[name="email"]').fill('ana@example.com');
  await page.locator('[name="issue"]').fill('Queremos conectar nuestra web y el seguimiento comercial.');
  await page.locator('.language-trigger').click();
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/contact\/$/);
  await expect(page.locator('[name="contactName"]')).toHaveValue('Ana Pérez');
  await expect(page.locator('[name="issue"]')).toHaveValue('Queremos conectar nuestra web y el seguimiento comercial.');
  expect(await page.evaluate(() => sessionStorage.getItem('lpm-contact-language-draft'))).toBeNull();
});

test('el formulario distingue demo, verificación, límite, fallo y entrega real', async ({ page }) => {
  await page.goto('/contacto/');
  await page.locator('[type="submit"]').click();
  await expect(page.locator('[name="contactName"]')).toBeFocused();
  await page.locator('[name="contactName"]').fill('Ana Pérez');
  await page.locator('[name="email"]').fill('ana@example.com');
  await page.locator('[name="issue"]').fill('Queremos conectar nuestra web y el seguimiento comercial.');
  await page.locator('[name="privacyAccepted"]').check();
  for (const state of [
    { status: 200, json: { ok: true, delivery: 'demo' }, expected: 'demo' },
    { status: 400, json: { ok: false, error: 'spam' }, expected: 'spam' },
    { status: 429, json: { ok: false, error: 'rate_limit' }, expected: 'rate_limit' },
    { status: 502, json: { ok: false, error: 'delivery' }, expected: 'error' },
    { status: 200, json: { ok: true, delivery: 'live' }, expected: 'received' },
  ]) {
    await page.route('**/api/contact', route => route.fulfill({ status: state.status, json: state.json }));
    await page.locator('[type="submit"]').click();
    await expect(page.locator('form')).toHaveAttribute('data-state', state.expected);
    await expect(page.locator('[name="issue"]')).not.toHaveValue('');
    await page.unroute('**/api/contact');
  }
  await expect(page.locator('[data-new-inquiry]')).toBeVisible();
  await page.locator('[data-new-inquiry]').click();
  await expect(page.locator('[name="issue"]')).toHaveValue('');
});

test('la landing conserva sus secciones y fragmentos y 404 conserva el idioma', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const old of ['/#trabajo', '/en/#nosotros', '/#como-trabajamos', '/#team-joaquin-laumann']) {
    await page.goto(old);
    expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe(old);
    await expect(page.locator(new URL(page.url()).hash)).toBeAttached();
  }
  const response = await page.goto('/en/missing-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('sin JavaScript siguen disponibles las páginas, los perfiles y los canales directos', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/nosotros/');
  await expect(page.locator('.team-profile')).toHaveCount(3);
  await page.locator('.primary-nav a[href="/contacto/"]').click();
  await expect(page.locator('.contact-intro a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('.contact-intro a[href^="https://wa.me/"]').first()).toBeVisible();
  await context.close();
});
