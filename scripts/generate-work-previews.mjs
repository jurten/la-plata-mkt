// Capture existing LPM concept artwork, in both languages. No third-party assets.
import { chromium } from 'playwright';
import { writeFile, mkdir, unlink, access } from 'node:fs/promises';
const paths = ['src/pages/work-preview-source.astro', 'src/pages/en/work-preview-source.astro'];
for (const path of paths) {
  if (await access(path).then(() => true, () => false)) throw new Error(`Temporary route already exists: ${path}`);
}
const template = (prefix) => `---
import ConceptPreview from '${prefix}components/ConceptPreview.astro';
import '${prefix}styles/fonts.css';
import '${prefix}styles/global.css';
import '${prefix}styles/portfolio-reveal.css';
import { projects, projectDetails } from '${prefix}lib/projects';
import { getTranslator } from '${prefix}lib/i18n';
const type = (Astro.url.searchParams.get('type') || 'real-estate') as 'real-estate' | 'legal' | 'automation';
const project = projects.find(project => project.type === type)!;
const t = getTranslator(Astro.url.pathname);
---
<html><head><meta charset="utf-8" /></head><body data-project-title={t(project.title)} data-services={projectDetails[type].services.map(service => t(service)).join(' + ')}><ConceptPreview {type} /></body></html>
<style is:global>
html, body { margin: 0; width: 1440px; height: 1080px; overflow: hidden; }
.concept-preview { width: 1440px; height: 1080px; padding: 110px; border-radius: 0; }
.concept-canvas { transform: none; padding: 64px; border-radius: 0; }
.mock-nav { font-size: 22px; padding-bottom: 30px; }
.mock-nav > span:first-child { font-size: 42px; }
.mock-nav .icon, .mock-bottom .icon { width: 28px; height: 28px; }
.mock-bottom { font-size: 19px; padding-top: 30px; }
.estate-layout, .legal-composition, .automation-composition { min-height: 580px; }
.estate-type, .legal-large { font-size: 82px; }
.estate-shapes { height: 420px; }
.arch { width: 220px; height: 370px; border-radius: 150px 150px 0 0; }
.arch-back { height: 420px; }
.estate-circle { width: 140px; height: 140px; }
.legal-symbol { font-size: 300px; }
.automation-composition { gap: 70px; }
.automation-composition > strong { font-size: 82px; }
.automation-flow { gap: 24px; font-size: 22px; }
.automation-flow b { font-size: 27px; }
.automation-flow > span { padding-block: 30px; gap: 24px; }
</style>`;
let browser;
try {
  await Promise.all(paths.map((path, i) => writeFile(path, template(i ? '../../' : '../'))));
  await mkdir('public/work', { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  for (const locale of ['es','en']) for (const type of ['real-estate','legal','automation']) {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto(`http://127.0.0.1:4321/${locale === 'en' ? 'en/' : ''}work-preview-source/?type=${type}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.mock-nav > span:first-child').evaluate(element => { element.textContent = element.textContent.replace(/\.$/, ''); });
    await page.screenshot({ path: `public/work/${type}${locale === 'en' ? '.en' : ''}.png` });
    await page.setViewportSize({ width: 1440, height: 1440 });
    await page.evaluate(() => {
      const body = document.body;
      const title = body.dataset.projectTitle;
      const services = body.dataset.services;
      body.replaceChildren();
      body.style.cssText = 'width:1440px;height:1440px;background:#eef2ff;color:#0b1430;display:flex;flex-direction:column;justify-content:center;gap:100px;padding:140px;box-sizing:border-box';
      const heading = document.createElement('h1'); heading.textContent = title;
      heading.style.cssText = 'font:700 140px/1.05 var(--display);letter-spacing:-.035em;margin:0;max-width:100%';
      const label = document.createElement('p'); label.textContent = services;
      label.style.cssText = 'font:400 36px/1.6 var(--body);margin:0';
      body.append(heading, label);
    });
    await page.screenshot({ path: `public/work/${type}-type${locale === 'en' ? '.en' : ''}.png` });
  }
} finally {
  await browser?.close();
  await Promise.all(paths.map(path => unlink(path).catch(() => {})));
}
