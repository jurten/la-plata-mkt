import { expect, test } from '@playwright/test';

test('ofrece WhatsApp sin escribir texto por el usuario', async ({ page }) => {
  await page.goto('/#contacto');
  const name = 'Escribir a La Plata Marketing por WhatsApp al +54 9 11 5886-1954';
  const link = page.locator('#contacto').getByRole('group', { name: 'Canales de contacto directo' }).getByRole('link', { name });
  await expect(link).toContainText('+54 9 11 5886-1954');
  await expect(link).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(page.locator('footer').getByRole('link', { name })).toHaveAttribute('href', 'https://wa.me/5491158861954');
});

test('recorre enfoque, problemas, método y contacto en una misma página', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Ideas de otro planeta.');
  await expect(page.locator('.hero')).toContainText('Para problemas de acá.');
  await page.locator('.hero').getByRole('link', { name: 'Conocé nuestro enfoque', exact: true }).click();
  await expect(page).toHaveURL(/#soluciones$/);
  await expect(page.locator('#soluciones')).toBeInViewport();
  await page.locator('.business-problems summary').click();
  await expect(page.locator('.problem-item')).toHaveCount(6);
  for (const item of await page.locator('.problem-item').all()) await expect(item).toBeVisible();
  await expect(page.locator('.method-step')).toHaveCount(4);
  await page.locator('.primary-nav').getByRole('link', { name: 'Contacto', exact: true }).click();
  await expect(page).toHaveURL(/#contacto$/);
  for (const label of ['Empresa', 'Nombre de contacto', 'Email', '¿Qué problema querés resolver?']) await expect(page.getByLabel(label)).toBeVisible();
});

test('la lectura y el contacto básico funcionan sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.primary-nav').getByRole('link', { name: 'Contacto', exact: true })).toBeVisible();
  await expect(page.locator('.hero .button-primary')).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(page.locator('.alien-portrait img')).toHaveCount(0);
  await expect(page.locator('.alien-portrait canvas')).toHaveCSS('opacity', '0');
  await expect(page.locator('.perspective-study')).toHaveAttribute('data-view', 'whole');
  await expect(page.getByRole('group', { name: 'Cambiar la perspectiva del recorrido', includeHidden: true })).toBeHidden();
  await page.locator('#faq summary').first().click();
  await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
  await context.close();
});
