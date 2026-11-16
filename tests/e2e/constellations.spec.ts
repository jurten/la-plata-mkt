import { expect, test } from '@playwright/test';
import { auditGalaxy } from './helpers/galaxy-audit';

test('Galaxy anima capas en la GPU, repele el cursor y congela el cielo al pausar', async ({ page }) => {
  test.setTimeout(60_000);
  await auditGalaxy(page);
  await page.goto('/#inicio');
  const portrait = page.locator('[data-spatial-portrait]');
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uTime?.[0] ?? 0), { timeout: 15_000 }).toBeGreaterThan(2.5);
  const arrival = await page.evaluate(() => window.galaxyArrivalScales);
  expect(arrival[0]).toBeLessThan(.5);
  expect(arrival.at(-1)).toBe(1);
  expect(arrival.every((scale, index) => index === 0 || scale >= arrival[index - 1])).toBeTruthy();
  const firstTime = await page.evaluate(() => window.galaxyUniforms.uTime[0]);
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uTime[0])).toBeGreaterThan(firstTime);
  await page.mouse.move(650, 220);
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uMouseActiveFactor?.[0] ?? 0), { timeout: 10_000 }).toBeGreaterThan(.99);
  expect(await page.evaluate(() => window.galaxyUniforms.uRepulsionStrength[0])).toBe(2);
  await page.mouse.move(720, 40);
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uMouseActiveFactor[0]), { timeout: 10_000 }).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: true })));
  await expect(portrait).toHaveAttribute('data-spatial-state', 'paused');
  const pausedTime = await page.evaluate(() => window.galaxyUniforms.uTime[0]);
  const image = await portrait.locator('.spatial-canvas').screenshot();
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.galaxyUniforms.uTime[0])).toBe(pausedTime);
  expect(await portrait.locator('.spatial-canvas').screenshot()).toEqual(image);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: false })));
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uTime[0])).toBeGreaterThan(pausedTime);
  await page.setViewportSize({ width: 1360, height: 1000 });
  expect(await page.evaluate(() => window.galaxyUniforms.uHeadScale[0])).toBe(1);
});

test('el warp se activa en el fondo y deja funcionar los enlaces del hero', async ({ page }) => {
  test.setTimeout(60_000);
  await auditGalaxy(page);
  await page.goto('/#inicio');
  await expect(page.locator('[data-spatial-portrait]')).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uTime?.[0] ?? 0), { timeout: 15_000 }).toBeGreaterThan(4);
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uWarp?.[0] ?? 1)).toBeLessThan(.1);
  await page.mouse.click(650, 180);
  await expect.poll(() => page.evaluate(() => window.galaxyUniforms.uWarp[0])).toBeGreaterThan(.5);
  await page.locator('.hero .button-text').click();
  await expect(page).toHaveURL(/#soluciones$/);
});

test('el cielo cambia al recargar y conserva su semilla al redimensionar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const sky = page.locator('[data-constellation-sky]');
  await expect(sky).toHaveAttribute('data-sky-seed', /^\d+$/);
  const seed = await sky.getAttribute('data-sky-seed');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => sky.evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBe(390);
  expect(await sky.getAttribute('data-sky-seed')).toBe(seed);
  await page.reload();
  await expect(sky).toHaveAttribute('data-sky-seed', /^\d+$/);
  expect(await sky.getAttribute('data-sky-seed')).not.toBe(seed);
});

test('el cielo estático muestra estrellas sin cargar 3D y respeta colores forzados', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const modelRequests: string[] = [];
  page.on('request', request => {
    if (/supplied-alien-head\.glb/.test(request.url())) modelRequests.push(request.url());
  });
  await page.goto('/');
  const sky = page.locator('[data-constellation-sky]');
  await expect(sky).toHaveAttribute('data-sky-seed', /^\d+$/);
  await expect(sky).toHaveCSS('visibility', 'visible');
  expect(await sky.evaluate(element => {
    const canvas = element as HTMLCanvasElement;
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let bright = 0;
    for (let index = 0; index < pixels.length; index += 4) if (pixels[index + 2] > 35) bright++;
    return bright;
  })).toBeGreaterThan(50);
  expect(modelRequests).toEqual([]);
  await expect(page.locator('.hero .button-primary')).toBeVisible();
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(sky).toHaveCSS('display', 'none');
});
