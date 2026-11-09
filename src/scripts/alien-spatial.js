function enhancePortrait(portrait) {
  const hero = portrait.closest('.alien-hero');
  const canvas = portrait.querySelector('.spatial-canvas');
  if (!hero || !canvas) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read once, then use event state. Polling the native query during every draw
  // can interfere with change delivery while multiple scenes observe it.
  let reduceMotion = reduced.matches;
  const coarse = matchMedia('(pointer: coarse)');
  let renderer;
  let loading;
  let failed = false;
  let settled = false;
  let paused = false;
  let signalHeld = false;
  let signal = {
    enabled: false, phase: 'locked', frame: -1, present: true,
    beam: { active: false, x: 0, y: 0, radii: new Float32Array(192) },
  };
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
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const canRun = () => !failed && !paused && !signalHeld && !reduceMotion && inView && !document.hidden;
  const reportProgress = (value) => {
    const progress = Math.max(0, Math.min(100, Math.round(value)));
    portrait.dataset.spatialProgress = String(progress);
    window.dispatchEvent(new CustomEvent('lpm:alien-progress', { detail: progress }));
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    greeting = undefined;
    portrait.dataset.spatialMotion = 'idle';
  };
  const reportSettled = (state) => {
    if (settled) return;
    settled = true;
    window.dispatchEvent(new CustomEvent(`lpm:alien-${state}`));
  };
  const fallback = () => {
    failed = true;
    stop();
    renderer?.destroy();
    renderer = undefined;
    portrait.dataset.spatialState = 'unavailable';
    canvas.setAttribute('aria-hidden', 'true');
    reportSettled('unavailable');
  };
  const recordPresentation = () => {
    portrait.dataset.spatialSignal = signal.enabled ? signal.phase : 'locked';
    portrait.dataset.spatialSignalFrame = signal.enabled ? String(signal.frame) : '-1';
  };
  const presentSignal = () => {
    if (!renderer || failed) return;
    // Holding the pose must not hold the postprocess which corrupts that pose.
    const visible = inView && !document.hidden && !reduceMotion && signal.present !== false;
    try {
      if (renderer.signal(signal, visible && (!paused || !signal.enabled))) recordPresentation();
    } catch { fallback(); }
  };
  const draw = () => {
    try {
      if (renderer?.draw(current.x, current.y, coarse.matches)) {
        recordPresentation();
        reportProgress(100);
        reportSettled('ready');
      }
    } catch { fallback(); }
  };
  const tick = (time) => {
    frame = 0;
    if (!renderer || !canRun()) return stop();
    // The hero transmission distorts the cached view. Only redraw the head
    // while its pose changes, and hold that view during a skipping burst.
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
    reportProgress(5);
    loading = (async () => {
      const { createAlienScene } = await import('../lib/alien/alien-scene');
      if (reduceMotion) return;
      reportProgress(15);
      const next = await createAlienScene(canvas, progress => reportProgress(15 + progress * 70));
      reportProgress(92);
      if (reduceMotion || !inView || document.hidden) { next.destroy(); portrait.dataset.spatialState = 'static'; return; }
      renderer = next;
      current = { x: 0, y: 0 };
      target = { ...current };
      geometry();
      presentSignal();
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
      signal = { ...signal, enabled: false, phase: 'locked', frame: -1 };
      presentSignal();
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
    canvas.setAttribute('aria-hidden', String(!renderer || reduceMotion));
  };

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || coarse.matches) return;
    const region = hero.getBoundingClientRect();
    move((event.clientX - region.left) / region.width * 2 - 1, (event.clientY - region.top) / region.height * 2 - 1);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    move(0, 0);
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
    move(0, 0);
  };
  portrait.addEventListener('pointerup', endDrag, { passive: true });
  portrait.addEventListener('pointercancel', endDrag, { passive: true });
  window.addEventListener('blur', endDrag);
  screen.orientation?.addEventListener('change', () => move(0, 0));
  window.addEventListener('lpm:transmission-pause', (event) => { paused = event.detail; synchronize(); });
  hero.addEventListener('lpm:signal-skip', (event) => {
    signalHeld = Boolean(event.detail);
    if (signalHeld) stop();
    else if (canRun() && Math.abs(target.x - current.x) + Math.abs(target.y - current.y) >= .001) move(target.x, target.y);
  });
  hero.addEventListener('lpm:signal-frame', (event) => {
    signal = event.detail;
    presentSignal();
  });

  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); fallback(); });
  canvas.addEventListener('webglcontextrestored', () => { failed = false; synchronize(); });
  reduced.addEventListener('change', (event) => { reduceMotion = event.matches; synchronize(); });
  coarse.addEventListener('change', () => { current = target = { x: 0, y: 0 }; geometry(); synchronize(); });
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('pagehide', stop);
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
