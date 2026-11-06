import { createHash } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';

const portraitSelector = '.alien-portrait[data-spatial-portrait]';
const sceneURL = /alien-scene(?:\.[^/?]+)?\.(?:js|ts)(?:[?]|$)/i;
const depthURL = /lpm-visitor-depth/i;
const modelURL = /\/models\/supplied-alien-head\.glb(?:[?]|$)/i;
const materialURLs = ['basecolor.jpg', 'normal.jpg', 'metallic-roughness.jpg'];

const readyPortrait = async (page: Page) => {
  const portrait = page.locator(portraitSelector);
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await expect(portrait.locator('canvas.spatial-canvas')).toHaveAttribute('aria-hidden', 'false');
  await expect(portrait.getByRole('img')).toHaveAccessibleName('Modelo tridimensional de un extraterrestre azul que mira al visitante.');
  await expect(portrait.locator('img')).toHaveCount(0);
  return portrait;
};

const expectFallback = async (page: Page, state: 'static' | 'unavailable') => {
  const portrait = page.locator(portraitSelector);
  await expect(portrait).toHaveAttribute('data-spatial-state', state);
  await expect(portrait.locator('img')).toHaveCount(0);
  await expect(portrait.locator('canvas.spatial-canvas')).toHaveCSS('opacity', '0');
  await expect(portrait.locator('canvas.spatial-canvas')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.hero .button-primary')).toHaveAttribute('href', 'https://wa.me/5491158861954');
};

const expectOtherControlsWork = async (page: Page) => {
  await page.locator('[data-set-theme="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.primary-nav').getByRole('link', { name: 'Contacto', exact: true }).click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contact-title')).toBeVisible();
};

test('el rostro saluda una vez sin mover el texto y luego queda quieto', async ({ page }) => {
  await page.addInitScript(() => {
    const audit = { samples: [] as number[][], lastSample: -Infinity };
    Object.defineProperty(window, '__greetingPixelAudit', { value: audit });
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      const context = (originalContext as (...args: unknown[]) => unknown).apply(this, [contextId, ...args]);
      if (/webgl/i.test(contextId) && this.matches('.spatial-canvas') && context) {
        const canvas = this;
        const graphics = context as WebGLRenderingContext;
        let queued = false;
        const sample = () => {
          if (queued) return;
          queued = true;
          // Three draws several indexed meshes per render. Read after the whole
          // synchronous render, before the browser discards the default buffer.
          queueMicrotask(() => {
            queued = false;
            const now = performance.now();
            if (canvas.parentElement?.getAttribute('data-spatial-motion') !== 'moving'
              || now - audit.lastSample < 100 || audit.samples.length >= 24
              || graphics.getParameter(graphics.FRAMEBUFFER_BINDING) !== null) return;
            const pixels = new Uint8Array(16 * 16 * 4);
            graphics.readPixels(Math.floor(canvas.width * .7), Math.floor(canvas.height * .55),
              16, 16, graphics.RGBA, graphics.UNSIGNED_BYTE, pixels);
            audit.samples.push([...pixels]);
            audit.lastSample = now;
          });
        };
        const originalArrays = graphics.drawArrays;
        graphics.drawArrays = function (...drawArgs: Parameters<WebGLRenderingContext['drawArrays']>) {
          originalArrays.apply(graphics, drawArgs);
          sample();
        };
        const originalElements = graphics.drawElements;
        graphics.drawElements = function (...drawArgs: Parameters<WebGLRenderingContext['drawElements']>) {
          originalElements.apply(graphics, drawArgs);
          sample();
        };
      }
      return context;
    } as typeof originalContext;
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const portrait = page.locator(portraitSelector);
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('.hero h1');
  const action = page.locator('.hero .button-primary');
  const headingBox = await heading.boundingBox();
  const actionBox = await action.boundingBox();
  const readPixelAudit = () => page.evaluate(() => {
    const { samples } = (window as unknown as { __greetingPixelAudit: { samples: number[][] } }).__greetingPixelAudit;
    const first = samples[0];
    const differences = samples.map((sample) => {
      let total = 0;
      for (let index = 0; index < sample.length; index += 4) {
        total += Math.abs(sample[index] - first[index])
          + Math.abs(sample[index + 1] - first[index + 1])
          + Math.abs(sample[index + 2] - first[index + 2]);
      }
      return total / (16 * 16 * 3);
    });
    return { sampleCount: samples.length, maxMeanDifference: Math.max(0, ...differences) };
  });
  // No pointer or orientation input is dispatched during these pixel samples.
  // Two differing framebuffer samples prove movement. A higher frame minimum
  // would measure synchronous GPU readback overhead rather than this behavior.
  await expect.poll(async () => (await readPixelAudit()).sampleCount).toBeGreaterThanOrEqual(2);
  await expect.poll(async () => (await readPixelAudit()).maxMeanDifference).toBeGreaterThan(.15);
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  expect(await heading.boundingBox()).toEqual(headingBox);
  expect(await action.boundingBox()).toEqual(actionBox);

  await page.locator('#contact-title').evaluate((element) => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(portrait).not.toBeInViewport();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(portrait).toBeInViewport();
  // Re-entry and resize must not restart the greeting.
  await page.waitForTimeout(400);
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  await page.setViewportSize({ width: 1360, height: 1000 });
  await page.waitForTimeout(300);
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
});

test('el retrato tiene profundidad visible y puede pausarse sin mover texto ni CTA', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portrait = await readyPortrait(page);
  const canvas = portrait.locator('canvas.spatial-canvas');
  const heading = page.locator('.hero h1');
  const action = page.locator('.hero .button-primary');
  const headingBox = await heading.boundingBox();
  const actionBox = await action.boundingBox();
  const heroBox = (await page.locator('.alien-hero').boundingBox())!;
  const hash = async () => createHash('sha256').update(await canvas.screenshot()).digest('hex');

  await page.mouse.move(heroBox.x + heroBox.width * .08, heroBox.y + heroBox.height * .25);
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'moving');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  const leftView = await hash();
  await page.mouse.move(heroBox.x + heroBox.width * .92, heroBox.y + heroBox.height * .7);
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'moving');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  const rightView = await hash();
  expect(rightView).not.toBe(leftView);
  expect(await heading.boundingBox()).toEqual(headingBox);
  expect(await action.boundingBox()).toEqual(actionBox);

  const toggle = page.locator('[data-spatial-toggle]');
  await expect(page.locator('[data-spatial-controls]')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(portrait).toHaveAttribute('data-spatial-state', 'paused');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  await expect(canvas).toHaveCSS('opacity', '1');
  await expect(portrait.locator('img')).toHaveCount(0);
  await page.mouse.move(heroBox.x + heroBox.width * .15, heroBox.y + heroBox.height * .25);
  const paused = createHash('sha256').update(await portrait.screenshot()).digest('hex');
  await page.mouse.move(heroBox.x + heroBox.width * .85, heroBox.y + heroBox.height * .25);
  expect(createHash('sha256').update(await portrait.screenshot()).digest('hex')).toBe(paused);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready');
});

test('el rayo de neón limpia la interferencia cerca del cursor y se retira al salir', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portrait = await readyPortrait(page);
  const canvas = portrait.locator('canvas.spatial-canvas');
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5);
  await expect(portrait).toHaveAttribute('data-transmission-beam', 'active');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  await page.waitForTimeout(500);
  // A narrow strip includes both sample regions without shipping full-page
  // pixel arrays through browser evaluation.
  const clip = { x: box.x + box.width * .75 - 25, y: box.y + box.height * .15 - 25, width: 50, height: box.height * .35 + 50 };
  const first = [...await page.screenshot({ clip })];
  await page.waitForTimeout(250);
  const second = [...await page.screenshot({ clip })];
  const variation = await page.evaluate(async ({ first, second }) => {
    async function pixels(bytes: number[]) {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const scratch = document.createElement('canvas');
      scratch.width = bitmap.width; scratch.height = bitmap.height;
      const context = scratch.getContext('2d')!;
      context.drawImage(bitmap, 0, 0); bitmap.close();
      return { width: scratch.width, height: scratch.height, data: context.getImageData(0, 0, scratch.width, scratch.height).data };
    }
    const a = await pixels(first), b = await pixels(second);
    function difference(startY: number) {
      let sum = 0;
      for (let y = 0; y < 50; y++) for (let x = 0; x < 50; x++) {
        const at = ((startY + y) * a.width + x) * 4;
        for (let c = 0; c < 3; c++) sum += Math.abs(a.data[at + c] - b.data[at + c]);
      }
      return sum / (50 * 50 * 3);
    }
    return { inside: difference(a.height - 50), outside: difference(0) };
  }, { first, second });
  expect(variation.outside, 'la señal CRT sigue viva fuera del rayo').toBeGreaterThan(.1);
  expect(variation.inside, 'la zona revelada queda limpia y estable').toBeLessThan(variation.outside * .35);
  await page.mouse.move(20, box.y + box.height + 30);
  await expect(portrait).toHaveAttribute('data-transmission-beam', 'inactive');
});

