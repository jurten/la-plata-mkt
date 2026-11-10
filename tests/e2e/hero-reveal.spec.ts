import { expect, test, type Page } from '@playwright/test';

async function scrollReveal(page: Page, progress: number) {
  await page.evaluate(progress => {
    const root = document.querySelector<HTMLElement>('[data-hero-reveal]')!;
    const start = Number(root.dataset.revealStart), end = Number(root.dataset.revealEnd);
    window.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' });
  }, progress);
  await expect.poll(() => page.locator('[data-hero-reveal]').getAttribute('data-reveal-progress').then(Number)).toBeCloseTo(progress, 2);
}

async function visibleWindowBottom(page: Page) {
  return page.locator('[data-hero-visual]').evaluate(element => {
    // The element's rectangle includes corners outside the mask. Let the
    // browser measure a transparent copy of the actual curved SVG contour.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none';
    const path = document.querySelector('[data-hero-silhouette]')!.cloneNode(true) as SVGPathElement;
    path.removeAttribute('data-hero-silhouette');
    svg.append(path);
    element.append(svg);
    const bottom = path.getBoundingClientRect().bottom;
    svg.remove();
    return bottom;
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('https://js.hs-scripts.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`el semiovalo revela servicios y reconstruye la hero al volver, ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#inicio');
    const root = page.locator('[data-hero-reveal]');
    const hero = page.locator('#inicio');
    const services = page.locator('#soluciones');
    await expect(root).toHaveAttribute('data-reveal-enabled', '');
    await page.evaluate(() => document.fonts.ready);
    expect((await hero.boundingBox())!.y).toBeCloseTo(0, 0);
    const naturalHeight = await hero.evaluate(element => (element as HTMLElement).offsetHeight);
    const start = Number(await root.getAttribute('data-reveal-start'));
    expect(start).toBeCloseTo(Math.max(0, naturalHeight - viewport.height), 0);
    if (start > 1) {
      await page.evaluate(start => window.scrollTo({ top: start - 1, behavior: 'instant' }), start);
      await expect(root).toHaveAttribute('data-reveal-state', 'idle');
    }
    await scrollReveal(page, .38);
    await expect(root).toHaveAttribute('data-reveal-state', 'moving');
    expect((await hero.boundingBox())!.width).toBeLessThan(viewport.width * .9);
    const title = page.locator('#pillars-title');
    expect((await title.boundingBox())!.y).toBeGreaterThan(await visibleWindowBottom(page));
    await expect(page.locator('[data-hero-visual]')).toHaveCSS('clip-path', /url\(/);
    await expect(hero).toHaveAttribute('inert', '');
    await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-transmission-state', 'suspended');
    const tick = await page.locator('[data-site-transmission]').getAttribute('data-signal-tick');
    await page.waitForTimeout(160);
    expect(await page.locator('[data-site-transmission]').getAttribute('data-signal-tick')).toBe(tick);
    await page.mouse.move(viewport.width * .9, viewport.height * .9);
    for (const progress of [.6, .83, .95, .98]) {
      await scrollReveal(page, progress);
      await page.waitForTimeout(650);
      expect((await title.boundingBox())!.y).toBeGreaterThan(await visibleWindowBottom(page));
    }
    await scrollReveal(page, 1);
    await expect(page.locator('[data-hero-visual]')).toBeHidden();
    await expect(services).not.toHaveAttribute('inert', '');
    expect((await services.boundingBox())!.y).toBeLessThan(viewport.height * .25);
    await expect(title).toBeInViewport();
    expect((await title.boundingBox())!.y).toBeLessThan(viewport.height * .35);
    await services.locator('summary').first().click();
    await expect(services.locator('details').first()).toHaveAttribute('open', '');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(root).toHaveAttribute('data-reveal-state', 'idle');
    await expect(hero).not.toHaveAttribute('inert', '');
    await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-site-transmission]')).toHaveAttribute('data-transmission-state', 'running');
    expect((await hero.boundingBox())!.width).toBe(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  });
}

test('los enlaces, el hash directo y el historial aterrizan en servicios', async ({ page }) => {
  await page.goto('/#inicio');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-enabled', '');
  await page.locator('.hero-copy a[href="#soluciones"]').click();
  await expect(page).toHaveURL(/#soluciones$/);
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'complete');
  await expect(page.locator('#pillars-title')).toBeInViewport();
  await expect(page.locator('#soluciones')).not.toHaveAttribute('inert', '');
  await page.goBack();
  await expect(page).toHaveURL(/#inicio$/);
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'idle');
  await page.goto('/#soluciones');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'complete');
  await expect(page.locator('#pillars-title')).toBeInViewport();
});

