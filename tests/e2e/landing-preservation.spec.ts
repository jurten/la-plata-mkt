import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
  test(`${route} preserves the complete original landing alongside the new URLs`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await expect(page.locator('.hero-scroll-cue')).toHaveAttribute('href', '#soluciones');
    await expect(page.locator('#soluciones #como-trabajamos')).toHaveCount(1);
    await expect(page.locator('[data-approach-playback-toggle]')).toHaveCount(1);
    await expect(page.locator('.featured-work [data-featured-project]')).toHaveCount(3);
    await expect(page.locator('[data-work-list], .work-curve-canvas')).toHaveCount(0);
    await expect(page.locator('.featured-about #nosotros [data-team-roster]')).toHaveCount(1);
    await expect(page.locator('.home-work,.home-team,.conversation-cta')).toHaveCount(0);
    await expect(page.locator('.primary-nav a')).toHaveCount(3);
    const work = route === '/' ? '/trabajos/' : '/en/work/';
    await expect(page.locator('.primary-nav a[data-channel-id="trabajo"]')).toHaveAttribute('href', work);
    await page.locator('.primary-nav a[data-channel-id="trabajo"]').click();
    await expect(page).toHaveURL(work);
    await expect(page.locator('.work-showcase--standalone [data-work-item]')).toHaveCount(3);
    expect(errors).toEqual([]);
  });
}

test('the original mobile menu keeps its television preview and opens the new URLs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('[data-station-menu]')).toBeVisible();
  await expect(page.locator('.station-preview')).toHaveCount(1);
  await page.locator('[data-station-link][data-channel-id="contacto"]').click();
  await expect(page).toHaveURL('/contacto/');
  await expect(page.locator('[data-contact-form]')).toBeVisible();
});
