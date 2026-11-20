import { expect, test } from '@playwright/test';
test('privacy describes the actual form, providers and temporary language draft', async ({ page }) => {
  await page.goto('/privacidad/');
  await expect(page.locator('main')).toContainText('Resend');
  await expect(page.locator('main')).toContainText('Turnstile');
  await expect(page.locator('main')).toContainText('treinta minutos');
  await expect(page.locator('main')).not.toContainText('no tiene un formulario');
  await expect(page.locator('main a[href="/contacto/"]')).toBeVisible();
});
