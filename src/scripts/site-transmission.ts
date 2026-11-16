import type { AlienSignal } from '../lib/alien/signal-pass';

const surface = document.querySelector<HTMLElement>('[data-site-transmission]');

function enhanceGalaxyClock(surface: HTMLElement) {
  const hero = surface.closest<HTMLElement>('.alien-hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let paused = false, suspended = false, revealing = false, inView = false, active = false, frame = 0, lastDraw = 0;
  let width = hero.clientWidth, height = hero.clientHeight, x = width * .7, y = height * .45;
  let clientX = 0, clientY = 0, signalTime = 0, lastTick = 0;
  let signalTick = 0, warp = 0;
  const allowed = () => inView && !paused && !suspended && !revealing && !reduced.matches && !forced.matches && !document.hidden;
  function emitSignal(enabled: boolean) {
    const detail: AlienSignal = {
      enabled, time: signalTime / 1000, warp,
      present: inView && !suspended && !document.hidden,
      pointer: { active: active && enabled, x, y },
    };
    hero!.dispatchEvent(new CustomEvent<AlienSignal>('lpm:signal-frame', { detail }));
  }
  const stop = () => {
    cancelAnimationFrame(frame); frame = 0; lastDraw = 0; lastTick = 0;
    emitSignal(false);
  };
  function resize() {
    width = hero!.clientWidth; height = hero!.clientHeight;
  }
  function draw(time: number) {
    frame = 0;
    if (!allowed()) return;
    frame = requestAnimationFrame(draw);
    if (time - lastDraw < 1000 / 24) return;
    lastDraw = time;
    // Reflow may move the hero beneath a stationary pointer without firing
    // pointermove or scroll. Keep Galaxy input aligned with the live layout.
    if (active) {
      const box = hero!.getBoundingClientRect();
      x = clientX - box.left; y = clientY - box.top;
      if (x < 0 || y < 0 || x > width || y > height) leave();
    }
    if (lastTick) signalTime += Math.min(time - lastTick, 120);
    lastTick = time;
    surface.dataset.signalTick = String(++signalTick);
    emitSignal(true);
  }
  function synchronize() {
    stop();
    const running = allowed();
    surface.dataset.transmissionState = running ? 'running' : paused ? 'paused' : reduced.matches || forced.matches ? 'static' : 'suspended';
    surface.dataset.galaxyPointer = active && running ? 'active' : 'inactive';
    if (running) frame = requestAnimationFrame(draw);
  }
  const pointer = (event: PointerEvent) => {
    if (!allowed()) return;
    if (event.pointerType === 'touch' && event.type !== 'pointerdown' && !active) return;
    const box = hero!.getBoundingClientRect();
    clientX = event.clientX; clientY = event.clientY;
    x = clientX - box.left; y = clientY - box.top;
    if (x < 0 || y < 0 || x > width || y > height) { leave(); return; }
    active = true;
    surface.dataset.galaxyPointer = 'active';
  };
  function leave() { active = false; surface.dataset.galaxyPointer = 'inactive'; }
  hero.addEventListener('pointermove', pointer, { passive: true });
  hero.addEventListener('pointerdown', pointer, { passive: true });
  hero.addEventListener('click', event => {
    if (!allowed() || !(event.target instanceof Element)) return;
    if (!event.target.closest('a, button, input, textarea, select, summary, label')) warp++;
  });
  window.addEventListener('pointerup', event => { if (event.pointerType === 'touch') leave(); }, { passive: true });
  window.addEventListener('pointercancel', leave, { passive: true });
  hero.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => {
    if (!active) return;
    const box = hero.getBoundingClientRect();
    x = clientX - box.left; y = clientY - box.top;
    if (x < 0 || y < 0 || x > width || y > height) leave();
  }, { passive: true });
  window.addEventListener('pagehide', () => { suspended = true; leave(); synchronize(); });
  window.addEventListener('pageshow', () => { suspended = false; synchronize(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); synchronize(); });
  reduced.addEventListener('change', synchronize); forced.addEventListener('change', synchronize);
  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => { paused = event.detail; leave(); synchronize(); }) as EventListener);
  hero.addEventListener('lpm:hero-reveal', ((event: CustomEvent<boolean>) => { revealing = event.detail; leave(); synchronize(); }) as EventListener);
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) leave();
    synchronize();
  }, { threshold: 0 }).observe(hero);
  resize(); synchronize();
}
if (surface) { try { enhanceGalaxyClock(surface); } catch { surface.dataset.transmissionState = 'unavailable'; } }
