import { expect, test } from '@playwright/test';

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
