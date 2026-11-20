import { gsap } from 'gsap';

// Original irregular contour informed by the organic boundary in the supplied
// A24 / Backrooms reference, rather than a repeating sine-wave separator.
const root = document.querySelector<HTMLElement>('[data-system-orbit]');
if (root) {
  const paths = Array.from(root.querySelectorAll<SVGPathElement>('[data-orbit-blob]'));
  const media = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
  const contours = paths.map((path, index) => {
    const initial = path.getAttribute('d')!;
    const phase = index * 2.7;
    // Correlated motion travels along the original contour. Each region has
    // its own rhythm instead of every lobe stopping and reversing together.
    const flow = (x: number, time: number) =>
      10 * Math.sin(x * .006 - time * 1.35 + phase)
      + 5 * Math.sin(x * .012 + time * .83 + phase * 1.3)
      + 2 * Math.sin(x * .021 - time * 1.91 + phase * .7);
    const segments = Array.from(initial.matchAll(/([A-Z])([^A-Z]*)/g), match => ({
      command: match[1],
      values: (match[2].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number),
    }));
    const render = (time: number) => {
      path.setAttribute('d', segments.map(({ command, values }) => {
        if (command !== 'V' && command !== 'C' && command !== 'S') return command + values.join(' ');
        return command + values.map((value, coordinate) => {
          if (command !== 'V' && coordinate % 2 === 0) return value;
          const x = command === 'V' ? 1440 : values[coordinate - 1];
          // Taper at the SVG bounds to retain the silhouette without clipping.
          const displacement = (flow(x, time) - flow(x, 0)) * Math.sin(value / 120 * Math.PI);
          return (value + displacement).toFixed(2);
        }).join(' ');
      }).join(''));
    };
    return {
      path,
      initial,
      visible: false,
      motion: gsap.to({ time: 0 }, {
        time: 1, duration: 1, repeat: -1, ease: 'none', paused: true,
        onUpdate: function () { render(this.totalTime()); },
      }),
    };
  });
  const sync = () => {
    for (const contour of contours) {
      const running = contour.visible && !document.hidden && !media.matches && root.dataset.orbitPaused !== 'true';
      contour.motion.paused(!running);
      if (media.matches) { contour.motion.totalTime(0); contour.path.setAttribute('d', contour.initial); }
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
