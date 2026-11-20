import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1180, height: 820 }]) {
  test(`Circular Gallery conserva las siete etapas sin controles visibles a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#sistema');
    const stage = page.locator('[data-orbit-stage]');
    const gallery = stage.locator('[data-system-gallery]');
    await expect(stage).toHaveAttribute('data-gallery-ready');
    await gallery.scrollIntoViewIfNeeded();
    await expect(stage).not.toHaveAttribute('data-orbit-ready');
    await expect(gallery.locator('canvas')).toBeVisible();
    await expect(gallery.locator('[data-gallery-list] > li')).toHaveCount(7);
    await expect(stage.locator('#system-title')).toBeVisible();
    await expect(gallery.locator('.system-gallery-controls')).toHaveCount(0);
    await expect(page.locator('[data-orbit-toggle]')).toBeHidden();
    await gallery.locator('.system-orbit-card[tabindex="0"]').focus();
    await page.keyboard.press('Home');
    await expect(gallery).toHaveAttribute('data-gallery-active', '0');
    await page.keyboard.press('ArrowRight');
    await expect(gallery).toHaveAttribute('data-gallery-active', '1');
    await page.keyboard.press('ArrowLeft');
    await expect(gallery).toHaveAttribute('data-gallery-active', '0');
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `artifacts/system-orbit/circular-gallery-${viewport.width}-verified.png` });
  });
}

test('el teclado recorre todas las etapas y el cambio de orientación restaura escritorio', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/#sistema');
  const stage = page.locator('[data-orbit-stage]');
  const gallery = stage.locator('[data-system-gallery]');
  await expect(stage).toHaveAttribute('data-gallery-ready');
  await gallery.scrollIntoViewIfNeeded();
  await gallery.locator('.system-orbit-card[tabindex="0"]').focus();
  await page.keyboard.press('Home');
  await expect(gallery).toHaveAttribute('data-gallery-active', '0');
  for (let index = 1; index < 7; index++) {
    await page.keyboard.press('ArrowRight');
    await expect(gallery).toHaveAttribute('data-gallery-active', String(index));
  }
  await page.keyboard.press('ArrowRight');
  await expect(gallery).toHaveAttribute('data-gallery-active', '0');
  await page.setViewportSize({ width: 1180, height: 820 });
  await expect(stage).toHaveAttribute('data-gallery-ready');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(stage).toHaveAttribute('data-orbit-ready');
  await expect(stage).not.toHaveAttribute('data-gallery-ready');
  await expect(gallery.locator('canvas')).toHaveCount(0);
  await expect(stage.getByRole('button', { name: 'Traer CRM al frente' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(stage).toHaveAttribute('data-gallery-ready');
  await expect(gallery.locator('canvas')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(stage).not.toHaveAttribute('data-gallery-ready');
  await expect(stage.locator('strong')).toHaveCount(7);
  for (const title of await stage.locator('strong').all()) await expect(title).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(stage).toHaveAttribute('data-gallery-ready');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(stage).not.toHaveAttribute('data-gallery-ready');
});

test('el arrastre táctil cambia de tarjeta y el scroll vertical sigue libre', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/#sistema');
  const view = page.locator('[data-gallery-view]');
  await expect(page.locator('[data-orbit-stage]')).toHaveAttribute('data-gallery-ready');
  await view.scrollIntoViewIfNeeded();
  const gallery = page.locator('[data-system-gallery]');
  const before = await gallery.getAttribute('data-gallery-active');
  const box = (await view.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const y = Math.max(120, box.y + box.height / 2);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 290, y }] });
  for (let step = 1; step <= 10; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 290 - step * 22, y }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => gallery.getAttribute('data-gallery-active')).not.toBe(before);
  const top = await page.evaluate(() => scrollY);
  await page.mouse.move(195, y);
  await page.mouse.wheel(0, 160);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top + 80);
  await context.close();
});

test('sin WebGL conserva las tarjetas HTML completas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return getContext.apply(this, [type, ...args] as Parameters<typeof getContext>);
    } as typeof getContext;
  });
  await page.goto('/#sistema');
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator('[data-orbit-stage]');
  await expect(stage).not.toHaveAttribute('data-gallery-ready');
  for (const title of await stage.locator('strong').all()) await expect(title).toBeVisible();
  await expect(stage.locator('canvas')).toHaveCount(0);
});

