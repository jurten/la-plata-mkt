import { expect, test } from '@playwright/test';
async function openTeam(page: import('@playwright/test').Page) {
  await page.goto('/nosotros/#nosotros');
  await expect(page.locator('[data-team-hold]')).toHaveAttribute('data-hold-enabled', '');
  await page.locator('[data-team-list]').scrollIntoViewIfNeeded();
}
test('team index owns its hold and links to complete normal-flow profiles', async ({ page }) => {
  await openTeam(page);
  await expect(page.locator('[data-team-choice]')).toHaveCount(3);
  await expect(page.locator('.team-profile')).toHaveCount(3);
  expect(await page.locator('[data-team-hold]').evaluate(el => el.clientHeight)).toBeGreaterThan(3000);
  await page.locator('[data-team-choice]').first().click();
  await expect(page).toHaveURL(/#team-joaquin-laumann$/);
  await expect(page.locator('#team-joaquin-laumann')).toBeInViewport();
  await expect(page.locator('#team-joaquin-laumann img')).toBeVisible();
  await expect(page.locator('.featured-about')).toHaveCount(0);
});
test('hover and keyboard keep names, roles and fixed capsule portraits', async ({ page }) => {
  await openTeam(page);
  const choice = page.locator('[data-team-choice]').first();
  await choice.focus();
  await expect(page.locator('[data-team-row]').first()).toHaveAttribute('data-current', '');
  await expect(choice).not.toHaveAttribute('role', 'button');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-team-choice]').nth(1)).toBeFocused();
  const portrait = page.locator('[data-team-row]').nth(1).locator('.flowing-team__portrait').first();
  await expect(portrait).toHaveCSS('border-radius', '999px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#team-santiago-laumann$/);
  await expect(page.locator('#team-santiago-laumann')).toBeInViewport();
});
test('the ruler reverses with native scroll and reduced motion removes the hold', async ({ page }) => {
  await openTeam(page);
  const scrollTo = async (progress: number) => page.locator('[data-team-hold]').evaluate((el, progress) => {
    const section = el.querySelector('section') as HTMLElement;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (el.clientHeight - section.clientHeight) * progress, behavior: 'instant' });
  }, progress);
  await scrollTo(.7);
  await expect.poll(() => page.locator('#nosotros').evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--team-scroll-progress')))).toBeCloseTo(.7, 1);
  await scrollTo(.2);
  await expect.poll(() => page.locator('#nosotros').evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--team-scroll-progress')))).toBeCloseTo(.2, 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-team-hold]')).not.toHaveAttribute('data-hold-enabled');
  await expect(page.locator('.team-profile')).toHaveCount(3);
});
