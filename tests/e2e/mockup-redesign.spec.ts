import { expect, test } from '@playwright/test';

test('el portfolio no publica identidades o resultados sin aprobación', async ({ page }) => {
  await page.goto('/');
  const portfolio = page.locator('#trabajo');
  await expect(portfolio.getByText('Estudio conceptual', { exact: true })).toHaveCount(3);
  await expect(portfolio).toContainText('Son ejemplos ilustrativos, no proyectos de clientes ni resultados obtenidos.');
  for (const name of ['Mirta Libera Propiedades', 'María Laumann Asociados', 'Señal verificada']) await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});

test('el logo y los destinos de contacto directo siguen siendo reales', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('[data-contact-form]')).toHaveCount(0);
  await expect(page.locator('.hero .button-primary')).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(page.locator('[data-floating-whatsapp]')).toHaveCSS('position', 'fixed');
  const links = page.locator('a[href^="https://wa.me"]');
  expect(await links.count()).toBeGreaterThanOrEqual(6);
  for (const link of await links.all()) await expect(link).toHaveAttribute('href', 'https://wa.me/5491158861954');
  const favicon = await request.get('/favicon.svg');
  expect(favicon.ok()).toBe(true);
  expect(await favicon.text()).toContain('#1536f1');
});
