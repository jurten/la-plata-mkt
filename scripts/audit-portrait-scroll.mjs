import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/about-portrait-scroll';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
try {
  for (const locale of ['es', 'en']) for (const theme of ['light', 'dark']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /shader|WebGL|GLSL|uniform/i.test(message.text())) errors.push(message.text()); });
    await page.route(/hs-scripts|hs-analytics|hubspot/, route => route.fulfill({ body: '' }));
    await page.goto(`http://127.0.0.1:4321/${locale === 'es' ? 'nosotros' : 'en/about'}/`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#nosotros').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 130, behavior: 'instant' }));
    const canvas = page.locator('.about-portrait-canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('[data-scroll-portrait-ready]').first()).toBeAttached();
    await expect(canvas).toHaveAttribute('data-scroll-state', 'idle', { timeout: 5000 });
    await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-rest.png` });
    await page.mouse.wheel(0, 240);
    await expect(canvas).toHaveAttribute('data-scroll-state', 'moving');
    const moving = await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-moving.png` });
    await expect(canvas).toHaveAttribute('data-scroll-state', 'idle', { timeout: 5000 });
    const settled = await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-settled.png` });
    if (moving.equals(settled)) throw Error('Scroll lens did not change the rendered image');
    await page.mouse.wheel(0, -180);
    await expect(canvas).toHaveAttribute('data-scroll-state', 'moving');
    await expect(canvas).toHaveAttribute('data-scroll-state', 'idle', { timeout: 5000 });
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      canvasWidth: document.querySelector('.about-portrait-canvas').getBoundingClientRect().width,
      visibleImages: [...document.querySelectorAll('.about-person img')].every(img => img.complete && img.naturalWidth > 0 || !img.closest('[data-scroll-portrait-ready]')),
    }));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(canvas).toBeHidden();
    await expect(page.locator('[data-scroll-portrait-ready]')).toHaveCount(0);
    await expect(page.locator('.about-person img').first()).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-reduced.png` });
    const accessibility = (await new AxeBuilder({ page }).include('.about-team').analyze()).violations;
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(canvas).toBeVisible();
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await page.locator('#nosotros').scrollIntoViewIfNeeded();
    await expect(canvas).toBeVisible();
    const resized = await canvas.boundingBox();
    if (resized?.width !== (width === 390 ? 1440 : 390)) throw Error('Canvas did not resize');
    await page.evaluate(() => {
      const canvas = document.querySelector('.about-portrait-canvas');
      canvas.getContext('webgl').getExtension('WEBGL_lose_context').loseContext();
    });
    await expect(canvas).toBeHidden();
    await expect(page.locator('[data-scroll-portrait-ready]')).toHaveCount(0);
    await expect(page.locator('.about-person img').first()).toHaveCSS('opacity', '1');
    await page.goto('http://127.0.0.1:4321/');
    await expect(page.locator('.about-portrait-canvas')).toHaveCount(0);
    const row = { locale, theme, width, ...geometry, errors, accessibility: accessibility.map(v => v.id), settled: true, reverse: true, reduced: true, resize: true, contextLoss: true, landingIsolated: true };
    report.push(row); console.log(JSON.stringify(row));
    await context.close();
  }
  for (const fallback of ['reduced', 'forced', 'no-webgl', 'no-js']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, javaScriptEnabled: fallback !== 'no-js', reducedMotion: fallback === 'reduced' ? 'reduce' : 'no-preference', forcedColors: fallback === 'forced' ? 'active' : 'none' });
    const page = await context.newPage();
    if (fallback === 'no-webgl') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /webgl/.test(type) ? null : original.call(this, type, ...args); };
    });
    await page.goto('http://127.0.0.1:4321/nosotros/#nosotros');
    await page.locator('.about-person img').first().evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(page.locator('[data-scroll-portrait-ready]')).toHaveCount(0);
    await expect(page.locator('.about-person img').first()).toBeVisible();
    await expect(page.locator('.about-person img').first()).toHaveCSS('opacity', '1');
    report.push({ fallback, passed: true });
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
}
if (report.some(row => row.overflow || row.errors?.length || row.accessibility?.length)) process.exitCode = 1;
