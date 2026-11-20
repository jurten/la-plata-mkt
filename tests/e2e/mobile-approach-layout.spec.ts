import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
  for (const viewport of [{ width: 320, height: 780 }, { width: 390, height: 740 }, { width: 412, height: 850 }]) {
    test(`mobile approach separates artwork, reading and navigation at ${viewport.width}×${viewport.height} on ${route}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator('[data-approach]');
      await expect(root).toHaveAttribute('data-approach-enabled', '');
      for (const [index, progress] of [.1, .55, .95].entries()) {
        await page.evaluate(progress => {
          const root = document.querySelector<HTMLElement>('[data-approach]')!;
          const start = Number(root.dataset.approachStart), end = Number(root.dataset.approachEnd);
          window.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' });
        }, progress);
        await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(progress, 2);
        const copy = (await root.locator('.approach-copy').nth(index).boundingBox())!;
        const nav = (await root.locator('.approach-nav').boundingBox())!;
        const art = (await root.locator(index === 2 ? '.approach-brand .brand-logo__symbol' : '[data-approach-eye]').boundingBox())!;
        const playback = (await root.locator('.approach-playback').boundingBox())!;
        expect(art.y).toBeGreaterThanOrEqual(playback.y + playback.height + 12);
        expect(art.y + art.height + 20).toBeLessThanOrEqual(copy.y);
        expect(copy.y + copy.height + 20).toBeLessThanOrEqual(nav.y);
        expect(copy.x).toBeGreaterThanOrEqual(0);
        expect(copy.x + copy.width).toBeLessThanOrEqual(viewport.width);
        expect(nav.y + nav.height).toBeLessThan(viewport.height);
        await expect(root.locator('.approach-copy').nth(index).locator('a')).toBeInViewport();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    });
  }
}

test('mobile atmosphere remains continuous and falls back cleanly after graphics loss', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 412, height: 850 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
  await page.goto('/');
  const canvas = page.locator('[data-atmosphere]');
  await expect.poll(() => canvas.evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBeGreaterThan(412);
  const maximumSeam = await canvas.evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl')!;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const { width, height } = canvas;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (gl.getError() !== gl.NO_ERROR || !pixels.some((value, index) => index % 4 !== 3 && value > 20)) return Infinity;
    let maximum = 0;
    for (let x = 1; x < width; x++) {
      let difference = 0;
      for (let y = 0; y < height; y++) for (let c = 0; c < 3; c++) {
        const offset = (y * width + x) * 4 + c;
        difference += Math.abs(pixels[offset] - pixels[offset - 4]);
      }
      maximum = Math.max(maximum, difference / (height * 3));
    }
    for (let y = 1; y < height; y++) {
      let difference = 0;
      for (let x = 0; x < width; x++) for (let c = 0; c < 3; c++) {
        const offset = (y * width + x) * 4 + c;
        difference += Math.abs(pixels[offset] - pixels[offset - width * 4]);
      }
      maximum = Math.max(maximum, difference / (width * 3));
    }
    return maximum;
  });
  expect(maximumSeam).toBeLessThan(8);
  await canvas.evaluate((canvas: HTMLCanvasElement) => canvas.getContext('webgl')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(canvas).toBeHidden();
  await expect(page.locator('.atmosphere')).toBeVisible();
  await expect(page.locator('#inicio a[href^="https://wa.me/"]')).toBeVisible();
  await context.close();
});
