import { expect, test, type Page } from '@playwright/test';

async function seek(page: Page, progress: number) {
  const root = page.locator('[data-approach]');
  await expect(root).toHaveAttribute('data-approach-enabled', '');
  await page.evaluate(progress => {
    const root = document.querySelector<HTMLElement>('[data-approach]')!;
    const start = Number(root.dataset.approachStart), end = Number(root.dataset.approachEnd);
    window.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' });
  }, progress);
  await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(progress, 2);
}

test.beforeEach(async ({ page }) => {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
});

for (const viewport of [{ width: 1920, height: 933 }, { width: 390, height: 844 }]) {
  test(`el cierre del hero solo expone marketing antes de iniciar el enfoque a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#inicio');
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-approach]');
    await expect(root).toHaveAttribute('data-approach-enabled', '');
    const assertInitialScene = async () => {
      await expect(root).toHaveAttribute('data-approach-progress', '0.0000');
      await expect(page.locator('#enfoque-marketing')).toHaveCSS('opacity', '1');
      for (const selector of ['#enfoque-tecnologia', '#enfoque-metodo', '[data-approach-brand]', '[data-approach-return]', '[data-approach-eye] .approach-eye__code']) {
        await expect(page.locator(selector)).toHaveCSS('opacity', '0');
      }
      await expect(page.locator('[data-approach-eye] .approach-eye__fill')).toHaveCSS('opacity', '1');
      await expect(page.locator('[data-approach-eye] .approach-eye__letters')).toHaveCSS('opacity', '1');
    };
    for (const progress of [.6, .8, 1]) {
      await page.evaluate(progress => {
        const hero = document.querySelector<HTMLElement>('[data-hero-reveal]')!;
        const start = Number(hero.dataset.revealStart), end = Number(hero.dataset.revealEnd);
        window.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' });
      }, progress);
      await expect.poll(() => page.locator('[data-hero-reveal]').getAttribute('data-reveal-progress').then(Number)).toBeCloseTo(progress, 2);
      await assertInitialScene();
    }
    await seek(page, .95);
    await expect(page.locator('[data-approach-brand]')).toHaveCSS('opacity', '1');
    await seek(page, 0);
    await assertInitialScene();
    // Resize forces a refresh at the exact zero boundary, rather than after
    // the first positive scroll frame that used to hide the leaked layers.
    await page.setViewportSize({ ...viewport, width: viewport.width - 1 });
    await seek(page, 0);
    await assertInitialScene();
  });
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`el ojo cruza, cambia de disciplina y el choque revela LPM a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#soluciones');
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-approach]');
    const eye = page.locator('[data-approach-eye]');
    const brand = page.locator('[data-approach-brand]');
    await seek(page, .1);
    await expect(root).toHaveAttribute('data-approach-state', 'marketing');
    await expect(eye.locator('.approach-eye__fill')).toHaveCSS('opacity', '1');
    await expect(eye.locator('.approach-eye__letters')).toHaveCSS('opacity', '1');
    await expect(brand).toHaveCSS('opacity', '0');
    const marketingPose = await eye.getAttribute('style');
    const left = (await eye.boundingBox())!.x;
    await seek(page, .55);
    await expect(root).toHaveAttribute('data-approach-state', 'technology');
    await expect(eye.locator('.approach-eye__fill')).toHaveCSS('opacity', '0');
    await expect(eye.locator('.approach-eye__code')).toHaveCSS('opacity', '1');
    expect((await eye.boundingBox())!.x).toBeGreaterThan(left);
    await seek(page, .8);
    await expect(page.locator('[data-approach-return]')).toHaveCSS('opacity', '1');
    await seek(page, .95);
    await expect(root).toHaveAttribute('data-approach-state', 'method');
    await expect(eye).toHaveCSS('opacity', '0');
    await expect(brand).toHaveCSS('opacity', '1');
    await expect(brand.locator('use')).toHaveAttribute('href', '/brand/lpm-logo.svg#lpm');
    await expect(page.locator('.approach-panel--method')).toHaveCSS('opacity', '1');
    await seek(page, .1);
    expect(await eye.getAttribute('style')).toBe(marketingPose);
    await expect(eye.locator('.approach-eye__fill')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    expect(errors).toEqual([]);
  });
}

