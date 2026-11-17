import { expect, test } from '@playwright/test';

for (const edge of ['top', 'bottom']) {
test(`la escena ocupa todo el ancho y el borde ${edge} respeta pausa y movimiento reducido`, async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const scene = page.locator('[data-system-orbit]');
  const transition = scene.locator('.system-orbit-transition').nth(edge === 'top' ? 0 : 1);
  const blob = transition.locator('[data-orbit-blob]');
  await transition.scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(1920);
  await expect(scene).toHaveCSS('border-radius', '0px');
  await expect(scene.locator('.system-orbit-stars span')).toHaveCount(170);
  const initial = await blob.getAttribute('d');
  await expect.poll(() => blob.getAttribute('d')).not.toBe(initial);
  await scene.locator('[data-orbit-toggle]').focus();
  await page.keyboard.press('Enter');
  await transition.scrollIntoViewIfNeeded();
  const frozen = await blob.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await blob.getAttribute('d')).toBe(frozen);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await blob.getAttribute('d');
  await page.waitForTimeout(180);
  expect(await blob.getAttribute('d')).toBe(reduced);
  await page.screenshot({ path: `artifacts/system-orbit/full-width-stars-${edge}.png` });
});
}

test('usa la elipse inclinada del prompt y sigue girando al pasar el cursor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit.locator('[data-orbit-stage]')).toHaveAttribute('data-orbit-ready', '');
  await expect(orbit.locator('[data-orbit-path]')).toHaveAttribute('transform', 'rotate(-8 700 700)');
  await expect(orbit.locator('strong')).toHaveText(['Publicidad', 'Web', 'Consulta', 'Comunicación', 'CRM', 'Proceso', 'Venta']);
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
  await page.setViewportSize({ width: 1440, height: 1600 });
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

for (const width of [320, 390, 768, 1250, 1280, 1440, 1920]) {
  test(`mantiene el contenido disponible a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#sistema');
    const orbit = page.locator('[data-system-orbit]');
    await orbit.scrollIntoViewIfNeeded();
    for (const item of await orbit.locator('strong').all()) await expect(item).toBeVisible();
    for (const card of await orbit.locator('.system-orbit-card').all()) {
      expect(await card.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(orbit.locator('[data-orbit-plane]')).toHaveCount(0);
    if (width === 390) await page.screenshot({ path: 'artifacts/system-orbit/supplied-engine-mobile.png' });
  });
}

test('las tarjetas no se superponen entre sí ni con el título durante una vuelta completa', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit.locator('[data-orbit-stage]')).toHaveAttribute('data-orbit-ready', '');
  for (let second = 0; second < 31; second++) {
    await page.clock.runFor(1000);
    const overlaps = await orbit.evaluate(root => {
      const cards = Array.from(root.querySelectorAll('.system-orbit-card'));
      const centerParts = Array.from(root.querySelectorAll('#system-title, [data-orbit-detail] > *'));
      const toggle = root.querySelector('[data-orbit-toggle]')!;
      const rects = [...cards, ...centerParts, toggle].map(el => el.getBoundingClientRect());
      const collisions: string[] = [];
      cards.forEach((card, i) => {
        if (card.scrollHeight > card.clientHeight + 1) collisions.push(`texto ${i}`);
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i], b = rects[j];
          // Reserve the same 3% enlargement used on hover and keyboard focus.
          const extraX = a.width * .015, extraY = a.height * .015;
          if (a.left - extraX < b.right && a.right + extraX > b.left && a.top - extraY < b.bottom && a.bottom + extraY > b.top) collisions.push(`${i} / ${j}`);
        }
      });
      return collisions;
    });
    expect(overlaps, `superposiciones en segundo ${second}`).toEqual([]);
  }
});

test('el título queda centrado y cada tarjeta conserva su información', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#sistema');
  const orbit = page.locator('[data-system-orbit]');
  await expect(orbit.locator('[data-orbit-stage] #system-title')).toBeVisible();
  await expect(orbit.locator('[data-orbit-detail]')).toHaveCount(0);
  await expect(orbit.locator('[data-orbit-path]')).toHaveAttribute('d', 'M 360 700 A 340 110 0 1 0 1040 700 A 340 110 0 1 0 360 700');
  const stageBox = (await orbit.locator('[data-orbit-stage]').boundingBox())!;
  const titleBox = (await orbit.locator('#system-title').boundingBox())!;
  expect(Math.abs(titleBox.x + titleBox.width / 2 - stageBox.x - stageBox.width / 2)).toBeLessThan(1);
  expect(Math.abs(titleBox.y + titleBox.height / 2 - stageBox.y - stageBox.height / 2)).toBeLessThan(1);
  for (const card of await orbit.locator('.system-orbit-card').all()) {
    await expect(card.locator('.system-orbit-description')).toBeVisible();
    await expect(card.locator('.system-orbit-points > span')).toHaveCount(3);
    await expect(card.locator('.system-orbit-points')).toBeVisible();
  }
});

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
