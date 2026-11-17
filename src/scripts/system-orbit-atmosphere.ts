import { gsap } from 'gsap';

// Original irregular contour informed by the organic boundary in the supplied
// A24 / Backrooms reference, rather than a repeating sine-wave separator.
const root = document.querySelector<HTMLElement>('[data-system-orbit]');
if (root) {
  const path = root.querySelector<SVGPathElement>('[data-orbit-blob]')!;
  const initial = path.getAttribute('d')!;
  const alternate = 'M0 0H1440V88C1400 95 1380 72 1320 76S1240 103 1200 91S1120 72 1080 83S1000 79 960 49S880 35 840 44S760 17 720 20S640 43 600 35S520 40 480 68S400 76 360 56S280 65 240 85S160 96 120 71S40 84 0 82Z';
  const media = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
  let visible = false;
  const motion = gsap.to(path, { attr: { d: alternate }, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
  const sync = () => {
    const running = visible && !document.hidden && !media.matches && root.dataset.orbitPaused !== 'true';
    motion.paused(!running);
    if (media.matches) { motion.progress(0); path.setAttribute('d', initial); }
  };
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
  intersection.observe(path.ownerSVGElement!);
  const pause = new MutationObserver(sync);
  pause.observe(root, { attributes: true, attributeFilter: ['data-orbit-paused'] });
  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('astro:before-swap', () => {
    motion.kill(); intersection.disconnect(); pause.disconnect();
    media.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  }, { once: true });
}
