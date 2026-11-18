import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
});

for (const width of [1440, 390]) {
  test(`la entrada por líneas conserva el contenido y el diseño a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#inicio');
    const title = page.locator('#hero-title');
    await expect(title.locator('.text-reveal-line').first()).toBeAttached();
    await expect(title.locator('.text-reveal-line').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(title).toHaveAccessibleName('Ideas de otro planeta.');
    await expect(page.locator('.hero-subtitle .text-reveal-line').first()).toBeAttached();
    await expect(page.locator('.hero-lede .text-reveal-line, .button .text-reveal-line, .primary-nav .text-reveal-line, label .text-reveal-line')).toHaveCount(0);
    const animatedHeight = await title.evaluate(el => el.clientHeight);
    await expect(page.locator('.button-mimas')).toHaveAttribute('href', 'https://wa.me/5491158861954');
    await page.locator('.button-mimas').hover();
    await expect(page.locator('.button-mimas')).toHaveCSS('color', 'rgb(11, 20, 48)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.text-reveal-line')).toHaveCount(0);
    expect(await title.evaluate(el => el.clientHeight)).toBe(animatedHeight);
    await expect(title).toHaveText(/Ideas de\s+otro planeta\./);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(title.locator('.text-reveal-line').first()).toBeAttached();
  });
}

test('la información clave mantiene el texto estático y privacidad anima sus títulos', async ({ page }) => {
  await page.goto('/#como-trabajamos');
  const context = page.locator('#como-trabajamos');
  await expect(context.locator('p').first()).toBeVisible();
  await expect(context.locator('p .text-reveal-line')).toHaveCount(0);
  await page.goto('/privacidad/');
  await expect(page.locator('h1 .text-reveal-line').first()).toBeAttached();
  await expect(page.locator('.legal-cta').getByRole('link', { name: 'Volver a contacto' })).toHaveAttribute('href', '/#contacto');
});

test('el texto decorativo se anima y las descripciones quedan estáticas', async ({ page }) => {
  await page.goto('/#trabajo');
  await page.locator('.estate-type').scrollIntoViewIfNeeded();
  await expect(page.locator('.estate-type .text-reveal-line').first()).toBeAttached();
  await expect(page.locator('.concept-description p .text-reveal-line, .concept-caption .text-reveal-line')).toHaveCount(0);
});

test('las máscaras conservan el título de contacto y sus enlaces', async ({ page }) => {
  await page.goto('/#contacto');
  const title = page.locator('#contact-title');
  await expect(title.locator('.text-reveal-line').first()).toBeAttached();
  const colors = await title.evaluate(el => ({
    base: getComputedStyle(el).color,
    firstLine: getComputedStyle(el.querySelector('.text-reveal-line')!).color,
  }));
  expect(colors.firstLine).toBe(colors.base);
  await expect(title).toHaveText('Hablemos');
  await expect(page.locator('footer .footer-email')).toHaveAttribute('href', 'mailto:ceo@laplatamarketing.com');
});
