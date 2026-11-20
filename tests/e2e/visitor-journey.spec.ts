import { expect, test } from '@playwright/test';
test('a visitor can explore work and the team before opening contact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.primary-nav a[href="/trabajos/"]').click();
  await expect(page.locator('[data-work-item]')).toHaveCount(3);
  await page.locator('.primary-nav a[href="/nosotros/"]').click();
  await expect(page.locator('.team-profile')).toHaveCount(3);
  await page.locator('.primary-nav a[href="/contacto/"]').click();
  await expect(page.locator('[data-contact-form]')).toBeVisible();
  await expect(page.locator('.contact-intro a[href="https://wa.me/5491158861954"]').first()).toBeVisible();
});
