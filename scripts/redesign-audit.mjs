import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:4321';
const output = resolve('artifacts/redesign', process.env.VISUAL_PASS ?? 'initial');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
const settlePaint = (page) => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
const decodeImages = (page) => page.evaluate(async () => {
  await Promise.all([...document.images].map(async (img) => {
    await img.decode();
    if (img.naturalWidth === 0) throw new Error('No se pudo cargar una imagen del sitio.');
  }));
});
for (const view of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport: view, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await context.newPage();
  // Keep visual measurements deterministic without changing the production integration.
  await page.route('https://js.hs-scripts.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  const errors = [];
  const failedLocalResponses = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.url().startsWith(baseURL) && response.status() >= 400) failedLocalResponses.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await decodeImages(page);
  await settlePaint(page);
  await page.screenshot({ path: resolve(output, `hero-${view.name}.png`) });
  await page.screenshot({ path: resolve(output, `home-${view.name}-full.png`), fullPage: true });
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  for (const [name, selector] of [['pillars', '#soluciones'], ['combined', '.pillar-combined'], ['system', '#sistema'], ['portfolio', '#trabajo'], ['about', '#nosotros'], ['contact', '#contacto'], ['footer', '.site-footer']]) {
    await page.locator(selector).evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 112, behavior: 'instant' }));
    await settlePaint(page);
    if (name === 'contact') await page.locator('[data-floating-whatsapp]').waitFor({ state: 'hidden' });
    await page.screenshot({ path: resolve(output, `${name}-${view.name}.png`) });
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await settlePaint(page);
  await page.screenshot({ path: resolve(output, `hero-${view.name}-dark.png`) });
  await page.screenshot({ path: resolve(output, `home-${view.name}-dark-full.png`), fullPage: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('[data-perspective-view="piece"]').click();
  await page.evaluate(async () => { await Promise.all(document.querySelector('[data-perspective-study]').getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {}))); });
  await page.locator('.perspective-study').screenshot({ path: resolve(output, `perspective-${view.name}-piece.png`) });
  await page.locator('[data-perspective-view="whole"]').click();
  await page.evaluate(async () => { await Promise.all(document.querySelector('[data-perspective-study]').getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {}))); });
  await page.locator('.perspective-study').screenshot({ path: resolve(output, `perspective-${view.name}-whole.png`) });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Modo claro' }).click();
  await settlePaint(page);
  if (view.name === 'mobile') {
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
    await page.screenshot({ path: resolve(output, 'mobile-menu.png') });
    await page.keyboard.press('Escape');
  }
  await page.goto(`${baseURL}/privacidad/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(output, `privacy-${view.name}.png`) });
  results.push({ view: view.name, status: response?.status(), widths, errors, failedLocalResponses });
  await context.close();
}
await browser.close();
await writeFile(resolve(output, 'summary.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.status !== 200 || result.errors.length || result.failedLocalResponses.length || result.widths.document > result.widths.viewport)) process.exitCode = 1;