test('el modelo 3D conserva textura, ojos y controles en cada breakpoint', async ({ page }) => {
  const loaded = new Set<string>();
  page.on('response', (response) => { if (response.ok()) loaded.add(response.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await readyPortrait(page);
  expect([...loaded].some((url) => modelURL.test(url))).toBeTruthy();
  for (const name of materialURLs) expect([...loaded].some((url) => url.includes(name)), `mapa real ${name}`).toBeTruthy();
  for (const width of [390, 700, 701, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const portrait = await readyPortrait(page);
    await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
    await expect(portrait).toHaveAttribute('data-spatial-signal', 'locked');
    const canvas = portrait.locator('canvas.spatial-canvas');
    const canvasBox = (await canvas.boundingBox())!;
    const portraitBox = (await portrait.boundingBox())!;
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(canvasBox[key], `${key} @ ${width}`).toBeCloseTo(portraitBox[key], 0);
    const rendered = await canvas.screenshot({
      style: '.hero-copy,.hero-footer,.spatial-controls,.topbar,.floating-whatsapp,[data-site-transmission]{visibility:hidden!important}',
    });
    const face = await page.evaluate(async (bytes) => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const scratch = document.createElement('canvas');scratch.width = bitmap.width;scratch.height = bitmap.height;
      const ctx = scratch.getContext('2d', { willReadFrequently: true })!;ctx.drawImage(bitmap, 0, 0);
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const step = 2, w = Math.ceil(bitmap.width / step), h = Math.ceil(bitmap.height / step);
      const skin = new Uint8Array(w * h), dark = new Uint8Array(w * h), luminance = new Float32Array(w * h);
      let skinCount = 0, top = h, bottom = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (Math.min(y * step, bitmap.height - 1) * bitmap.width + Math.min(x * step, bitmap.width - 1)) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], at = y * w + x;
        luminance[at] = (r + g + b) / 3;
        if (b > 35 && b > r * 1.18 && b > g * 1.03) {skin[at] = 1;skinCount++;top = Math.min(top, y);bottom = Math.max(bottom, y);}
        if (Math.max(r, g, b) < 60) dark[at] = 1;
      }
      // Dark lenses must live inside the colored face, rather than merely being
      // empty page background. Their size distinguishes them from mouth/nostrils.
      const holes = new Uint8Array(w * h);
      const searchBottom = Math.min(h, Math.round(top + (bottom - top) * .73));
      for (let y = top; y < searchBottom; y++) {
        let left = w, right = -1;
        for (let x = 0; x < w; x++) if (skin[y * w + x]) {left = Math.min(left, x);right = x;}
        for (let x = left + 2; x < right - 2; x++) if (dark[y * w + x]) holes[y * w + x] = 1;
      }
      let eyes = 0;
      for (let start = 0; start < holes.length; start++) if (holes[start]) {
        holes[start] = 0;const queue = [start];let area = 0, minX = w, maxX = 0, minY = h, maxY = 0;
        for (let q = 0; q < queue.length; q++) {
          const at = queue[q], x = at % w, y = Math.floor(at / w);area++;
          minX = Math.min(minX, x);maxX = Math.max(maxX, x);minY = Math.min(minY, y);maxY = Math.max(maxY, y);
          for (const next of [x > 0 ? at - 1 : -1, x + 1 < w ? at + 1 : -1, y > 0 ? at - w : -1, y + 1 < h ? at + w : -1]) {
            if (next >= 0 && holes[next]) {holes[next] = 0;queue.push(next);}
          }
        }
        if (area > w * h * .0005 && maxX - minX > w * .025 && maxY - minY > h * .015) eyes++;
      }
      let fine = 0, samples = 0;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (skin[i] && skin[i-1] && skin[i+1] && skin[i-w] && skin[i+w]) {
          fine += Math.abs(luminance[i] - (luminance[i-1] + luminance[i+1] + luminance[i-w] + luminance[i+w]) * .25);samples++;
        }
      }
      bitmap.close();return { coverage: skinCount / (w * h), eyes, fineDetail: fine / Math.max(1, samples) };
    }, [...rendered]);
    expect(face.coverage, `superficie azul visible @ ${width}`).toBeGreaterThan(.07);
    expect(face.coverage, `espacio alrededor del modelo @ ${width}`).toBeLessThan(.85);
    expect(face.eyes, `lentes oscuros dentro de la cara @ ${width}`).toBeGreaterThanOrEqual(width === 701 ? 1 : 2);
    expect(face.fineDetail, `detalle tonal de la piel @ ${width}`).toBeGreaterThan(.08);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.hero .button-primary')).toBeVisible();
  }
});

