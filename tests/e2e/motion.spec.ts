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

test('espera a que la sección entre en la zona útil antes de animarla', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const target = document.querySelector('.service-social')!;
    const top = window.scrollY + target.getBoundingClientRect().top - window.innerHeight * 0.72;
    window.scrollTo(0, top);
  });
  await page.waitForTimeout(150);

  const enteringTop = await social.evaluate((element) => element.getBoundingClientRect().top / window.innerHeight);
  expect(enteringTop).toBeGreaterThan(0.68);
  expect(enteringTop).toBeLessThan(0.76);
  await expect(social).not.toHaveClass(/is-in-view/);

  await page.evaluate(() => {
    const target = document.querySelector('.service-social')!;
    const top = window.scrollY + target.getBoundingClientRect().top - window.innerHeight * 0.32;
    window.scrollTo(0, top);
  });

  await expect(social).toHaveClass(/is-in-view/);
});

test('el recorrido no muestra su estado final antes de entrar en la zona útil', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const journey = page.locator('.journey-map');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const target = document.querySelector('.journey-map')!;
    const top = window.scrollY + target.getBoundingClientRect().top - window.innerHeight * 0.76;
    window.scrollTo(0, top);
  });
  await page.waitForTimeout(150);

  const preTrigger = await journey.evaluate((map) => {
    const rect = map.getBoundingClientRect();
    const firstNode = map.querySelector('.journey-node')!;
    const nodeRect = firstNode.getBoundingClientRect();
    const styles = getComputedStyle(firstNode);
    return {
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      nodeLeft: nodeRect.left,
      animationName: styles.animationName,
      playState: styles.animationPlayState,
      opacity: Number.parseFloat(styles.opacity),
      transform: styles.transform,
    };
  });
  expect(preTrigger.top).toBeGreaterThan(0);
  expect(preTrigger.bottom).toBeLessThanOrEqual(900);
  expect(preTrigger.nodeLeft).toBeGreaterThanOrEqual(preTrigger.left);
  await expect(journey).not.toHaveClass(/is-in-view/);
  expect(preTrigger.animationName).toContain('motion-journey-spring-in');
  expect(preTrigger.playState).toBe('paused');
  expect(preTrigger.opacity).toBe(1);
  expect(preTrigger.transform).not.toBe('none');

  await page.evaluate(() => {
    const target = document.querySelector('.journey-map')!;
    const top = window.scrollY + target.getBoundingClientRect().top - window.innerHeight * 0.32;
    window.scrollTo(0, top);
  });
  await expect(journey).toHaveClass(/is-in-view/);
  await expect(journey.locator('.journey-node').first()).toHaveCSS('animation-play-state', 'running');
});

test('la zona útil sigue siendo alcanzable en viewports de poca altura', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 320 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const target = document.querySelector('.mirta-visual')!;
    const rect = target.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top - (window.innerHeight - rect.height) / 2);
  });

  await expect(page.locator('.mirta-visual')).toHaveClass(/is-in-view/);
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

  expect(animationNames.social).toContain('motion-social-fade-in');
  expect(animationNames.web).toContain('motion-mosaic-panel');
  expect(animationNames.crm).toContain('motion-mosaic-tile');
  expect(animationNames.automation).toContain('motion-automation-step');

  const essentialCopy = await page.locator(
    '.service-card h3, .service-card > p, .service-social li, .service-automation li',
  ).evaluateAll((elements) =>
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
    ['.journey-map', '.journey-arrow', 'journey', 'motion-journey-connector'],
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

test('el recorrido intermedio conserva una secuencia horizontal continua', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const width of [721, 830, 900, 1100, 1101]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const journey = page.locator('.journey-map');
    await journey.scrollIntoViewIfNeeded();
    const geometry = await journey.evaluate((map) => {
      const mapRect = map.getBoundingClientRect();
      const children = [...map.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return {
          kind: child.classList.contains('journey-node') ? 'node' : 'arrow',
          display: getComputedStyle(child).display,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      });
      return { map: { top: mapRect.top, bottom: mapRect.bottom }, children };
    });

    expect(geometry.children).toHaveLength(7);
    expect(geometry.children.every(({ display }) => display !== 'none')).toBe(true);
    expect(geometry.children.map(({ kind }) => kind)).toEqual([
      'node', 'arrow', 'node', 'arrow', 'node', 'arrow', 'node',
    ]);

    const nodes = geometry.children.filter(({ kind }) => kind === 'node');
    const nodeWidths = nodes.map(({ width: nodeWidth }) => nodeWidth);
    expect(Math.max(...nodeWidths) - Math.min(...nodeWidths)).toBeLessThan(2);
    const firstChild = geometry.children[0];
    expect(Math.abs(firstChild.top - geometry.map.top)).toBeLessThanOrEqual(2.5);
    expect(Math.abs(firstChild.bottom - geometry.map.bottom)).toBeLessThanOrEqual(2.5);
    for (const child of geometry.children) {
      expect(Math.abs(child.top - firstChild.top)).toBeLessThan(1);
      expect(Math.abs(child.bottom - firstChild.bottom)).toBeLessThan(1);
    }
    for (let index = 1; index < geometry.children.length; index += 1) {
      expect(Math.abs(geometry.children[index].left - geometry.children[index - 1].right)).toBeLessThan(2);
    }
  }
});

