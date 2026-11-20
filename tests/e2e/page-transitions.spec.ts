import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.route(/hubspot|hs-scripts|hs-analytics|hs-banner|hscollectedforms/, route => route.abort());
});

const variant = 'circle';
for (const width of [1440, 390]) {
  test(`${variant} cubre una carga lenta y revela el destino a ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => sessionStorage.setItem('lpm-nav-variant', 'overlay'));
    await page.goto('/trabajos/');
    await expect(page.locator('[data-nav-preview]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-nav-variant', 'circle');
    const phases: string[] = [];
    page.on('console', message => {
      if (message.text().startsWith('lpm-test-phase:')) phases.push(message.text().slice('lpm-test-phase:'.length));
    });
    await page.evaluate(() => {
      new MutationObserver(() => console.log(`lpm-test-phase:${document.documentElement.dataset.navigationPhase}`)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-navigation-phase'] });
    });
    const cdp = await page.context().newCDPSession(page);
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/contacto/', async route => { await gate; await route.continue(); });
    if (width < 1000) await page.locator('.menu-toggle').click();
    await page.locator(width < 1000 ? '[data-station-link][href="/contacto/"]' : '.primary-nav a[href="/contacto/"]').click({ noWaitAfter: true });
    // Read phases emitted by the browser: Playwright waits for navigation
    // before evaluating locators while the document response is blocked.
    await expect.poll(() => phases.includes('loading')).toBe(true);
    // This exceeds the old 460ms channel timer while the response is held.
    await page.waitForTimeout(800);
    expect(phases.at(-1)).toBe('loading');
    const capture = await cdp.send('Page.captureScreenshot');
    await mkdir('artifacts/navigation-transitions', { recursive: true });
    await writeFile(`artifacts/navigation-transitions/${variant}-${width}-loading.png`, Buffer.from(capture.data, 'base64'));
    release();
    await expect(page).toHaveURL(/\/contacto\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-nav-variant', variant);
    await expect(page.locator('[data-page-transition]')).toBeHidden();
    await expect(page.locator('main h1')).toBeInViewport();
    await expect(page.locator('.primary-nav [aria-current="page"]')).toHaveAttribute('href', '/contacto/');
    await page.goBack();
    await expect(page).toHaveURL(/\/trabajos\/$/);
    await expect(page.locator('[data-page-transition]')).toBeHidden();
    await expect(page.locator('main')).not.toHaveAttribute('inert');
    expect(errors).toEqual([]);
  });
}

test('los fragmentos locales recorren posiciones intermedias sin cambiar de canal', async ({ page }) => {
  await page.goto('/?nav-transition=circle');
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
  await page.evaluate(() => {
    const samples: number[] = [];
    (window as any).__scrollSamples = samples;
    window.addEventListener('scroll', () => samples.push(scrollY));
  });
  await page.locator('.hero-scroll-cue[href="#soluciones"]').click();
  await expect(page).toHaveURL(/#soluciones$/);
  await expect(page.locator('[data-page-transition]')).toBeHidden();
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
  await expect.poll(() => page.evaluate(() => new Set((window as any).__scrollSamples.map(Math.round)).size)).toBeGreaterThan(4);
});

test('movimiento reducido y almacenamiento bloqueado conservan la navegación', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/trabajos/?nav-transition=circle');
  await page.locator('.primary-nav a[href="/contacto/"]').click();
  await expect(page).toHaveURL(/\/contacto\/$/);
  await expect(page.locator('[data-page-transition]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
  await page.goto('/trabajos/');
  await page.locator('.primary-nav a[href="/contacto/"]').click();
  await expect(page).toHaveURL(/\/contacto\/$/);
  await expect(page.locator('[data-page-transition]')).toBeHidden();
});

test('los enlaces absolutos a la misma página también hacen scroll suave', async ({ page }) => {
  await page.goto('/nosotros/');
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = `${location.origin}/nosotros/#como-trabajamos`;
    link.textContent = 'Ir al método';
    link.id = 'absolute-anchor-test';
    document.querySelector('main')!.prepend(link);
  });
  await page.locator('#absolute-anchor-test').click();
  await expect(page).toHaveURL(/#como-trabajamos$/);
  await expect(page.locator('[data-page-transition]')).toBeHidden();
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
});
