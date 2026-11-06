import { expect, test, type Page } from '@playwright/test';

const idle = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('data-tv-transition-state', 'idle');
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
};

test('los canales conservan los enlaces de escritorio y muestran la sección actual', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const header = page.locator('.topbar[data-tv-navigation]');
  await expect(header).toBeVisible();
  await expect(header.locator('[data-current-channel]')).toHaveText('CH 01');
  const contact = header.locator('.primary-nav a[href="#contacto"]');
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAccessibleName('Contacto');
  await contact.click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(header.locator('[data-current-channel]')).toHaveText('CH 05');
  await idle(page);
});

test('el selector móvil gestiona el foco y restaura la página al cerrarse', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const menu = page.locator('.menu-toggle');
  const panel = page.locator('[data-station-menu]');
  const main = page.locator('main');
  const focusIsInNavigation = () => page.evaluate(() => Boolean(document.activeElement?.closest('[data-tv-navigation], [data-station-menu]')));
  await expect(panel).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(main).toHaveAttribute('inert', '');
  await expect(panel.locator('[data-station-link]')).toHaveCount(5);
  await expect.poll(focusIsInNavigation).toBe(true);
  for (let index = 0; index < 9; index++) {
    await page.keyboard.press('Tab');
    await expect.poll(focusIsInNavigation).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await expect(main).not.toHaveAttribute('inert', '');

  await menu.click();
  await panel.locator('[data-station-link][href="#soluciones"]').click();
  await expect(page).toHaveURL(/#soluciones$/);
  await expect(page.locator('#soluciones')).toBeInViewport();
  await expect(panel).toBeHidden();
  await expect(main).not.toHaveAttribute('inert', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('cambiar de canal y repetir el encendido siempre terminan con la pantalla disponible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await idle(page);
  const transition = page.locator('[data-tv-transition]');
  await expect(transition).toHaveAttribute('aria-hidden', 'true');
  await expect(transition).toHaveCSS('pointer-events', 'none');
  await page.locator('.primary-nav a[href="#trabajo"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-tv-transition-state', 'channel');
  await expect(page).toHaveURL(/#trabajo$/);
  await idle(page);
  await expect(page.locator('#trabajo')).toBeInViewport();

  await page.locator('.menu-toggle').click();
  await page.locator('[data-station-menu] [data-power-replay]').click();
  await expect(page.locator('html')).toHaveAttribute('data-tv-transition-state', 'power');
  await idle(page);
  await expect(page.locator('[data-station-menu]')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.locator('#trabajo')).toBeInViewport();
});

test('el encendido deja de cubrir la página si el modelo tarda demasiado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let releaseModel!: () => void;
  const heldModel = new Promise<void>(resolve => { releaseModel = resolve; });
  await page.route('**/models/supplied-alien-head.glb', async route => {
    await heldModel;
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-tv-transition-state', 'power');
  await expect(page.locator('[data-tv-transition]')).toBeVisible();
  await expect(page.locator('[data-tv-osd-label]')).toHaveText(/CARGANDO \d+%/);
  await expect(page.locator('html')).toHaveAttribute('data-tv-transition-state', 'idle', { timeout: 2600 });
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
  releaseModel();
  await expect(page.locator('[data-spatial-portrait]')).toHaveAttribute('data-spatial-state', 'ready', { timeout: 15_000 });
});

test('la última selección gana al cambiar de canal rápidamente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await idle(page);
  for (const hash of ['#soluciones', '#trabajo', '#contacto']) {
    await page.locator(`.primary-nav a[href="${hash}"]`).click();
  }
  await expect(page).toHaveURL(/#contacto$/);
  await idle(page);
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(page.locator('.topbar [data-current-channel]')).toHaveText('CH 05');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

for (const preference of ['reduced', 'paused'] as const) {
  test(`la navegación omite los efectos con movimiento ${preference === 'reduced' ? 'reducido' : 'pausado'}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference === 'reduced' ? 'reduce' : 'no-preference' });
    await page.goto('/');
    await idle(page);
    if (preference === 'paused') {
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: true })));
    }
    // Read the state in the same task as the click: polling idle alone could
    // miss an unwanted short animation.
    const state = await page.locator('.primary-nav a[href="#contacto"]').evaluate(element => {
      (element as HTMLAnchorElement).click();
      return document.documentElement.dataset.tvTransitionState;
    });
    expect(state).toBe('idle');
    await expect(page).toHaveURL(/#contacto$/);
    await expect(page.locator('#contacto')).toBeInViewport();
    await page.locator('.menu-toggle').click();
    const replayState = await page.locator('[data-station-menu] [data-power-replay]').evaluate(element => {
      (element as HTMLButtonElement).click();
      return document.documentElement.dataset.tvTransitionState;
    });
    expect(replayState).toBe('idle');
    await idle(page);
  });
}

test('los enlaces directos y el historial mantienen el canal correspondiente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nosotros');
  await idle(page);
  await expect(page.locator('#nosotros')).toBeInViewport();
  await expect(page.locator('.topbar [data-current-channel]')).toHaveText('CH 04');
  await page.locator('.primary-nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('.topbar [data-current-channel]')).toHaveText('CH 05');
  await page.goBack();
  await expect(page).toHaveURL(/#nosotros$/);
  await expect(page.locator('#nosotros')).toBeInViewport();
  await expect(page.locator('.topbar [data-current-channel]')).toHaveText('CH 04');
  await idle(page);
});

test('volver en el historial cancela un cambio de canal pendiente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#inicio');
  await page.locator('.primary-nav a[href="#soluciones"]').click();
  await expect(page).toHaveURL(/#soluciones$/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Start tuning and go back in one browser task, before the delayed
  // destination can run. The old callback must never overwrite history.
  const startedState = await page.locator('.primary-nav a[href="#contacto"]').evaluate(element => {
    (element as HTMLAnchorElement).click();
    const state = document.documentElement.dataset.tvTransitionState;
    history.back();
    return state;
  });
  expect(startedState).toBe('channel');
  await expect(page).toHaveURL(/#inicio$/);
  await idle(page);
  // Cover the cancelled transition's entire lifetime to catch stale timers.
  await page.waitForTimeout(550);
  await expect(page).toHaveURL(/#inicio$/);
  await expect(page.locator('#inicio')).toBeInViewport();
  await expect(page.locator('.topbar [data-current-channel]')).toHaveText('CH 01');
  await idle(page);
});

test('sin JavaScript los enlaces móviles y el contenido siguen disponibles', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-tv-transition]')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  const contact = page.locator('.primary-nav a[href="#contacto"]');
  await expect(contact).toBeVisible();
  await contact.click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contacto')).toBeInViewport();
  await context.close();
});
