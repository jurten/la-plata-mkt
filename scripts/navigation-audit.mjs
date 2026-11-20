import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const directory = 'artifacts/navigation-refactor';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const metrics = [];
for (const width of [1440, 390]) {
  for (const [name, route] of [['home', '/'], ['work', '/trabajos/'], ['about', '/nosotros/'], ['contact', '/contacto/']]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light' });
    await page.route(/hubspot|hs-scripts|hs-analytics|hs-banner|hscollectedforms/, route => route.abort());
    await page.goto(`http://127.0.0.1:4321${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => { await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })); });
    await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
    metrics.push({ route, width, ...await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, headings: [...document.querySelectorAll('h1,h2,h3')].filter(el => !el.closest('[aria-hidden="true"]')).map(el => el.textContent?.trim()) })) });
    await page.close();
  }
}
for (const [name, route] of [['work-en-dark','/en/work/'],['contact-en-dark','/en/contact/']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.route(/hubspot|hs-scripts|hs-analytics|hs-banner|hscollectedforms/, route => route.abort());
  await page.goto(`http://127.0.0.1:4321${route}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  await page.close();
}
await writeFile(`${directory}/metrics.json`, JSON.stringify(metrics, null, 2));
const menu = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await menu.goto('http://127.0.0.1:4321/trabajos/');
await menu.locator('.menu-toggle').click();
await menu.screenshot({ path: `${directory}/menu-390.png` });
await menu.close();
const form = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await form.goto('http://127.0.0.1:4321/contacto/');
await form.locator('[type="submit"]').click();
await form.screenshot({ path: `${directory}/contact-invalid.png`, fullPage: true });
await form.close();
await browser.close();
