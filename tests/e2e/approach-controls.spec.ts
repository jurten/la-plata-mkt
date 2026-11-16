import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`el enfoque integra servicios y sus controles animan sin cambiar de canal a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#soluciones');
    const root = page.locator('[data-approach]');
    await expect(root).toHaveAttribute('data-approach-enabled', '');
    await expect(root.locator('.approach-head, .approach-details')).toHaveCount(0);
    await expect(root.locator('.approach-service-list')).toHaveCount(3);
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('[data-approach]')!;
      window.scrollTo({ top: Number(el.dataset.approachStart), behavior: 'instant' });
    });
    await root.locator('[data-approach-step]').nth(1).click();
    await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeGreaterThan(.15);
    await expect(page.locator('[data-tv-transition]')).toBeHidden();
    await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(.55, 2);
    await expect(page.locator('#enfoque-tecnologia')).not.toHaveAttribute('inert');
    await expect(page.locator('#enfoque-tecnologia .approach-service-list')).toBeInViewport();
    await root.locator('[data-approach-step]').nth(2).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => root.getAttribute('data-approach-progress').then(Number)).toBeCloseTo(.95, 2);
    await expect(page.locator('[data-tv-transition]')).toBeHidden();
    await expect(page.locator('#enfoque-metodo .inline-link')).toBeInViewport();
    const nav = (await root.locator('.approach-nav').boundingBox())!;
    const copy = (await page.locator('#enfoque-metodo .approach-copy').boundingBox())!;
    expect(copy.y + copy.height).toBeLessThan(nav.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root).not.toHaveAttribute('data-approach-enabled');
    for (const panel of await root.locator('[data-approach-panel]').all()) await expect(panel).not.toHaveAttribute('inert');
  });
}