test('la ventana acompaña al cursor sin cambiar el progreso ni invadir los servicios', async ({ page }) => {
  await page.goto('/#inicio');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-enabled', '');
  await scrollReveal(page, .38);
  const offset = () => page.locator('[data-hero-window]').evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.m41, y: matrix.m42, pitch: matrix.m23, yaw: matrix.m13 };
  });
  const sceneTransform = await page.locator('[data-hero-visual]').evaluate(element => getComputedStyle(element).transform);
  await page.mouse.move(1296, 800);
  await expect.poll(async () => (await offset()).x).toBeGreaterThan(20);
  await expect.poll(async () => (await offset()).y).toBeGreaterThan(10);
  await expect.poll(async () => Math.abs((await offset()).pitch)).toBeGreaterThan(.05);
  await expect.poll(async () => Math.abs((await offset()).yaw)).toBeGreaterThan(.05);
  const rightTilt = await offset();
  const mediaOffset = await page.locator('[data-hero-parallax]').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41);
  expect(mediaOffset).toBeLessThan(-8);
  await page.mouse.move(144, 200);
  await expect.poll(async () => (await offset()).x).toBeLessThan(-20);
  await expect.poll(async () => (await offset()).y).toBeLessThan(-10);
  await expect.poll(async () => (await offset()).pitch * rightTilt.pitch).toBeLessThan(0);
  await expect.poll(async () => (await offset()).yaw * rightTilt.yaw).toBeLessThan(0);
  expect(await page.locator('[data-hero-visual]').evaluate(element => getComputedStyle(element).transform)).toBe(sceneTransform);
  expect(Number(await page.locator('[data-hero-reveal]').getAttribute('data-reveal-progress'))).toBeCloseTo(.38, 2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  const portal = await page.locator('[data-hero-visual]').boundingBox();
  const title = await page.locator('#pillars-title').boundingBox();
  expect(title!.y).toBeGreaterThan(portal!.y + portal!.height);
  await page.evaluate(() => document.documentElement.dispatchEvent(new PointerEvent('pointerleave')));
  await expect.poll(async () => Math.abs((await offset()).x)).toBeLessThan(.1);
  await expect.poll(async () => Math.abs((await offset()).y)).toBeLessThan(.1);
  await expect.poll(async () => Math.abs((await offset()).pitch)).toBeLessThan(.001);
  await expect.poll(async () => Math.abs((await offset()).yaw)).toBeLessThan(.001);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-hero-window]')).toHaveCSS('transform', 'none');
});

test('el desplazamiento del cursor no se activa con un puntero táctil', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/#inicio');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-enabled', '');
  await scrollReveal(page, .38);
  await page.mouse.move(350, 650);
  await expect(page.locator('[data-hero-window]')).toHaveCSS('transform', 'none');
  await context.close();
});

test('el movimiento reducido restaura el flujo sin espacio de transición', async ({ page }) => {
  await page.goto('/#inicio');
  const root = page.locator('[data-hero-reveal]');
  await expect(root).toHaveAttribute('data-reveal-enabled', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-reveal-enabled', '');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-reveal-enabled', '');
  await scrollReveal(page, .6);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-reveal-enabled', '');
  await expect(page.locator('#soluciones')).not.toHaveAttribute('inert', '');
  await expect(page.locator('.hero-reveal-services > section')).toHaveCSS('position', 'static');
  const gap = await page.evaluate(() => document.querySelector('#soluciones')!.getBoundingClientRect().top - document.querySelector('#inicio')!.getBoundingClientRect().bottom);
  expect(gap).toBeCloseTo(0, 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-reveal-state', 'complete');
  await expect(page.locator('#pillars-title')).toBeInViewport();
});

test('Tab sale de una hero en contracción a un control visible', async ({ page }) => {
  await page.goto('/#inicio');
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-enabled', '');
  await page.locator('.hero-copy a').first().focus();
  await expect(page.locator('.hero-copy a').first()).toBeFocused();
  await scrollReveal(page, .5);
  await expect(page.locator('.hero-copy a').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#soluciones summary').first()).toBeFocused();
  await expect(page.locator('[data-hero-reveal]')).toHaveAttribute('data-reveal-state', 'complete');
});

test('sin JavaScript la hero y los servicios permanecen en flujo', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-hero-reveal]')).not.toHaveAttribute('data-reveal-enabled', '');
  await expect(page.locator('#soluciones')).not.toHaveAttribute('inert', '');
  await page.locator('#soluciones').scrollIntoViewIfNeeded();
  await page.locator('#soluciones summary').first().click();
  await expect(page.locator('#soluciones details').first()).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await context.close();
});
