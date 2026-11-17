import { expect, test } from '@playwright/test';

test('la escena ocupa todo el ancho y el borde orgánico respeta pausa y movimiento reducido', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const scene = page.locator('[data-system-orbit]');
  const blob = scene.locator('[data-orbit-blob]');
  await scene.locator('.system-orbit-transition').scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(1920);
  await expect(scene).toHaveCSS('border-radius', '0px');
  await expect(scene.locator('.system-orbit-stars span')).toHaveCount(170);
  const initial = await blob.getAttribute('d');
  await expect.poll(() => blob.getAttribute('d')).not.toBe(initial);
  await scene.locator('[data-orbit-toggle]').focus();
  await page.keyboard.press('Enter');
  await scene.locator('.system-orbit-transition').scrollIntoViewIfNeeded();
  const frozen = await blob.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await blob.getAttribute('d')).toBe(frozen);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await blob.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await blob.getAttribute('d')).toBe(reduced);
  await page.screenshot({ path: 'artifacts/system-orbit/full-width-stars.png' });
});

test('usa la elipse inclinada del prompt y sigue girando al pasar el cursor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit.locator('[data-orbit-stage]')).toHaveAttribute('data-orbit-ready', '');
  await expect(orbit.locator('[data-orbit-path]')).toHaveAttribute('transform', 'rotate(-8 700 700)');
  await expect(orbit.locator('strong')).toHaveText(['Publicidad', 'Web', 'Consulta', 'WhatsApp', 'CRM', 'Proceso', 'Venta']);
  await expect(orbit.locator('[data-intro]')).toHaveCount(0);
  const first = orbit.locator('[data-orbit-item]').first();
  await expect.poll(() => first.evaluate(el => el.style.transform)).toContain('translate3d');
  await first.hover({ force: true });
  const before = await first.getAttribute('style');
  await expect.poll(() => first.getAttribute('style')).not.toBe(before);
  expect(await first.evaluate(el => el.style.transform)).not.toContain('rotate');
  await page.screenshot({ path: 'artifacts/system-orbit/supplied-engine-desktop.png' });
});

test('arrastre horizontal con inercia y clic para traer un concepto al frente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit.locator('[data-intro]')).toHaveCount(0);
  const stage = orbit.locator('[data-orbit-stage]');
  const box = (await stage.boundingBox())!;
  const first = orbit.locator('[data-orbit-item]').first();
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .7);
  const grab = /url\([^)]*\/cursors\/retro-grab\.png[^)]*\) 16 16, grab/;
  const grabbing = /url\([^)]*\/cursors\/retro-grabbing\.png[^)]*\) 16 16, grabbing/;
  await expect(stage).toHaveCSS('cursor', grab);
  await expect(orbit.locator('.system-orbit-card').first()).toHaveCSS('cursor', grab);
  await page.mouse.down();
  await expect(stage).toHaveCSS('cursor', grabbing);
  await page.mouse.move(box.x + box.width * .65, box.y + box.height * .7, { steps: 16 });
  await expect(stage).toHaveAttribute('data-dragging', '');
  await expect(stage).toHaveCSS('cursor', grabbing);
  await expect(orbit.locator('.system-orbit-card').first()).toHaveCSS('cursor', grabbing);
  const dragged = await first.getAttribute('style');
  await page.mouse.up();
  await expect(stage).not.toHaveAttribute('data-dragging');
  await expect(stage).not.toHaveCSS('cursor', grabbing);
  await expect(stage).toHaveCSS('cursor', grab);
  const cursorResponse = await page.request.get('/cursors/retro-grabbing.png');
  expect(cursorResponse.ok()).toBe(true);
  const cursorBytes = await cursorResponse.body();
  expect(cursorBytes.readUInt32BE(16)).toBe(32);
  expect(cursorBytes.readUInt32BE(20)).toBe(32);
  await expect.poll(() => first.getAttribute('style')).not.toBe(dragged);
  // Reduced motion makes deliberate click-to-front instant and measurable.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(1000);
  const target = orbit.getByRole('button', { name: 'Traer CRM al frente' });
  await target.click({ force: true });
  const crm = orbit.locator('[data-orbit-item="4"]');
  await expect.poll(() => crm.evaluate(el => Number(el.style.zIndex))).toBeGreaterThanOrEqual(180);
  await expect(orbit.locator('[data-orbit-toggle]')).toBeHidden();
});

for (const width of [320, 390, 768, 1440]) {
  test(`mantiene el contenido disponible a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#sistema');
    const orbit = page.locator('[data-system-orbit]');
    await orbit.scrollIntoViewIfNeeded();
    for (const item of await orbit.locator('strong').all()) await expect(item).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(orbit.locator('[data-orbit-plane]')).toHaveCount(0);
    if (width === 390) await page.screenshot({ path: 'artifacts/system-orbit/supplied-engine-mobile.png' });
  });
}

test('sin JavaScript conserva el recorrido completo en orden', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await expect(orbit.locator('li')).toHaveCount(7);
  for (const item of await orbit.locator('strong').all()) await expect(item).toBeVisible();
  await expect(orbit.locator('[data-orbit-toggle]')).toBeHidden();
  await context.close();
});
