import { expect, test } from '@playwright/test';

test('la ilustración del hero entra en registro sin animar el contenido esencial', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');

  const heroVisual = page.locator('.hero-visual');
  await expect(heroVisual).toHaveAttribute('data-motion', 'hero');
  await expect(heroVisual).toHaveClass(/is-in-view/);

  const illustrationMotion = await page.locator('.mock-browser').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      animationName: styles.animationName,
      animationDuration: styles.animationDuration,
    };
  });
  expect(illustrationMotion.animationName).toContain('motion-hero-browser');
  expect(illustrationMotion.animationDuration).not.toBe('0s');

  const essentialCopy = await page.locator('#hero-title, .hero-lede, .hero-actions').evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return {
        animationName: styles.animationName,
        opacity: styles.opacity,
        transform: styles.transform,
        visibility: styles.visibility,
      };
    }),
  );

  for (const styles of essentialCopy) {
    expect(styles.animationName).toBe('none');
    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
    expect(styles.visibility).toBe('visible');
  }
});

test('las capas ilustrativas del hero entran como una secuencia de impresión', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await expect(page.locator('.hero-visual')).toHaveClass(/is-in-view/);

  const layers = await page.locator('.hero-visual').evaluate((element) => {
    const animationOf = (selector: string, pseudo?: string) => {
      const target = pseudo ? element : element.querySelector(selector);
      const styles = getComputedStyle(target ?? element, pseudo);
      return {
        name: styles.animationName,
        duration: styles.animationDuration,
        delay: styles.animationDelay,
      };
    };

    return {
      frame: animationOf('', '::before'),
      phone: animationOf('.mock-phone'),
      crm: animationOf('.mock-crm'),
      stamp: animationOf('.automation-stamp'),
    };
  });

  expect(layers.frame.name).toContain('motion-hero-frame');
  expect(layers.phone.name).toContain('motion-hero-phone');
  expect(layers.crm.name).toContain('motion-hero-crm');
  expect(layers.stamp.name).toContain('motion-hero-stamp');

  for (const layer of Object.values(layers)) {
    expect(layer.duration).not.toBe('0s');
  }

  expect(Number.parseFloat(layers.phone.delay)).toBeGreaterThan(0);
  expect(Number.parseFloat(layers.crm.delay)).toBeGreaterThan(Number.parseFloat(layers.phone.delay));
  expect(Number.parseFloat(layers.stamp.delay)).toBeGreaterThan(Number.parseFloat(layers.crm.delay));
});

test('las capas animadas que contienen texto conservan opacidad completa', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const groups = [
    ['.hero-visual', ['.mock-browser', '.mock-phone', '.mock-crm', '.automation-stamp']],
    ['.mirta-visual', ['.property-social', '.property-crm', '.flow-card']],
    ['.maria-visual', ['.legal-browser', '.legal-phone', '.legal-post']],
    ['.team-stamp', ['.team-stamp']],
  ] as const;

  for (const [containerSelector, layerSelectors] of groups) {
    const container = page.locator(containerSelector);
    await container.scrollIntoViewIfNeeded();
    await expect(container).toHaveClass(/is-in-view/);
    await page.evaluate(() => {
      document.getAnimations().forEach((animation) => {
        const duration = animation.effect?.getComputedTiming().duration;
        if (typeof duration !== 'number' || !Number.isFinite(duration)) return;
        animation.pause();
        animation.currentTime = duration / 2;
      });
    });

    for (const selector of layerSelectors) {
      await expect(page.locator(selector)).toHaveCSS('opacity', '1');
    }
  }
});

test('los acentos de servicios se imprimen sin mover títulos ni texto', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveAttribute('data-motion', 'service');
  await expect(social).toHaveClass(/is-in-view/);
  await expect(page.locator('.service-web')).toHaveClass(/is-in-view/);

  const crm = page.locator('.service-crm');
  await crm.scrollIntoViewIfNeeded();
  await expect(crm).toHaveClass(/is-in-view/);
  await expect(page.locator('.service-automation')).toHaveClass(/is-in-view/);

  const animationNames = await page.evaluate(() => ({
    social: getComputedStyle(document.querySelector('.service-social .service-art span')!).animationName,
    web: getComputedStyle(document.querySelector('.service-web ul')!).animationName,
    crm: getComputedStyle(document.querySelector('.service-crm .service-art span:nth-child(3)')!).animationName,
    automation: getComputedStyle(document.querySelector('.service-automation .service-art span:nth-child(1)')!).animationName,
  }));

  expect(animationNames.social).toContain('motion-service-shape');
  expect(animationNames.web).toContain('motion-web-panel');
  expect(animationNames.crm).toContain('motion-service-block');
  expect(animationNames.automation).toContain('motion-service-marker');

  const essentialCopy = await page.locator('.service-card h3, .service-card > p, .service-card li').evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return {
        animationName: styles.animationName,
        opacity: styles.opacity,
        transform: styles.transform,
        visibility: styles.visibility,
      };
    }),
  );

  for (const styles of essentialCopy) {
    expect(styles.animationName).toBe('none');
    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
    expect(styles.visibility).toBe('visible');
  }
});

