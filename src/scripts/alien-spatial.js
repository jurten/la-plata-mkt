function enhancePortrait(portrait) {
  const hero = portrait.closest('.alien-hero');
  const image = portrait.querySelector('img');
  const canvas = portrait.querySelector('.spatial-canvas');
  const controls = hero?.querySelector('[data-spatial-controls]');
  const toggle = controls?.querySelector('[data-spatial-toggle]');
  const toggleLabel = toggle?.querySelector('span');
  const orientation = controls?.querySelector('[data-spatial-orientation]');
  const hint = controls?.querySelector('[data-spatial-hint]');
  if (!hero || !image || !canvas || !controls || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read once, then use event state. Polling the native query during every draw
  // can interfere with change delivery while multiple scenes observe it.
  let reduceMotion = reduced.matches;
  const coarse = matchMedia('(pointer: coarse)');
  let renderer;
  let loading;
  let failed = false;
  let paused = false;
  let inView = false;
  let frame = 0;
  let lastTime = 0;
  let lastDraw = 0;
  let greeting;
  let greeted = false;
  let current = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let bounds;
  let drag;
  let sensorEnabled = false;
  let sensorOrigin;
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const canRun = () => !failed && !paused && !reduceMotion && inView && !document.hidden;
  const defaultHint = () => coarse.matches ? 'Deslizá de lado para explorar' : 'Mové el cursor para explorar';
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    greeting = undefined;
    portrait.dataset.spatialMotion = 'idle';
  };
  const stopSensor = () => {
    window.removeEventListener('deviceorientation', onOrientation);
    sensorEnabled = false;
    sensorOrigin = undefined;
    if (orientation) {
      orientation.textContent = 'Activar inclinación';
      orientation.setAttribute('aria-pressed', 'false');
    }
  };
  const fallback = () => {
    failed = true;
    stop();
    stopSensor();
    renderer?.destroy();
    renderer = undefined;
    portrait.dataset.spatialState = 'unavailable';
    controls.hidden = true;
  };
  const draw = () => {
    try { renderer?.draw(current.x, current.y, coarse.matches); } catch { fallback(); }
  };
  const tick = (time) => {
    frame = 0;
    if (!renderer || !canRun()) return stop();
    // The global transmission owns the CRT animation. Only redraw the head
    // while its pose changes; the whole-site layer can distort its cached view.
    if (time - lastDraw < 1000 / 24) { frame = requestAnimationFrame(tick); return; }
    lastDraw = time;
    if (greeting) {
      greeting.startedAt ??= time;
      const progress = Math.min((time - greeting.startedAt) / 2400, 1);
      const poses = [[0, 0], [-.55, .08], [.4, -.12], [0, 0]];
      const segment = Math.min(Math.floor(progress * 3), 2);
      const position = progress * 3 - segment;
      const eased = position * position * (3 - 2 * position);
      current = {
        x: poses[segment][0] + (poses[segment + 1][0] - poses[segment][0]) * eased,
        y: poses[segment][1] + (poses[segment + 1][1] - poses[segment][1]) * eased,
      };
      draw();
      if (failed) return;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { current = target = { x: 0, y: 0 }; stop(); }
      return;
    }
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;
    const amount = 1 - Math.exp(-elapsed / 110);
    current.x += (target.x - current.x) * amount;
    current.y += (target.y - current.y) * amount;
    const settled = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < .001;
    if (settled) current = { ...target };
    draw();
    if (failed) return;
    portrait.dataset.spatialMotion = settled ? 'idle' : 'moving';
    if (!settled) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  };
  const move = (x, y) => {
    if (!canRun() || !renderer) return;
    greeting = undefined;
    target = { x: clamp(x), y: clamp(y) };
    portrait.dataset.spatialMotion = 'moving';
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const greet = () => {
    greeted = true;
    greeting = {};
    portrait.dataset.spatialMotion = 'moving';
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const geometry = () => {
    bounds = portrait.getBoundingClientRect();
    if (!renderer || !bounds.width || !bounds.height) return;
    try {
      renderer.resize(bounds.width, bounds.height);
      draw();
    } catch { fallback(); }
  };
  const initialize = () => {
    if (renderer || loading || failed || reduceMotion) return loading;
    portrait.dataset.spatialState = 'loading';
    loading = (async () => {
      await image.decode();
      if (reduceMotion) return;
      const { createAlienScene } = await import('../lib/alien/alien-scene');
      if (reduceMotion) return;
      const next = await createAlienScene(canvas);
      if (reduceMotion || !inView || document.hidden) { next.destroy(); portrait.dataset.spatialState = 'static'; return; }
      renderer = next;
      current = { x: 0, y: 0 };
      target = { ...current };
      geometry();
    })().catch(fallback).finally(() => {
      loading = undefined;
      synchronize();
    });
    return loading;
  };
  const synchronize = () => {
    if (failed) return;
    if (reduceMotion || paused) {
      stop();
      stopSensor();
      if (paused) draw();
      if (reduceMotion) current = target = { x: 0, y: 0 };
      else target = { ...current };
      portrait.dataset.spatialState = reduceMotion ? 'static' : 'paused';
    } else if (renderer) {
      portrait.dataset.spatialState = 'ready';
      if (!canRun()) { stop(); target = { x: 0, y: 0 }; }
      else if (!greeted) greet();
      else if (!greeting) move(target.x, target.y);
    } else if (canRun()) initialize();
    controls.hidden = !renderer || reduceMotion;
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.setAttribute('aria-label', paused ? 'Activar efecto espacial' : 'Pausar efecto espacial');
    if (toggleLabel) toggleLabel.textContent = paused ? 'Activar efecto' : 'Pausar efecto';
    if (hint) hint.textContent = coarse.matches ? defaultHint() : 'Mové el cursor para revelar la señal';
    if (orientation) orientation.hidden = !coarse.matches || paused || !window.isSecureContext || !('DeviceOrientationEvent' in window);
  };

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || coarse.matches || sensorEnabled) return;
    const region = hero.getBoundingClientRect();
    move((event.clientX - region.left) / region.width * 2 - 1, (event.clientY - region.top) / region.height * 2 - 1);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    if (!sensorEnabled) move(0, 0);
  });
  portrait.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }, { passive: true });
  portrait.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) move(dx / 90, dy / 120);
  }, { passive: true });
  const endDrag = () => {
    drag = undefined;
    if (!sensorEnabled) move(0, 0);
  };
  portrait.addEventListener('pointerup', endDrag, { passive: true });
  portrait.addEventListener('pointercancel', endDrag, { passive: true });
  window.addEventListener('blur', () => { endDrag(); stopSensor(); });
  screen.orientation?.addEventListener('change', () => { stopSensor(); move(0, 0); });
  window.addEventListener('lpm:transmission-pause', (event) => { paused = event.detail; synchronize(); });
  toggle.addEventListener('click', () => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: !paused })));

  function onOrientation(event) {
    if (!sensorEnabled || !canRun() || event.gamma == null || event.beta == null) return;
    if (!sensorOrigin) sensorOrigin = { x: event.gamma, y: event.beta };
    let x = (event.gamma - sensorOrigin.x) / 16;
    let y = (event.beta - sensorOrigin.y) / 16;
    const angle = (screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180;
    const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
    y = x * Math.sin(angle) + y * Math.cos(angle);
    x = rotatedX;
    if (Math.abs(x - target.x) + Math.abs(y - target.y) > .01) move(x, y);
  }
  orientation?.addEventListener('click', async () => {
    if (sensorEnabled) { stopSensor(); move(0, 0); return; }
    try {
      // iOS permission is requested only in this explicit user gesture.
      const api = window.DeviceOrientationEvent;
      const permission = typeof api?.requestPermission === 'function' ? await api.requestPermission() : 'granted';
      if (permission !== 'granted' || !canRun()) {
        if (hint) hint.textContent = 'Podés explorar arrastrando el retrato';
        return;
      }
      sensorEnabled = true;
      sensorOrigin = undefined;
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
      orientation.textContent = 'Desactivar inclinación';
      orientation.setAttribute('aria-pressed', 'true');
      if (hint) hint.textContent = 'Incliná suavemente el teléfono';
    } catch {
      if (hint) hint.textContent = 'Podés explorar arrastrando el retrato';
    }
  });

  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); fallback(); });
  canvas.addEventListener('webglcontextrestored', () => { failed = false; synchronize(); });
  image.addEventListener('load', () => {
    if (!renderer) return;
    geometry();
  });
  reduced.addEventListener('change', (event) => { reduceMotion = event.matches; synchronize(); });
  coarse.addEventListener('change', () => { stopSensor(); current = target = { x: 0, y: 0 }; geometry(); synchronize(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSensor(); synchronize(); });
  window.addEventListener('pagehide', () => { stop(); stopSensor(); });
  window.addEventListener('pageshow', synchronize);
  if ('ResizeObserver' in window) new ResizeObserver(geometry).observe(portrait);
  else window.addEventListener('resize', geometry, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { inView = entries.some((entry) => entry.isIntersecting); synchronize(); }, { threshold: 0 }).observe(portrait);
  } else { inView = true; synchronize(); }
}

// This enhancement is isolated: unsupported graphics must never block the site.
for (const portrait of document.querySelectorAll('[data-spatial-portrait]')) {
  try { enhancePortrait(portrait); } catch { portrait.dataset.spatialState = 'unavailable'; }
}
