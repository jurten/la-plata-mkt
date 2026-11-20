import { expect, test } from '@playwright/test';

for (const effect of ['coverflow']) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1180, height: 820 }]) {
    test(`touch ${effect} ${viewport.width}: swipe lateral y salida vertical libre`, async ({ browser, browserName }) => {
      test.skip(browserName !== 'chromium', 'Gestos sintetizados mediante CDP');
      const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      await page.goto(`/?portfolio=${effect}#trabajo`);
      const root = page.locator('[data-portfolio-reveal]');
      await expect(root).toHaveAttribute('data-touch-portfolio', '', { timeout: 15000 });
      await expect(root).not.toHaveAttribute('data-enhanced');
      await expect(page.locator('.featured-gallery')).toHaveClass(new RegExp(`swiper-${effect}`));
      await page.locator('.featured-gallery').scrollIntoViewIfNeeded();
      const cdp = await context.newCDPSession(page);
      const swipe = async (dx: number, dy: number) => {
        const box = (await page.locator('.featured-gallery').boundingBox())!;
        const x = box.x + box.width * .7;
        const y = Math.min(viewport.height - 80, Math.max(160, box.y + 150));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let i = 1; i <= 12; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 12, y: y + dy * i / 12 }] });
          await page.waitForTimeout(16);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      };
      await swipe(-(await page.locator('.featured-gallery').boundingBox())!.width * .65, 0);
      await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
      await expect(page.locator('#proyecto-juridico')).not.toHaveAttribute('inert');
      const before = await page.evaluate(() => scrollY);
      await swipe(0, -180);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 60);
      await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
      await page.evaluate(() => document.getElementById('nosotros')!.scrollIntoView({ behavior: 'instant' }));
      await expect(page.locator('#nosotros [data-team-roster]')).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await context.close();
    });
  }
}

test('Coverflow conserva teclado y se desmonta al pasar a desktop', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/#proyecto-juridico');
  const root = page.locator('[data-portfolio-reveal]');
  await expect(root).toHaveAttribute('data-touch-portfolio', '', { timeout: 15000 });
  await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
  await expect(page.locator('.featured-gallery')).toHaveClass(/swiper-coverflow/);
  await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
  await page.locator('.featured-gallery').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#proyecto-sistema')).toHaveClass(/swiper-slide-active/);
  await expect(page.locator('.featured-touch-controls')).toHaveCount(0);
  await expect(page.locator('.featured-closing')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.featured-gallery')).not.toHaveClass(/swiper-coverflow/);
  await expect(page.locator('#proyecto-sistema')).toHaveClass(/swiper-slide-active/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(root).toHaveAttribute('data-enhanced', 'true');
  await expect(root).not.toHaveAttribute('data-touch-portfolio');
  await expect(page.locator('.featured-gallery')).not.toHaveClass(/swiper/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-touch-portfolio');
  await expect(root).not.toHaveAttribute('data-enhanced');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('el recorrido horizontal termina revelando Nosotros y se puede invertir', async ({ page }) => {
  await page.goto('/#trabajo');
  const root = page.locator('[data-portfolio-reveal]');
  await expect(root).toHaveAttribute('data-enhanced', 'true');
  const bounds = await page.locator('#trabajo').evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, distance: (el as HTMLElement).offsetHeight - innerHeight }));
  const scroll = async (progress: number) => {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), bounds.top + bounds.distance * progress);
    await page.waitForTimeout(150);
  };
  await scroll(0);
  await expect(page.locator('#experience-title')).toBeInViewport();
  await scroll(.5);
  await expect(page.locator('#proyecto-juridico')).toBeInViewport();
  await scroll(1);
  await expect(page.locator('.featured-stage')).toHaveAttribute('inert', '');
  await expect(page.locator('#nosotros [data-team-roster]')).toBeInViewport();
  await expect(page.locator('#nosotros')).toHaveCSS('pointer-events', 'auto');
  await scroll(0);
  await expect(page.locator('.featured-stage')).not.toHaveAttribute('inert');
  await expect(page.locator('#experience-title')).toBeInViewport();
  await expect(page.locator('[data-featured-project]')).toHaveCount(3);
});

test('los enlaces internos llegan a los ejemplos y al equipo', async ({ page }) => {
  await page.goto('/#trabajo');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  await page.getByRole('link', { name: 'Explorá los ejemplos' }).click();
  await expect(page.locator('#proyecto-inmobiliario h3')).toBeInViewport();
  await page.locator('.primary-nav a[href="#nosotros"]').click();
  await expect(page.locator('#nosotros [data-team-roster]')).toBeInViewport();
});

