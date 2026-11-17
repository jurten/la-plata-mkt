import { createEngine } from '../lib/orbit-images-engine.js';

function initialize(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-orbit-stage]')!;
  const path = stage.querySelector<SVGPathElement>('[data-orbit-path]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-orbit-toggle]')!;
  const mobile = matchMedia('(max-width: 700px)');
  const forced = matchMedia('(forced-colors: active)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const config = { current: {
    baseWidth: 1400, rotation: -8, duration: 30, itemSize: 90,
    direction: 'normal', fill: true, pathWidth: 1, pathDash: 0,
    easing: 'linear', paused: false, depth: .6, hoverScale: 1.08,
    hoverSpeed: 1, draggable: true, clickToFront: true,
    alignToPath: false, intro: true, sources: [] as string[],
  } };
  let engine: ReturnType<typeof createEngine> | undefined;
  let paused = false;
  let sharedPause = false;
  function controls() {
    config.current.paused = paused || sharedPause;
    toggle.hidden = reduced.matches || forced.matches;
    toggle.textContent = paused ? 'Reanudar órbita' : 'Pausar órbita';
    toggle.setAttribute('aria-pressed', String(paused));
    engine?.wake();
  }
  function configure() {
    engine?.destroy();
    engine = undefined;
    delete stage.dataset.orbitReady;
    stage.removeAttribute('data-intro');
    stage.removeAttribute('data-dragging');
    stage.style.removeProperty('aspect-ratio');
    stage.querySelectorAll<HTMLElement>('[data-orbit-item]').forEach(item => item.removeAttribute('style'));
    if (forced.matches) { controls(); return; }
    const rx = mobile.matches ? 82 : 340;
    const ry = mobile.matches ? 240 : 80;
    path.setAttribute('d', `M ${700-rx} 700 A ${rx} ${ry} 0 1 0 ${700+rx} 700 A ${rx} ${ry} 0 1 0 ${700-rx} 700`);
    path.setAttribute('transform', 'rotate(-8 700 700)');
    stage.querySelectorAll<SVGPathElement>('[data-orbit-stroke]').forEach(stroke => {
      stroke.setAttribute('d', path.getAttribute('d')!);
      stroke.setAttribute('transform', 'rotate(-8 700 700)');
    });
    config.current.intro = !reduced.matches;
    stage.dataset.orbitReady = '';
    if (config.current.intro) stage.dataset.intro = '';
    // The supplied engine measures the rotated path plus its item margins.
    stage.style.aspectRatio = mobile.matches ? '.5' : '2.4';
    engine = createEngine(stage, config, (aspect: number) => { stage.style.aspectRatio = String(aspect); });
    engine.refresh();
    controls();
  }
  const click = () => { paused = !paused; controls(); };
  const pause = (event: Event) => { sharedPause = (event as CustomEvent<boolean>).detail; controls(); };
  toggle.addEventListener('click', click);
  mobile.addEventListener('change', configure);
  forced.addEventListener('change', configure);
  reduced.addEventListener('change', controls);
  window.addEventListener('lpm:transmission-pause', pause);
  configure();
  document.addEventListener('astro:before-swap', () => {
    engine?.destroy();
    toggle.removeEventListener('click', click);
    mobile.removeEventListener('change', configure);
    forced.removeEventListener('change', configure);
    reduced.removeEventListener('change', controls);
    window.removeEventListener('lpm:transmission-pause', pause);
  }, { once: true });
}

document.querySelectorAll<HTMLElement>('[data-system-orbit]').forEach(initialize);
