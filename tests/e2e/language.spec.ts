import { expect, test } from '@playwright/test';

test('el selector cambia de idioma con teclado y conserva sección y navegación de privacidad', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#soluciones');
  await page.locator('.language-trigger').click();
  const selector = page.getByRole('navigation', { name: 'Idioma', exact: true });
  await expect(selector.getByRole('link', { name: 'Español' })).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-theme-toggle]')).toHaveCount(0);
  await selector.getByRole('link', { name: 'English' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/en/#soluciones');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#hero-title')).toHaveText('We are a team with ideas from another planet');
  await expect(page.locator('.approach-panel').first()).toContainText('Communication');
  await expect(page.locator('.approach-panel').last()).toContainText('Digital consulting');
  await expect(page.locator('.content-disclosure')).toHaveText('These are illustrative examples, not client projects or achieved results.');
  await expect(page.locator('.flowing-team__role').first()).toHaveText('Technology');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL('/en/privacy/');
  await expect(page.locator('h1')).toContainText('without the fine print');
  await expect(page.locator('.legal-back')).toHaveAttribute('href', '/en/#contacto');
  await page.locator('.language-trigger').click();
  await page.getByRole('navigation', { name: 'Language', exact: true }).getByRole('link', { name: 'Español' }).click();
  await expect(page).toHaveURL('/privacidad/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
});

test('las versiones completas y sus metadatos funcionan sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const route of ['/en/', '/en/privacy/']) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.getByRole('navigation', { name: 'Language', exact: true }).getByRole('link', { name: 'Español' })).toBeVisible();
      const canonical = page.locator('link[rel="canonical"]');
      if (await canonical.count()) {
        const href = (await canonical.getAttribute('href'))!;
        expect(new URL(href).pathname).toBe(route);
        await expect(page.locator('link[hreflang="en"][rel="alternate"]')).toHaveAttribute('href', href);
      } else {
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      }
      expect(await page.locator('h1, h2, h3').allTextContents()).not.toEqual([]);
      for (const heading of await page.locator('h1, h2, h3').allTextContents()) expect(heading.trim()).not.toMatch(/\.$/);
    }
    await expect(page.locator('.legal-sections')).toContainText('Who receives your inquiry');
    await expect(page.locator('.legal-sections')).toContainText('Your choices and rights');
  } finally {
    await context.close();
  }
});

test('el idioma y los controles caben en escritorio y móvil', async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/en/', '/en/privacy/']) {
      await page.goto(route);
      await page.locator('.language-trigger').click();
      const links = page.locator('[data-language-switcher] a');
      for (const link of await links.all()) {
        await expect(link).toBeVisible();
        const box = (await link.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (route === '/en/' && width <= 390) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
        await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: /About us/ })).toBeVisible();
        await page.keyboard.press('Escape');
      }
      if (route.startsWith('/en/')) {
        await page.locator('body').click({ position: { x: 1, y: 150 } });
        await page.screenshot({ path: `artifacts/language/${width}-${route.includes('privacy') ? 'privacy' : 'home'}.png`, fullPage: route.includes('privacy') });
      }
      if (route === '/en/' && width !== 320) {
        for (const [name, selector] of [['approach', '[data-approach]'], ['system', '[data-system-orbit]'], ['work', '.featured-work'], ['team', '.team-roster'], ['contact', '.closing-footer']]) {
          await page.locator(selector).screenshot({ path: `artifacts/language/${width}-${name}.png` });
        }
      }
    }
  }
});

test('los controles de animación usan inglés y conservan su función', async ({ page }) => {
  await page.goto('/en/#soluciones');
  const playback = page.locator('[data-approach-playback-toggle]');
  await expect(playback).toHaveAttribute('aria-label', 'Pause autoplay');
  await playback.click();
  await expect(playback).toHaveAttribute('aria-label', 'Resume autoplay');
  await expect(page.locator('[data-approach-countdown]')).toHaveText('Continue tour');
  await expect(page.locator('[data-orbit-toggle-label]')).toHaveText('Pause orbit');
});

test('conserva la apariencia del sistema y una preferencia guardada entre idiomas', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#11151C');
  await page.evaluate(() => localStorage.setItem('lpm-theme', 'light'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#mode-label')).toHaveText('Visual identity / Live signal');
  await page.goto('/privacidad/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
