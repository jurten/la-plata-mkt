import { expect, test } from '@playwright/test';

const members = [
  { name: 'Justina Guiñazú', role: 'Cofundadora y directora creativa' },
  { name: 'Santiago Laumann', role: 'Asistente creativo' },
  { name: 'Joaquín Laumann', role: 'Cofundador y director general' },
];

test('la rueda vincula cada nombre con su cargo y retrato', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nosotros');
  const roster = page.locator('[data-team-roster]');
  const wheel = roster.getByRole('listbox', { name: 'Integrantes del equipo' });
  await roster.scrollIntoViewIfNeeded();
  for (const member of members) {
    await wheel.getByRole('option', { name: member.name }).click();
    await expect(wheel.getByRole('option', { name: member.name })).toHaveAttribute('aria-selected', 'true');
    const profile = roster.locator('[data-team-profile]:visible');
    await expect(profile).toHaveCount(1);
    await expect(profile.getByRole('heading')).toHaveText(member.name);
    await expect(profile.locator('[data-team-current-role]')).toHaveText(member.role);
    const image = profile.getByRole('img');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('alt', 'Retrato alienígena de relleno, provisorio');
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test('teclado, límites y botones mantienen la selección sincronizada', async ({ page }) => {
  await page.goto('/#nosotros');
  const wheel = page.getByRole('listbox', { name: 'Integrantes del equipo' });
  const previous = page.getByRole('button', { name: 'Ver integrante anterior' });
  const next = page.getByRole('button', { name: 'Ver siguiente integrante' });
  await wheel.focus();
  await wheel.press('Home');
  await expect(previous).toBeDisabled();
  await wheel.press('ArrowDown');
  await expect(wheel).toHaveAttribute('aria-activedescendant', 'team-wheel-option-1');
  await expect(page.locator('[data-team-status]')).toHaveText('Santiago Laumann, Asistente creativo');
  await wheel.press('End');
  await expect(next).toBeDisabled();
  await wheel.press('ArrowDown');
  await expect(wheel).toHaveAttribute('data-selected', '2');
  await previous.click();
  await expect(wheel).toHaveAttribute('data-selected', '1');
  await wheel.focus();
  await wheel.press('Home');
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(wheel).toHaveAttribute('data-selected', '1');
});

test('scroll y arrastre cambian de integrante y liberan el scroll en los extremos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nosotros');
  const wheel = page.getByRole('listbox', { name: 'Integrantes del equipo' });
  await wheel.scrollIntoViewIfNeeded();
  await wheel.focus();
  await wheel.press('Home');
  const canceled = await wheel.evaluate(element => {
    const box = element.getBoundingClientRect();
    return !element.dispatchEvent(new WheelEvent('wheel', { deltaY: 160, cancelable: true, bubbles: true, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }));
  });
  expect(canceled).toBe(true);
  await expect(wheel).toHaveAttribute('data-selected', '1');
  const box = (await wheel.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 130, { steps: 8 });
  await page.mouse.up();
  await expect(wheel).toHaveAttribute('data-selected', '2');
  await expect(wheel).not.toHaveAttribute('data-ow-dragging');
  const edgeCanceled = await wheel.evaluate(element => {
    const box = element.getBoundingClientRect();
    return !element.dispatchEvent(new WheelEvent('wheel', { deltaY: 160, cancelable: true, bubbles: true, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }));
  });
  expect(edgeCanceled).toBe(false);
});

