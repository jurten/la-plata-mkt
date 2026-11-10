import { expect, test } from '@playwright/test';

const arrowCursor = /url\([^)]*\/cursors\/retro-arrow\.png[^)]*\) 4 1, default/;
const handCursor = /url\([^)]*\/cursors\/retro-hand\.png[^)]*\) 14 1, pointer/;
const textCursor = /url\([^)]*\/cursors\/retro-text\.png[^)]*\) 16 16, text/;

test('el cursor retro distingue acciones y texto y conserva la espera nativa', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('cursor', arrowCursor);
  await expect(page.locator('.hero .button-primary')).toHaveCSS('cursor', handCursor);
  await expect(page.locator('[data-theme-toggle]')).toHaveCSS('cursor', handCursor);
  await expect(page.locator('details summary').first()).toHaveCSS('cursor', handCursor);
  await expect(page.locator('#company')).toHaveCSS('cursor', textCursor);
  await expect(page.locator('#issue')).toHaveCSS('cursor', textCursor);
  await expect(page.locator('.hero h1')).toHaveCSS('cursor', textCursor);

  const submit = page.locator('.submit-button');
  await submit.evaluate((button) => { (button as HTMLButtonElement).disabled = true; });
  await expect(submit).toHaveCSS('cursor', 'wait');
  await submit.evaluate((button) => { (button as HTMLButtonElement).disabled = false; });
  await expect(submit).toHaveCSS('cursor', handCursor);

  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('body')).toHaveCSS('cursor', arrowCursor);
  await expect(page.locator('.hero .button-primary')).toHaveCSS('cursor', handCursor);

  // Confirm the native cursor sources are real 32px PNGs, not missing URLs.
  for (const name of ['retro-arrow', 'retro-hand', 'retro-text']) {
    const response = await page.request.get(`/cursors/${name}.png`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
    const bytes = await response.body();
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.readUInt32BE(16)).toBe(32);
    expect(bytes.readUInt32BE(20)).toBe(32);
  }
  await page.goto('/privacidad/');
  await expect(page.locator('body')).toHaveCSS('cursor', arrowCursor);
  await expect(page.getByRole('link').first()).toHaveCSS('cursor', handCursor);
  await expect(page.locator('main p').first()).toHaveCSS('cursor', textCursor);
});

test('el cursor del sistema se conserva con colores forzados', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveCSS('cursor', /url\(/);
  await expect(page.locator('.hero .button-primary')).not.toHaveCSS('cursor', /url\(/);
  await expect(page.locator('[data-theme-toggle]')).toHaveCSS('cursor', 'pointer');
  await expect(page.locator('#company')).toHaveCSS('cursor', 'text');
});

test('un dispositivo táctil conserva los cursores del sistema', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBeTruthy();
    await expect(page.locator('body')).not.toHaveCSS('cursor', /url\(/);
    await expect(page.locator('.hero .button-primary')).not.toHaveCSS('cursor', /url\(/);
    await expect(page.locator('[data-theme-toggle]')).toHaveCSS('cursor', 'pointer');
  } finally {
    await context.close();
  }
});