test('Nosotros permanece inmóvil mientras el portfolio se retira', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 966 });
  await page.goto('/#trabajo');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  await page.evaluate(() => {
    const section = document.getElementById('trabajo')!;
    const start = section.getBoundingClientRect().top + scrollY;
    scrollTo({ top: start + innerWidth * 1.5 + document.documentElement.clientHeight * .85 * .25, behavior: 'instant' });
  });
  await expect(page.locator('.featured-about')).toHaveAttribute('data-team-locked');
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const image = document.querySelector('[data-team-list]')!;
    const samples: number[] = [];
    const record = () => samples.push(image.getBoundingClientRect().top);
    window.addEventListener('scroll', record, { passive: true });
    record();
    Object.assign(window, { portfolioMotionSamples: samples, stopPortfolioMotion: () => window.removeEventListener('scroll', record) });
  });
  await page.mouse.move(100, 450);
  for (let index = 0; index < 4; index++) {
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(120);
  }
  const samples = await page.evaluate(() => {
    const state = window as unknown as { portfolioMotionSamples: number[]; stopPortfolioMotion: () => void };
    state.stopPortfolioMotion();
    return state.portfolioMotionSamples;
  });
  expect(samples.length).toBeGreaterThan(2);
  expect(Math.max(...samples) - Math.min(...samples)).toBeLessThan(1);
  await expect(page.locator('.featured-about')).toHaveAttribute('data-team-locked');
});

test('Nosotros se habilita solo cuando la sección anterior desaparece por completo', async ({ page }) => {
  await page.goto('/#trabajo');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  const about = page.locator('.featured-about');
  const choices = page.locator('[data-team-choice]');
  const setExit = async (exit: number) => {
    await page.evaluate(fraction => {
      const section = document.getElementById('trabajo')!;
      const start = section.getBoundingClientRect().top + scrollY;
      const distance = section.offsetHeight - innerHeight;
      const travel = innerWidth * 1.5;
      const end = start + distance;
      scrollTo({ top: fraction < 1 ? Math.min(end - 2, start + travel + (distance - travel) * fraction) : Math.ceil(end), behavior: 'instant' });
    }, exit);
  };
  for (const exit of [.55, .999]) {
    await setExit(exit);
    await expect(about).toHaveAttribute('data-team-locked');
    await expect(choices.last()).toHaveAttribute('aria-disabled', 'true');
    await choices.last().dispatchEvent('click');
    await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-selected', '-1');
    await choices.last().evaluate(element => element.focus({ preventScroll: true }));
    await expect(choices.last()).not.toBeFocused();
    await expect(page).toHaveURL(/#trabajo$/);
  }
  await setExit(1);
  await expect(about).not.toHaveAttribute('data-team-locked');
  await expect(page.locator('.featured-stage')).toHaveAttribute('inert');
  await choices.last().click();
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-selected', '2');
  await expect(page).toHaveURL(/#trabajo$/);
  await setExit(.999);
  await expect(about).toHaveAttribute('data-team-locked');
  await expect(choices.last()).toHaveAttribute('aria-disabled', 'true');
});

test('el enlace conserva el hover y el clic durante la salida del panel', async ({ page }) => {
  await page.goto('/#trabajo');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  await page.evaluate(() => {
    const section = document.getElementById('trabajo')!;
    const start = section.getBoundingClientRect().top + scrollY;
    scrollTo({ top: start + innerWidth * 1.5 + document.documentElement.clientHeight * .85 * .55, behavior: 'instant' });
  });
  const link = page.getByRole('link', { name: 'Conocé al equipo' });
  await expect(page.locator('.featured-closing')).not.toHaveAttribute('inert');
  const box = await link.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(link.locator('.featured-link-arrow--left')).toHaveCSS('opacity', '1');
  await expect(link.locator('.featured-link-arrow--right')).toHaveCSS('opacity', '0');
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(page).toHaveURL(/#nosotros$/);
  await expect(page.locator('#nosotros [data-team-roster]')).toBeInViewport();
});

for (const mode of ['reduced', 'no-js']) {
  test(`el contenido completo permanece disponible: ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
      javaScriptEnabled: mode !== 'no-js',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/#trabajo');
    await expect(page.locator('[data-portfolio-reveal]')).not.toHaveAttribute('data-enhanced');
    await expect(page.locator('[data-featured-project]')).toHaveCount(3);
    for (const card of await page.locator('[data-featured-project]').all()) {
      await card.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect(card.locator('h3')).toBeInViewport();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}
