import { expect, test } from '@playwright/test';

test('el aviso de privacidad explica el tratamiento y permite volver al formulario', async ({ page }) => {
  const response = await page.goto('/privacidad');

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacidad, sin letra chica.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Qué datos recibimos' })).toBeVisible();
  await expect(page.getByText('celular (si decidís compartirlo)', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Para qué los usamos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tus decisiones y derechos' })).toBeVisible();
  await expect(page.getByText('laplatamarketing@gmail.com', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Borrador pendiente de revisión legal', { exact: false })).toBeVisible();

  const backLinks = page.getByRole('link', { name: 'Volver al formulario' });
  await expect(backLinks).toHaveCount(2);
  await expect(backLinks.nth(0)).toHaveAttribute('href', '/#contacto');
  await expect(backLinks.nth(1)).toHaveAttribute('href', '/#contacto');
});
