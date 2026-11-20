import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out = '.impeccable/review/work-showcase';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const captureStatic = async (page, name) => {
  // Full-document captures cannot represent a viewport-fixed WebGL enhancement.
  // Capture the real HTML images here and the live curve separately below.
  const style = await page.addStyleTag({ content: '.work-curve-canvas{display:none!important}[data-work-curved]{opacity:1!important}' });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await style.evaluate(el => el.remove());
};
for (const [label, width, height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push({ label, error: error.message }));
  await page.goto('http://127.0.0.1:4321/trabajos/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-work-filter="all"]:visible').waitFor();
  await captureStatic(page, `${label}-index`);
  if (label === 'desktop') {
    await page.locator('[data-work-link]').first().hover();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/desktop-hover.png` });
    await page.locator('[data-work-filter="web"]').click();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/desktop-filter.png` });
    await page.locator('[data-work-filter="all"]').click();
  }
  await page.locator('[data-work-link]').first().click();
  await page.locator('h1').waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    await Promise.all([...document.querySelectorAll('img[data-work-media]')].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
  });
  await captureStatic(page, `${label}-detail`);
  if (label === 'desktop') {
    await page.locator('.work-case-media-pair').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 450, behavior: 'instant' }));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/desktop-curve.png` });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('http://127.0.0.1:4321/trabajos/');
    await page.waitForTimeout(300);
    await captureStatic(page, 'desktop-dark-index');
  }
  await page.close();
}
await writeFile(`${out}/errors.json`, JSON.stringify(errors, null, 2));
await browser.close();
console.log(JSON.stringify({ errors, directory: out }));