test('las etapas del recorrido saltan como un resorte de izquierda a derecha', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const journey = page.locator('.journey-map');
  const nodes = journey.locator('.journey-node');
  await journey.scrollIntoViewIfNeeded();
  await expect(journey).toHaveClass(/is-in-view/);

  const contracts = await nodes.evaluateAll((elements) => elements.map((node) => {
    const styles = getComputedStyle(node);
    return {
      name: styles.animationName,
      delay: Number.parseFloat(styles.animationDelay),
      origin: styles.transformOrigin,
    };
  }));
  expect(contracts.every(({ name }) => name.includes('motion-journey-spring-in'))).toBe(true);
  expect(contracts.map(({ delay }) => delay)).toEqual([...contracts.map(({ delay }) => delay)].sort((a, b) => a - b));
  expect(contracts[3].delay).toBeGreaterThan(contracts[0].delay);

  const sample = async (progress: number) => nodes.first().evaluate((node, fraction) => {
    const animation = node.getAnimations().find(
      (candidate) => candidate instanceof CSSAnimation && candidate.animationName === 'motion-journey-spring-in',
    );
    if (!animation) throw new Error('No se encontró el resorte del recorrido');
    const timing = animation.effect?.getComputedTiming();
    if (typeof timing?.duration !== 'number') throw new Error('Duración de animación inválida');
    animation.pause();
    animation.currentTime = (timing.delay ?? 0) + timing.duration * fraction;
    const rect = node.getBoundingClientRect();
    return {
      centerX: rect.x + rect.width / 2,
      width: rect.width,
      opacity: Number.parseFloat(getComputedStyle(node).opacity),
    };
  }, progress);

  const start = await sample(0);
  const overshoot = await sample(0.58);
  const end = await sample(1);
  expect(start.centerX).toBeLessThan(end.centerX - 20);
  expect(start.width).toBeLessThan(end.width * 0.8);
  expect(start.opacity).toBe(1);
  expect(overshoot.width).toBeGreaterThan(end.width * 1.025);
  expect(end.opacity).toBe(1);
});