test('movimiento reducido inicial omite el alien sin cargar imagen, Three, GPU ni sensores', async ({ page }) => {
  const sceneRequests: string[] = [];
  const depthRequests: string[] = [];
  const modelRequests: string[] = [];
  const requested: string[] = [];
  page.on('request', (request) => { if (sceneURL.test(request.url())) sceneRequests.push(request.url()); });
  page.on('request', (request) => { if (depthURL.test(request.url())) depthRequests.push(request.url()); });
  page.on('request', (request) => { if (modelURL.test(request.url())) modelRequests.push(request.url()); });
  page.on('request', (request) => requested.push(request.url()));
  await page.addInitScript(() => {
    const audit = { contexts: 0, permissions: 0 };
    Object.defineProperty(window, '__spatialAudit', { value: audit });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      if (/webgl/i.test(contextId) && this.matches('.spatial-canvas')) audit.contexts += 1;
      return (original as (...args: unknown[]) => unknown).apply(this, [contextId, ...args]);
    } as typeof original;
    class OrientationEvent extends Event {
      static requestPermission() { audit.permissions += 1; return Promise.resolve('granted'); }
    }
    Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: OrientationEvent });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator(portraitSelector).scrollIntoViewIfNeeded();
  await expectFallback(page, 'static');
  await expect(page.locator('[data-spatial-controls]')).toBeHidden();
  expect(sceneRequests).toEqual([]);
  expect(depthRequests).toEqual([]);
  expect(modelRequests).toEqual([]);
  expect(requested.some((url) => url.includes('/models/supplied-alien'))).toBeFalsy();
  expect(requested.some((url) => /lpm-visitor(?:\.|\/)/i.test(url))).toBeFalsy();
  expect(await page.evaluate(() => (window as unknown as { __spatialAudit: unknown }).__spatialAudit))
    .toEqual({ contexts: 0, permissions: 0 });
});

