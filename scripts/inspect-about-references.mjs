import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'artifacts/about-redesign';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  for (const [name, url, heading] of [
    ['monopo', 'https://monopo.london/team/', 'Meet our london team'],
    ['koto', 'https://koto.com/about', 'Optimism'],
  ]) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('h2,h3').filter({ hasText: heading }).first().waitFor();
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /^accept$/i }).click({ timeout: 1000 }).catch(() => {});
    const target = page.locator('h2,h3').filter({ hasText: heading }).first();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${out}/${name}-section.png` });
    await writeFile(`${out}/${name}-structure.json`, JSON.stringify(await target.evaluate(el => {
      const root = el.closest('section') ?? el.parentElement.parentElement;
      return { html: root.outerHTML.slice(0, 65000), styles: [...root.querySelectorAll('h2,h3,img,canvas,video')].slice(0, 20).map(node => {
        const c = getComputedStyle(node), r = node.getBoundingClientRect();
        return { tag: node.tagName, text: node.textContent, src: node.getAttribute('src'), rect: { x:r.x,y:r.y,width:r.width,height:r.height }, font:c.font, borderRadius:c.borderRadius, filter:c.filter, clipPath:c.clipPath };
      }) };
    }), null, 2));
  }
} finally { await browser.close(); }
