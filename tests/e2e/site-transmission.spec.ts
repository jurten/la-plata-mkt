import { expect, test, type Locator } from '@playwright/test';

const expectHeroBounds = async (hero: Locator, surface: Locator) => {
  const heroBox = await hero.boundingBox();
  const effectBox = await surface.boundingBox();
  expect(heroBox).not.toBeNull();
  expect(effectBox).not.toBeNull();
  for (const property of ['x', 'y', 'width', 'height'] as const) {
    expect(effectBox![property], property).toBeCloseTo(heroBox![property], 0);
  }
};

test('la interferencia pertenece al hero y se suspende fuera de pantalla', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expect(surface).toHaveCSS('position', 'absolute');
  await expect(surface).toHaveCSS('pointer-events', 'none');
  await expect(hero.locator('[data-transmission-toggle]')).toHaveCount(0);
  expect(await hero.evaluate(element => ['clip', 'hidden'].includes(getComputedStyle(element).overflowY))).toBe(true);
  await expectHeroBounds(hero, surface);

  // During the authored exit the effect stays inside the hero and stops its
  // own animation, leaving the scroll-driven silhouette as the focal motion.
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await expectHeroBounds(hero, surface);
  await expect(surface).toHaveAttribute('data-transmission-state', 'suspended');
  await page.locator('#trabajo').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-transmission-state', 'suspended');
  await expect(surface).not.toBeInViewport();
  const stopped = await surface.getAttribute('data-signal-tick');
  // Cover several 24fps intervals: hidden work must actually stop.
  await page.waitForTimeout(220);
  expect(await surface.getAttribute('data-signal-tick')).toBe(stopped);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expect.poll(() => surface.getAttribute('data-signal-tick')).not.toBe(stopped);
});

test('el framebuffer colapsa, repite cuadros y recupera la imagen sin filtros CSS', async ({ page }) => {
  test.setTimeout(45_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  const portrait = hero.locator('[data-spatial-portrait]');
  const canvas = portrait.locator('.spatial-canvas');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expect(portrait).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
  await expect(canvas).toHaveAttribute('aria-hidden', 'false');
  await expect(hero.locator('.transmission-glass')).toHaveCount(0);

  // End the greeting, then leave the hero so the aperture cannot reveal a clean
  // patch during the comparison. Use a complete first burst to settle the pose.
  const heroBox = (await hero.boundingBox())!;
  await page.mouse.move(heroBox.x + heroBox.width * .8, heroBox.y + heroBox.height * .35);
  const headerBox = (await page.locator('.topbar').boundingBox())!;
  await page.mouse.move(headerBox.x + headerBox.width * .5, headerBox.y + headerBox.height * .5);
  await expect(surface).toHaveAttribute('data-beam', 'inactive');
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'collapse', { timeout: 10_000 });
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'locked');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');

  // Hide every overlay and disable CSS backdrop filtering. A change in these
  // screenshots must therefore come from pixels presented by the WebGL canvas.
  const screenshotStyle = `
    .site-transmission,.hero-copy,.hero-footer,.topbar,.floating-whatsapp{visibility:hidden!important}
    #inicio,#inicio *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  `;
  const normal = await canvas.screenshot({ style: screenshotStyle });
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'locked');

  // Read the renderer's presentation state, rather than only the controller's
  // requested phase: these attributes update after a real shader presentation.
  const burstObservation = portrait.evaluate(element => new Promise<{ frames: number[]; recoveryFrame: string | null }>((resolve, reject) => {
    const frames: number[] = [];
    let armed = element.getAttribute('data-spatial-signal') !== 'collapse';
    let collecting = false;
    let lastFrame = -1;
    let request = 0;
    const timeout = setTimeout(() => {
      cancelAnimationFrame(request);
      reject(new Error('El renderer no presentó un colapso y su recuperación en 12 segundos.'));
    }, 12_000);
    const sample = () => {
      const phase = element.getAttribute('data-spatial-signal');
      if (phase !== 'collapse') {
        armed = true;
        if (collecting) {
          clearTimeout(timeout);
          resolve({ frames, recoveryFrame: element.getAttribute('data-spatial-signal-frame') });
          return;
        }
      } else if (armed) {
        collecting = true;
        const id = Number(element.getAttribute('data-spatial-signal-frame'));
        if (id !== lastFrame) {
          frames.push(id);
          lastFrame = id;
        }
      }
      request = requestAnimationFrame(sample);
    };
    sample();
  }));
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'collapse', { timeout: 10_000 });
  const collapsed = await canvas.screenshot({ style: screenshotStyle });
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'collapse');
  const burst = await burstObservation;
  await expect(portrait).toHaveAttribute('data-spatial-signal', 'locked');
  await expect(portrait).toHaveAttribute('data-spatial-motion', 'idle');
  const recovered = await canvas.screenshot({ style: screenshotStyle });

  expect(burst.frames.length, 'varios cuadros repetidos, no un único salto').toBeGreaterThanOrEqual(4);
  expect([...new Set(burst.frames)].sort()).toEqual([0, 1, 2]);
  expect(burst.frames.length, 'los tres cuadros vuelven como un disco trabado').toBeGreaterThan(new Set(burst.frames).size);
  expect(burst.recoveryFrame, 'la recuperación desactiva el cuadro de colapso').toBe('-1');

  const pixels = await page.evaluate(async (images) => {
    const decode = async (bytes: number[]) => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const scratch = document.createElement('canvas');
      scratch.width = bitmap.width; scratch.height = bitmap.height;
      const context = scratch.getContext('2d', { willReadFrequently: true })!;
      context.drawImage(bitmap, 0, 0); bitmap.close();
      return { width: scratch.width, height: scratch.height, data: context.getImageData(0, 0, scratch.width, scratch.height).data };
    };
    const [normal, collapsed, recovered] = await Promise.all(images.map(decode));
    const difference = (a: typeof normal, b: typeof normal) => {
      if (a.width !== b.width || a.height !== b.height) throw new Error('El canvas cambió de tamaño durante el colapso.');
      let total = 0;
      for (let i = 0; i < a.data.length; i++) total += Math.abs(a.data[i] - b.data[i]);
      return total / a.data.length;
    };
    const blueCoverage = (image: typeof normal) => {
      let blue = 0;
      for (let i = 0; i < image.data.length; i += 4) {
        const [r, g, b] = [image.data[i], image.data[i + 1], image.data[i + 2]];
        if (b > 35 && b > r * 1.18 && b > g * 1.03) blue++;
      }
      return blue / (image.width * image.height);
    };
    return {
      collapseDifference: difference(normal, collapsed), recoveryDifference: difference(normal, recovered),
      normalBlue: blueCoverage(normal), collapsedBlue: blueCoverage(collapsed), recoveredBlue: blueCoverage(recovered),
    };
  }, [[...normal], [...collapsed], [...recovered]]);
  expect(pixels.normalBlue, 'el modelo azul está realmente dibujado').toBeGreaterThan(.07);
  expect(pixels.collapsedBlue, 'el colapso conserva señal, no borra el canvas a negro').toBeGreaterThan(.005);
  expect(pixels.collapseDifference, 'la distorsión modifica fuertemente el framebuffer real').toBeGreaterThan(12);
  expect(pixels.recoveryDifference, 'el rostro recupera la imagen coherente con la misma pose').toBeLessThan(1.5);
  expect(pixels.recoveredBlue).toBeCloseTo(pixels.normalBlue, 2);
});

