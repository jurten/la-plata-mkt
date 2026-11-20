import { expect, test } from '@playwright/test';

for (const width of [390, 820, 1440]) {
  test(`work gallery uses native vertical flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/trabajos/');
    await expect(page.locator('[data-work-item]')).toHaveCount(3);
    await expect(page.locator('[data-work-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('.work-index-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(width < 701 ? 1 : width <= 1050 ? 2 : 3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const image of await page.locator('img[data-work-media]').all()) expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  });
}

test('service filters expose relevant projects and support keyboard reset', async ({ page }) => {
  await page.goto('/trabajos/');
  const web = page.locator('[data-work-filter="web"]');
  await web.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-work-item]:visible')).toHaveCount(1);
  await expect(page.locator('#proyecto-juridico')).toBeVisible();
  await expect(page.locator('[data-work-status]')).toHaveText('1 trabajos');
  await expect(web).toBeFocused();
  await page.locator('[data-work-filter="systems"]').click();
  await expect(page.locator('[data-work-item]:visible')).toHaveCount(2);
  await page.locator('[data-work-filter="all"]').click();
  await expect(page.locator('[data-work-item]:visible')).toHaveCount(3);
});

test('project opens a full case, retains its language and returns to its source', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/trabajos/');
  await page.locator('#proyecto-juridico [data-work-link]').click();
  await expect(page).toHaveURL('/trabajos/proyecto-juridico/');
  await expect(page.locator('h1')).toHaveText('Credibilidad que convierte');
  await page.locator('.work-chapters a[href="#problema"]').click();
  await expect(page.locator('#problema')).toBeInViewport();
  await expect(page.locator('.work-case')).toContainText('sin representar un encargo ni resultados de un cliente');
  await expect(page.locator('#enlaces')).toHaveCount(0);
  await expect(page.locator('[data-language-switcher] a[lang="en"]')).toHaveAttribute('href', /\/en\/work\/proyecto-juridico\//);
  await page.locator('[data-work-back]').first().click();
  await expect(page).toHaveURL('/trabajos/#proyecto-juridico');
  await expect(page.locator('#proyecto-juridico')).toBeInViewport();
  await page.goto('/en/work/proyecto-inmobiliario/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#problema h2')).toHaveText('The challenge');
  await expect(page.locator('.work-case-cover img')).toHaveAttribute('src', /real-estate.en.png$/);
  expect(errors).toEqual([]);
});

test('native project zoom is enabled on supporting browsers', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Cross-document View Transitions support');
  await page.addInitScript(() => window.addEventListener('pageswap', event => {
    sessionStorage.setItem('test-work-transition', String(Boolean((event as Event & { viewTransition?: unknown }).viewTransition)));
  }));
  await page.goto('/trabajos/');
  await page.locator('[data-work-link]').first().click();
  await expect(page).toHaveURL('/trabajos/proyecto-inmobiliario/');
  expect(await page.evaluate(() => sessionStorage.getItem('test-work-transition'))).toBe('true');
});

test('curve enhancement restores original media with reduced motion and context loss', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'WebGL support differs in headless Firefox');
  await page.goto('/trabajos/');
  await expect(page.locator('[data-work-curved]')).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.work-curve-canvas')).toHaveCount(0);
  await expect(page.locator('[data-work-curved]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-work-curved]')).toHaveCount(3);
  await page.locator('.work-curve-canvas').dispatchEvent('webglcontextlost');
  await expect(page.locator('[data-work-curved]')).toHaveCount(0);
  await expect(page.locator('.work-curve-canvas')).toHaveCount(0);
});

test('no-JavaScript visitors can read the gallery and open complete cases', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/trabajos/');
  await expect(page.locator('.work-filters')).toBeHidden();
  await expect(page.locator('[data-work-item]')).toHaveCount(3);
  await page.locator('[data-work-link]').last().click();
  await expect(page.locator('h1')).toHaveText('Cada consulta, un próximo paso');
  await expect(page.locator('#alcance')).toContainText('Integración de canales');
  await expect(page.locator('[data-work-curved]')).toHaveCount(0);
  await context.close();
});

test('homepage retains its original portfolio and team behavior', async ({ page }) => {
  await page.goto('/#nosotros');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  await expect(page.locator('#nosotros')).toBeInViewport();
  const content = page.locator('.featured-about__content');
  const scrollTo = async (progress: number) => page.locator('.featured-about').evaluate((el, progress) => {
    const child = el.firstElementChild as HTMLElement;
    const root = el.closest('[data-portfolio-reveal]') as HTMLElement;
    const exit = parseFloat(root.style.getPropertyValue('--featured-exit-distance'));
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + exit + (el.clientHeight - child.clientHeight - exit) * progress, behavior: 'instant' });
  }, progress);
  await scrollTo(.7);
  await expect.poll(() => content.evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--team-scroll-progress')))).toBeCloseTo(.7, 1);
  await scrollTo(.2);
  await expect.poll(() => content.evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--team-scroll-progress')))).toBeCloseTo(.2, 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-portfolio-reveal]')).not.toHaveAttribute('data-enhanced');
});
