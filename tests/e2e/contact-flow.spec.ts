import { expect, test } from '@playwright/test';
test('direct contact keeps the configured number and never writes a message for the visitor', async ({ page }) => {
  await page.goto('/contacto/');
  for (const link of await page.locator('a[href^="https://wa.me/"]').all()) await expect(link).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(page.locator('.contact-address')).toHaveAttribute('href', 'mailto:ceo@laplatamarketing.com');
  await expect(page.locator('[name="company"]')).not.toHaveAttribute('required');
  await expect(page.locator('[name="phone"]')).not.toHaveAttribute('required');
});
test('privacy returns to the localized contact page', async ({ page }) => {
  await page.goto('/en/privacy/');
  await page.locator('main a[href="/en/contact/"]').click();
  await expect(page).toHaveURL('/en/contact/');
  await expect(page.locator('[data-contact-form]')).toBeVisible();
});
