import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts/about-portrait-scroll', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('https://monopo.london/team/', { waitUntil: 'domcontentloaded' });
  await page.locator('.c-Team-members').waitFor();
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const top = document.querySelector('.c-Team-members').getBoundingClientRect().top + scrollY - 150;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'artifacts/about-portrait-scroll/reference-rest.png' });
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(80);
  await page.screenshot({ path: 'artifacts/about-portrait-scroll/reference-moving.png' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'artifacts/about-portrait-scroll/reference-settled.png' });
} finally { await browser.close(); }
