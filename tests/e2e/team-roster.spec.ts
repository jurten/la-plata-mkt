import { expect, test } from '@playwright/test';

const members = [
  { name: 'Joaquín Laumann', role: 'Tecnología' },
  { name: 'Santiago Laumann', role: 'Creatividad' },
  { name: 'Justina Guiñazú', role: 'Marketing' },
];
const arrival = async (page: import('@playwright/test').Page) => {
  await page.goto('/#nosotros');
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-ready');
  await page.evaluate(() => document.fonts.ready);
  if (await page.locator('[data-portfolio-reveal]').getAttribute('data-enhanced')) {
    await expect(page.locator('.featured-stage')).toHaveAttribute('inert');
  }
  await expect.poll(() => page.locator('#nosotros').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
};

test('los nombres y cargos están siempre visibles y cada uno presenta su retrato', async ({ page }) => {
  await arrival(page);
  for (const member of members) {
    const choice = page.getByRole('button', { name: `${member.name} ${member.role}`, exact: true });
    await expect(choice).toBeInViewport();
    await choice.click();
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/#nosotros$/);
    const band = page.locator('[data-team-row][data-current] [data-team-band]');
    await expect(band).toBeVisible();
    await expect(band.locator('[data-team-part]').first()).toContainText(member.name);
    const img = band.locator('img').first();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('teclado y foco recorren los integrantes sin desplazar la página', async ({ page }) => {
  await arrival(page);
  const choices = page.locator('[data-team-choice]');
  await choices.first().focus();
  const top = await page.evaluate(() => scrollY);
  await choices.first().press('ArrowDown');
  await expect(choices.nth(1)).toBeFocused();
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-team-status]')).toHaveText('Santiago Laumann, Creatividad');
  await choices.nth(1).press('End');
  await expect(choices.last()).toBeFocused();
  await choices.last().press(' ');
  await expect(choices.last()).toHaveAttribute('aria-pressed', 'true');
  expect(Math.abs(await page.evaluate(() => scrollY) - top)).toBeLessThan(2);
});

test('Nosotros mide una pantalla y reserva un recorrido antes del footer', async ({ browser }) => {
  for (const [width, height] of [[1920,966], [1440,1000], [1100,900], [768,900], [390,844], [320,740]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    // Each width checks a fresh direct arrival. Reusing the same fragment URL
    // asks the browser for a same-document jump into a sticky reveal instead.
    await arrival(page);
    const geometry = await page.evaluate(() => {
      const section = document.querySelector('#nosotros')!.getBoundingClientRect();
      const footer = document.querySelector('#contacto')!.getBoundingClientRect();
      const visibleText = [...document.querySelectorAll('[data-team-current-name], [data-team-current-role]')].every(el => {
        const box = el.getBoundingClientRect();
        return box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth && el.scrollWidth <= el.clientWidth + 1;
      });
      const holding = document.querySelector('[data-portfolio-reveal]')!.hasAttribute('data-enhanced');
      const contact = document.querySelector('.team-roster__footer a')!.getBoundingClientRect();
      const whatsapp = document.querySelector('[data-floating-whatsapp]')!.getBoundingClientRect();
      const actionsClear = contact.right <= whatsapp.left || contact.left >= whatsapp.right || contact.bottom <= whatsapp.top || contact.top >= whatsapp.bottom;
      return { height: section.height, footerTop: footer.top, pageWidth: document.documentElement.scrollWidth, visibleText, holding, actionsClear };
    });
    expect(geometry.height).toBe(height);
    expect(Math.abs(geometry.footerTop - height * (geometry.holding ? 3.5 : 1))).toBeLessThan(2);
    expect(geometry.pageWidth).toBe(width);
    expect(geometry.visibleText).toBe(true);
    expect(geometry.actionsClear).toBe(true);
    await context.close();
  }
});

test('hover abre una banda recta con retratos en pastilla sin deformación blob', async ({ page }) => {
  await arrival(page);
  const choice = page.locator('[data-team-choice]').nth(1);
  await choice.hover({position:{x:200,y:70}});
  await expect(choice).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(700);
  const band = page.locator('[data-team-row]').nth(1).locator('[data-team-band]');
  await expect(band).toBeVisible();
  expect(await band.evaluate(el => getComputedStyle(el).clipPath)).toContain('inset');
  const portrait = band.locator('.flowing-team__portrait').first();
  await expect(portrait).toHaveCSS('clip-path', 'none');
  await expect(portrait).toHaveCSS('border-radius', '999px');
  await expect(portrait).not.toHaveAttribute('style');
  const track = page.locator('[data-team-row]').nth(1).locator('[data-team-track]');
  const transform = await track.getAttribute('style');
  await expect.poll(() => track.getAttribute('style')).not.toBe(transform);
});

test('la rueda conserva su distancia nativa mientras Nosotros permanece en pantalla', async ({ page }) => {
  await arrival(page);
  const roster = page.locator('[data-team-roster]');
  await page.mouse.move(700,180);
  const selected = await roster.getAttribute('data-team-selected');
  const start = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0,240);
  await expect.poll(() => page.evaluate(origin => Math.abs(scrollY - origin - 240), start)).toBeLessThan(3);
  expect(Math.abs(await page.locator('#nosotros').evaluate(el => el.getBoundingClientRect().top))).toBeLessThan(2);
  await expect(roster).toHaveAttribute('data-team-selected', selected!);
  expect(await page.locator('#contacto').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(1000);
  await page.mouse.wheel(0,-240);
  await expect.poll(() => page.evaluate(origin => Math.abs(scrollY - origin), start)).toBeLessThan(3);
});

test('el scroll indica el avance sin zoom y se revierte antes de salir al footer', async ({ page }) => {
  await arrival(page);
  const roster = page.locator('[data-team-roster]');
  const start = await page.evaluate(() => scrollY);
  await page.mouse.move(700,180);
  const selected = await roster.getAttribute('data-team-selected');
  await page.waitForTimeout(750);
  const initial = await page.locator('[data-team-list]').boundingBox();
  const cursor = page.locator('.team-roster__scroll-cursor');
  const cursorInitial = await cursor.boundingBox();
  for (let gesture = 0; gesture < 8; gesture++) await page.mouse.wheel(0,240);
  await expect.poll(() => page.evaluate(origin => Math.abs(scrollY - origin - 1920), start)).toBeLessThan(3);
  const still = await page.locator('[data-team-list]').boundingBox();
  expect(Math.abs(still!.width - initial!.width)).toBeLessThan(1);
  expect(Math.abs(still!.x - initial!.x)).toBeLessThan(1);
  expect(Math.abs(still!.y - initial!.y)).toBeLessThan(1);
  await expect(page.locator('#nosotros > .wrap')).toHaveCSS('transform', 'none');
  const progress = page.locator('.featured-about__content');
  const readProgress = () => progress.evaluate(el => Number((el as HTMLElement).style.getPropertyValue('--team-scroll-progress')));
  await expect.poll(readProgress).toBeGreaterThan(.7);
  await expect(page.locator('.team-roster__scroll')).toBeVisible();
  await expect(page.locator('.team-roster__scroll-ticks i')).toHaveCount(31);
  await expect(page.locator('#nosotros')).toHaveCSS('box-shadow', 'none');
  const cursorAdvanced = await cursor.boundingBox();
  const ruler = await page.locator('.team-roster__scroll').boundingBox();
  expect(cursorAdvanced!.y - cursorInitial!.y).toBeGreaterThan(ruler!.height * .7);
  expect(cursorAdvanced!.x).toBeLessThan(initial!.x);
  expect(cursorAdvanced!.y).toBeLessThan(ruler!.y + ruler!.height);
  expect(Math.abs(await page.locator('#nosotros').evaluate(el => el.getBoundingClientRect().top))).toBeLessThan(2);
  expect(await page.locator('#contacto').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(1000);
  await expect(roster).toHaveAttribute('data-team-selected', selected!);
  // Firefox caps a single wheel impulse; mirror the original eight gestures.
  for (let gesture = 0; gesture < 8; gesture++) await page.mouse.wheel(0,-240);
  await expect.poll(readProgress).toBeLessThan(.002);
  const restored = await page.locator('[data-team-list]').boundingBox();
  expect(Math.abs(restored!.width - initial!.width)).toBeLessThan(1);
  expect(Math.abs((await cursor.boundingBox())!.y - cursorInitial!.y)).toBeLessThan(1);
  for (let gesture = 0; gesture < 8; gesture++) await page.mouse.wheel(0,240);
  await expect.poll(readProgress).toBeGreaterThan(.7);
  for (let gesture = 0; gesture < 6; gesture++) await page.mouse.wheel(0,240);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeLessThan(2);
  await expect(page.locator('#contact-title')).toBeInViewport();
  // Reverse into the hold: the viewport-sized scene returns with its feedback.
  await page.mouse.wheel(0,-1200);
  await expect.poll(() => page.locator('#nosotros').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
  expect(await page.locator('#nosotros').evaluate(el => el.getBoundingClientRect().height)).toBe(1000);
});

test('los impulsos pequeños del trackpad mantienen la velocidad nativa', async ({ page }) => {
  await arrival(page);
  await page.mouse.move(700,180);
  const start = await page.evaluate(() => scrollY);
  for (let impulse = 0; impulse < 24; impulse++) await page.mouse.wheel(0,1);
  await expect.poll(() => page.evaluate(origin => Math.abs(scrollY - origin - 24), start)).toBeLessThan(2);
  expect(Math.abs(await page.locator('#nosotros').evaluate(el => el.getBoundingClientRect().top))).toBeLessThan(2);
});

test('el enlace al contacto omite la permanencia y el modo reducido la elimina', async ({ page }) => {
  await arrival(page);
  const roster = page.locator('[data-team-roster]');
  await roster.getByRole('link', {name:'Sigamos en contacto'}).click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contact-title')).toBeInViewport();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-portfolio-reveal]')).not.toHaveAttribute('data-enhanced');
  await expect(page.locator('.team-roster__scroll')).toBeHidden();
  await expect(page.locator('#nosotros > .wrap')).toHaveCSS('transform', 'none');
  await expect(page.locator('.featured-about__content')).not.toHaveAttribute('style', /--team-scroll-progress/);
  await page.locator('[data-team-choice]').last().click();
  await expect(roster).toHaveAttribute('data-team-selected','2');
});

for (const [width,height] of [[390,844],[320,740]]) test(`el equipo puede elegirse con toque y permanece dentro de una pantalla móvil de ${width}px`, async ({ browser, browserName }) => {
  const context = await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:browserName !== 'firefox'});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/#nosotros');
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-ready');
  await page.evaluate(() => document.fonts.ready);
  const choices = page.locator('[data-team-choice]');
  await expect(choices.last()).toBeInViewport();
  await choices.first().tap();
  await expect(choices.first()).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-flow-state','active');
  await choices.last().tap();
  await expect(choices.last()).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-flow-state','active');
  expect(await page.locator('#nosotros').evaluate(el => el.getBoundingClientRect().height)).toBe(height);
  await context.close();
});

test('sin JavaScript los enlaces conservan los tres perfiles en flujo normal', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/#nosotros');
  for (const member of members) await expect(page.getByRole('heading', {name:`${member.name} ${member.role}`,exact:true})).toBeVisible();
  await expect(page.locator('[data-team-profile]:visible')).toHaveCount(3);
  await expect(page.locator('[data-team-choice]').first()).toHaveAttribute('href','#team-joaquin-laumann');
  await context.close();
});

test('colores forzados muestra todos los perfiles y permite volver a la presentación', async ({ page }) => {
  await arrival(page);
  await page.emulateMedia({forcedColors:'active'});
  await expect(page.locator('[data-team-roster]')).not.toHaveAttribute('data-team-ready');
  await expect(page.locator('[data-team-profile]:visible')).toHaveCount(3);
  await page.emulateMedia({forcedColors:'none'});
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-ready');
  await expect(page.locator('[data-team-profile]:visible')).toHaveCount(0);
});

test('volver a Trabajos desactiva y restablece la banda en vez de congelarla', async ({ page }) => {
  await arrival(page);
  const root=page.locator('[data-team-roster]');
  const choice=page.locator('[data-team-choice]').nth(1);
  await choice.hover({position:{x:200,y:70}});
  await expect(root).toHaveAttribute('data-team-flow-state','active');
  const track=page.locator('[data-team-row]').nth(1).locator('[data-team-track]');
  await expect.poll(()=>track.getAttribute('style')).toContain('translate3d');
  await page.mouse.wheel(0,-240);
  await expect(page.locator('.featured-about')).toHaveAttribute('data-team-locked');
  await expect(root).toHaveAttribute('data-team-flow-state','disabled');
  await expect(root).toHaveAttribute('data-team-selected','-1');
  for(const band of await page.locator('[data-team-band]').all()){
    await expect(band).toBeHidden();
    await expect(band).not.toHaveAttribute('style');
  }
  for(const item of await page.locator('[data-team-track]').all())await expect(item).not.toHaveAttribute('style');
  await page.waitForTimeout(500);
  await expect(track).not.toHaveAttribute('style');
  await page.mouse.wheel(0,240);
  await expect(page.locator('.featured-about')).not.toHaveAttribute('data-team-locked');
  await expect(root).toHaveAttribute('data-team-flow-state','idle');
  await expect(page.locator('[data-team-row][data-current]')).toHaveCount(0);
  await choice.hover({position:{x:240,y:80}});
  await expect(root).toHaveAttribute('data-team-flow-state','active');
  await expect(choice).toHaveAttribute('aria-pressed','true');
});

test('salir al footer también limpia la interacción y Trabajos reemplaza Portfolio', async ({ page }) => {
  await arrival(page);
  await expect(page.locator('.primary-nav a[href="#trabajo"]')).toContainText('Trabajos');
  await expect(page.locator('.footer-explore a[href="#trabajo"]')).toHaveText('Trabajos');
  await page.locator('[data-team-choice]').last().click();
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-flow-state','active');
  await page.locator('.team-roster__footer a').click();
  await expect(page.locator('#contact-title')).toBeInViewport();
  await expect(page.locator('[data-team-roster]')).toHaveAttribute('data-team-selected','-1');
  await expect(page.locator('[data-team-row][data-current]')).toHaveCount(0);
});
