import { test, expect } from '@playwright/test';

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