test('el cambio de tamaño reconstruye la composición sin conservar el estado final', async ({ page }) => {
  await page.goto('/#soluciones');
  await seek(page, .95);
  for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 768 }, { width: 1440, height: 620 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.locator('[data-approach-stage]').evaluate(el => el.clientWidth)).toBe(viewport.width);
    await seek(page, .1);
    await expect(page.locator('[data-approach-eye] .approach-eye__fill')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-approach-brand]')).toHaveCSS('opacity', '0');
    await seek(page, .55);
    await expect(page.locator('[data-approach-eye] .approach-eye__code')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await seek(page, .95);
    const logo = (await page.locator('[data-approach-brand]').boundingBox())!;
    const heading = (await page.locator('#enfoque-metodo h3').boundingBox())!;
    expect(logo.y + logo.height + 8).toBeLessThanOrEqual(heading.y);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const panel of await page.locator('[data-approach-panel]').all()) {
      await expect(panel).toHaveCSS('opacity', '1');
      await expect(panel).toHaveCSS('clip-path', 'none');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
});

test('los enlaces del recorrido, hashes directos e historial llegan al acto correspondiente', async ({ page }) => {
  await page.goto('/#soluciones');
  const root = page.locator('[data-approach]');
  await expect(root).toHaveAttribute('data-approach-progress', '0.0000');
  const nav = page.getByRole('navigation', { name: 'Recorrido de nuestro enfoque' });
  await nav.getByRole('link', { name: 'Tecnología', exact: true }).click();
  await expect(root).toHaveAttribute('data-approach-state', 'technology');
  await expect(nav.getByRole('link', { name: 'Tecnología', exact: true })).toHaveAttribute('aria-current', 'step');
  await nav.getByRole('link', { name: 'Nuestro método', exact: true }).click();
  await expect(root).toHaveAttribute('data-approach-state', 'method');
  await expect(page.locator('[data-approach-brand]')).toHaveCSS('opacity', '1');
  await page.goBack();
  await expect(root).toHaveAttribute('data-approach-state', 'technology');
  await page.goto('/#enfoque-metodo');
  await expect(root).toHaveAttribute('data-approach-state', 'method');
  await expect(page.locator('[data-approach-brand]')).toHaveCSS('opacity', '1');
  await page.goto('/#inicio');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'idle');
  await page.locator('.hero-scroll-cue').click();
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'complete');
  await expect(root).toHaveAttribute('data-approach-state', 'marketing');
  await expect(page.locator('#pillars-title')).toBeInViewport();
});

test('teclado y enlaces permiten recorrer la escena y acceder a servicios en flujo normal', async ({ page }) => {
  await page.goto('/#soluciones');
  const link = page.locator('.approach-nav a').nth(1);
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-approach]')).toHaveAttribute('data-approach-state', 'technology');
  for (const detail of await page.locator('.approach-services details').all()) {
    await detail.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(detail).toHaveAttribute('open', '');
    await expect(detail.locator('.service-list')).toBeVisible();
    await expect(detail.locator('summary')).toBeInViewport();
  }
  await page.locator('#servicios-conexion .inline-link').click();
  await expect(page.locator('#system-title')).toBeInViewport();
});

test('movimiento reducido, pausa y poca altura conservan los tres actos y los servicios', async ({ page }) => {
  await page.goto('/#soluciones');
  await seek(page, .55);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const root = page.locator('[data-approach]');
  await expect(root).not.toHaveAttribute('data-approach-enabled');
  for (const panel of await page.locator('[data-approach-panel]').all()) {
    await expect(panel).toHaveCSS('opacity', '1');
    await expect(panel.locator('.approach-static-art')).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-approach-enabled', '');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: true })));
  await expect(root).not.toHaveAttribute('data-approach-enabled');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: false })));
  await expect(root).toHaveAttribute('data-approach-enabled', '');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(root).not.toHaveAttribute('data-approach-enabled');
  await expect(page.locator('#enfoque-metodo')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(root).not.toHaveAttribute('data-approach-enabled');
});

test('sin JavaScript los tres actos y las capacidades siguen disponibles', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  await context.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
  const page = await context.newPage();
  await page.goto('/#soluciones');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-approach]')).not.toHaveAttribute('data-approach-enabled');
  await expect(page.locator('[data-approach-panel]')).toHaveCount(3);
  for (const panel of await page.locator('[data-approach-panel]').all()) {
    await expect(panel.locator('h3')).toBeVisible();
    await expect(panel.locator('.approach-static-art')).toBeVisible();
  }
  await page.locator('#servicios-marketing summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#servicios-marketing .service-list')).toBeVisible();
  await page.locator('#capacidades summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#capacidades')).toContainText('Consultoría digital');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await context.close();
});
