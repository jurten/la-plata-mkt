// GooeyNav-style droplet travel, retaining the official LPM eye silhouette.
export function enhanceGooeyNavigation(nav: HTMLElement, motionAllowed: () => boolean) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('nav-goo');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><filter id="nav-liquid" x="-30%" y="-100%" width="160%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2.4"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs><g filter="url(#nav-liquid)"></g>`;
  const group = svg.querySelector('g')!;
  const eye = document.createElementNS(ns, 'image');
  eye.setAttribute('href', '/brand/lpm-eye.svg');
  // The source uses currentColor (black in an external SVG); invert to brand ink.
  eye.style.filter = 'invert(1)';
  group.append(eye);
  nav.prepend(svg);
  nav.dataset.gooey = 'ready';
  let frame = 0;
  let clicked: HTMLAnchorElement | undefined;
  let destination: HTMLAnchorElement | undefined;
  let position: { x: number; y: number; w: number; h: number } | undefined;
  const drops: SVGCircleElement[] = [];
  const clear = () => { cancelAnimationFrame(frame); frame = 0; drops.splice(0).forEach(drop => drop.remove()); };
  const drawEye = (box: NonNullable<typeof position>, scale = 1) => {
    eye.setAttribute('x', String(box.x + box.w * (1 - scale) / 2));
    eye.setAttribute('y', String(box.y + box.h * (1 - scale) / 2));
    eye.setAttribute('width', String(box.w * scale));
    eye.setAttribute('height', String(box.h * scale));
  };
  function update(animate = true) {
    const target = links.find(link => link.hasAttribute('aria-current'));
    if (target === destination && animate) return;
    destination = target;
    clear();
    links.forEach(link => link.toggleAttribute('data-gooey-target', link === target));
    if (!target || !nav.getClientRects().length) { svg.style.visibility = 'hidden'; position = undefined; return; }
    const outer = nav.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${outer.width} ${outer.height}`);
    const end = { x: rect.left - outer.left, y: rect.top - outer.top, w: rect.width, h: rect.height };
    svg.style.visibility = 'visible';
    const start = position;
    if (!start || !animate || !motionAllowed()) { position = end; drawEye(end); return; }
    const particles = Array.from({ length: 15 }, () => {
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('fill', 'white');
      group.prepend(circle);
      drops.push(circle);
      return { circle, scatter: (Math.random() - .5) * 56, delay: Math.random() * .18, radius: 2 + Math.random() * 4 };
    });
    const began = performance.now();
    const tick = (now: number) => {
      if (!motionAllowed()) { clear(); position = end; drawEye(end); return; }
      const t = Math.min(1, (now - began) / 780);
      const ease = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      position = { x: start.x + (end.x - start.x) * ease, y: start.y + (end.y - start.y) * ease, w: end.w, h: end.h };
      drawEye(position, 1 - .2 * Math.sin(Math.PI * t));
      for (const { circle, scatter, delay, radius } of particles) {
        const p = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
        const travel = p * p * (3 - 2 * p);
        circle.setAttribute('cx', String(start.x + start.w / 2 + (end.x + end.w / 2 - start.x - start.w / 2) * travel));
        circle.setAttribute('cy', String(start.y + start.h / 2 + (end.y + end.h / 2 - start.y - start.h / 2) * travel + Math.sin(Math.PI * p) * scatter));
        circle.setAttribute('r', String(radius * Math.sin(Math.PI * p)));
      }
      if (t < 1) frame = requestAnimationFrame(tick);
      else { clear(); position = end; drawEye(end); }
    };
    frame = requestAnimationFrame(tick);
  }
  nav.addEventListener('click', event => {
    const mouse = event as MouseEvent;
    if (mouse.button !== 0 || mouse.metaKey || mouse.ctrlKey || mouse.altKey || mouse.shiftKey || event.defaultPrevented) return;
    clicked = (event.target as Element).closest<HTMLAnchorElement>('a') ?? undefined;
    // Selection is applied synchronously by the existing document click handler.
    setTimeout(() => { clicked = undefined; }, 0);
  });
  new MutationObserver(() => {
    const target = links.find(link => link.hasAttribute('aria-current'));
    update(Boolean(clicked && clicked === target));
  }).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  new ResizeObserver(() => update(false)).observe(nav);
  document.fonts.ready.then(() => update(false));
  document.addEventListener('visibilitychange', () => update(false));
  window.addEventListener('lpm:transmission-pause', () => update(false));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => update(false));
  matchMedia('(forced-colors: active)').addEventListener('change', () => update(false));
  update(false);
}
