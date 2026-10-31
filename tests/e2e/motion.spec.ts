import { expect, test } from '@playwright/test';

test('los textos esenciales permanecen visibles y sin animación', async ({ page }) => {
  await page.goto('/');
  const styles = await page.locator('h1, h2, .pillar h3, .concept-description h3, .method-step h4').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, visibility: style.visibility, animation: style.animationName };
  }));
  expect(styles.length).toBeGreaterThan(15);
  for (const style of styles) expect(style).toEqual({ opacity: '1', visibility: 'visible', animation: 'none' });
});

test('la perspectiva se explora con botones y teclado y respeta movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const study = page.locator('.perspective-study');
  const controls = study.getByRole('group', { name: 'Cambiar la perspectiva del recorrido' });
  const piece = controls.getByRole('button', { name: 'Una pieza', exact: true });
  const whole = controls.getByRole('button', { name: 'El sistema', exact: true });
  const caption = study.locator('[data-perspective-caption]');
  await expect(controls).toBeVisible();
  await expect(study).toHaveAttribute('data-view', 'piece');
  await expect(piece).toHaveAttribute('aria-pressed', 'true');
  await expect(whole).toHaveAttribute('aria-pressed', 'false');
  const pieceCaption = await caption.textContent();
  await whole.click();
  await expect(study).toHaveAttribute('data-view', 'whole');
  await expect(whole).toHaveAttribute('aria-pressed', 'true');
  await expect(piece).toHaveAttribute('aria-pressed', 'false');
  await expect(caption).not.toHaveText(pieceCaption ?? '');
  await expect(caption).toHaveAttribute('aria-live', 'polite');
  await piece.focus();
  await page.keyboard.press('Enter');
  await expect(study).toHaveAttribute('data-view', 'piece');
  await study.locator('[data-perspective-explore]').click();
  await expect(study).toHaveAttribute('data-view', 'whole');
  await study.locator('[data-perspective-explore]').click();
  await expect(study).toHaveAttribute('data-view', 'piece');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(study).toHaveAttribute('data-view', 'whole');
  await expect(whole).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => study.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  for (const step of await study.locator('.system-node strong').all()) await expect(step).toBeVisible();
});

test('con movimiento reducido la perspectiva comienza completa y el contenido queda disponible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const study = page.locator('.perspective-study');
  await expect(study).toHaveAttribute('data-view', 'whole');
  await expect(study.locator('[data-perspective-view="whole"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(study.locator('.system-node')).toHaveCount(7);
  await expect(study.locator('[data-perspective-caption]')).not.toBeEmpty();
  expect(await study.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('las preguntas funcionan con teclado y clics repetidos', async ({ page }) => {
  await page.goto('/#faq');
  const details = page.locator('#faq details').first();
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('p')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(details).not.toHaveAttribute('open', '');
});

test('el modo automático sigue cambios de apariencia del sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#060917');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(6, 9, 23)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#EEF2FF');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 242, 255)');
});
