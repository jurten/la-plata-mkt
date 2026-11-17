import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('.impeccable/review/team', { recursive: true });
const browser = await chromium.launch();
for (const width of [1440, 390, 320, 768]) {
  const page = await browser.newPage({ viewport: { width, height: width > 800 ? 1000 : 900 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4321/#nosotros');
  await page.evaluate(() => document.fonts.ready);
  const roster = page.locator('[data-team-roster]');
  await roster.locator('[data-team-profile]:visible img').evaluate(img => img.decode());
  await roster.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await roster.screenshot({ path: `.impeccable/review/team/section-${width}.png` });
  const wheel = page.getByRole('listbox');
  for (const [key, suffix] of [['Home', 'first'], ['End', 'last']]) {
    await wheel.focus();
    await wheel.press(key);
    await roster.screenshot({ path: `.impeccable/review/team/section-${width}-${suffix}.png` });
  }
  if (width === 1440) {
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await roster.screenshot({ path: '.impeccable/review/team/section-dark.png' });
  }
  console.log(JSON.stringify({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) }));
  await page.close();
}
await browser.close();
