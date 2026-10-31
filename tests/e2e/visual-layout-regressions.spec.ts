import { expect, test } from '@playwright/test';

for (const route of ['/', '/privacidad/']) {
  test(route + ' mantiene texto y controles dentro del viewport', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    for (const width of [320, 390, 560, 700, 768, 900, 1000, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        clipped: [...document.querySelectorAll('h1, h2, h3, h4, input, textarea')].filter((node) => {
          const element = node as HTMLElement;
          return element.scrollWidth > element.clientWidth + 1;
        }).map((node) => node.textContent),
      }));
      expect(result.document, route + ' @ ' + width).toBeLessThanOrEqual(result.viewport);
      expect(result.body, route + ' @ ' + width).toBeLessThanOrEqual(result.viewport);
      expect(result.clipped, route + ' @ ' + width).toEqual([]);
    }
  });
}

test('el hero carga su imagen, mantiene el CTA visible y lo prioriza en móvil', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const image = page.locator('.alien-portrait img');
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    await expect(image).toHaveAttribute('loading', 'eager');
    await expect(image).toHaveAttribute('fetchpriority', 'high');
    const action = page.locator('.hero .button-primary');
    await expect(action).toBeVisible();
    await expect(action).toBeInViewport();
    const copy = (await page.locator('.hero-copy').boundingBox())!;
    expect(copy.x).toBeGreaterThanOrEqual(0);
    expect(copy.x + copy.width).toBeLessThanOrEqual(width);
    if (width === 390) {
      const art = (await page.locator('.alien-portrait').boundingBox())!;
      expect(art.y).toBeGreaterThanOrEqual(copy.y + copy.height);
      await expect(page.locator('.pillars').getByRole('heading', { name: 'Comunicación y marketing.', exact: true })).toBeVisible();
      await expect(page.locator('.pillars').getByRole('heading', { name: 'La conexión entre ambas.', exact: true })).toBeVisible();
    }
  }
});

test('el contacto se apila y muestra el formulario completo en móvil', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 900]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#contacto');
    await expect(page.locator('#contact-title')).toHaveText('Contanos qué necesitás resolver.');
    await expect(page.locator('[data-floating-whatsapp]')).toBeHidden();
    const intro = (await page.locator('.contact-intro').boundingBox())!;
    const form = (await page.locator('.form-surface').boundingBox())!;
    expect(form.y - (intro.y + intro.height)).toBeGreaterThanOrEqual(32);
    expect(form.x).toBeGreaterThanOrEqual(0);
    expect(form.x + form.width).toBeLessThanOrEqual(width);
  }
});
