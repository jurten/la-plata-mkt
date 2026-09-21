import { expect, test } from '@playwright/test';

test('el contenido editorial permanece visible y estacionario por defecto', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const essential = page.locator(
    '#hero-title, .section-head h2, .solution-path h3, .system-node span, .experience-card h3, .method-step h3, .capability h3, #contact-title, #faq-title',
  );
  expect(await essential.count()).toBeGreaterThan(20);
  const styles = await essential.evaluateAll((elements) =>
    elements.map((element) => {
      const computed = getComputedStyle(element);
      return {
        opacity: computed.opacity,
        visibility: computed.visibility,
        animationName: computed.animationName,
      };
    }),
  );

  for (const style of styles) {
    expect(style.opacity).toBe('1');
    expect(style.visibility).toBe('visible');
    expect(style.animationName).toBe('none');
  }
});

test('el modo automático sigue los cambios de apariencia del sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0B1238');
  await expect(page.getByRole('button', { name: 'Usar preferencia del sistema' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 18, 56)');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EFE5');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 239, 229)');
});

test('movimiento reducido elimina desplazamientos y transiciones no esenciales', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  for (const locator of [
    page.locator('.button').first(),
    page.locator('.skip-link'),
    page.locator('.submit-button'),
  ]) {
    const durations = await locator.evaluate((element) => ({
      animation: getComputedStyle(element).animationDuration,
      transition: getComputedStyle(element).transitionDuration,
    }));
    expect(Number.parseFloat(durations.animation)).toBeLessThanOrEqual(0.001);
    expect(Number.parseFloat(durations.transition)).toBeLessThanOrEqual(0.001);
  }
});

for (const scenario of ['missing', 'throwing'] as const) {
  test(`si matchMedia está ${scenario}, navegación, tema y formulario siguen activos`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript((mode) => {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: mode === 'missing'
          ? undefined
          : () => { throw new Error('matchMedia unavailable'); },
      });
    }, scenario);
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, delivery: 'demo' }),
      });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#contacto');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EFE5');

    const menu = page.getByRole('button', { name: 'Menú' });
    await menu.click();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();

    await page.getByLabel('Empresa').fill('Estudio de prueba');
    await page.getByLabel('Nombre de contacto').fill('Prueba progresiva');
    await page.getByLabel('Email').fill('progressive@example.com');
    await page.getByLabel('¿Qué problema querés resolver?').fill(
      'Necesitamos ordenar las consultas y mejorar el seguimiento comercial.',
    );
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.getByRole('status')).toContainText('Modo demo:');
    expect(pageErrors).toEqual([]);
  });
}

test('sin JavaScript el menú y todo el contenido siguen disponibles', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Menú' })).not.toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.locator('.solution-path')).toHaveCount(3);
  await expect(page.locator('.system-node')).toHaveCount(7);
  await expect(page.locator('.contact-form')).toBeVisible();

  const hidden = await page.locator('main h1, main h2, main h3, main p').evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
    }).length,
  );
  expect(hidden).toBe(0);
  await context.close();
});
