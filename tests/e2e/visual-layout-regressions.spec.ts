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

const openHome = async (page: Page, width = 1440, height = 1000) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
};

test('el hero protege la lectura y conserva aire antes de sus resultados', async ({ page }) => {
  await openHome(page, 1280, 900);

  const title = await boxOf(page.locator('#hero-title'));
  const side = await boxOf(page.locator('.hero-side'));
  const actions = await boxOf(page.locator('.hero-side .actions'));
  const ticker = await boxOf(page.locator('.hero-ticker'));
  const buttons = await page.locator('.hero-side .actions .button').evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );

  expect(overlap(title, side)).toBe(false);
  expect(ticker.y - (actions.y + actions.height)).toBeGreaterThanOrEqual(24);
  expect(ticker.y - (actions.y + actions.height)).toBeLessThanOrEqual(160);
  expect(Math.abs(buttons[0] - buttons[1])).toBeLessThan(2);
});

test('el hero pasa a una lectura lineal antes de comprimir su columna de conversión', async ({ page }) => {
  await openHome(page, 1024, 900);

  const title = await boxOf(page.locator('#hero-title'));
  const side = await boxOf(page.locator('.hero-side'));
  const ticker = await boxOf(page.locator('.hero-ticker'));

  expect(side.y).toBeGreaterThanOrEqual(title.y + title.height);
  expect(Math.abs(side.x - title.x)).toBeLessThan(2);
  expect(ticker.y).toBeGreaterThan(side.y + side.height);
});

test('las tres rutas mantienen tarjetas íntegras y títulos dentro de sus bordes', async ({ page }) => {
  await openHome(page);

  const cards = page.locator('.solution-path');
  await expect(cards).toHaveCount(3);
  const geometry = await cards.evaluateAll((elements) => elements.map((card) => {
    const cardBox = card.getBoundingClientRect();
    const titleBox = card.querySelector('h3')!.getBoundingClientRect();
    const actionBox = card.querySelector('a.button')!.getBoundingClientRect();
    return {
      card: { x: cardBox.x, y: cardBox.y, width: cardBox.width, height: cardBox.height },
      title: { x: titleBox.x, y: titleBox.y, width: titleBox.width, height: titleBox.height },
      action: { x: actionBox.x, y: actionBox.y, width: actionBox.width, height: actionBox.height },
    };
  }));

  expect(Math.max(...geometry.map(({ card }) => card.height)) - Math.min(...geometry.map(({ card }) => card.height))).toBeLessThan(2);
  for (const { card, title, action } of geometry) {
    expect(title.x).toBeGreaterThanOrEqual(card.x);
    expect(title.x + title.width).toBeLessThanOrEqual(card.x + card.width);
    expect(action.y + action.height).toBeLessThanOrEqual(card.y + card.height);
  }
});

test('el flujo conserva siete etapas alineadas en escritorio y una columna íntegra en móvil', async ({ page }) => {
  await openHome(page, 901, 900);
  let flow = page.locator('.system-flow');
  await flow.scrollIntoViewIfNeeded();
  let nodes = flow.locator('.system-node');
  await expect(nodes).toHaveCount(7);
  const desktop = await nodes.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  for (let index = 1; index < desktop.length; index += 1) {
    const gap = desktop[index].left - desktop[index - 1].right;
    expect(gap).toBeGreaterThanOrEqual(4);
    expect(gap).toBeLessThanOrEqual(16);
    expect(Math.abs(desktop[index].top - desktop[0].top)).toBeLessThan(2);
    expect(Math.abs(desktop[index].bottom - desktop[0].bottom)).toBeLessThan(2);
  }

  await openHome(page, 900, 900);
  flow = page.locator('.system-flow');
  await flow.scrollIntoViewIfNeeded();
  nodes = flow.locator('.system-node');
  const mobile = await nodes.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  for (let index = 1; index < mobile.length; index += 1) {
    const gap = mobile[index].top - mobile[index - 1].bottom;
    expect(gap).toBeGreaterThanOrEqual(4);
    expect(gap).toBeLessThanOrEqual(16);
    expect(Math.abs(mobile[index].left - mobile[0].left)).toBeLessThan(2);
    expect(Math.abs(mobile[index].right - mobile[0].right)).toBeLessThan(2);
  }
});

test('el diagrama de experiencia nunca invade texto esencial', async ({ page }) => {
  await openHome(page);

  const card = page.locator('.experience-real-estate');
  const diagram = await boxOf(card.locator('.case-diagram'));
  for (const locator of [card.locator('h3'), card.locator(':scope > p:not(.meta)'), card.locator(':scope > small')]) {
    expect(overlap(diagram, await boxOf(locator))).toBe(false);
  }

  await openHome(page, 390, 844);
  const mobileDiagram = page.locator('.experience-real-estate .case-diagram');
  await expect(mobileDiagram).toHaveCSS('display', 'none');
  expect(await mobileDiagram.boundingBox()).toBeNull();
});

test('el contacto presenta la decisión a la izquierda y el formulario a la derecha', async ({ page }) => {
  await openHome(page, 1440, 900);

  const intro = await boxOf(page.locator('.contact-intro'));
  const form = await boxOf(page.locator('.contact-form'));
  const side = await boxOf(page.locator('.contact-side'));
  const title = await boxOf(page.locator('.contact-title'));

  expect(form.x - (intro.x + intro.width)).toBeGreaterThanOrEqual(48);
  expect(side.y).toBeGreaterThanOrEqual(title.y + title.height + 24);
  expect(Math.abs(side.x - title.x)).toBeLessThan(2);
});

test('el contacto se apila sin desbordes en tablet y móvil', async ({ page }) => {
  for (const width of [900, 560, 320]) {
    await openHome(page, width, 900);
    const intro = await boxOf(page.locator('.contact-intro'));
    const form = await boxOf(page.locator('.contact-form'));
    expect(form.y, `${width}px`).toBeGreaterThanOrEqual(intro.y + intro.height + 48);
    expect(form.x, `${width}px`).toBeGreaterThanOrEqual(0);
    expect(form.x + form.width, `${width}px`).toBeLessThanOrEqual(width);
  }
});

test('el correo público del footer conserva una línea legible', async ({ page }) => {
  for (const width of [390, 1440]) {
    await openHome(page, width, 900);
    const email = page.locator('.site-footer a[href="mailto:ceo@laplatamarketing.com"]');
    const lineCount = await email.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0).length;
    });
    expect(lineCount, `${width}px`).toBe(1);
  }
});

for (const route of ['/', '/privacidad']) {
  test(`${route} no desborda en anchos críticos`, async ({ page }) => {
    for (const width of [320, 390, 560, 900, 901, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
      await page.goto(route);
      const widths = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        bodyOverflow: getComputedStyle(document.body).overflowX,
      }));
      expect(widths.document, `${route} @ ${width}px`).toBeLessThanOrEqual(widths.viewport);
      expect(widths.body, `${route} body @ ${width}px`).toBeLessThanOrEqual(widths.viewport);
      expect(widths.bodyOverflow).not.toBe('hidden');
    }
  });
}
