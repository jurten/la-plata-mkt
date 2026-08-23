import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:4322';
const outputDir = resolve('artifacts');
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const summary = [];

for (const view of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    colorScheme: 'light',
  });
  const page = await context.newPage();
  const errors = [];
  const warnings = [];
  const failedRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning') warnings.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));

  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const metrics = await page.evaluate(() => ({
    title: document.title,
    statusLanguage: document.documentElement.lang,
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    h1Font: getComputedStyle(document.querySelector('h1')).fontFamily,
  }));

  await page.screenshot({ path: resolve(outputDir, `home-${view.name}-full.png`), fullPage: true });
  await page.locator('.hero').screenshot({ path: resolve(outputDir, `hero-${view.name}.png`) });
  await page.locator('#servicios').screenshot({ path: resolve(outputDir, `services-${view.name}.png`) });
  await page.locator('#contacto').screenshot({ path: resolve(outputDir, `contact-${view.name}.png`) });

  const interactions = {};
  if (view.name === 'mobile') {
    const menu = page.locator('.menu-toggle');
    await menu.click();
    interactions.menuOpened = await menu.getAttribute('aria-expanded') === 'true';
    interactions.mobileNavVisible = await page.locator('.primary-nav').isVisible();
    await page.keyboard.press('Escape');
    interactions.menuClosed = await menu.getAttribute('aria-expanded') === 'false';
  }

  if (view.name === 'desktop') {
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    await page.getByLabel('Empresa').fill('Auditoría de producción');
    await page.getByLabel('Nombre de contacto').fill('Prueba Visual');
    await page.getByLabel('Email').fill('visual@example.com');
    await page.getByLabel('¿Qué problema querés resolver?').fill(
      'Necesitamos ordenar las consultas y automatizar su seguimiento comercial.',
    );
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Enviar consulta' }).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent?.trim());
    const statusText = await page.locator('[role="status"]').textContent();
    interactions.formDemoConfirmed = statusText?.startsWith('Modo demo:') ?? false;
  }

  summary.push({
    view: view.name,
    status: response?.status(),
    ...metrics,
    interactions,
    errors,
    warnings,
    failedRequests,
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(summary, null, 2));

const interactionFailure = summary.some((entry) =>
  entry.view === 'desktop'
    ? !entry.interactions.formDemoConfirmed
    : !entry.interactions.menuOpened || !entry.interactions.mobileNavVisible || !entry.interactions.menuClosed,
);

if (
  interactionFailure ||
  summary.some((entry) => entry.errors.length || entry.failedRequests.length || entry.documentWidth > entry.viewportWidth)
) {
  process.exitCode = 1;
}
