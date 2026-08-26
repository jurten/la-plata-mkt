import { expect, test } from '@playwright/test';

test('Registro activo es fija y las antiguas URLs de paleta son inertes', async ({ page }) => {
  await page.goto('/?palettes=1&palette=manchette');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');
  await expect(page.locator('[data-palette-lab], [data-palette-option], [data-palette-toggle]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1D62A8');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('.footer-links a[href^="/privacidad"]')).toHaveAttribute('href', '/privacidad');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe(
    '#1d62a8',
  );

  await page.goto('/privacidad?palettes=1&palette=sobreimpresion');

  await expect(page.locator('html')).toHaveAttribute('data-palette', 'registro');
  await expect(page.locator('[data-palette-lab], [data-palette-option], [data-palette-toggle]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F2D31B');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('.legal-header .brand')).toHaveAttribute('href', '/');
  await expect(page.locator('.legal-back')).toHaveAttribute('href', '/#contacto');
  await expect(page.locator('script[src="/scripts/site.js"]')).toHaveCount(0);
});

test('Registro activo conserva foco visible en navegación y formulario', async ({ page }) => {
  await page.goto('/');

  const navigationLink = page.getByRole('link', { name: 'Servicios' }).first();
  await navigationLink.focus();
  const navigationFocus = await navigationLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.outlineColor, offset: styles.outlineOffset, style: styles.outlineStyle, width: styles.outlineWidth };
  });
  expect(navigationFocus).toEqual({ color: 'rgb(23, 41, 45)', offset: '3px', style: 'solid', width: '3px' });

  const email = page.getByLabel('Email');
  await email.focus();
  const formFocus = await email.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.outlineColor, offset: styles.outlineOffset, style: styles.outlineStyle, width: styles.outlineWidth };
  });
  expect(formFocus).toEqual({ color: 'rgb(23, 41, 45)', offset: '3px', style: 'solid', width: '3px' });
});