test('las referencias 6 a 9 construyen el recorrido y los mosaicos en secuencia', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const journey = page.locator('.journey-map');
  await journey.scrollIntoViewIfNeeded();
  await expect(journey).toHaveClass(/is-in-view/);
  const journeySteps = await journey.locator('.journey-node').evaluateAll((nodes) =>
    nodes.map((node) => {
      const styles = getComputedStyle(node);
      return { name: styles.animationName, delay: Number.parseFloat(styles.animationDelay) };
    }),
  );
  expect(journeySteps.every(({ name }) => name.includes('motion-journey-spring-in'))).toBe(true);
  expect(journeySteps.map(({ delay }) => delay)).toEqual([...journeySteps.map(({ delay }) => delay)].sort((a, b) => a - b));
  expect(journeySteps[3].delay).toBeGreaterThan(journeySteps[0].delay);

  const web = page.locator('.service-web');
  await web.scrollIntoViewIfNeeded();
  await expect(web).toHaveClass(/is-in-view/);
  const webSequence = await web.evaluate((card) => {
    const panel = card.querySelector('ul')!;
    return {
      panelAnimations: getComputedStyle(panel).animationName,
      rows: [...panel.querySelectorAll('li')].map((row) => ({
        name: getComputedStyle(row).animationName,
        delay: Number.parseFloat(getComputedStyle(row).animationDelay),
      })),
    };
  });
  expect(webSequence.panelAnimations).toContain('motion-mosaic-backdrop');
  expect(webSequence.panelAnimations).toContain('motion-mosaic-panel');
  expect(webSequence.rows.every(({ name }) => name.includes('motion-mosaic-text'))).toBe(true);
  expect(webSequence.rows[0].delay).toBeGreaterThan(0);
  expect(webSequence.rows[2].delay).toBeGreaterThan(webSequence.rows[0].delay);

  const crm = page.locator('.service-crm');
  await crm.scrollIntoViewIfNeeded();
  await expect(crm).toHaveClass(/is-in-view/);
  const crmSequence = await crm.evaluate((card) => {
    const tiles = [...card.querySelectorAll('.service-art span')].filter(
      (tile) => getComputedStyle(tile).display !== 'none',
    );
    const panel = card.querySelector('ul')!;
    return {
      tiles: tiles.map((tile) => ({
        name: getComputedStyle(tile).animationName,
        delay: Number.parseFloat(getComputedStyle(tile).animationDelay),
      })),
      panelAnimation: getComputedStyle(panel).animationName,
      rows: [...panel.querySelectorAll('li')].map((row) => ({
        name: getComputedStyle(row).animationName,
        delay: Number.parseFloat(getComputedStyle(row).animationDelay),
      })),
    };
  });
  expect(crmSequence.tiles.every(({ name }) => name.includes('motion-mosaic-tile'))).toBe(true);
  expect(crmSequence.tiles[2].delay).toBeGreaterThan(crmSequence.tiles[0].delay);
  expect(crmSequence.panelAnimation).toContain('motion-mosaic-panel');
  expect(crmSequence.rows.every(({ name }) => name.includes('motion-mosaic-text'))).toBe(true);
  expect(crmSequence.rows[0].delay).toBeGreaterThan(crmSequence.tiles[2].delay);

  const automation = page.locator('.service-automation');
  await expect(automation).toHaveClass(/is-in-view/);
  const automationSteps = await automation.locator('.service-art span:visible').evaluateAll((markers) =>
    markers.map((marker) => ({
      name: getComputedStyle(marker).animationName,
      delay: Number.parseFloat(getComputedStyle(marker).animationDelay),
    })),
  );
  expect(automationSteps).toHaveLength(3);
  expect(automationSteps.every(({ name }) => name.includes('motion-automation-step'))).toBe(true);
  expect(automationSteps[2].delay).toBeGreaterThan(automationSteps[0].delay);
});

test('los paneles Web y CRM permanecen opacos durante toda la escalera', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  for (const selector of ['.service-web', '.service-crm']) {
    const card = page.locator(selector);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-in-view/);

    for (const progress of [0, 0.5, 1]) {
      const alpha = await card.locator('ul').evaluate((panel, fraction) => {
        const animation = panel.getAnimations().find(
          (candidate) => candidate instanceof CSSAnimation && candidate.animationName === 'motion-mosaic-panel',
        );
        if (animation) {
          const timing = animation.effect?.getComputedTiming();
          if (typeof timing?.duration === 'number') {
            animation.pause();
            animation.currentTime = (timing.delay ?? 0) + timing.duration * fraction;
          }
        }
        const color = getComputedStyle(panel).backgroundColor;
        const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
        return parts.length === 4 ? parts[3] : 1;
      }, progress);
      expect(alpha).toBe(1);
    }
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
    '.mock-browser, .service-social .service-art span, .service-web li, .service-crm li, .service-automation .service-art span, .journey-node, .property-social, .process-list li b, .team-stamp',
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

test('las referencias 1 a 5 repiten circuitos y pops contenidos al pasar el puntero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const hoverChecks = [
    ['.hero-visual', '.mock-browser', 'motion-hero-browser-pop'],
    ['.mirta-visual', '.property-social', 'motion-case-property-pop'],
    ['.maria-visual', '.legal-browser', 'motion-case-legal-pop'],
  ] as const;

  for (const [containerSelector, layerSelector, expectedAnimation] of hoverChecks) {
    const container = page.locator(containerSelector);
    await container.scrollIntoViewIfNeeded();
    await expect(container).toHaveClass(/is-in-view/);
    await container.hover({ position: { x: 20, y: 20 } });
    await expect(container.locator(layerSelector)).toHaveCSS('animation-name', new RegExp(expectedAnimation));
    await page.mouse.move(0, 0);
  }

  const team = page.locator('.team-stamp');
  await team.scrollIntoViewIfNeeded();
  await expect(team).toHaveClass(/is-in-view/);
  const teamBox = await team.boundingBox();
  expect(teamBox).not.toBeNull();
  await page.mouse.move(teamBox!.x + teamBox!.width / 2, teamBox!.y + teamBox!.height / 2);
  const teamMotion = await team.evaluate((element) => ({
    stamp: getComputedStyle(element).animationName,
    firstRing: getComputedStyle(element, '::before').animationName,
    secondRing: getComputedStyle(element, '::after').animationName,
  }));
  expect(teamMotion.stamp).toContain('motion-team-pop');
  expect(teamMotion.firstRing).toBe('none');
  expect(teamMotion.secondRing).toBe('none');
});

