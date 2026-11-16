import { expect, test } from '@playwright/test';
import { auditGalaxy } from './helpers/galaxy-audit';

test('el hero muestra Galaxy y el alien sin capas ni distorsión CRT', async ({ page }) => {
  await auditGalaxy(page);
  await page.goto('/#inicio');
  const portrait = page.locator('[data-spatial-portrait]');
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uTime?.[0] ?? 0), { timeout: 15_000 }).toBeGreaterThan(2.5);
  await expect(page.locator('.transmission-static, .transmission-glass, [data-crt-cutout]')).toHaveCount(0);
  await expect(page.locator('[data-site-transmission]')).toBeHidden();
  await expect(portrait).not.toHaveAttribute('data-spatial-signal');
  expect(await page.evaluate(() => window.galaxyUniforms.uPhase)).toBeUndefined();
  await expect(page.locator('.television-nav')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.hero .button-primary')).toBeVisible();
});

for (const width of [1440, 390]) {
  test(`la repulsión de Galaxy sigue alineada al redistribuir el hero, ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await auditGalaxy(page);
    await page.goto('/#inicio');
    const portrait = page.locator('[data-spatial-portrait]');
    await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
    await page.evaluate(() => document.fonts.ready);
    const cursor = { x: width * .5, y: width < 700 ? 650 : 300 };
    await page.mouse.move(cursor.x, cursor.y);
    await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-galaxy-pointer', 'active');
    await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle', { timeout: 10_000 });
    // Neither change resizes the portrait. Galaxy must remeasure its origin.
    if (width < 700) await portrait.evaluate(el => { el.style.marginTop = '72px'; });
    else await portrait.evaluate(el => { el.style.translate = '36px 44px'; });
    const box = (await portrait.boundingBox())!;
    const size = await portrait.evaluate(el => ({ width: el.clientWidth, height: el.clientHeight }));
    const expected = { x: (cursor.x - box.x) / size.width, y: 1 - (cursor.y - box.y) / size.height };
    await expect.poll(async () => {
      const pointer = await page.evaluate(() => window.galaxyUniforms.uMouse);
      if (!pointer) return Infinity;
      return Math.abs(pointer[0] - expected.x) + Math.abs(pointer[1] - expected.y);
    }, { timeout: 10_000 }).toBeLessThan(.001);
    await expect(page.locator('[data-crt-cutout]')).toHaveCount(0);
    await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-transmission-state', 'running');
  });
}

test('el reloj de Galaxy se suspende fuera del hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expect(surface).toBeHidden();
  await expect(surface.locator('canvas')).toHaveCount(0);
  await expect(hero.locator('[data-transmission-toggle]')).toHaveCount(0);
  expect(await hero.evaluate(element => ['clip', 'hidden'].includes(getComputedStyle(element).overflowY))).toBe(true);

  // During the authored exit the effect stays inside the hero and stops its
  // own animation, leaving the scroll-driven silhouette as the focal motion.
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-transmission-state', 'suspended');
  await page.locator('#trabajo').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-transmission-state', 'suspended');
  await expect(surface).not.toBeInViewport();
  const stopped = await surface.getAttribute('data-signal-tick');
  // Cover several 24fps intervals: hidden work must actually stop.
  await page.waitForTimeout(220);
  expect(await surface.getAttribute('data-signal-tick')).toBe(stopped);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expect.poll(() => surface.getAttribute('data-signal-tick')).not.toBe(stopped);
});

test('Galaxy usa coordenadas del hero y respeta pausa y movimiento reducido', async ({ page }) => {
  // A short viewport leaves a natural reading scroll before the reveal starts.
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  const point = { x: 900, y: 350 };
  await page.mouse.move(point.x, point.y);
  await expect(surface).toHaveAttribute('data-galaxy-pointer', 'active');
  await expect(surface.locator('[data-crt-cutout]')).toHaveCount(0);
  await expect(surface.locator('canvas')).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: true })));
  await expect(surface).toHaveAttribute('data-transmission-state', 'paused');
  await expect(surface).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: false })));
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(surface).toBeHidden();
  await expect(hero.locator('[data-transmission-toggle]')).toHaveCount(0);
  // Decorative layers never take over actual section navigation.
  await page.locator('.primary-nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
});

test('privacidad no monta interferencia ni controles del hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/privacidad/');
  await expect(page.locator('[data-site-transmission]')).toHaveCount(0);
  await expect(page.locator('[data-transmission-toggle]')).toHaveCount(0);
});

test('en móvil Galaxy sigue el toque sin retener el scroll y queda dentro del hero', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'La secuencia de gestos nativos usa Chrome DevTools Protocol.');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  const portrait = hero.locator('[data-spatial-portrait]');
  await portrait.scrollIntoViewIfNeeded();
  const portraitBox = (await portrait.boundingBox())!;
  const point = { x: portraitBox.x + portraitBox.width / 2, y: portraitBox.y + portraitBox.height / 2 };
  const initialScroll = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await expect(surface).toHaveAttribute('data-galaxy-pointer', 'active');
  for (const distance of [40, 90, 140, 190]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - distance }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(surface).toHaveAttribute('data-galaxy-pointer', 'inactive');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll + 40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await context.close();
});
