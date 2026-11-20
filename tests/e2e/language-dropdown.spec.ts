import { expect, test } from '@playwright/test';
test('abre, cierra y selecciona idioma con animaciones', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Cambiar idioma' });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.language-dropdown')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.language-dropdown')).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.screenshot({ path: 'artifacts/language/dropdown-desktop.png' });
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en/');
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole('button', { name: 'Change language' }).click();
  await expect(page.getByRole('link', { name: 'Español', exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/language/dropdown-mobile.png' });
});
