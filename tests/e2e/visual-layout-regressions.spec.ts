import { expect, test, type Locator, type Page } from '@playwright/test';

type Box = { x: number; y: number; width: number; height: number };

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
};

const openDesktopHome = async (page: Page) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
};

test('la lista de Web vive dentro de una caja legible', async ({ page }) => {
  await openDesktopHome(page);

  const list = page.locator('.service-web ul');
  const styles = await list.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      borderLeft: computed.borderLeftStyle,
      borderRight: computed.borderRightStyle,
    };
  });

  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.borderLeft).toBe('solid');
  expect(styles.borderRight).toBe('solid');
});

test('el bloque azul de CRM no invade el texto introductorio', async ({ page }) => {
  await openDesktopHome(page);

  const copy = await boxOf(page.locator('.service-crm > p'));
  const blueBlock = await boxOf(page.locator('.service-crm .service-art span:nth-child(3)'));

  expect(overlap(copy, blueBlock)).toBe(false);
});

test('la lista de CRM conserva un panel de lectura opaco', async ({ page }) => {
  await openDesktopHome(page);

  const list = page.locator('.service-crm ul');
  const styles = await list.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      borderLeft: computed.borderLeftStyle,
      borderRight: computed.borderRightStyle,
    };
  });

  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.borderLeft).toBe('solid');
  expect(styles.borderRight).toBe('solid');
});

test('los marcadores de Automatizaciones quedan fuera del texto', async ({ page }) => {
  await openDesktopHome(page);

  const copy = await boxOf(page.locator('.service-automation > p'));
  const markers = page.locator('.service-automation .service-art span:visible');
  const markerCount = await markers.count();
  expect(markerCount).toBe(3);

  for (let index = 0; index < markerCount; index += 1) {
    const marker = await boxOf(markers.nth(index));
    expect(overlap(copy, marker)).toBe(false);
  }
});

test('el título del afiche inmobiliario no pisa los bloques de color', async ({ page }) => {
  await openDesktopHome(page);

  const title = await boxOf(page.locator('.property-photo span'));
  const bars = page.locator('.property-photo i');

  for (let index = 0; index < await bars.count(); index += 1) {
    expect(overlap(title, await boxOf(bars.nth(index)))).toBe(false);
  }
});

test('la sombra del CTA conserva aire antes de las pestañas', async ({ page }) => {
  await openDesktopHome(page);

  const button = await boxOf(page.locator('.hero-actions .button-primary'));
  const tabs = await boxOf(page.locator('.hero-service-list'));
  const shadowExtent = 5;
  const shadowClearance = tabs.y - (button.y + button.height + shadowExtent);

  expect(shadowClearance).toBeGreaterThanOrEqual(8);
});
