import { expect, test } from '@playwright/test';
test('the shared footer uses page destinations and explicit direct channels', async ({ page }) => {
  await page.goto('/trabajos/');
  const footer = page.locator('footer');
  await expect(footer.locator('a[href="/contacto/"]')).toHaveCount(1);
  await expect(footer.locator('a[href="mailto:ceo@laplatamarketing.com"]')).toHaveCount(1);
  await expect(footer.locator('a[href="/nosotros/#como-trabajamos"]')).toHaveCount(1);
  await footer.locator('a[href="/nosotros/#como-trabajamos"]').click();
  await expect(page.locator('#como-trabajamos')).toBeInViewport();
  await expect(page.locator('[data-tv-navigation]')).toBeInViewport();
});
test('the floating contact clears the footer and the open menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/trabajos/');
  await expect(page.locator('[data-floating-whatsapp]')).toBeVisible();
  await page.locator('.menu-toggle').click();
  await expect(page.locator('[data-floating-whatsapp]')).toBeHidden();
  await page.keyboard.press('Escape');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-floating-whatsapp]')).toBeHidden();
});
