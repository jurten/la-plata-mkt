import { expect, test } from '@playwright/test';

const whatsappName = 'Escribir a La Plata Marketing por WhatsApp al +54 9 11 6426-5551';
const whatsappHref = 'https://wa.me/5491164265551';

test('adopta la arquitectura editorial del mockup sin perder el formulario real', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hacemos que todo trabaje como un sistema.' }),
  ).toBeVisible();
  await expect(page.getByText('LPM / Marketing × Tecnología × Ventas', { exact: true })).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  for (const link of ['Soluciones', 'Experiencia', 'Método', 'Capacidades']) {
    await expect(nav.getByRole('link', { name: link, exact: true })).toBeVisible();
  }

  await expect(page.locator('#problemas')).toBeVisible();
  await expect(page.locator('#soluciones .solution-path')).toHaveCount(3);
  await expect(page.locator('#sistema .system-node')).toHaveCount(7);
  await expect(page.locator('#trabajo .experience-card')).toHaveCount(2);
  await expect(page.locator('#metodo .method-step')).toHaveCount(4);
  await expect(page.locator('#capacidades .capability')).toHaveCount(4);
  await expect(page.locator('#faq details')).toHaveCount(8);

  const contact = page.locator('#contacto');
  await expect(contact.getByRole('heading', { name: 'Contanos qué necesitás resolver.' })).toBeVisible();
  await expect(contact.locator('[data-contact-form]')).toBeVisible();
  await expect(contact.getByLabel('Empresa')).toBeVisible();
  await expect(contact.getByRole('button', { name: 'Enviar consulta' })).toBeVisible();
});

test('conserva destinos aprobados y no importa placeholders ni dependencias del prototipo', async ({ page }) => {
  await page.goto('/');

  const whatsappLinks = page.getByRole('link', { name: whatsappName });
  await expect(whatsappLinks).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(whatsappLinks.nth(index)).toHaveAttribute('href', whatsappHref);
    await expect(whatsappLinks.nth(index)).not.toHaveAttribute('target', '_blank');
  }

  await expect(page.locator('a[href="mailto:ceo@laplatamarketing.com"]')).toHaveCount(2);
  const html = await page.locator('html').innerHTML();
  expect(html).not.toContain('hola@lpm.agency');
  expect(html).not.toContain('fonts.googleapis.com');
  expect(html).not.toContain('fonts.gstatic.com');
  expect(html).not.toContain('wa.me/?text=');
  expect(html).not.toMatch(/calendly|cal\.com|acuity/i);

  const layout = await page.evaluate(() => ({
    bodyOverflowX: getComputedStyle(document.body).overflowX,
    background: getComputedStyle(document.body).backgroundColor,
    blue: getComputedStyle(document.documentElement).getPropertyValue('--blue').trim(),
  }));
  expect(layout.bodyOverflowX).not.toBe('hidden');
  expect(layout.background).toBe('rgb(243, 239, 229)');
  expect(layout.blue).toBe('#1536f1');
});

test('publica la nueva marca LPM sin depender de un favicon externo', async ({ request }) => {
  const response = await request.get('/favicon.svg');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  const favicon = await response.text();
  expect(favicon).toContain('#1536f1');
  expect(favicon).toContain('La Plata Marketing');
  expect(favicon).not.toContain('#1d62a8');
});

test('permite elegir apariencia y conserva la preferencia sin romper el menú móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const appearance = page.getByRole('group', { name: 'Apariencia' });
  await expect(appearance.getByRole('button', { name: 'Usar preferencia del sistema' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await appearance.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0B1238');
  expect(await page.evaluate(() => localStorage.getItem('lpm-theme'))).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(appearance.getByRole('button', { name: 'Modo oscuro' })).toHaveAttribute('aria-pressed', 'true');

  const menu = page.getByRole('button', { name: 'Menú' });
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).not.toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('sin JavaScript mantiene la navegación móvil dentro del encabezado y fuera del hero', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(page.locator('.menu-toggle')).toBeHidden();
  await expect(nav).toBeVisible();

  const geometry = await page.evaluate(() => {
    const headerElement = document.querySelector('.topbar');
    const navElement = document.querySelector('.primary-nav');
    const heroElement = document.querySelector('.hero');
    if (!headerElement || !navElement || !heroElement) {
      throw new Error('No se pudo medir la navegación móvil sin JavaScript.');
    }

    const headerBox = headerElement.getBoundingClientRect();
    const navBox = navElement.getBoundingClientRect();
    const heroBox = heroElement.getBoundingClientRect();
    return {
      header: { top: headerBox.top, bottom: headerBox.bottom },
      nav: { top: navBox.top, bottom: navBox.bottom },
      hero: { top: heroBox.top },
      navPosition: getComputedStyle(navElement).position,
    };
  });

  expect(geometry.navPosition).toBe('static');
  expect(geometry.nav.top).toBeGreaterThanOrEqual(geometry.header.top);
  expect(geometry.nav.bottom).toBeLessThanOrEqual(geometry.header.bottom + 1);
  expect(geometry.hero.top).toBeGreaterThanOrEqual(geometry.header.bottom - 1);
  expect(geometry.nav.bottom).toBeLessThanOrEqual(geometry.hero.top + 1);
  await context.close();
});

test('sin JavaScript mantiene visible todo el contenido editorial y el formulario', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');

  for (const heading of [
    'Hacemos que todo trabaje como un sistema.',
    'Tu negocio funciona. ¿Su sistema digital también?',
    'Empecemos por lo que necesitás lograr.',
    'Una herramienta sola rara vez resuelve todo el problema.',
    'Experiencia aplicada a negocios reales.',
    'De un problema a una solución.',
    'Herramientas distintas para problemas distintos.',
    'Contanos qué necesitás resolver.',
    'Antes de conversar.',
  ]) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-contact-form]')).toBeVisible();
  await context.close();
});
