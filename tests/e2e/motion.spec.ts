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

test('la navegación del footer permite llegar a la información clave con teclado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contacto');
  await page.locator('footer').getByRole('link', { name: 'Cómo trabajamos' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#working-title')).toBeInViewport();
  await expect(page.locator('#working-title')).toBeFocused();
});

test('el modo automático sigue cambios de apariencia del sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#11151C');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 21, 28)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#EEF2FF');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 242, 255)');
});
