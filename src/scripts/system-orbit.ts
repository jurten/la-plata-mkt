import { getTranslator } from '../lib/i18n';
import { createEngine } from '../lib/orbit-images-engine.js';
import { createSystemGallery } from './system-circular-gallery';

const t = getTranslator(window.location.pathname);

function initialize(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-orbit-stage]')!;
  const path = stage.querySelector<SVGPathElement>('[data-orbit-path]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-orbit-toggle]')!;
  const toggleLabel = toggle.querySelector<HTMLElement>('[data-orbit-toggle-label]')!;
  const compact = matchMedia('(max-width: 1250px)');
  const forced = matchMedia('(forced-colors: active)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const config = { current: {
    baseWidth: 1400, rotation: -8, duration: 30, itemSize: 110,
    direction: 'normal', fill: true, pathWidth: 1, pathDash: 0,
    easing: 'linear', paused: false, depth: .05, hoverScale: 1.01,
    hoverSpeed: 1, draggable: true, clickToFront: true,
    alignToPath: false, intro: true, sources: [] as string[],
  } };
  let engine: ReturnType<typeof createEngine> | undefined;
  let gallery: ReturnType<typeof createSystemGallery>;
  let generation = 0;
  let paused = false;
  let sharedPause = false;
  function controls() {
    config.current.paused = paused || sharedPause;
    root.dataset.orbitPaused = String(config.current.paused);
    toggle.hidden = reduced.matches || forced.matches || compact.matches;
    toggleLabel.textContent = compact.matches
      ? (paused ? t("Reanudar recorrido") : t("Pausar recorrido"))
      : (paused ? t('Reanudar órbita') : t('Pausar órbita'));
    toggle.setAttribute('aria-pressed', String(paused));
    engine?.wake();
    gallery?.pause(config.current.paused);
  }
  function configure() {
    const current = ++generation;
    gallery?.destroy();
    gallery = null;
    engine?.destroy();
    engine = undefined;
    delete stage.dataset.orbitReady;
    stage.removeAttribute('data-intro');
    stage.removeAttribute('data-dragging');
    stage.style.removeProperty('aspect-ratio');
    stage.querySelectorAll<HTMLElement>('[data-orbit-item]').forEach(item => item.removeAttribute('style'));
    if (forced.matches) { controls(); return; }
    if (compact.matches) {
      controls();
      if (!reduced.matches) void document.fonts.ready.then(() => {
        if (generation !== current) return;
        gallery = createSystemGallery(stage);
        controls();
      });
      return;
    }
    const rx = 340;
    const ry = 110;
    path.setAttribute('d', `M ${700-rx} 700 A ${rx} ${ry} 0 1 0 ${700+rx} 700 A ${rx} ${ry} 0 1 0 ${700-rx} 700`);
    path.setAttribute('transform', 'rotate(-8 700 700)');
    stage.querySelectorAll<SVGPathElement>('[data-orbit-stroke]').forEach(stroke => {
      stroke.setAttribute('d', path.getAttribute('d')!);
      stroke.setAttribute('transform', 'rotate(-8 700 700)');
    });
    // Start in the spaced layout; the fan-out intro stacks these text cards.
    config.current.intro = false;
    stage.dataset.orbitReady = '';
    if (config.current.intro) stage.dataset.intro = '';
    // The supplied engine measures the rotated path plus its item margins.
    stage.style.aspectRatio = '2.4';
    engine = createEngine(stage, config, (aspect: number) => { stage.style.aspectRatio = String(aspect); });
    engine.refresh();
    controls();
  }
  const click = () => { paused = !paused; controls(); };
  const pause = (event: Event) => { sharedPause = (event as CustomEvent<boolean>).detail; controls(); };
  const motion = () => { if (compact.matches) configure(); else controls(); };
  toggle.addEventListener('click', click);
  compact.addEventListener('change', configure);
  forced.addEventListener('change', configure);
  reduced.addEventListener('change', motion);
  window.addEventListener('lpm:transmission-pause', pause);
  configure();
  document.addEventListener('astro:before-swap', () => {
    generation++;
    gallery?.destroy();
    engine?.destroy();
    toggle.removeEventListener('click', click);
    compact.removeEventListener('change', configure);
    forced.removeEventListener('change', configure);
    reduced.removeEventListener('change', motion);
    window.removeEventListener('lpm:transmission-pause', pause);
  }, { once: true });
}

document.querySelectorAll<HTMLElement>('[data-system-orbit]').forEach(initialize);
