import { expect, test } from '@playwright/test';
for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1180, height: 820 }]) {
  test(`Coverflow preserves horizontal exploration and native vertical scrolling at ${viewport.width}px`, async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP touch synthesis');
    const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('/trabajos/');
    const gallery = page.locator('.featured-gallery');
    await expect(gallery).toHaveClass(/swiper-coverflow/);
    await gallery.scrollIntoViewIfNeeded();
    const cdp = await context.newCDPSession(page);
    const swipe = async (dx: number, dy: number) => {
      const box = (await gallery.boundingBox())!;
      const x = box.x + box.width * .7, y = Math.min(viewport.height - 80, Math.max(160, box.y + 150));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 12, y: y + dy * i / 12 }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await swipe(-(await gallery.boundingBox())!.width * .65, 0);
    await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
    await expect(page.locator('#proyecto-juridico')).not.toHaveAttribute('inert');
    const before = await page.evaluate(() => scrollY);
    await swipe(0, -180);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 60);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}
test('keyboard, project fragments, responsive teardown and reduced motion work independently', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/trabajos/#proyecto-juridico');
  await expect(page.locator('#proyecto-juridico')).toHaveClass(/swiper-slide-active/);
  await page.locator('.featured-gallery').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#proyecto-sistema')).toHaveClass(/swiper-slide-active/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.featured-gallery')).not.toHaveClass(/swiper-coverflow/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('[data-portfolio-reveal]')).not.toHaveAttribute('data-touch-portfolio');
  await expect(page.locator('.project-card[inert]')).toHaveCount(0);
  await expect(page.locator('[data-team-roster]')).toHaveCount(0);
});
test('desktop and no-JavaScript layouts show the complete standalone gallery', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto('/trabajos/');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await expect(page.locator('.project-card').last()).toBeVisible();
  await expect(page.locator('.featured-about')).toHaveCount(0);
  await context.close();
});
