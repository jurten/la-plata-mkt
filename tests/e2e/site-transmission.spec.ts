import { expect, test } from '@playwright/test';

test('la interferencia ocupa todo el viewport después del hero y el rayo cambia de forma', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const surface = page.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.locator('#soluciones').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const viewport = page.viewportSize()!;
  await expect(surface).toHaveCSS('position', 'fixed');
  expect(await surface.boundingBox()).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });
  await page.mouse.move(viewport.width * .65, viewport.height * .5);
  await expect(surface).toHaveAttribute('data-beam', 'active');
  const path = page.locator('[data-crt-cutout]');
  const before = await path.getAttribute('d');
  await expect.poll(() => path.getAttribute('d')).not.toBe(before);
  const clip = { x: viewport.width * .65 - 20, y: viewport.height * .5 - 20, width: 40, height: 40 };
  const clear = await page.screenshot({ clip });
  // Disabling the whole effect must leave the beam's core pixel-identical.
  await page.locator('[data-transmission-toggle]').evaluate(button => (button as HTMLButtonElement).click());
  await expect(surface).toHaveAttribute('data-transmission-state', 'paused');
  expect(await page.screenshot({ clip })).toEqual(clear);
  await page.locator('[data-transmission-toggle]').click();
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  // The overlay must never intercept real navigation.
  await page.locator('.primary-nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
});

test('privacidad comparte la interferencia y el control global', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/privacidad/');
  const surface = page.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.mouse.move(700, 350);
  await expect(surface).toHaveAttribute('data-beam', 'active');
  await page.locator('[data-transmission-toggle]').click();
  await expect(surface).toHaveAttribute('data-transmission-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(surface).toBeHidden();
  await expect(page.locator('[data-transmission-toggle]')).toBeHidden();
});

test('en móvil el rayo se activa al tocar y no retiene el scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  const surface = page.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 350 }] });
  await expect(surface).toHaveAttribute('data-beam', 'active');
  for (const y of [310, 260, 210, 160]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(surface).toHaveAttribute('data-beam', 'inactive');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await context.close();
});
