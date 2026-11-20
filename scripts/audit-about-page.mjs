import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/about-redesign';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
const base = 'http://127.0.0.1:4321';
try {
  for (const [locale, widths] of [['es', [320, 390, 768, 1024, 1440, 1920]], ['en', [390, 1440]]]) {
    for (const theme of ['light', 'dark']) {
      for (const width of widths) {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(/hs-scripts|hs-analytics|hubspot/, route => route.fulfill({ body: '' }));
        await page.goto(base + (locale === 'es' ? '/nosotros/' : '/en/about/'));
        await page.evaluate(() => document.fonts.ready);
        await page.locator('[data-about-ready]').waitFor();
        await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-opening.png` });
        await page.locator('#valores').evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 120, behavior: 'instant' }));
        await page.waitForTimeout(350);
        await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-values.png` });
        const geometry = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          clipped: [...document.querySelectorAll('.about-page h1,.about-page h2,.about-page h3,.about-value__caption p')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent),
          headingPeriods: [...document.querySelectorAll('.about-page h1,.about-page h2,.about-page h3')].filter(el => /[.]$/.test(el.textContent.trim())).map(el => el.textContent),
          portraits: [...document.querySelectorAll('.about-person img')].map(img => ({ radius: getComputedStyle(img).borderRadius, loaded: img.complete && img.naturalWidth > 0 })),
        }));
        await page.locator('.about-person img').last().scrollIntoViewIfNeeded();
        await page.locator('#nosotros').evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 120, behavior: 'instant' }));
        await page.waitForTimeout(350);
        await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-team.png` });
        if ([390, 1440].includes(width)) {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.waitForTimeout(350);
          await page.screenshot({ path: `${out}/${locale}-${width}-${theme}-full.png`, fullPage: true });
        }
        let violations = [];
        if ([390, 1440].includes(width)) violations = (await new AxeBuilder({ page }).include('.about-page').analyze()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
        const row = { locale, width, theme, ...geometry, errors, violations };
        report.push(row);
        console.log(JSON.stringify(row));
        await context.close();
      }
    }
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(/hs-scripts|hs-analytics|hubspot/, route => route.fulfill({ body: '' }));
  await page.goto(`${base}/nosotros/`);
  await page.locator('#valores').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-value-warp-ready]'));
  if (await page.locator('[data-value-motion]').count()) throw Error('Removed motion control is still present');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-value-warp-ready] canvas')].every(el => el.dataset.animationState === 'idle'), null, { timeout: 6500 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (await page.locator('[data-value-warp-ready]').count()) throw Error('Reduced motion did not stop the values');
  await page.goto(`${base}/nosotros/#nosotros`);
  await page.waitForFunction(() => Math.abs(document.querySelector('#nosotros').getBoundingClientRect().top - 120) < 4);
  await page.goto(`${base}/nosotros/#team-justina-guinazu`);
  await page.locator('#team-justina-guinazu').waitFor();
  const rect = await page.locator('#team-justina-guinazu').boundingBox();
  if (!rect || rect.y < 70 || rect.y > 150) throw Error('Direct profile anchor was hidden');
  if (await page.locator('.about-page #como-trabajamos,.about-page .conversation-cta,.about-index').count()) throw Error('Removed About blocks are still present');
  await page.locator('.primary-nav a[href="/contacto/"]').click();
  await page.locator('[data-contact-form]').waitFor();
  await context.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(`${base}/nosotros/`);
  if (await nojsPage.locator('.about-value').count() !== 3 || await nojsPage.locator('.about-person').count() !== 3) throw Error('Static content missing without JavaScript');
  await nojs.close();
  const homeContext = await browser.newContext({ reducedMotion: 'reduce' });
  const home = await homeContext.newPage();
  for (const path of ['/', '/en/']) {
    await home.goto(base + path);
    if (await home.locator('.about-page,.about-value,[data-value-motion]').count()) throw Error('About styles or content leaked into home');
    const assets = await home.evaluate(() => [...document.querySelectorAll('link[href],script[src]')].map(el => el.getAttribute('href') ?? el.getAttribute('src')));
    if (assets.some(asset => /about-page/.test(asset))) throw Error('About asset loaded on home');
  }
  await homeContext.close();
} finally {
  await browser.close();
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
}
if (report.some(row => row.overflow || row.clipped.length || row.headingPeriods.length || row.errors.length || row.violations.length)) process.exitCode = 1;
