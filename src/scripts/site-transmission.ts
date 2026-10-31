const surface = document.querySelector<HTMLElement>('[data-site-transmission]');

function enhanceTransmission(surface: HTMLElement) {
  const canvas = surface.querySelector<HTMLCanvasElement>('canvas')!;
  const context = canvas.getContext('2d', { alpha: true });
  const cutout = surface.querySelector<SVGPathElement>('[data-crt-cutout]')!;
  const warp = surface.querySelector<SVGFEDisplacementMapElement>('[data-crt-warp]')!;
  const drift = surface.querySelector<SVGFEOffsetElement>('[data-crt-drift]')!;
  const toggle = document.querySelector<HTMLButtonElement>('[data-transmission-toggle]')!;
  if (!context) return;
  const ctx = context;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const coarse = matchMedia('(pointer: coarse)');
  const tile = document.createElement('canvas');
  tile.width = tile.height = 128;
  const noiseContext = tile.getContext('2d')!;
  const grain = noiseContext.createImageData(128, 128);
  const anchors = 12;
  // 40% of the previous morph speed: 440ms / .4 = 1100ms per target.
  const morphDuration = 1100;
  const randomShape = () => Float32Array.from({ length: anchors }, () => .48 + Math.random() * 1.04);
  const contourPhase = Math.random() * Math.PI * 2;
  let previous = randomShape(), from = randomShape(), to = randomShape(), next = randomShape();
  let shapeStarted = 0;
  // Smooth random folds plus slow overlapping lobes form a restless plasma
  // outline. Continuous splines keep the wilder shape fluid at the same speed.
  const spline = (a: number, b: number, c: number, d: number, t: number) => {
    const t2 = t * t, t3 = t2 * t;
    return ((1 - t) ** 3 * a + (3 * t3 - 6 * t2 + 4) * b
      + (-3 * t3 + 3 * t2 + 3 * t + 1) * c + t3 * d) / 6;
  };
  let paused = false, suspended = false, active = false, frame = 0, lastDraw = 0;
  let width = innerWidth, height = innerHeight, x = width * .7, y = height * .45;
  const allowed = () => !paused && !suspended && !reduced.matches && !forced.matches && !document.hidden;
  const outerPath = () => `M0 0H${width}V${height}H0Z`;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastDraw = 0; };
  function updatePortraitBeam() {
    const portrait = document.querySelector<HTMLElement>('[data-spatial-portrait]');
    const hero = portrait?.closest('.alien-hero');
    if (!portrait || !hero) return;
    const box = hero.getBoundingClientRect();
    portrait.dataset.transmissionBeam = active && allowed() && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom ? 'active' : 'inactive';
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.25, Math.sqrt(1_400_000 / (width * height)));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    cutout.setAttribute('d', outerPath());
  }
  function draw(time: number) {
    frame = 0;
    if (!allowed()) return;
    frame = requestAnimationFrame(draw);
    if (time - lastDraw < 1000 / 24) return;
    lastDraw = time;
    const seconds = time / 1000;
    if (!shapeStarted) shapeStarted = time;
    while (time - shapeStarted >= morphDuration) {
      previous = from; from = to; to = next; next = randomShape(); shapeStarted += morphDuration;
    }
    const progress = (time - shapeStarted) / morphDuration;
    const radii = Float32Array.from(from, (_, i) => spline(previous[i], from[i], to[i], next[i], progress));
    const radius = Math.min(185, Math.max(115, width * .125)) * .5;
    const phase = contourPhase + time / morphDuration * .35;
    const points: [number, number][] = [];
    for (let index = 0; index < 192; index++) {
      const position = index / 192 * anchors, at = Math.floor(position);
      const fraction = position - at;
      const angle = index / 192 * Math.PI * 2;
      const profile = spline(radii[(at + anchors - 1) % anchors], radii[at], radii[(at + 1) % anchors], radii[(at + 2) % anchors], fraction);
      const folds = (profile - 1) * 4 + .45 * Math.sin(angle * 5 + phase) + .25 * Math.sin(angle * 9 - phase * .7);
      // Deep bays and stretched lobes stay bounded, keeping a clear core and
      // the previous half-size footprint without hard-clamped, flat edges.
      const r = radius * (1 + .48 * Math.tanh(folds));
      points.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
    }
    const hole = active ? `M${points.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L')}Z` : '';
    const inverse = outerPath() + hole;
    cutout.setAttribute('d', inverse);
    warp.setAttribute('scale', String((coarse.matches ? 14 : 23) + Math.sin(seconds * 2.3) * 6));
    drift.setAttribute('dy', String(Math.sin(seconds * .31) * 65));
    ctx.clearRect(0, 0, width, height);
    // Real CRT scanlines and dense phosphor static across every section.
    for (let i = 0; i < grain.data.length; i += 4) {
      const bright = Math.random() > .49;
      grain.data[i] = bright ? 166 : 0;
      grain.data[i + 1] = bright ? 207 : 3;
      grain.data[i + 2] = bright ? 255 : 15;
      grain.data[i + 3] = Math.random() * (coarse.matches ? 50 : 72);
    }
    noiseContext.putImageData(grain, 0, 0);
    const pattern = ctx.createPattern(tile, 'repeat');
    if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, width, height); }
    ctx.fillStyle = 'rgba(0, 3, 15, .38)';
    for (let row = 0; row < height; row += 4) ctx.fillRect(0, row, width, 1.25);
    const trackingY = (seconds * 54) % (height + 240) - 120;
    const band = ctx.createLinearGradient(0, trackingY, 0, trackingY + 160);
    band.addColorStop(0, 'transparent'); band.addColorStop(.42, 'rgba(0, 8, 30, .29)');
    band.addColorStop(.5, 'rgba(116, 212, 255, .24)'); band.addColorStop(.55, 'rgba(0, 3, 18, .48)'); band.addColorStop(1, 'transparent');
    ctx.fillStyle = band; ctx.fillRect(0, trackingY, width, 160);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(1, 6, 28, .45)' : 'rgba(95, 184, 255, .23)';
      ctx.fillRect(0, Math.random() * height, width, 2 + Math.random() * 6);
    }
    if (active) {
      const boundary = new Path2D(hole);
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill(boundary); ctx.restore();
      // Clip every light contribution to the outside too: the interior is
      // entirely untouched, rather than fading static under a colored glow.
      ctx.save(); ctx.clip(new Path2D(inverse), 'evenodd');
      // All light follows the contour: a cobalt corona, cyan bloom and hot
      // neon core. There is no shaft or light source above the cursor.
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(0, 117, 255, .22)'; ctx.lineWidth = 10; ctx.shadowColor = '#008dff'; ctx.shadowBlur = 26; ctx.stroke(boundary);
      ctx.strokeStyle = 'rgba(22, 218, 255, .55)'; ctx.lineWidth = 4.5; ctx.shadowColor = '#00d5ff'; ctx.shadowBlur = 14; ctx.stroke(boundary);
      ctx.strokeStyle = '#60efff'; ctx.lineWidth = 1.5; ctx.shadowBlur = 7; ctx.stroke(boundary);
      ctx.strokeStyle = '#e0ffff'; ctx.lineWidth = .6; ctx.shadowBlur = 3; ctx.stroke(boundary);
      ctx.restore();
    }
  }
  function synchronize() {
    stop();
    const running = allowed();
    surface.dataset.transmissionState = running ? 'running' : paused ? 'paused' : 'static';
    surface.dataset.beam = active && running ? 'active' : 'inactive';
    toggle.hidden = reduced.matches || forced.matches;
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.querySelector('span')!.textContent = paused ? 'Activar interferencia' : 'Pausar interferencia';
    updatePortraitBeam();
    if (running) frame = requestAnimationFrame(draw);
  }
  const pointer = (event: PointerEvent) => {
    if (!allowed()) return;
    if (event.pointerType === 'touch' && event.type !== 'pointerdown' && !active) return;
    x = event.clientX; y = event.clientY; active = true;
    surface.dataset.beam = 'active'; updatePortraitBeam();
  };
  function leave() { active = false; surface.dataset.beam = 'inactive'; updatePortraitBeam(); }
  window.addEventListener('pointermove', pointer, { passive: true });
  window.addEventListener('pointerdown', pointer, { passive: true });
  window.addEventListener('pointerup', event => { if (event.pointerType === 'touch') leave(); }, { passive: true });
  window.addEventListener('pointercancel', leave, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updatePortraitBeam, { passive: true });
  window.addEventListener('pagehide', () => { suspended = true; leave(); synchronize(); });
  window.addEventListener('pageshow', () => { suspended = false; synchronize(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); synchronize(); });
  reduced.addEventListener('change', synchronize); forced.addEventListener('change', synchronize);
  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => { paused = event.detail; leave(); synchronize(); }) as EventListener);
  toggle.addEventListener('click', () => window.dispatchEvent(new CustomEvent('lpm:transmission-pause', { detail: !paused })));
  resize(); synchronize();
}
if (surface) { try { enhanceTransmission(surface); } catch { surface.dataset.transmissionState = 'unavailable'; } }
