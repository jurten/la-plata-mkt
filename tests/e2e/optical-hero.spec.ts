import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
 test(`hero survives changes below the fold, ${viewport.width}px`, async ({ page }) => {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
  await page.setViewportSize(viewport);
  // Dev reloads can restore a lower-section hash before the shaders initialise.
  await page.goto('/#contacto', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-warp-ready]')).toHaveCount(1);
  await page.locator('#contacto').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'complete');
  // A stylesheet update can resize text while its ancestor is scaled down.
  await page.addStyleTag({ content: '.optical-heading { padding-bottom: 27px; }' });
  await page.setViewportSize({ width: viewport.width - 40, height: viewport.height - 40 });
  for (const selector of ['[data-warp-canvas]', '[data-atmosphere]']) {
   await expect.poll(() => page.locator(selector).evaluate((canvas: HTMLCanvasElement) =>
    Math.min(canvas.width / canvas.clientWidth, canvas.height / canvas.clientHeight))).toBeGreaterThanOrEqual(.99);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'idle');
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
  // Read after a rendered frame, before WebGL discards its buffer. All three
  // lines must contain visible text, rather than the reported white sliver.
  await expect.poll(() => page.locator('[data-warp-canvas]').evaluate((canvas: HTMLCanvasElement) =>
   new Promise<number>(resolve => requestAnimationFrame(() => {
    const copy = document.createElement('canvas');
    copy.width = canvas.width; copy.height = canvas.height;
    const ctx = copy.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0);
    const { data } = ctx.getImageData(0, 0, copy.width, copy.height);
    const counts = [0, 0, 0];
    for (let y = 0; y < copy.height; y++) {
     for (let x = 0; x < copy.width; x++) {
      if (data[(y * copy.width + x) * 4 + 3] > 128) counts[Math.min(2, Math.floor(y * 3 / copy.height))]++;
     }
    }
    resolve(Math.min(...counts) / (copy.width * copy.height / 3));
   })))).toBeGreaterThan(.025);
  await expect(page.locator('#inicio a[href^="https://wa.me/"]')).toBeVisible();
 });
}

test('warped headline renders, responds to input and preserves contact', async ({ page }) => {
 const errors: string[]=[];page.on('pageerror', e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('[data-warp-ready]')).toHaveCount(1);
 // The headline has its own graphics context; also verify the smoke actually renders.
 expect(await page.locator('[data-atmosphere]').evaluate((canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext('webgl');
  return !!gl?.getParameter(gl.CURRENT_PROGRAM) && gl.getError() === gl.NO_ERROR;
 })).toBe(true);
 await expect(page.locator('#hero-title')).toHaveText('Somos un equipo con ideas de otro planeta');
 expect(await page.locator('#hero-title > span').evaluateAll(lines=>lines.map(line=>getComputedStyle(line).textAlign))).toEqual(['left','right','center']);
 await expect(page.locator('[data-optical-lens], .optical-secondary, .optical-switch, [data-spatial-portrait]')).toHaveCount(0);
 const canvas=page.locator('[data-warp-canvas]');
 const before=await canvas.screenshot();
 await canvas.locator('..').click({position:{x:420,y:120}});
 await page.waitForTimeout(160);
 expect(Buffer.compare(before,await canvas.screenshot())).not.toBe(0);
 await expect(page.locator('#inicio a[href^="https://wa.me/"]')).toBeVisible();
 expect(errors).toEqual([]);
});

test('small screens and reduced motion retain the headline and no horizontal overflow', async ({ page }) => {
 await page.setViewportSize({width:320,height:780});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('[data-warp-ready]')).toHaveCount(1);
 const canvas=page.locator('[data-warp-canvas]');const before=await canvas.screenshot();await page.waitForTimeout(200);
 expect(Buffer.compare(before,await canvas.screenshot())).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('without JavaScript the staggered heading and contact remain visible', async ({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/');
 await expect(page.locator('#hero-title')).toBeVisible();
 await expect(page.locator('#inicio a[href^="https://wa.me/"]')).toBeVisible();
 await expect(page.locator('[data-warp-canvas]')).toHaveCount(0);
 await context.close();
});