test('activar movimiento reducido durante la visita oculta el alien sin mostrar una imagen', async ({ page }) => {
  await page.addInitScript(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const audit = { changes: 0, lastMatches: query.matches };
    Object.defineProperty(window, '__reducedChangeAudit', { value: audit });
    query.addEventListener('change', (event) => { audit.changes += 1; audit.lastMatches = event.matches; });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portrait = await readyPortrait(page);
  const box = (await portrait.boundingBox())!;
  await page.mouse.move(box.x + box.width * .9, Math.max(100, box.y + box.height * .4));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy();
  await expect.poll(() => page.evaluate(() => (window as unknown as {
    __reducedChangeAudit: { lastMatches: boolean };
  }).__reducedChangeAudit.lastMatches)).toBeTruthy();
  await expectFallback(page, 'static');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  await expect(page.locator('[data-spatial-controls]')).toBeHidden();
  await expectOtherControlsWork(page);
});

test('el alien no redibuja en reposo y la transmisión se suspende fuera del hero', async ({ page }) => {
  await page.addInitScript(() => {
    const audit = { frames: 0, modelDraws: 0, outputDraws: 0 };
    Object.defineProperty(window, '__spatialIdleAudit', { value: audit });
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (callback: FrameRequestCallback) {
      if (/alien-spatial|AlienPortrait|alien-scene/i.test(new Error().stack ?? '')) audit.frames += 1;
      return originalRAF.call(window, callback);
    };
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      const context = (originalContext as (...args: unknown[]) => unknown).apply(this, [contextId, ...args]);
      if (/webgl/i.test(contextId) && this.matches('.spatial-canvas') && context) {
        const graphics = context as WebGLRenderingContext;
        const recordDraw = () => {
          if (graphics.getParameter(graphics.FRAMEBUFFER_BINDING) !== null) audit.modelDraws += 1;
          else audit.outputDraws += 1;
        };
        const originalArrays = graphics.drawArrays;
        graphics.drawArrays = function (...drawArgs: Parameters<WebGLRenderingContext['drawArrays']>) {
          recordDraw();
          return originalArrays.apply(graphics, drawArgs);
        };
        const originalElements = graphics.drawElements;
        graphics.drawElements = function (...drawArgs: Parameters<WebGLRenderingContext['drawElements']>) {
          recordDraw();
          return originalElements.apply(graphics, drawArgs);
        };
      }
      return context;
    } as typeof originalContext;
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portrait = await readyPortrait(page);
  const box = (await portrait.boundingBox())!;
  await page.mouse.move(box.x + box.width * .85, Math.max(120, box.y + box.height * .3));
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'moving');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  const readAudit = () => page.evaluate(() => ({ ...(window as unknown as {
    __spatialIdleAudit: { frames: number; modelDraws: number; outputDraws: number };
  }).__spatialIdleAudit }));
  const settled = await readAudit();
  expect(settled.frames).toBeGreaterThan(0);
  expect(settled.modelDraws).toBeGreaterThan(0);
  expect(settled.outputDraws).toBeGreaterThan(0);
  // The post-processing quad can present interference from the cached target.
  // The settled 3D head must schedule no animation frames or model/FBO draws.
  await page.waitForTimeout(400);
  const idle = await readAudit();
  expect(idle.frames).toBe(settled.frames);
  expect(idle.modelDraws).toBe(settled.modelDraws);
  expect(idle.outputDraws).toBeGreaterThanOrEqual(settled.outputDraws);
  await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-transmission-state', 'running');
  await page.locator('[data-spatial-toggle]').click();
  const paused = await readAudit();
  await page.waitForTimeout(400);
  expect(await readAudit()).toEqual(paused);
  await page.locator('[data-spatial-toggle]').click();
  await page.locator('#contact-title').evaluate((element) => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(portrait).not.toBeInViewport();
  await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-transmission-state', 'suspended');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  const offscreen = await readAudit();
  await page.waitForTimeout(400);
  expect(await readAudit()).toEqual(offscreen);
});

test('sin WebGL no aparece una imagen y siguen disponibles la navegación y el contacto', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      if (/webgl/i.test(contextId) && this.matches('.spatial-canvas')) return null;
      return (original as (...args: unknown[]) => unknown).apply(this, [contextId, ...args]);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expectFallback(page, 'unavailable');
  await expectOtherControlsWork(page);
});

test('un módulo 3D que falla no muestra una imagen y deja los controles útiles', async ({ page }) => {
  const aborted: string[] = [];
  await page.route('**/*', (route) => {
    if (sceneURL.test(route.request().url())) {
      aborted.push(route.request().url());
      return route.abort('failed');
    }
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expectFallback(page, 'unavailable');
  expect(aborted.length).toBeGreaterThan(0);
  await expectOtherControlsWork(page);
});

test('un modelo GLB que falla omite el alien y conserva el contacto', async ({ page }) => {
  const aborted: string[] = [];
  await page.route('**/*', (route) => {
    if (modelURL.test(route.request().url())) {aborted.push(route.request().url());return route.abort('failed');}
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expectFallback(page, 'unavailable');
  expect(aborted.length).toBeGreaterThan(0);
  await expectOtherControlsWork(page);
});

test('una textura del modelo que falla omite el alien y conserva el contacto', async ({ page }) => {
  let failed = false;
  await page.route('**/models/supplied-alien-textures/basecolor.jpg*', (route) => {failed = true;return route.abort('failed');});
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expectFallback(page, 'unavailable');
  expect(failed).toBeTruthy();
  await expectOtherControlsWork(page);
});

test('un mapa normal del modelo que falla no degrada silenciosamente la piel', async ({ page }) => {
  let failed = false;
  await page.route('**/models/supplied-alien-textures/normal.jpg*', (route) => {
    failed = true;
    return route.abort('failed');
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expectFallback(page, 'unavailable');
  expect(failed).toBeTruthy();
  await expectOtherControlsWork(page);
});

test('perder el contexto gráfico oculta el alien sin mostrar una imagen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portrait = await readyPortrait(page);
  await portrait.locator('canvas.spatial-canvas').evaluate((canvas) => {
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  });
  await expectFallback(page, 'unavailable');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  await expectOtherControlsWork(page);
});

test('el gesto vertical sobre el alien permite desplazar la página en móvil', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'La secuencia de gestos nativos usa Chrome DevTools Protocol.');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const portrait = await readyPortrait(page);
    await expect(portrait).toHaveCSS('touch-action', 'pan-y pinch-zoom');
    const box = (await portrait.boundingBox())!;
    const x = Math.round(box.x + box.width * .5);
    const y = Math.round(Math.min(760, box.y + box.height * .75));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (const amount of [35, 85, 140, 190]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - amount }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore + 40);
    await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await cdp.detach();
  } finally {
    await context.close();
  }
});

test('el permiso de orientación se solicita únicamente al pulsar el control', async ({ browser, browserName }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: browserName !== 'firefox', hasTouch: true, reducedMotion: 'no-preference',
  });
  try {
    await context.addInitScript(() => {
      const audit = { permissions: 0 };
      Object.defineProperty(window, '__spatialAudit', { value: audit });
      class OrientationEvent extends Event {
        static requestPermission() { audit.permissions += 1; return Promise.resolve('granted'); }
      }
      Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: OrientationEvent });
    });
    const page = await context.newPage();
    await page.goto('/');
    await readyPortrait(page);
    const requests = () => page.evaluate(() => (window as unknown as {
      __spatialAudit: { permissions: number };
    }).__spatialAudit.permissions);
    expect(await requests()).toBe(0);
    const orientation = page.locator('[data-spatial-orientation]');
    await expect(orientation).toBeVisible();
    await orientation.click();
    await expect.poll(requests).toBe(1);
  } finally {
    await context.close();
  }
});
