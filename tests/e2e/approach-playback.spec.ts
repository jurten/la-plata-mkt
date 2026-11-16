import { expect, test, type Page } from '@playwright/test';

async function openApproach(page: Page) {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ body: '' }));
  await page.goto('/#enfoque-marketing');
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('[data-approach]');
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(.1, 2);
  return root;
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`el timer recorre los actos y termina dentro del enfoque a ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(40_000);
    await page.setViewportSize(viewport);
    const root = await openApproach(page);
    await expect(page.locator('[data-approach-countdown]')).toHaveText(/Siguiente en [1-6] s/);
    await expect(root).toHaveAttribute('data-approach-playback', 'playing', { timeout: 9_000 });
    await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(.55, 2);
    await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
    await expect(root).toHaveAttribute('data-approach-playback', 'complete', { timeout: 12_000 });
    await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(.95, 2);
    await expect(page.locator('[data-approach-brand]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-approach-playback-toggle]')).toBeDisabled();
    expect(new URL(page.url()).hash).toBe('#enfoque-marketing');
    const scroll = await page.evaluate(() => scrollY);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  });
}

test('el scroll interrumpe el avance, reinicia el timer y permite pausar y reanudar', async ({ page }) => {
  test.setTimeout(40_000);
  const root = await openApproach(page);
  const playback = page.locator('[data-approach-playback-toggle]');
  await expect(root).toHaveAttribute('data-approach-playback', 'playing', { timeout: 9_000 });
  await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeGreaterThan(.18);
  await page.mouse.wheel(0, -120);
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await expect(page.locator('[data-approach-countdown]')).toHaveText('Siguiente en 6 s');
  await playback.click();
  await expect(playback).toHaveAttribute('aria-pressed', 'true');
  await expect(root).toHaveAttribute('data-approach-playback', 'paused');
  const scroll = await page.evaluate(() => scrollY);
  await page.waitForTimeout(6_500);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await playback.click();
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await expect(playback).toHaveAttribute('aria-label', 'Pausar avance automático');
  await expect(root).toHaveAttribute('data-approach-playback', 'playing', { timeout: 9_000 });
  // Touch, keyboard and scrollbar/programmatic movement give control back too.
  await page.dispatchEvent('body', 'touchstart');
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })));
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
});

test('el timer se suspende fuera de pantalla, con foco de lectura y al reducir movimiento', async ({ page }) => {
  const root = await openApproach(page);
  await page.locator('#enfoque-marketing .inline-link').focus();
  await expect(root).not.toHaveAttribute('data-approach-playback', 'countdown');
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await page.evaluate(() => { document.querySelector('main')!.inert = true; });
  await expect(root).toHaveAttribute('data-approach-playback', 'idle');
  await page.evaluate(() => { document.querySelector('main')!.inert = false; });
  await expect(root).toHaveAttribute('data-approach-playback', 'countdown');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(root).toHaveAttribute('data-approach-playback', 'idle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-approach-enabled');
  await expect(page.locator('[data-approach-playback-toggle]')).toBeHidden();
  for (const panel of await root.locator('[data-approach-panel]').all()) {
    await expect(panel).toHaveCSS('opacity', '1');
    await expect(panel).toHaveCSS('clip-path', 'none');
  }
});
