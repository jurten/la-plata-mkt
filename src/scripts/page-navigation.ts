import { pageId, pages } from '../lib/navigation';

const pendingKey = 'lpm-nav-pending';

export function enhancePageNavigation(motionAllowed: () => boolean, beforeLeave: () => void) {
  const root = document.documentElement;
  const cover = document.querySelector<HTMLElement>('[data-page-transition]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
  let animation: Animation | undefined;
  let leaving = false;
  let navigatingTo: string | undefined;
  let recoveryTimer = 0;
  const circle = (radius: number) => {
    // An even-odd polygon makes a circular aperture in an opaque full-screen cover.
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const points = Array.from({ length: 65 }, (_, index) => {
      const angle = index / 64 * Math.PI * 2;
      return `${cx + Math.cos(angle) * radius}px ${cy + Math.sin(angle) * radius}px`;
    });
    return `polygon(evenodd, 0px 0px, ${innerWidth}px 0px, ${innerWidth}px ${innerHeight}px, 0px ${innerHeight}px, 0px 0px, ${points.join(', ')})`;
  };
  function reset() {
    animation?.cancel();
    animation = undefined;
    clearTimeout(recoveryTimer);
    delete root.dataset.navArrival;
    delete root.dataset.navigationPhase;
    cover.hidden = true;
    leaving = false;
    navigatingTo = undefined;
  }
  async function animateCover(entering: boolean) {
    const radius = Math.hypot(innerWidth, innerHeight) / 2 + 4;
    const frames = [{ clipPath: circle(entering ? radius : 0) }, { clipPath: circle(entering ? 0 : radius) }];
    animation = cover.animate(frames, { duration: entering ? 240 : 480, easing: 'cubic-bezier(.65, 0, .2, 1)', fill: 'both' });
    try { await animation.finished; } catch { /* Motion changes and bfcache restores cancel cleanly. */ }
  }
  function labelDestination(href: string) {
    const id = pageId(new URL(href).pathname);
    const number = id === 'home' ? '01' : id === 'work' ? '02' : id === 'about' ? '03' : id === 'contact' ? '04' : '05';
    const en = new URL(href).pathname.startsWith('/en/');
    const labels = en ? { home: 'Home', work: 'Work', about: 'About', contact: 'Contact', privacy: 'Privacy' } : Object.fromEntries(Object.entries(pages).map(([key, page]) => [key, page.label]));
    cover.querySelector('[data-page-channel]')!.textContent = `CH ${number}`;
    cover.querySelector('[data-page-label]')!.textContent = id ? labels[id].toLocaleUpperCase(en ? 'en' : 'es-AR') : 'LPM';
  }
  function internalPage(link: HTMLAnchorElement) {
    if (link.hasAttribute('download') || (link.target && link.target !== '_self') || link.relList.contains('external') || link.hasAttribute('data-no-transition')) return false;
    const url = new URL(link.href);
    return url.origin === location.origin && /^https?:$/.test(url.protocol) && Boolean(pageId(url.pathname)) && (url.pathname !== location.pathname || url.search !== location.search);
  }
  async function navigate(href: string) {
    if (leaving) return;
    beforeLeave();
    if (!motionAllowed() || !cover.animate) { location.assign(href); return; }
    try {
      // An unavailable storage bridge cannot safely hide the incoming document.
      sessionStorage.setItem(pendingKey, JSON.stringify({ href, created: Date.now() }));
    } catch { location.assign(href); return; }
    leaving = true;
    navigatingTo = href;
    labelDestination(href);
    cover.hidden = false;
    root.dataset.navigationPhase = 'covering';
    await animateCover(true);
    if (!leaving) return;
    root.dataset.navigationPhase = 'loading';
    location.assign(href);
    recoveryTimer = window.setTimeout(() => {
      sessionStorage.removeItem(pendingKey);
      reset();
    }, 12000);
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || !internalPage(link)) return;
    event.preventDefault();
    void navigate(link.href);
  });
  // The language selector finishes its own feedback and saves form drafts first.
  window.addEventListener('lpm:navigate', event => {
    const href = (event as CustomEvent<string>).detail;
    const link = document.createElement('a');
    link.href = href;
    if (!internalPage(link)) return;
    event.preventDefault();
    void navigate(href);
  });
  const releaseMotion = () => {
    if (!motionAllowed()) {
      const href = navigatingTo;
      reset();
      if (href) location.assign(href);
    }
  };
  reduced.addEventListener('change', releaseMotion);
  window.addEventListener('lpm:transmission-pause', releaseMotion);
  window.addEventListener('pagehide', reset);
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  if (root.dataset.navArrival === 'pending') {
    labelDestination(location.href);
    cover.hidden = false;
    root.dataset.navArrival = 'covered';
    root.dataset.navigationPhase = 'loading';
    const domReady = document.readyState === 'loading' ? new Promise<void>(resolve => document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })) : Promise.resolve();
    const ready = domReady.then(async () => {
      const visibleImages = [...document.images].filter(img => img.loading !== 'lazy' && img.getBoundingClientRect().top < innerHeight && img.getBoundingClientRect().bottom > 0);
      const portrait = document.querySelector<HTMLElement>('[data-spatial-portrait]');
      const alien = !portrait || ['ready', 'paused', 'unavailable'].includes(portrait.dataset.spatialState ?? '') ? Promise.resolve() : new Promise<void>(resolve => {
        const settled = () => { window.removeEventListener('lpm:alien-ready', settled); window.removeEventListener('lpm:alien-unavailable', settled); resolve(); };
        window.addEventListener('lpm:alien-ready', settled);
        window.addEventListener('lpm:alien-unavailable', settled);
        window.setTimeout(settled, 1800);
      });
      await Promise.all([document.fonts.ready, alien, ...visibleImages.map(img => img.decode().catch(() => {}))]);
    });
    void Promise.race([ready, new Promise(resolve => window.setTimeout(resolve, 2000))]).then(() => {
      if (!motionAllowed() || cover.hidden) { reset(); return; }
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        root.dataset.navigationPhase = 'revealing';
        await animateCover(false);
        reset();
      }));
    });
  }
}
