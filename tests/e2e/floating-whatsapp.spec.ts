import { expect, test } from '@playwright/test';

test('WhatsApp activates on hover, follows within bounds, and returns to a circle', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-floating-whatsapp]');
  const visual = button.locator('.whatsapp-visual');
  const contour = button.locator('[data-whatsapp-contour]');
  await expect(button).toHaveAttribute('data-splash-state', 'idle');
  const circle = await contour.getAttribute('d');
  const centers = await button.evaluate(el => {
    const splash = el.querySelector('.whatsapp-splash')!.getBoundingClientRect();
    const logo = el.querySelector('.whatsapp-visual > svg:last-child')!.getBoundingClientRect();
    return { dx: splash.x + splash.width / 2 - logo.x - logo.width / 2,
      dy: splash.y + splash.height / 2 - logo.y - logo.height / 2 };
  });
  expect(Math.abs(centers.dx)).toBeLessThan(.1);
  expect(Math.abs(centers.dy)).toBeLessThan(.1);
  const box = (await button.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  // Proximity alone must not activate the effect.
  await page.mouse.move(x - 40, y);
  await expect(button).toHaveAttribute('data-splash-state', 'idle');
  await page.mouse.move(x, y);
  await expect(button).toHaveAttribute('data-splash-state', 'active');
  await expect(contour).not.toHaveAttribute('d', circle!);
  await page.mouse.move(x - 43, y);
  await expect.poll(() => visual.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)).toBeLessThan(-35);
  const offset = await visual.evaluate(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return Math.hypot(matrix.m41, matrix.m42);
  });
  expect(offset).toBeLessThanOrEqual(84.01);
  await expect(button).toHaveAttribute('data-splash-state', 'active');
  await page.screenshot({ path: 'artifacts/whatsapp-hover.png' });
  await page.mouse.move(x - 90, y);
  await expect(button).toHaveAttribute('data-splash-state', 'active');
  await expect.poll(() => visual.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41)).toBeLessThan(-77);
  // The pointer remains over the native WhatsApp link throughout following.
  expect(await page.evaluate(({ x, y }) =>
    !!document.elementFromPoint(x, y)?.closest('[data-floating-whatsapp]'), { x: x - 90, y })).toBeTruthy();
  // Observe a real mouse click without navigating to WhatsApp during the test.
  await button.evaluate(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      el.setAttribute('data-click-verified', 'true');
    }, { once: true });
  });
  await page.mouse.click(x - 90, y);
  await expect(button).toHaveAttribute('data-click-verified', 'true');
  await page.mouse.move(x - 110, y);
  await expect(button).toHaveAttribute('data-splash-state', 'returning');
  const swing = await visual.evaluate(el => new Promise<number[]>(resolve => {
    const samples: number[] = [];
    const start = performance.now();
    function sample() {
      samples.push(new DOMMatrix(getComputedStyle(el).transform).m41);
      if (performance.now() - start < 1100) requestAnimationFrame(sample);
      else resolve(samples);
    }
    requestAnimationFrame(sample);
  }));
  // Return crosses home, swings back again, and loses amplitude.
  const firstCrossing = swing.findIndex(value => value > 5);
  expect(firstCrossing).toBeGreaterThanOrEqual(0);
  expect(swing.slice(firstCrossing + 1).some(value => value < -2)).toBeTruthy();
  // Re-entry during the return must resume without getting stuck.
  await page.mouse.move(x, y);
  await expect(button).toHaveAttribute('data-splash-state', 'active');
  await page.mouse.move(x - 110, y);
  await expect(button).toHaveAttribute('data-splash-state', 'idle');
  await expect(contour).toHaveAttribute('d', circle!);
  await expect(visual).toHaveCSS('transform', 'none');
  expect(await page.evaluate(({ x, y }) =>
    !!document.elementFromPoint(x, y)?.closest('[data-floating-whatsapp]'), { x: x - 90, y })).toBeFalsy();
  await expect(button).toHaveAttribute('href', 'https://wa.me/5491158861954');
});

test('WhatsApp stays static with reduced motion and resets if the preference changes', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-floating-whatsapp]');
  await button.hover();
  await expect(button).toHaveAttribute('data-splash-state', 'active');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button).toHaveAttribute('data-splash-state', 'idle');
  await button.hover();
  await expect(button.locator('.whatsapp-visual')).toHaveCSS('transform', 'none');
});

test('WhatsApp remains static and usable on touch screens', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const button = page.locator('[data-floating-whatsapp]');
    await button.dispatchEvent('pointerenter', { pointerType: 'touch' });
    await expect(button).toHaveAttribute('data-splash-state', 'idle');
    await expect(button).toHaveAttribute('href', 'https://wa.me/5491158861954');
    await button.screenshot({ path: 'artifacts/whatsapp-touch.png' });
  } finally { await context.close(); }
});
