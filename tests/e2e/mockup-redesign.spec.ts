import { expect, test } from '@playwright/test';

test('presenta tres disciplinas sin perder las capacidades existentes', async ({ page }) => {
  await page.goto('/');
  const pillars = page.locator('.pillars');
  await expect(pillars.locator('article')).toHaveCount(3);
  for (const name of [/Comunicación.*y marketing\./, 'Tecnología.', /La conexión.*entre ambas\./]) {
    await expect(pillars.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.locator('#nosotros')).toBeVisible();
  await expect(page.locator('#sistema .system-node')).toHaveCount(7);
  await expect(page.locator('#faq details')).toHaveCount(8);
  for (const service of ['Sitios institucionales', 'Landing pages', 'Ecommerce', 'Mantenimiento', 'Meta Ads', 'Setup de campañas', 'Medición', 'Optimización', 'CRM', 'Automatizaciones', 'Integraciones', 'Turnos y herramientas', 'Consultoría digital', 'Sistemas comerciales', 'Diseño de procesos', 'Diagnóstico']) {
    await expect(page.locator('#capacidades').getByText(service, { exact: true })).toBeVisible();
  }
});

test('el portfolio no publica identidades o resultados sin aprobación', async ({ page }) => {
  await page.goto('/');
  const portfolio = page.locator('#trabajo');
  await expect(portfolio.getByText('Estudio conceptual', { exact: true })).toHaveCount(2);
  await expect(portfolio).toContainText('Son ejemplos ilustrativos, no proyectos de clientes ni resultados obtenidos.');
  for (const name of ['Mirta Libera Propiedades', 'María Laumann Asociados', 'Señal verificada']) await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});

test('el formulario, el logo y los destinos de contacto siguen siendo reales', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('[data-contact-form]')).toHaveAttribute('action', '/api/contact');
  await expect(page.locator('.hero .button-primary')).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(page.locator('[data-floating-whatsapp]')).toHaveCSS('position', 'fixed');
  const links = page.locator('a[href^="https://wa.me"]');
  expect(await links.count()).toBeGreaterThanOrEqual(6);
  for (const link of await links.all()) await expect(link).toHaveAttribute('href', 'https://wa.me/5491158861954');
  const favicon = await request.get('/favicon.svg');
  expect(favicon.ok()).toBe(true);
  expect(await favicon.text()).toContain('#1536f1');
});
