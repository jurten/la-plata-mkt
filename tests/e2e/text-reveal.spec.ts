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

test('el contenido de desplegables y privacidad también recibe la entrada', async ({ page }) => {
  await page.goto('/#soluciones');
  const disclosure = page.locator('#soluciones details').first();
  await disclosure.locator('summary').click();
  await expect(disclosure.locator('li .text-reveal-line').first()).toBeAttached();
  await page.goto('/privacidad/');
  await expect(page.locator('h1 .text-reveal-line').first()).toBeAttached();
  await expect(page.locator('.legal-cta').getByRole('link', { name: 'Volver al formulario' })).toHaveAttribute('href', '/#contacto');
});

test('las máscaras conservan los colores del título y las etiquetas del formulario', async ({ page }) => {
  await page.goto('/#contacto');
  const title = page.locator('#contact-title');
  await expect(title.locator('.text-reveal-line').first()).toBeAttached();
  const colors = await title.evaluate(el => ({
    base: getComputedStyle(el).color,
    firstLine: getComputedStyle(el.querySelector('.text-reveal-line')!).color,
    emphasis: getComputedStyle([...el.querySelectorAll('span')].find(span => span.textContent === 'resolver.')!).color,
  }));
  expect(colors.firstLine).toBe(colors.base);
  expect(colors.emphasis).not.toBe(colors.base);
  await expect(page.getByLabel('Empresa')).toHaveCount(1);
  await expect(page.getByLabel('Empresa')).toHaveAttribute('id', 'company');
});
