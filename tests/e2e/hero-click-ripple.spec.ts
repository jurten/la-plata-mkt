import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
 test(`click pushes the blue field at the headline's wave scale (${width}px)`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-warp-ready]')).toHaveCount(1);
  const background = page.locator('[data-atmosphere]');
  const state = () => background.evaluate((canvas: HTMLCanvasElement) => {
   const gl = canvas.getContext('webgl')!;
   const program = gl.getParameter(gl.CURRENT_PROGRAM);
   const clicks = Array.from(gl.getUniform(program, gl.getUniformLocation(program, 'uClicks[0]')!) as Float32Array);
   const height = gl.getUniform(program, gl.getUniformLocation(program, 'rippleHeight')!) as number;
   return { clicks, height, error: gl.getError(), scale: canvas.height / canvas.getBoundingClientRect().height };
  });
  expect((await state()).clicks[3]).toBe(0);
  // Click bare background, outside the text, without generating cursor travel.
  await page.locator('#inicio').evaluate(hero => {
   const r = hero.getBoundingClientRect();
   hero.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + r.width * .72, clientY: r.top + 150, button: 0 }));
  });
  await expect.poll(async () => (await state()).clicks[2]).toBeGreaterThan(.08);
  const wave = await state();
  expect(wave.clicks[0]).toBeCloseTo(.72, 2);
  expect(wave.clicks[3]).toBe(1);
  expect(wave.error).toBe(0);
  const headingHeight = await page.locator('[data-warp-text]').evaluate(el => el.getBoundingClientRect().height);
  expect(wave.height / wave.scale).toBeCloseTo(headingHeight, 1);
  await page.screenshot({ path: `artifacts/hero-click-ripple-${width}.png` });
  await expect.poll(async () => (await state()).clicks[3], { timeout: 4000 }).toBe(0);
 });
}

test('reduced motion keeps the background still on click', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('/');
 await expect(page.locator('[data-warp-ready]')).toHaveCount(1);
 const background = page.locator('[data-atmosphere]');
 const before = await background.screenshot();
 await page.locator('#inicio').dispatchEvent('pointerdown', { clientX: 800, clientY: 150, button: 0 });
 await page.waitForTimeout(200);
 expect(Buffer.compare(before, await background.screenshot())).toBe(0);
});
