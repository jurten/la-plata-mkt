import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('el laboratorio y las alternativas aparecen solo cuando palettes=1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1D62A8');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--purple'))).toBe('');

  await page.goto('/?palette=manchette');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');

  await page.goto('/?palettes=1');
  await expect(page.locator('[data-palette-lab]')).toBeVisible();
  await expect(page.locator('[data-palette-option]')).toHaveCount(4);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('cambia la paleta en vivo y mantiene un enlace compartible', async ({ page }) => {
  await page.goto('/?palettes=1');
  await page.locator('[data-palette-toggle]').click();

  await expect(page.locator('[data-palette-panel]')).toBeVisible();
  await page.getByRole('button', { name: /Manchette rojo/i }).click();

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'manchette');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#B72730');
  await expect(page.locator('[data-palette-option="manchette"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/palettes=1/);
  await expect(page).toHaveURL(/palette=manchette/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe('#b72730');
});

test('un enlace compartido aplica la paleta también en privacidad', async ({ page }) => {
  await page.goto('/privacidad?palettes=1&palette=sobreimpresion');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'sobreimpresion');
  await expect(page.locator('[data-palette-lab]')).toBeVisible();
  await expect(page.locator('[data-palette-option="sobreimpresion"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#284F82');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe('#284f82');
});

test('privacidad no carga el laboratorio fuera del modo de comparación', async ({ page }) => {
  await page.goto('/privacidad?palette=manchette');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F2D31B');
  await expect(page.locator('[data-palette-lab]')).toHaveCount(0);
  await expect(page.locator('script[src="/scripts/site.js"]')).toHaveCount(0);
});

test('el foco bicolor permanece visible dentro y fuera del laboratorio', async ({ page }) => {
  await page.goto('/');
  const normalLink = page.getByRole('link', { name: 'Servicios' }).first();
  await normalLink.focus();
  const normalFocus = await normalLink.evaluate((element) => ({
    color: getComputedStyle(element).outlineColor,
    offset: getComputedStyle(element).outlineOffset,
  }));

  expect(normalFocus).toEqual({ color: 'rgb(23, 41, 45)', offset: '3px' });

  const emailField = page.getByLabel('Email');
  await emailField.focus();
  const formFocus = await emailField.evaluate((element) => ({
    color: getComputedStyle(element).outlineColor,
    offset: getComputedStyle(element).outlineOffset,
    style: getComputedStyle(element).outlineStyle,
    width: getComputedStyle(element).outlineWidth,
  }));

  expect(formFocus).toEqual({
    color: 'rgb(23, 41, 45)',
    offset: '3px',
    style: 'solid',
    width: '3px',
  });

  await page.goto('/?palettes=1');
  const previewToggle = page.locator('[data-palette-toggle]');
  await previewToggle.focus();
  const previewFocus = await previewToggle.evaluate((element) => ({
    color: getComputedStyle(element).outlineColor,
    offset: getComputedStyle(element).outlineOffset,
  }));

  expect(previewFocus).toEqual({ color: 'rgb(23, 41, 45)', offset: '3px' });
});

test('la navegación conserva una paleta elegida en vivo', async ({ page }) => {
  await page.goto('/?palettes=1');
  await page.locator('[data-palette-toggle]').click();
  await page.locator('[data-palette-option="archivo"]').click();

  const privacyLink = page.locator('.footer-links a[href^="/privacidad"]');
  await expect(privacyLink).toHaveAttribute('href', '/privacidad?palettes=1&palette=archivo');
  await privacyLink.click();

  await expect(page).toHaveURL(/\/privacidad\?palettes=1&palette=archivo$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'archivo');
});

test('la navegación desde privacidad conserva una paleta elegida en vivo', async ({ page }) => {
  await page.goto('/privacidad?palettes=1');
  await page.locator('[data-palette-toggle]').click();
  await page.locator('[data-palette-option="manchette"]').click();

  const homeLink = page.locator('.legal-header .brand');
  await expect(homeLink).toHaveAttribute('href', '/?palettes=1&palette=manchette');
  await homeLink.click();

  await expect(page).toHaveURL(/\?palettes=1&palette=manchette$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'manchette');
});

test('Salir restaura la identidad predeterminada y elimina el laboratorio', async ({ page }) => {
  await page.goto('/?palettes=1&palette=sobreimpresion');
  await page.locator('[data-palette-toggle]').click();
  await page.getByRole('link', { name: 'Salir' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');
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
  await page.goto('/?palettes=1&palette=manchette#contacto');
  await page.getByLabel('Empresa').fill('Estudio Ejemplo');
  await page.getByLabel('Nombre de contacto').fill('Ana Pérez');
  await page.getByLabel('Email').fill('ana@example.com');
  await page
    .getByLabel('¿Qué problema querés resolver?')
    .fill('Necesitamos ordenar las consultas que llegan desde la web y mejorar su seguimiento.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();

  await expect(page.getByRole('status')).toContainText('Modo demo');
  await expect(page).toHaveURL(/\?palettes=1&palette=manchette#contacto$/);
});

for (const palette of ['registro', 'manchette', 'archivo', 'sobreimpresion']) {
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
  await page.goto('/?palettes=1&palette=manchette');
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
  await page.goto('/?palettes=1&palette=archivo');
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
