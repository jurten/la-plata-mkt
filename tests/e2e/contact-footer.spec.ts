import { expect, test } from '@playwright/test';

test('el footer ofrece navegación y contacto directo sin FAQ ni formulario', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contacto');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toHaveAttribute('id', 'contacto');
  await expect(footer.locator('#contact-title')).toHaveText('Hablemos');
  await expect(page.locator('#faq, [data-contact-form], .cf-turnstile')).toHaveCount(0);
  await expect(page.locator('script[src*="challenges.cloudflare.com/turnstile"]')).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'Contacto por email' })).toHaveAttribute('href', 'mailto:ceo@laplatamarketing.com');
  await expect(footer.locator('.footer-whatsapp')).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(footer.getByRole('link', { name: 'Cómo trabajamos' })).toHaveAttribute('href', '#como-trabajamos');
  await expect(page.locator('[data-floating-whatsapp]')).toBeHidden();
  await footer.getByRole('link', { name: 'Cómo trabajamos' }).click();
  await expect(page.locator('#working-title')).toBeInViewport();
  await expect(page.locator('#como-trabajamos')).toContainText('alcance, los tiempos y el presupuesto');
  await expect(page.locator('#como-trabajamos')).toContainText('servicio puntual');
});

test('el contacto y la información clave funcionan sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/#contacto');
    await expect(page.locator('footer .footer-whatsapp')).toBeVisible();
    await expect(page.locator('form, #faq')).toHaveCount(0);
    await page.locator('footer').getByRole('link', { name: 'Cómo trabajamos' }).click();
    await expect(page.locator('#working-title')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  } finally { await context.close(); }
});

test('los destinos directos y el antiguo enlace FAQ llegan a contenido útil', async ({ page }) => {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
  for (const hash of ['contacto', 'como-trabajamos', 'faq']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator(hash === 'contacto' ? '#contact-title' : '#working-title')).toBeInViewport();
  }
});
