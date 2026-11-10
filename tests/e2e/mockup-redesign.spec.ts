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
  await page.locator('#capacidades > summary').click();
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

test('los servicios se pueden desplegar con teclado sin desbordar en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/#soluciones');
  const details = page.locator('.service-disclosure');
  await expect(details).toHaveCount(3);
  for (const detail of await details.all()) {
    await expect(detail.locator('.service-list')).toBeHidden();
    await detail.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(detail.locator('.service-list')).toBeVisible();
    await expect(detail.getByRole('link')).toHaveAttribute('href', /^(https:\/\/wa\.me\/5491158861954|#sistema)$/);
  }
  await page.locator('#capacidades > summary').click();
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
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
