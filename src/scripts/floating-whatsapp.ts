const button = document.querySelector<HTMLAnchorElement>('[data-floating-whatsapp]');

if (button) {
  const visual = button.querySelector<HTMLElement>('.whatsapp-visual')!;
  const path = button.querySelector<SVGPathElement>('[data-whatsapp-contour]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const forced = matchMedia('(forced-colors: active)');
  const allowed = () => fine.matches && !reduced.matches && !forced.matches && !document.hidden;
  const anchors = 12;
  const followRadius = 96;
  const maxTravel = 84;
  const randomShape = () => Float32Array.from({ length: anchors }, () => .48 + Math.random() * 1.04);
  const spline = (a: number, b: number, c: number, d: number, t: number) =>
    ((1 - t) ** 3 * a + (3 * t ** 3 - 6 * t * t + 4) * b
      + (-3 * t ** 3 + 3 * t * t + 3 * t + 1) * c + t ** 3 * d) / 6;
  let previous = randomShape(), from = randomShape(), to = randomShape(), next = randomShape();
  let frame = 0, lastTime = 0, shapeTime = 0, phase = 0;
  let x = 0, y = 0, vx = 0, vy = 0, amount = 0, amountVelocity = 0;
  let targetX = 0, targetY = 0;
  let state: 'idle' | 'active' | 'returning' = 'idle';
  const setState = (value: typeof state) => { state = value; button.dataset.splashState = value; };
  const circle = 'M28 0A28 28 0 1 1-28 0A28 28 0 1 1 28 0Z';

  function reset() {
    cancelAnimationFrame(frame);
    frame = lastTime = 0;
    x = y = vx = vy = amount = amountVelocity = targetX = targetY = 0;
    visual.style.removeProperty('transform');
    path.setAttribute('d', circle);
    setState('idle');
  }
  function draw(time: number) {
    frame = 0;
    if (!allowed()) { reset(); return; }
    const dt = Math.min((time - (lastTime || time - 16.67)) / 1000, .1);
    lastTime = time;
    // Track closely while held, then release into a softer, oscillating spring.
    // Keep velocity through both transitions so the return never snaps.
    const held = state === 'active';
    const stiffness = held ? 650 : 155;
    const damping = held ? 44 : 8;
    // Small simulation steps keep the spring stable at lower rendering rates.
    const steps = Math.ceil(dt / (1 / 120));
    const step = dt / steps;
    for (let i = 0; i < steps; i++) {
      vx += ((targetX - x) * stiffness - vx * damping) * step;
      vy += ((targetY - y) * stiffness - vy * damping) * step;
      x += vx * step; y += vy * step;
      const distance = Math.hypot(x, y);
      if (distance > maxTravel) { x *= maxTravel / distance; y *= maxTravel / distance; }
      amountVelocity += (((held ? 1 : 0) - amount) * (held ? 210 : 100)
        - amountVelocity * (held ? 21 : 7)) * step;
      amount += amountVelocity * step;
    }
    if (state === 'active') { shapeTime += dt * 1000; phase += dt / 1.1 * .35; }
    while (shapeTime >= 1100) {
      previous = from; from = to; to = next; next = randomShape(); shapeTime -= 1100;
    }
    const radii = Float32Array.from(from, (_, i) => spline(previous[i], from[i], to[i], next[i], shapeTime / 1100));
    const points: string[] = [];
    for (let i = 0; i < 96; i++) {
      const position = i / 96 * anchors, at = Math.floor(position), angle = i / 96 * Math.PI * 2;
      const profile = spline(radii[(at + 11) % anchors], radii[at], radii[(at + 1) % anchors], radii[(at + 2) % anchors], position - at);
      const folds = (profile - 1) * 4 + .45 * Math.sin(angle * 5 + phase)
        + .25 * Math.sin(angle * 9 - phase * .7);
      const radius = 28 * (1 + .22 * amount * Math.tanh(folds));
      points.push(`${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`);
    }
    path.setAttribute('d', `M${points.join('L')}Z`);
    visual.style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`;
    if (state === 'returning' && Math.hypot(x, y) < .04 && Math.hypot(vx, vy) < .3
      && Math.abs(amount) < .002 && Math.abs(amountVelocity) < .02) { reset(); return; }
    frame = requestAnimationFrame(draw);
  }
  function startFrame() { if (!frame) { lastTime = 0; frame = requestAnimationFrame(draw); } }
  function release() {
    if (state !== 'active') return;
    targetX = targetY = 0;
    setState('returning');
    startFrame();
  }
  function track(event: PointerEvent) {
    if (state !== 'active') return;
    const box = button!.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > followRadius) { release(); return; }
    const pull = Math.min(.9, maxTravel / Math.max(distance, 1));
    // Follow almost to the pointer while keeping the complete button on screen.
    targetX = Math.max(6 - box.left, Math.min(innerWidth - 6 - box.right, dx * pull));
    targetY = Math.max(6 - box.top, Math.min(innerHeight - 6 - box.bottom, dy * pull));
  }
  button.addEventListener('pointerenter', event => {
    if (!allowed() || event.pointerType === 'touch' || button.inert) return;
    setState('active'); track(event); startFrame();
  });
  window.addEventListener('pointermove', track, { passive: true });
  document.documentElement.addEventListener('pointerleave', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  window.addEventListener('scroll', release, { passive: true });
  window.addEventListener('resize', release, { passive: true });
  window.addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  new MutationObserver(() => { if (button.inert) reset(); }).observe(button, { attributes: true, attributeFilter: ['inert'] });
  for (const media of [reduced, fine, forced]) media.addEventListener('change', reset);
  reset();
}
