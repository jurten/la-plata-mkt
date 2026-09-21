import { expect, test, type Locator } from '@playwright/test';

test('la nueva identidad ignora antiguas URLs de paleta y conserva el modo automático', async ({ page }) => {
  await page.goto('/?palettes=1&palette=manchette');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('[data-palette-lab], [data-palette-option], [data-palette-toggle]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EFE5');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('a[href="/privacidad/"]')).toHaveCount(2);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--blue').trim())).toBe(
    '#1536f1',
  );

  await page.goto('/privacidad?palettes=1&palette=sobreimpresion');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto');
  await expect(page.locator('[data-palette-lab], [data-palette-option], [data-palette-toggle]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EFE5');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('.legal-header .brand')).toHaveAttribute('href', '/');
  await expect(page.locator('.legal-back')).toHaveAttribute('href', '/#contacto');
  await expect(page.locator('script[src="/scripts/site.js"]')).toHaveCount(1);
});

test('la nueva identidad conserva foco visible en navegación, tema y formulario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Modo claro' }).click();
  await page.reload();

  const assertKeyboardFocus = async (locator: Locator) => {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await locator.evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press('Tab');
    }
    await expect(locator).toBeFocused();
    const focus = await locator.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        color: styles.outlineColor,
        offset: styles.outlineOffset,
        style: styles.outlineStyle,
        width: styles.outlineWidth,
      };
    });
    expect(focus).toEqual({ color: 'rgb(17, 19, 24)', offset: '3px', style: 'solid', width: '3px' });
  };

  await assertKeyboardFocus(page.getByRole('link', { name: 'Soluciones' }).first());
  await assertKeyboardFocus(page.getByRole('button', { name: 'Modo oscuro' }));
  await assertKeyboardFocus(page.getByLabel('Email'));
});
