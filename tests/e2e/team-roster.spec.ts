import { expect, test } from '@playwright/test';

test('el equipo presenta sus especialidades y actualiza el panel al recorrerlas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#nosotros');

  const roster = page.locator('[data-team-roster]');
  await expect(roster.getByRole('heading', { name: 'Un equipo. Muchas miradas.' })).toBeVisible();

  const automation = roster.locator('[data-team-item]', { hasText: 'Automatización' });
  await automation.evaluate((element) => element.scrollIntoView({ block: 'center' }));

  await expect(automation).toHaveAttribute('aria-current', 'true');
  await expect(roster.locator('[data-team-current-name]')).toHaveText('Automatización');
  await expect(roster.locator('[data-team-current-description]')).toContainText('reducir trabajo manual');
});

test('en teléfono cada especialidad conserva su explicación sin depender del scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#nosotros');

  const roster = page.locator('[data-team-roster]');
  await expect(roster.locator('.team-roster__active')).toBeHidden();
  await expect(roster.locator('[data-team-item] > p')).toHaveCount(6);
  await expect(roster.locator('[data-team-item] > p').first()).toBeVisible();
});