test('en celular se puede cambiar el perfil', async ({ browser, browserName }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: browserName !== 'firefox', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/#nosotros');
  const roster = page.locator('[data-team-roster]');
  await roster.scrollIntoViewIfNeeded();
  const wheel = page.getByRole('listbox');
  await expect(wheel).toBeVisible();
  await page.getByRole('button', { name: 'Ver siguiente integrante' }).tap();
  await expect(roster.locator('[data-team-profile]:visible [data-team-current-name]')).toHaveText('Joaquín Laumann');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('el scroll real y los pasos de una línea cambian la persona después de la transición', async ({ page }) => {
  await page.goto('/#nosotros');
  const wheel = page.getByRole('listbox', { name: 'Integrantes del equipo' });
  await expect(wheel).toBeVisible();
  await expect(page.locator('.featured-about')).not.toHaveAttribute('data-team-locked');
  await expect(page.locator('.featured-stage')).toHaveAttribute('inert');
  const pointerBounds = (await wheel.boundingBox())!;
  await page.mouse.move(pointerBounds.x + pointerBounds.width / 2, pointerBounds.y + pointerBounds.height / 2);
  await page.mouse.wheel(0, 120);
  await expect(wheel).toHaveAttribute('data-selected', '2');
  await page.mouse.wheel(0, -120);
  await expect(wheel).toHaveAttribute('data-selected', '1');
  const box = (await wheel.boundingBox())!;
  await wheel.dispatchEvent('wheel', { deltaY: -1, deltaMode: 1, cancelable: true, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 });
  await expect(wheel).toHaveAttribute('data-selected', '0');
  await expect(page.locator('[data-team-profile]:visible [data-team-current-name]')).toHaveText('Justina Guiñazú');
});

test('sin JavaScript quedan todos los nombres, cargos y retratos en el documento', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/#nosotros');
  const roster = page.locator('[data-team-roster]');
  await expect(roster.locator('[data-team-profile]')).toHaveCount(3);
  for (const member of members) await expect(roster.getByRole('heading', { name: member.name })).toBeVisible();
  await expect(roster.locator('[data-team-navigation]')).toBeHidden();
  await context.close();
});

test('una altura de 966 píxeles no deja bloqueadas las flechas ni el scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 966 });
  await page.goto('/#nosotros');
  const wheel = page.locator('#team-wheel');
  const next = page.locator('[data-team-next]');
  await expect.poll(() => page.locator('.featured-stage').evaluate(element => Math.abs(element.getBoundingClientRect().right))).toBeLessThan(0.01);
  await expect(next).toBeEnabled();
  await expect(page.locator('.featured-about')).not.toHaveAttribute('data-team-locked');
  const arrow = (await next.boundingBox())!;
  await page.mouse.click(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
  await expect(wheel).toHaveAttribute('data-selected', '2');
  const bounds = (await wheel.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, -120);
  await expect(wheel).toHaveAttribute('data-selected', '1');
});

test('la rueda recibe scroll continuo desde el portfolio sin mover el mouse', async ({ page }) => {
  await page.goto('/#trabajo');
  await expect(page.locator('[data-portfolio-reveal]')).toHaveAttribute('data-enhanced', 'true');
  await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('#trabajo')!;
    const end = section.getBoundingClientRect().top + scrollY + section.offsetHeight - innerHeight;
    scrollTo({ top: Math.ceil(end) - 100, behavior: 'instant' });
  });
  const about = page.locator('.featured-about');
  const wheel = page.locator('#team-wheel');
  await expect(about).toHaveAttribute('data-team-locked');
  const box = (await wheel.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await expect(about).not.toHaveAttribute('data-team-locked');
  await page.mouse.wheel(0, 120);
  await expect(wheel).toHaveAttribute('data-selected', '2');
  await expect(page.locator('[data-team-profile]:visible [data-team-current-name]')).toHaveText('Joaquín Laumann');
});

test('colores forzados conserva los perfiles y permite volver a la rueda', async ({ page }) => {
  await page.goto('/#nosotros');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('[data-team-profile]:visible')).toHaveCount(3);
  await expect(page.locator('[data-wheel-option]').first()).not.toHaveAttribute('style');
  await page.emulateMedia({ forcedColors: 'none' });
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.locator('[data-team-profile]:visible')).toHaveCount(1);
});

test('los tres nombres completos caben en ambos extremos de la rueda', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nosotros');
  const wheel = page.getByRole('listbox');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await wheel.focus();
    for (const key of ['Home', 'End']) {
      await wheel.press(key);
      await expect.poll(() => wheel.evaluate(root => {
        const box = root.getBoundingClientRect();
        return [...root.querySelectorAll('[data-wheel-option]')].every(item => {
          const bounds = item.getBoundingClientRect();
          return bounds.top >= box.top && bounds.bottom <= box.bottom && bounds.left >= box.left && bounds.right <= box.right;
        });
      })).toBe(true);
    }
  }
});
