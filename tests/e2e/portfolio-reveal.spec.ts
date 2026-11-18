import { expect, test } from '@playwright/test';

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
    const image = document.querySelector('[data-team-profile]:not([hidden]) img')!;
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
  const wheel = page.locator('#team-wheel');
  const next = page.locator('[data-team-next]');
  const selected = await wheel.getAttribute('data-selected');
  const setExit = async (exit: number) => {
    await page.evaluate(fraction => {
      const section = document.getElementById('trabajo')!;
      const start = section.getBoundingClientRect().top + scrollY;
      const distance = section.offsetHeight - innerHeight;
      const travel = innerWidth * 1.5;
      const end = start + distance;
      // Leave two CSS pixels before the end so integer scroll rounding cannot finish the exit.
      const top = fraction < 1 ? Math.min(end - 2, start + travel + (distance - travel) * fraction) : Math.ceil(end);
      scrollTo({ top, behavior: 'instant' });
    }, exit);
  };

  for (const exit of [.55, .999]) {
    await setExit(exit);
    await expect(about).toHaveAttribute('data-team-locked');
    expect(await page.locator('.featured-stage').evaluate(element => element.getBoundingClientRect().right)).toBeGreaterThan(0);
    const button = (await next.boundingBox())!;
    await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
    await wheel.evaluate(element => element.focus({ preventScroll: true }));
    await expect(wheel).not.toBeFocused();
    await expect(wheel).toHaveAttribute('data-selected', selected!);
    if (exit > .9) {
      const name = (await page.locator('[data-wheel-option]').first().boundingBox())!;
      await page.mouse.click(name.x + name.width / 2, name.y + name.height / 2);
      await expect(page).toHaveURL(/#trabajo$/);
      await expect(about).toHaveAttribute('data-team-locked');
    }
  }

  await setExit(.55);
  await expect(about).toHaveAttribute('data-team-locked');
  const box = (await wheel.boundingBox())!;
  await page.mouse.move(box.x + box.width - 12, box.y + box.height / 2);
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 30);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore);
  await expect(wheel).toHaveAttribute('data-selected', selected!);

  await setExit(1);
  await expect(about).not.toHaveAttribute('data-team-locked');
  await expect(page.locator('.featured-stage')).toHaveAttribute('inert');
  await next.click();
  await expect(wheel).toHaveAttribute('data-selected', '2');
  await setExit(.999);
  await expect(about).toHaveAttribute('data-team-locked');
  await wheel.evaluate(element => element.focus({ preventScroll: true }));
  await expect(wheel).not.toBeFocused();
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

for (const mode of ['mobile', 'reduced', 'no-js']) {
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