test('los círculos sociales terminan en la roseta de cuatro puntos indicada', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);
  await page.waitForTimeout(1300);

  const layout = await social.evaluate((card) => {
    const cardRect = card.getBoundingClientRect();
    const copy = card.querySelector(':scope > p')!.getBoundingClientRect();
    const list = card.querySelector('ul')!.getBoundingClientRect();
    const intersects = (a: DOMRect, b: DOMRect) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const circles = [...card.querySelectorAll('.service-art span')].map((circle) => {
      const rect = circle.getBoundingClientRect();
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        width: rect.width,
        inCard: rect.left >= cardRect.left && rect.right <= cardRect.right && rect.top >= cardRect.top && rect.bottom <= cardRect.bottom,
        copy: intersects(rect, copy),
        list: intersects(rect, list),
      };
    });
    return circles;
  });

  const [blue, red, yellow, lightBlue] = layout;
  expect(Math.abs(lightBlue.x - yellow.x)).toBeLessThan(16);
  expect(Math.abs(blue.x - red.x)).toBeLessThan(16);
  expect(blue.x - lightBlue.x).toBeGreaterThan(70);
  expect(yellow.y - lightBlue.y).toBeGreaterThan(45);
  expect(red.y - blue.y).toBeGreaterThan(35);

  for (const circle of layout) {
    expect(circle.inCard).toBe(true);
    expect(circle.copy).toBe(false);
    expect(circle.list).toBe(false);
  }
});

test('la roseta social aparece con un fade estable desde baja opacidad', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  const circles = social.locator('.service-art span');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);
  await expect(circles.first()).toHaveCSS('animation-name', /motion-social-fade-in/);

  const sampleFrame = async (progress: number) => circles.evaluateAll((elements, fraction) =>
    elements.map((circle) => {
      const animation = circle.getAnimations().find(
        (candidate) => candidate instanceof CSSAnimation && candidate.animationName === 'motion-social-fade-in',
      );
      if (!animation) throw new Error('No se encontró el fade social');
      const timing = animation.effect?.getComputedTiming();
      if (typeof timing?.duration !== 'number') throw new Error('Duración de animación inválida');
      animation.pause();
      animation.currentTime = (timing.delay ?? 0) + timing.duration * fraction;
      return Number.parseFloat(getComputedStyle(circle).opacity);
    }), progress);

  const start = await sampleFrame(0);
  const middle = await sampleFrame(0.5);
  const end = await sampleFrame(1);
  start.forEach((opacity, index) => {
    expect(opacity).toBeLessThan(0.15);
    expect(middle[index]).toBeGreaterThan(opacity);
    expect(middle[index]).toBeLessThan(1);
    expect(end[index]).toBe(1);
  });
});

test('la roseta social permanece quieta al pasar el puntero', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  const circles = social.locator('.service-art span');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);
  await page.waitForTimeout(1350);

  const resting = await circles.evaluateAll((elements) => elements.map((circle) => {
    const rect = circle.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  }));

  await social.hover({ position: { x: 20, y: 20 } });
  const hoverNames = await circles.evaluateAll((elements) => elements.map((circle) => getComputedStyle(circle).animationName));
  expect(hoverNames.every((name) => name.includes('motion-social-fade-in'))).toBe(true);
  expect(hoverNames.every((name) => name.includes('motion-social-circle-spin-in'))).toBe(true);
  expect(hoverNames.every((name) => !name.includes('hover'))).toBe(true);
  await page.waitForTimeout(500);

  const hovered = await circles.evaluateAll((elements) => elements.map((circle) => {
    const rect = circle.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  }));
  hovered.forEach((circle, index) => {
    expect(Math.abs(circle.x - resting[index].x)).toBeLessThan(0.5);
    expect(Math.abs(circle.y - resting[index].y)).toBeLessThan(0.5);
  });
});

