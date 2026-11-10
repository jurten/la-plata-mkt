import { mkdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'public/og-la-plata-marketing.png');
const width = 1200;
const height = 630;
const title = 'Ideas de otro planeta.';
const subtitle = 'Para problemas de acá.';

const dataURL = async (path, mime) => `data:${mime};base64,${(await readFile(resolve(root, path))).toString('base64')}`;
const [portrait, logo, displayFont, bodyFont, monoFont, editorialFont] = await Promise.all([
  dataURL('src/assets/lpm-visitor.png', 'image/png'),
  dataURL('public/brand/lpm-logo.svg', 'image/svg+xml'),
  dataURL('src/assets/fonts/radio-canada-big-700.ttf', 'font/ttf'),
  dataURL('node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2', 'font/woff2'),
  dataURL('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'font/woff2'),
  dataURL('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2', 'font/woff2'),
]);

// Render the site's authored brand composition. All assets are local data URLs;
// this does not retouch the portrait or depend on a running site or external CDN.
const html = `<!doctype html>
<html lang="es-AR"><head><meta charset="UTF-8"><title>${title} | La Plata Marketing</title>
<style>
@font-face { font-family: 'Radio Canada Big'; src: url('${displayFont}') format('truetype'); font-style: normal; font-weight: 700; font-display: block; }
@font-face { font-family: 'IBM Plex Sans'; src: url('${bodyFont}') format('woff2'); font-style: normal; font-weight: 400; font-display: block; }
@font-face { font-family: 'IBM Plex Mono'; src: url('${monoFont}') format('woff2'); font-style: normal; font-weight: 500; font-display: block; }
@font-face { font-family: 'Newsreader'; src: url('${editorialFont}') format('woff2'); font-style: italic; font-weight: 200 800; font-display: block; }
* { box-sizing: border-box; }
html, body { width: ${width}px; height: ${height}px; margin: 0; overflow: hidden; background: #020307; color: #EEF2FF; }
body { position: relative; font-family: 'IBM Plex Sans', sans-serif; }
.portrait { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 48%; }
.reading-field { position: absolute; inset: 0; background: linear-gradient(90deg, #020307 0%, rgba(2,3,7,.97) 27%, rgba(2,3,7,.68) 47%, rgba(2,3,7,0) 68%); }
header, main, footer { position: absolute; left: 56px; right: 56px; }
header { top: 42px; display: flex; align-items: center; gap: 13px; }
.mark { display: block; width: 108px; height: auto; filter: brightness(0) invert(1); }
main { top: 196px; }
h1 { width: 650px; margin: 0; font-family: 'Radio Canada Big', sans-serif; font-size: 88px; line-height: .96; font-weight: 700; letter-spacing: -.04em; }
.subtitle { margin: 26px 0 0; color: #B7D7EE; font: italic 400 32px/1.25 'Newsreader', serif; }
footer { bottom: 35px; display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; font-size: 17px; }
.name { font: 500 14px/1.3 'IBM Plex Mono', monospace; }
.disciplines { margin: 8px 0 0; color: #A8B6D0; font-size: 13px; }
.domain { color: #EEF2FF; font-size: 12px; }
</style></head><body>
<img class="portrait" src="${portrait}" alt="">
<div class="reading-field"></div>
<header><img class="mark" src="${logo}" alt="La Plata Marketing"></header>
<main><h1 aria-label="${title}">Ideas de<br>otro planeta.</h1><p class="subtitle">${subtitle}</p></main>
<footer><div><span class="name">La Plata Marketing</span><p class="disciplines">Comunicación · Marketing · Tecnología</p></div><span class="domain">laplatamarketing.com</span></footer>
</body></html>`;

await mkdir(resolve(root, 'public'), { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' });
  await context.route(/^https?:\/\//, (route) => route.abort('blockedbyclient'));
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page.screenshot({ path: output, type: 'png', animations: 'disabled' });
  await context.close();
} finally {
  await browser.close();
}
console.log(`${output} (${width}×${height}, ${(await stat(output)).size} bytes)`);
