import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('el laboratorio y las alternativas aparecen solo cuando palettes=1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'editorial');

  await page.goto('/?palette=cobalt');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'editorial');

  await page.goto('/?palettes=1');
  await expect(page.locator('[data-palette-lab]')).toBeVisible();
  await expect(page.locator('[data-palette-option]')).toHaveCount(4);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('cambia la paleta en vivo y mantiene un enlace compartible', async ({ page }) => {
  await page.goto('/?palettes=1');
  await page.locator('[data-palette-toggle]').click();

  await expect(page.locator('[data-palette-panel]')).toBeVisible();
  await page.getByRole('button', { name: /Cobalto cinético/i }).click();

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'cobalt');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#2146D0');
  await expect(page.locator('[data-palette-option="cobalt"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/palettes=1/);
  await expect(page).toHaveURL(/palette=cobalt/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--purple').trim())).toBe('#2146d0');
});

test('un enlace compartido aplica la paleta también en privacidad', async ({ page }) => {
  await page.goto('/privacidad?palettes=1&palette=burgundy');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'burgundy');
  await expect(page.locator('[data-palette-lab]')).toBeVisible();
  await expect(page.locator('[data-palette-option="burgundy"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#8C153F');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--purple').trim())).toBe('#8c153f');
});

test('privacidad no carga el laboratorio fuera del modo de comparación', async ({ page }) => {
  await page.goto('/privacidad?palette=cobalt');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'editorial');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F4E600');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('script[src="/scripts/site.js"]')).toHaveCount(0);
});

test('el foco reforzado queda aislado al modo de comparación', async ({ page }) => {
  await page.goto('/');
  const normalLink = page.getByRole('link', { name: 'Servicios' }).first();
  await normalLink.focus();
  const normalFocus = await normalLink.evaluate((element) => ({
    color: getComputedStyle(element).outlineColor,
    offset: getComputedStyle(element).outlineOffset,
  }));

  expect(normalFocus).toEqual({ color: 'rgb(183, 13, 138)', offset: '4px' });

  await page.goto('/?palettes=1');
  const previewToggle = page.locator('[data-palette-toggle]');
  await previewToggle.focus();
  const previewFocus = await previewToggle.evaluate((element) => ({
    color: getComputedStyle(element).outlineColor,
    offset: getComputedStyle(element).outlineOffset,
  }));

  expect(previewFocus).toEqual({ color: 'rgb(17, 17, 17)', offset: '3px' });
});

test('la navegación conserva una paleta elegida en vivo', async ({ page }) => {
  await page.goto('/?palettes=1');
  await page.locator('[data-palette-toggle]').click();
  await page.locator('[data-palette-option="petrol"]').click();

  const privacyLink = page.locator('.footer-links a[href^="/privacidad"]');
  await expect(privacyLink).toHaveAttribute('href', '/privacidad?palettes=1&palette=petrol');
  await privacyLink.click();

  await expect(page).toHaveURL(/\/privacidad\?palettes=1&palette=petrol$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'petrol');
});

test('la navegación desde privacidad conserva una paleta elegida en vivo', async ({ page }) => {
  await page.goto('/privacidad?palettes=1');
  await page.locator('[data-palette-toggle]').click();
  await page.locator('[data-palette-option="cobalt"]').click();

  const homeLink = page.locator('.legal-header .brand');
  await expect(homeLink).toHaveAttribute('href', '/?palettes=1&palette=cobalt');
  await homeLink.click();

  await expect(page).toHaveURL(/\?palettes=1&palette=cobalt$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'cobalt');
});

test('Salir restaura la identidad predeterminada y elimina el laboratorio', async ({ page }) => {
  await page.goto('/?palettes=1&palette=burgundy');
  await page.locator('[data-palette-toggle]').click();
  await page.getByRole('link', { name: 'Salir' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'editorial');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
});

test('un envío de contacto no borra el enlace compartible de la paleta', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, delivery: 'demo' }),
    });
  });
  await page.goto('/?palettes=1&palette=cobalt#contacto');
  await page.getByLabel('Empresa').fill('Estudio Ejemplo');
  await page.getByLabel('Nombre de contacto').fill('Ana Pérez');
  await page.getByLabel('Email').fill('ana@example.com');
  await page
    .getByLabel('¿Qué problema querés resolver?')
    .fill('Necesitamos ordenar las consultas que llegan desde la web y mejorar su seguimiento.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();

  await expect(page.getByRole('status')).toContainText('Modo demo');
  await expect(page).toHaveURL(/\?palettes=1&palette=cobalt#contacto$/);
});

for (const palette of ['editorial', 'cobalt', 'petrol', 'burgundy']) {
  test(`${palette} conserva contraste accesible en ambas rutas`, async ({ page }) => {
    for (const route of ['', 'privacidad']) {
      await page.goto(`/${route}?palettes=1&palette=${palette}`);
      await page.locator('[data-palette-toggle]').click();

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations, `${palette} /${route}`).toEqual([]);
    }
  });
}

test('el laboratorio cabe a 390px sin ocultar desborde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?palettes=1&palette=cobalt');
  const toggle = page.locator('[data-palette-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    overflowX: getComputedStyle(document.body).overflowX,
  }));
  const panelBox = await page.locator('[data-palette-panel]').boundingBox();

  expect(dimensions.document).toBe(dimensions.viewport);
  expect(dimensions.body).toBe(dimensions.viewport);
  expect(dimensions.overflowX).not.toBe('hidden');
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(0);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(dimensions.viewport);
});

test('el control para cerrar sigue visible en un viewport corto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 480 });
  await page.goto('/?palettes=1&palette=petrol');
  const toggle = page.locator('[data-palette-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');

  const toggleBox = await toggle.boundingBox();
  const panelBox = await page.locator('[data-palette-panel]').boundingBox();

  expect(toggleBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(toggleBox!.y).toBeGreaterThanOrEqual(0);
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(480);
});