test('cada círculo social recorre su propio giro sin formar un bloque rígido', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  const circles = social.locator('.service-art span');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);

  const contract = await social.evaluate((card) => {
    const art = card.querySelector('.service-art')!;
    const circles = [...art.querySelectorAll('span')];
    return {
      wrapperTransform: getComputedStyle(art).transform,
      wrapperAnimations: art.getAnimations().length,
      circles: circles.map((circle) => {
        const styles = getComputedStyle(circle);
        const spin = circle.getAnimations().find(
          (candidate) => candidate instanceof CSSAnimation
            && candidate.animationName === 'motion-social-circle-spin-in',
        );
        const timing = spin?.effect?.getTiming();
        return {
          names: styles.animationName,
          duration: timing?.duration,
          delay: timing?.delay,
          origin: styles.transformOrigin,
        };
      }),
    };
  });
  expect(contract.wrapperTransform).toBe('none');
  expect(contract.wrapperAnimations).toBe(0);
  expect(contract.circles.every(({ names }) => names.includes('motion-social-circle-spin-in'))).toBe(true);
  expect(new Set(contract.circles.map(({ duration }) => duration)).size).toBe(4);
  expect(new Set(contract.circles.map(({ delay }) => delay)).size).toBeGreaterThan(2);

  const sample = async (progress: number) => circles.evaluateAll((elements, fraction) =>
    elements.map((circle) => {
      const animation = circle.getAnimations().find(
        (candidate) => candidate instanceof CSSAnimation
          && candidate.animationName === 'motion-social-circle-spin-in',
      );
      if (!animation) throw new Error('No se encontró el giro individual social');
      const timing = animation.effect?.getComputedTiming();
      if (typeof timing?.duration !== 'number') throw new Error('Duración de animación inválida');
      animation.pause();
      animation.currentTime = (timing.delay ?? 0) + timing.duration * fraction;
      const rect = circle.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }), progress);

  const start = await sample(0);
  const end = await sample(1);
  const centroid = (points: Array<{ x: number; y: number }>) => ({
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  });
  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  const startCenter = centroid(start);
  const endCenter = centroid(end);

  expect(distance(startCenter, endCenter)).toBeGreaterThan(8);
  const travel = start.map((point, index) => distance(point, end[index]));
  travel.forEach((amount) => {
    expect(amount).toBeGreaterThan(10);
    expect(amount).toBeLessThan(24);
  });

  const pairDistances = (points: Array<{ x: number; y: number }>) => points.flatMap((point, index) =>
    points.slice(index + 1).map((other) => distance(point, other)));
  const startPairs = pairDistances(start);
  const endPairs = pairDistances(end);
  const shapeChanges = startPairs.map((amount, index) => Math.abs(amount - endPairs[index]));
  expect(Math.max(...shapeChanges)).toBeGreaterThan(8);
  expect(shapeChanges.filter((amount) => amount > 4).length).toBeGreaterThanOrEqual(3);

  const verticalDirections = start.map((point, index) => Math.sign(point.y - end[index].y));
  expect(verticalDirections).toContain(-1);
  expect(verticalDirections).toContain(1);
});

test('el fade social permanece fuera del texto y la lista durante toda la entrada', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);

  const sampleFade = async (time: number) => {
    await social.locator('.service-art span').evaluateAll((circles, currentTime) => {
      circles.forEach((circle) => {
        circle.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = currentTime;
        });
      });
    }, time);

    return social.evaluate((card) => {
      const copy = card.querySelector(':scope > p')!.getBoundingClientRect();
      const list = card.querySelector('ul')!.getBoundingClientRect();
      const intersects = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      return [...card.querySelectorAll('.service-art span')].map((circle) => {
        const rect = circle.getBoundingClientRect();
        return { copy: intersects(rect, copy), list: intersects(rect, list) };
      });
    });
  };

  for (const time of [0, 250, 500, 750, 1000, 1300]) {
    expect(await sampleFade(time)).toEqual([
      { copy: false, list: false },
      { copy: false, list: false },
      { copy: false, list: false },
      { copy: false, list: false },
    ]);
  }
});

