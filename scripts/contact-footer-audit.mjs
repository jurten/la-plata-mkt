import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const output = 'artifacts/contact-footer';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 700, 900, 1100, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://127.0.0.1:4321/#contacto');
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.locator('#contacto').evaluate(footer => ({
        viewport: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        footerWidth: footer.getBoundingClientRect().width,
        clipped: [...footer.querySelectorAll('h2, h3, a, input, textarea, summary')]
          .filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent),
        heading: footer.querySelector('#contact-title').textContent,
        questions: footer.querySelectorAll('#faq details').length,
        contactForms: footer.querySelectorAll('[data-contact-form]').length,
      }));
      if ([390, 1440].includes(width)) {
        await page.locator('#contacto').screenshot({ path: `${output}/footer-${width}-${colorScheme}.png` });
        await page.locator('#como-trabajamos').screenshot({ path: `${output}/working-${width}-${colorScheme}.png` });
      }
      results.push({ width, colorScheme, ...metrics, errors: [...errors] });
    }
    const accessibility = await new AxeBuilder({ page }).include('#contacto').include('#como-trabajamos').analyze();
    results.push({ colorScheme, accessibility: accessibility.violations.map(({ id, impact, nodes }) => ({
      id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })) });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.pageWidth > result.viewport || result.clipped?.length || result.errors?.length || result.accessibility?.length || result.contactForms || result.questions)) process.exitCode = 1;
