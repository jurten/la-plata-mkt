import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/about-value-blobs';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
try {
  const variants = process.argv.includes('--fallback-only') ? [] : [['es',1440,'light'],['es',390,'light'],['es',768,'dark'],['es',1440,'dark'],['en',390,'dark'],['en',1440,'light']];
  for (const [locale, width, theme] of variants) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, hasTouch: width === 390, isMobile: width === 390 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /shader|WebGL|GLSL|uniform/i.test(message.text())) errors.push(message.text()); });
    await page.route(/hs-scripts|hs-analytics|hubspot/, route => route.fulfill({ body: '' }));
    await page.goto(`http://127.0.0.1:4321/${locale === 'es' ? 'nosotros' : 'en/about'}/`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#valores').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 120, behavior: 'instant' }));
    const visuals = page.locator('[data-value-visual]');
    for (let index = 0; index < 3; index++) {
      const visual = visuals.nth(index);
      await visual.scrollIntoViewIfNeeded();
      await expect(visual).toHaveAttribute('data-value-warp-ready', '');
      await visual.screenshot({ path: `${out}/${locale}-${width}-${theme}-blob-${index}.png` });
    }
    await page.locator('#valores').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 120, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-section.png` });
    const first = visuals.first(), canvas = first.locator('canvas');
    await first.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute('data-animation-state', 'idle', { timeout: 6500 });
    const before = await first.screenshot();
    if (width === 390) await first.tap();
    else await first.hover({ position: { x: 150, y: 100 } });
    await expect(canvas).toHaveAttribute('data-animation-state', 'playing');
    await page.waitForTimeout(200);
    const after = await first.screenshot({ path: `${out}/${locale}-${width}-${theme}-interaction.png` });
    if (before.equals(after)) throw Error('Hero interaction did not change the blob');
    if (width !== 390) {
      await first.click({ position: { x: 150, y: 100 } });
      await page.waitForTimeout(150);
      await first.screenshot({ path: `${out}/${locale}-${width}-${theme}-click.png` });
      await page.mouse.move(5, 5);
    }
    await expect(canvas).toHaveAttribute('data-animation-state', width === 390 ? 'holding' : 'idle', { timeout: 5000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-value-warp-ready]')).toHaveCount(0);
    await expect(first.locator('.about-value__still')).toHaveCSS('visibility', 'visible');
    const accessibility = (await new AxeBuilder({ page }).include('.about-values').analyze()).violations.map(v => v.id);
    await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-reduced.png` });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(first).toHaveAttribute('data-value-warp-ready', '');
    await page.evaluate(() => document.querySelector('.about-value__canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await expect(first).not.toHaveAttribute('data-value-warp-ready', '');
    const row = { locale, width, theme, overflow, errors, accessibility, interaction: true, returnsToAmbient: true, reducedMotion: true, contextLoss: true };
    report.push(row); console.log(JSON.stringify(row));
    await context.close();
  }
  for (const fallback of ['no-webgl', 'no-js', 'reduced', 'forced']) {
    const context = await browser.newContext({ javaScriptEnabled: fallback !== 'no-js', reducedMotion: fallback === 'reduced' ? 'reduce' : 'no-preference', forcedColors: fallback === 'forced' ? 'active' : 'none' });
    const page = await context.newPage();
    if (fallback === 'no-webgl') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /webgl/.test(type) ? null : original.call(this, type, ...args); };
    });
    await page.goto('http://127.0.0.1:4321/nosotros/#valores');
    await expect(page.locator('[data-value-warp-ready]')).toHaveCount(0);
    await expect(page.locator('.about-value__still').first()).toHaveCSS('visibility', 'visible');
    await expect(page.locator('.about-value__caption h3')).toHaveCount(3);
    report.push({ fallback, passed: true });
    await context.close();
  }
} finally { await browser.close(); await writeFile(`${out}/${process.argv.includes('--fallback-only') ? 'report-fallbacks' : 'report'}.json`, JSON.stringify(report, null, 2)); }
if (report.some(row => row.overflow || row.errors?.length || row.accessibility?.length)) process.exitCode = 1;