test('la roseta social protege el título y los bordes en todo el rango de dos columnas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const width of [1201, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const social = page.locator('.service-social');
    const circles = social.locator('.service-art span');
    await social.scrollIntoViewIfNeeded();
    await expect(social).toHaveClass(/is-in-view/);

    for (const time of [0, 250, 500, 750, 1000, 1300]) {
      const geometry = await circles.evaluateAll((elements, currentTime) => {
        elements.forEach((circle) => {
          const spin = circle.getAnimations().find(
            (candidate) => candidate instanceof CSSAnimation
              && candidate.animationName === 'motion-social-circle-spin-in',
          );
          if (!spin) throw new Error('No se encontró el giro social');
          spin.pause();
          spin.currentTime = currentTime;
        });

        const card = elements[0].closest('.service-card')!;
        const cardRect = card.getBoundingClientRect();
        const titleRange = document.createRange();
        titleRange.selectNodeContents(card.querySelector('h3')!);
        const titleRect = titleRange.getBoundingClientRect();
        const circleRects = elements.map((circle) => circle.getBoundingClientRect());
        const verticallyOverlaps = (rect: DOMRect) =>
          Math.min(rect.bottom, titleRect.bottom) > Math.max(rect.top, titleRect.top);

        return {
          titleGap: Math.min(
            ...circleRects.filter(verticallyOverlaps).map((rect) => rect.left - titleRect.right),
          ),
          inCard: circleRects.every((rect) =>
            rect.left >= cardRect.left && rect.right <= cardRect.right
            && rect.top >= cardRect.top && rect.bottom <= cardRect.bottom),
        };
      }, time);

      expect(geometry.titleGap, `${width}px @ ${time}ms`).toBeGreaterThanOrEqual(8);
      expect(geometry.inCard, `${width}px @ ${time}ms`).toBe(true);
    }
  }
});

test('la roseta social conserva su zona de lectura en tablet', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const social = page.locator('.service-social');
  await social.scrollIntoViewIfNeeded();
  await expect(social).toHaveClass(/is-in-view/);
  await page.waitForTimeout(1300);

  const geometry = await social.evaluate((card) => {
    const copy = card.querySelector(':scope > p')!.getBoundingClientRect();
    const list = card.querySelector('ul')!.getBoundingClientRect();
    const intersects = (a: DOMRect, b: DOMRect) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      cardWidth: card.getBoundingClientRect().width,
      circles: [...card.querySelectorAll('.service-art span')].map((circle) => {
        const rect = circle.getBoundingClientRect();
        return { copy: intersects(rect, copy), list: intersects(rect, list) };
      }),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(geometry.cardWidth).toBeGreaterThan(700);
  expect(geometry.circles).toEqual([
    { copy: false, list: false },
    { copy: false, list: false },
    { copy: false, list: false },
    { copy: false, list: false },
  ]);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
});

test('el aro inferior del sello permanece debajo de ESTRATEGIA durante el hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const team = page.locator('.team-stamp');
  await team.scrollIntoViewIfNeeded();
  await expect(team).toHaveClass(/is-in-view/);
  const box = await team.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(team).toHaveCSS('animation-name', /motion-team-pop/);

  const result = await team.evaluate((element) => {
    const orbit = element.getAnimations({ subtree: true }).find((animation) => {
      const effect = animation.effect;
      return effect instanceof KeyframeEffect && effect.pseudoElement === '::after';
    });
    if (orbit) {
      const timing = orbit.effect?.getComputedTiming();
      if (typeof timing?.duration === 'number') {
        orbit.pause();
        orbit.currentTime = (timing.delay ?? 0) + timing.duration * 0.5;
      }
    }
    const styles = getComputedStyle(element, '::after');
    const matrix = new DOMMatrixReadOnly(styles.transform === 'none' ? undefined : styles.transform);
    return {
      bottom: Number.parseFloat(styles.bottom),
      height: element.getBoundingClientRect().height,
      translateY: matrix.m42,
    };
  });

  expect(result.bottom).toBeLessThanOrEqual(result.height * 0.04);
  expect(result.translateY).toBeGreaterThanOrEqual(0);
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

test('si matchMedia lanza una excepción, revela todo y el formulario sigue activo', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => {
        throw new Error('matchMedia unavailable');
      },
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

  const styles = await page.locator(
    '#hero-title, .hero-lede, .service-card h3, .service-web li, .service-crm li, .case-copy h3, .process-list h3',
  ).evaluateAll((elements) =>
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
