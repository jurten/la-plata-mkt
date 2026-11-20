import { expect, test } from '@playwright/test';

test('the selector preserves the page and valid section with native equivalents', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/nosotros/#como-trabajamos');
  await page.locator('.language-trigger').click();
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en/about/#como-trabajamos');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#como-trabajamos')).toContainText('Before we begin');
  await page.goto('/en/privacy/');
  await page.locator('.language-trigger').click();
  await page.locator('[hreflang="es-AR"][lang]').click();
  await expect(page).toHaveURL('/privacidad/');
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

test('English animation controls describe the orbit and services have no timer', async ({ page }) => {
  await page.goto('/en/#que-hacemos');
  await expect(page.locator('[data-approach-playback-toggle]')).toHaveCount(0);
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
  await expect(page.locator('#mode-label')).toHaveCount(0);
  await page.goto('/privacidad/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
