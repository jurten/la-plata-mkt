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
  await expect(page.locator('#nosotros h2')).toBeInViewport();
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
  await expect(page.locator('#nosotros h2')).toBeInViewport();
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
  await expect(page.locator('#nosotros h2')).toBeInViewport();
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