test('el recorrido, los casos y el proceso animan solo sus capas gráficas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const targets = [
    ['.journey-map', '.journey-arrow', 'journey', 'motion-journey-arrow'],
    ['.mirta-visual', '.property-social', 'case', 'motion-case-property'],
    ['.maria-visual', '.legal-browser', 'case', 'motion-case-legal'],
    ['.process-list', '.process-list li b', 'process', 'motion-process-arrow'],
    ['.team-stamp', '.team-stamp', 'stamp', 'motion-team-stamp'],
  ] as const;

  for (const [containerSelector, animatedSelector, motionName, expectedAnimation] of targets) {
    const container = page.locator(containerSelector);
    await container.scrollIntoViewIfNeeded();
    await expect(container).toHaveAttribute('data-motion', motionName);
    await expect(container).toHaveClass(/is-in-view/);
    const animationName = await page.locator(animatedSelector).first().evaluate((element) => getComputedStyle(element).animationName);
    expect(animationName).toContain(expectedAnimation);
  }

  const narrative = await page.locator(
    '.journey-node strong, .journey-node small, .case-copy h3, .case-copy p, .process-list h3, .process-list p, .team-copy h2, .team-copy p, .team-copy li',
  ).evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return {
      animationName: styles.animationName,
      opacity: styles.opacity,
      transform: styles.transform,
      visibility: styles.visibility,
    };
  }));

  for (const styles of narrative) {
    expect(styles.animationName).toBe('none');
    expect(styles.opacity).toBe('1');
    expect(styles.transform).toBe('none');
    expect(styles.visibility).toBe('visible');
  }
});

test('respeta cambios de movimiento reducido mientras la página está abierta', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'reduced');

  const targets = page.locator('[data-motion]');
  expect(await targets.count()).toBeGreaterThan(0);
  for (let index = 0; index < await targets.count(); index += 1) {
    await expect(targets.nth(index)).toHaveClass(/is-in-view/);
  }

  const animationNames = await page.locator(
    '.mock-browser, .service-social .service-art span, .property-social, .process-list li b, .team-stamp',
  ).evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationName));
  expect(animationNames).toEqual(animationNames.map(() => 'none'));
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-iteration-count', '1');
});

test('al salir de movimiento reducido vuelve a observar solo lo que entra en pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const hero = page.locator('.hero-visual');
  const teamStamp = page.locator('.team-stamp');
  const targets = page.locator('[data-motion]');

  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'reduced');
  for (let index = 0; index < await targets.count(); index += 1) {
    await expect(targets.nth(index)).toHaveClass(/is-in-view/);
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect(hero).toHaveClass(/is-in-view/);
  await expect(teamStamp).not.toHaveClass(/is-in-view/);

  await teamStamp.scrollIntoViewIfNeeded();
  await expect(teamStamp).toHaveClass(/is-in-view/);
  await expect(teamStamp).toHaveCSS('animation-name', 'motion-team-stamp');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  await expect(hero).toHaveClass(/is-in-view/);
  await expect(teamStamp).not.toHaveClass(/is-in-view/);
});

test('las microinteracciones dan feedback y permiten pausar el movimiento continuo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const primaryButton = page.locator('.hero-actions .button-primary');
  await primaryButton.hover();
  const arrowTransform = await primaryButton.locator('span').evaluate((element) => getComputedStyle(element).transform);
  expect(arrowTransform).not.toBe('none');

  const marquee = page.locator('.service-marquee');
  await marquee.hover();
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(0, 0);
  await marquee.focus();
  await expect(marquee).toBeFocused();
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'paused');

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Menú' });
  await menu.click();
  const glyphLocator = page.locator('.menu-glyph');
  await expect(glyphLocator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const glyph = await glyphLocator.evaluate((element) => ({
    beforeTransform: getComputedStyle(element, '::before').transform,
    afterTransform: getComputedStyle(element, '::after').transform,
  }));

  expect(glyph.beforeTransform).not.toBe('none');
  expect(glyph.afterTransform).not.toBe('none');
});

test('si IntersectionObserver no es utilizable, revela todo sin romper el sitio', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: class BrokenIntersectionObserver {
        constructor() {
          throw new Error('IntersectionObserver constructor unavailable');
        }
      },
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-motion-state', 'ready');
  const targets = page.locator('[data-motion]');
  expect(await targets.count()).toBeGreaterThan(0);
  for (let index = 0; index < await targets.count(); index += 1) {
    await expect(targets.nth(index)).toHaveClass(/is-in-view/);
  }
  expect(pageErrors).toEqual([]);
});