test('el rayo usa coordenadas del hero y la pausa y movimiento reducido detienen el efecto', async ({ page }) => {
  // A short viewport leaves a natural reading scroll before the reveal starts.
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  const point = { x: 900, y: 350 };
  await page.mouse.move(point.x, point.y);
  await expect(surface).toHaveAttribute('data-beam', 'active');
  const path = surface.locator('[data-crt-cutout]');
  const before = await path.getAttribute('d');
  await expect.poll(() => path.getAttribute('d')).not.toBe(before);
  // The canvas must clear the cursor's core even after the hero has scrolled.
  await expect.poll(() => surface.locator('canvas').evaluate((element, cursor) => {
    const canvas = element as HTMLCanvasElement;
    const box = canvas.getBoundingClientRect();
    const x = Math.round((cursor.x - box.left) * canvas.width / box.width);
    const y = Math.round((cursor.y - box.top) * canvas.height / box.height);
    return canvas.getContext('2d')!.getImageData(x, y, 1, 1).data[3];
  }, point)).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: true })));
  await expect(surface).toHaveAttribute('data-transmission-state', 'paused');
  await expect(surface).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: false })));
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(surface).toBeHidden();
  await expect(hero.locator('[data-transmission-toggle]')).toHaveCount(0);
  // Decorative layers never take over actual section navigation.
  await page.locator('.primary-nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
});

test('privacidad no monta interferencia ni controles del hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/privacidad/');
  await expect(page.locator('[data-site-transmission]')).toHaveCount(0);
  await expect(page.locator('[data-transmission-toggle]')).toHaveCount(0);
});

test('en móvil el rayo sigue el toque sin retener el scroll y queda dentro del hero', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'La secuencia de gestos nativos usa Chrome DevTools Protocol.');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/#inicio');
  const hero = page.locator('#inicio');
  const surface = hero.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  await expectHeroBounds(hero, surface);
  const portrait = hero.locator('[data-spatial-portrait]');
  await portrait.scrollIntoViewIfNeeded();
  const portraitBox = (await portrait.boundingBox())!;
  const point = { x: portraitBox.x + portraitBox.width / 2, y: portraitBox.y + portraitBox.height / 2 };
  const initialScroll = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await expect(surface).toHaveAttribute('data-beam', 'active');
  for (const distance of [40, 90, 140, 190]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - distance }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(surface).toHaveAttribute('data-beam', 'inactive');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll + 40);
  await expectHeroBounds(hero, surface);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await context.close();
});

test('el CRT cubre también el lado del texto y la barra comienza transparente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const surface = page.locator('[data-site-transmission]');
  await expect(surface).toHaveAttribute('data-transmission-state', 'running');
  const copy = (await page.locator('.hero-copy').boundingBox())!;
  await expect(surface).toHaveCSS('clip-path', 'none');
  await expect(page.locator('.television-nav')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect.poll(() => surface.locator('canvas').evaluate(element => {
    const canvas = element as HTMLCanvasElement;
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height)).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  })).toBe(true);
  await page.mouse.move(copy.x + copy.width / 2, copy.y + copy.height / 2);
  await expect(surface).toHaveAttribute('data-beam', 'active');
  await expect(page.locator('.hero .button-primary')).toBeVisible();
});
