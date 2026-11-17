import { gsap } from 'gsap';

// Original irregular contour informed by the organic boundary in the supplied
// A24 / Backrooms reference, rather than a repeating sine-wave separator.
const root = document.querySelector<HTMLElement>('[data-system-orbit]');
if (root) {
  const paths = Array.from(root.querySelectorAll<SVGPathElement>('[data-orbit-blob]'));
  const alternate = 'M0 0H1440V88C1400 95 1380 72 1320 76S1240 103 1200 91S1120 72 1080 83S1000 79 960 49S880 35 840 44S760 17 720 20S640 43 600 35S520 40 480 68S400 76 360 56S280 65 240 85S160 96 120 71S40 84 0 82Z';
  const media = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
  const contours = paths.map(path => ({
    path,
    initial: path.getAttribute('d')!,
    visible: false,
    motion: gsap.to(path, { attr: { d: alternate }, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }),
  }));
  const sync = () => {
    for (const contour of contours) {
      const running = contour.visible && !document.hidden && !media.matches && root.dataset.orbitPaused !== 'true';
      contour.motion.paused(!running);
      if (media.matches) { contour.motion.progress(0); contour.path.setAttribute('d', contour.initial); }
    }
  };
  const intersection = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const contour = contours.find(contour => contour.path.ownerSVGElement === entry.target);
      if (contour) contour.visible = entry.isIntersecting;
    }
    sync();
  });
  contours.forEach(contour => intersection.observe(contour.path.ownerSVGElement!));
  const pause = new MutationObserver(sync);
  pause.observe(root, { attributes: true, attributeFilter: ['data-orbit-paused'] });
  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('astro:before-swap', () => {
    contours.forEach(contour => contour.motion.kill()); intersection.disconnect(); pause.disconnect();
    media.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  }, { once: true });
}