test('si matchMedia falta, el movimiento falla abierto y el formulario sigue activo', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/#contacto');

  const targets = page.locator('[data-motion]');
  for (let index = 0; index < await targets.count(); index += 1) {
    await expect(targets.nth(index)).toHaveClass(/is-in-view/);
  }

  await page.getByLabel('Empresa').fill('Estudio de prueba');
  await page.getByLabel('Nombre de contacto').fill('Prueba Motion');
  await page.getByLabel('Email').fill('motion@example.com');
  await page.getByLabel('¿Qué problema querés resolver?').fill(
    'Necesitamos ordenar las consultas y automatizar el seguimiento comercial.',
  );
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();

  await expect(page.getByRole('status')).toContainText('Modo demo:');
  expect(pageErrors).toEqual([]);
});

test('sin JavaScript todo el contenido queda visible y en su estado final', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('html')).not.toHaveAttribute('data-motion-state', /.+/);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.service-card h3')).toHaveCount(4);
  await expect(page.locator('.contact-form')).toBeVisible();

  const styles = await page.locator('#hero-title, .hero-lede, .service-card h3, .case-copy h3, .process-list h3').evaluateAll((elements) =>
    elements.map((element) => {
      const computed = getComputedStyle(element);
      return {
        animationName: computed.animationName,
        opacity: computed.opacity,
        visibility: computed.visibility,
      };
    }),
  );

  for (const style of styles) {
    expect(style.animationName).toBe('none');
    expect(style.opacity).toBe('1');
    expect(style.visibility).toBe('visible');
  }

  await context.close();
});

test('las animaciones a mitad de cuadro no reintroducen desborde ni cruces de texto', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const crm = page.locator('.service-crm');
  await crm.scrollIntoViewIfNeeded();
  await expect(crm).toHaveClass(/is-in-view/);

  await page.evaluate(() => {
    document.getAnimations().forEach((animation) => {
      const duration = animation.effect?.getComputedTiming().duration;
      if (typeof duration !== 'number' || !Number.isFinite(duration)) return;
      animation.pause();
      animation.currentTime = duration / 2;
    });
  });

  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const box = document.querySelector(selector)!.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const intersects = (a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) =>
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

    const socialCopy = rect('.service-social > p');
    const socialList = rect('.service-social ul');
    const socialShapes = [...document.querySelectorAll('.service-social .service-art span')]
      .filter((element) => getComputedStyle(element).display !== 'none')
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      });
    const crmCopy = rect('.service-crm > p');
    const crmBlue = rect('.service-crm .service-art span:nth-child(3)');
    const automationCopy = rect('.service-automation > p');
    const automationMarkers = [...document.querySelectorAll('.service-automation .service-art span')]
      .filter((element) => getComputedStyle(element).display !== 'none')
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      });

    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      socialCopyOverlaps: socialShapes.map((shape) => intersects(socialCopy, shape)),
      socialListOverlaps: socialShapes.map((shape) => intersects(socialList, shape)),
      crmOverlap: intersects(crmCopy, crmBlue),
      automationOverlaps: automationMarkers.map((marker) => intersects(automationCopy, marker)),
    };
  });

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.socialCopyOverlaps).toEqual(geometry.socialCopyOverlaps.map(() => false));
  expect(geometry.socialListOverlaps).toEqual(geometry.socialListOverlaps.map(() => false));
  expect(geometry.crmOverlap).toBe(false);
  expect(geometry.automationOverlaps).toEqual(geometry.automationOverlaps.map(() => false));
});

test('el movimiento móvil conserva zonas de lectura y no desborda', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);
  await page.evaluate(() => {
    document.getAnimations().forEach((animation) => {
      const duration = animation.effect?.getComputedTiming().duration;
      if (typeof duration !== 'number' || !Number.isFinite(duration)) return;
      animation.pause();
      animation.currentTime = duration / 2;
    });
  });

  const geometry = await page.evaluate(() => {
    const rectOf = (element: Element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const intersects = (a: ReturnType<typeof rectOf>, b: ReturnType<typeof rectOf>) =>
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    const socialCopy = rectOf(document.querySelector('.service-social > p')!);
    const socialList = rectOf(document.querySelector('.service-social ul')!);
    const socialArt = document.querySelector('.service-social .service-art')!;
    const shapes = [...socialArt.querySelectorAll('span')]
      .map(rectOf)
      .filter((shape) => shape.width > 0 && shape.height > 0);

    return {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      socialArtDisplay: getComputedStyle(socialArt).display,
      renderedShapeCount: shapes.length,
      copyOverlaps: shapes.map((shape) => intersects(socialCopy, shape)),
      listOverlaps: shapes.map((shape) => intersects(socialList, shape)),
    };
  });

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.socialArtDisplay).toBe('none');
  expect(geometry.renderedShapeCount).toBe(0);
  expect(geometry.copyOverlaps).toEqual(geometry.copyOverlaps.map(() => false));
  expect(geometry.listOverlaps).toEqual(geometry.listOverlaps.map(() => false));
});
