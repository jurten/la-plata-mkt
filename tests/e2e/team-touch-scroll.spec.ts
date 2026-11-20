import { expect, test } from '@playwright/test';

for (const [width, height] of [[390, 844], [768, 1024], [1024, 768]]) {
  test(`el indicador activa las bandas por scroll en una pantalla táctil de ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
    const page = await context.newPage();
    await page.goto('/#nosotros');
    const roster = page.locator('[data-team-roster]');
    await expect(roster).toHaveAttribute('data-team-ready');
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator('#nosotros').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
    const range = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>('[data-portfolio-reveal]')!;
      const about = root.querySelector<HTMLElement>('.featured-about')!;
      const content = root.querySelector<HTMLElement>('.featured-about__content')!;
      const enhanced = root.hasAttribute('data-enhanced');
      const work = root.querySelector<HTMLElement>('.featured-work')!;
      const distance = parseFloat(root.style.getPropertyValue('--featured-distance')) || 0;
      const exit = parseFloat(root.style.getPropertyValue('--featured-exit-distance')) || 0;
      return {
        start: enhanced ? work.getBoundingClientRect().top + scrollY + distance : about.getBoundingClientRect().top + scrollY,
        length: about.offsetHeight - content.offsetHeight - (enhanced ? exit : 0),
      };
    });
    expect(range.length).toBeGreaterThan(height * 2);
    await expect(page.locator('.team-roster__scroll')).toBeVisible();
    for (const [progress, selected] of [[0,-1], [.1,0], [.5,1], [.9,2], [1,-1], [.5,1], [.1,0], [0,-1]]) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), Math.ceil(range.start + range.length * progress));
      await expect(roster).toHaveAttribute('data-team-selected', String(selected));
      if (selected === -1) {
        for (const track of await page.locator('[data-team-track]').all()) await expect(track).not.toHaveAttribute('style');
        await expect(page.locator('[data-team-row][data-current]')).toHaveCount(0);
      } else {
        const track = page.locator('[data-team-track]').nth(selected);
        await expect.poll(() => track.getAttribute('style')).toContain('translate3d');
        const initial = await track.getAttribute('style');
        await expect.poll(() => track.getAttribute('style')).not.toBe(initial);
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.team-roster__scroll')).toBeHidden();
    await context.close();
  });
}
