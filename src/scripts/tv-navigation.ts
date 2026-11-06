const masthead = document.querySelector<HTMLElement>('[data-tv-navigation]');

function enhanceNavigation(header: HTMLElement) {
  const root = document.documentElement;
  const menu = document.querySelector<HTMLElement>('[data-station-menu]')!;
  const toggle = header.querySelector<HTMLButtonElement>('.menu-toggle')!;
  const overlay = document.querySelector<HTMLElement>('[data-tv-transition]')!;
  const shutter = overlay.querySelector<HTMLElement>('[data-tv-shutter]')!;
  const tuning = overlay.querySelector<HTMLElement>('[data-tv-tuning]')!;
  const phosphor = overlay.querySelector<HTMLElement>('[data-tv-phosphor]')!;
  const osd = overlay.querySelector<HTMLElement>('[data-tv-osd]')!;
  const replay = menu.querySelector<HTMLButtonElement>('[data-power-replay]')!;
  const links = [...menu.querySelectorAll<HTMLAnchorElement>('[data-station-link]')];
  const channels = links.map(link => ({
    id: link.hash.slice(1),
    number: link.dataset.channelNumber!,
    label: link.dataset.channelLabel!,
    description: link.dataset.channelDescription!,
    section: document.getElementById(link.hash.slice(1))!,
  }));
  type Channel = typeof channels[number];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let paused = false;
  let isOpen = false;
  let active = channels[0];
  let animations: Animation[] = [];
  let tuneTimer = 0;
  let finishTimer = 0;
  let scrollFrame = 0;
  let pendingTune: (() => void) | undefined;
  let transitionCleanup = () => {};
  let inertElements: { element: HTMLElement; previous: boolean }[] = [];
  const motionAllowed = () => !reduced.matches && !forced.matches && !paused && !document.hidden;

  function clearTransition() {
    transitionCleanup();
    transitionCleanup = () => {};
    clearTimeout(tuneTimer);
    clearTimeout(finishTimer);
    animations.forEach(animation => animation.cancel());
    animations = [];
    pendingTune = undefined;
    overlay.hidden = true;
    root.dataset.tvTransitionState = 'idle';
  }

  function playLoadingTransition(channel: Channel) {
    clearTransition();
    if (!motionAllowed() || !shutter.animate) return;
    overlay.querySelector('[data-tv-osd-number]')!.textContent = `CH ${channel.number}`;
    const loadingLabel = overlay.querySelector<HTMLElement>('[data-tv-osd-label]')!;
    const portrait = document.querySelector<HTMLElement>('[data-spatial-portrait]');
    const showProgress = (value: number) => {
      const progress = Math.max(0, Math.min(100, Math.round(value)));
      loadingLabel.textContent = `CARGANDO ${progress}%`;
    };
    showProgress(Number(portrait?.dataset.spatialProgress ?? 0));
    overlay.hidden = false;
    root.dataset.tvTransitionState = 'power';
    animations.push(shutter.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 2000, fill: 'both' }));
    animations.push(tuning.animate([
      { transform: 'scaleY(.003)', opacity: .7 },
      { transform: 'scaleY(1)', opacity: .28 },
    ], { duration: 140, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    animations.push(phosphor.animate([
      { transform: 'scaleX(.002)', opacity: 1 },
      { transform: 'scaleX(1)', opacity: 1 },
    ], { duration: 110, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    animations.push(osd.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100, fill: 'both' }));

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      transitionCleanup();
      transitionCleanup = () => {};
      clearTimeout(finishTimer);
      animations.forEach(animation => animation.cancel());
      animations = [];
      showProgress(100);
      const duration = 220;
      const aperture = (top: number, bottom: number) => `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 0% ${top}%, 0% ${bottom}%, 100% ${bottom}%, 100% ${top}%, 0% ${top}%)`;
      animations.push(shutter.animate([
        { clipPath: aperture(49.85, 50.15) },
        { clipPath: aperture(0, 100) },
      ], { duration, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
      animations.push(tuning.animate([
        { transform: 'scaleY(.003)', opacity: .42 },
        { transform: 'scaleY(1)', opacity: 0 },
      ], { duration, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
      animations.push(phosphor.animate([
        { transform: 'scaleX(1) scaleY(1)', opacity: 1 },
        { transform: 'scaleX(1) scaleY(4)', opacity: 0 },
      ], { duration: 100, fill: 'both' }));
      animations.push(osd.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'both' }));
      finishTimer = window.setTimeout(clearTransition, duration);
    };
    const onSettled = () => release();
    const onKey = () => release();
    const onProgress = (event: Event) => showProgress((event as CustomEvent<number>).detail);
    window.addEventListener('lpm:alien-ready', onSettled);
    window.addEventListener('lpm:alien-unavailable', onSettled);
    window.addEventListener('lpm:alien-progress', onProgress);
    window.addEventListener('keydown', onKey, { once: true });
    transitionCleanup = () => {
      window.removeEventListener('lpm:alien-ready', onSettled);
      window.removeEventListener('lpm:alien-unavailable', onSettled);
      window.removeEventListener('lpm:alien-progress', onProgress);
      window.removeEventListener('keydown', onKey);
    };
    finishTimer = window.setTimeout(release, 2000);
    if (!portrait || ['ready', 'paused', 'unavailable'].includes(portrait.dataset.spatialState ?? '')) queueMicrotask(release);
  }

  function playTransition(kind: 'power' | 'channel', channel: Channel, onTune?: () => void) {
    clearTransition();
    if (!motionAllowed() || !shutter.animate) { onTune?.(); return; }
    overlay.querySelector('[data-tv-osd-number]')!.textContent = `CH ${channel.number}`;
    overlay.querySelector('[data-tv-osd-label]')!.textContent = channel.label.toLocaleUpperCase('es-AR');
    overlay.hidden = false;
    root.dataset.tvTransitionState = kind;
    const duration = kind === 'power' ? 720 : 460;
    if (kind === 'power') {
      const aperture = (left: number, top: number, right: number, bottom: number) => `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}% ${top}%, ${left}% ${bottom}%, ${right}% ${bottom}%, ${right}% ${top}%, ${left}% ${top}%)`;
      animations.push(shutter.animate([
        { clipPath: aperture(49.9, 49.9, 50.1, 50.1), offset: 0 },
        { clipPath: aperture(0, 49.8, 100, 50.2), offset: .3 },
        { clipPath: aperture(0, 0, 100, 100), offset: 1 },
      ], { duration, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
      animations.push(tuning.animate([
        { transform: 'scale(.002, .002)', opacity: .7 },
        { transform: 'scale(1, .003)', opacity: .65, offset: .25 },
        { transform: 'scale(1)', opacity: 0 },
      ], { duration, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    } else {
      animations.push(shutter.animate([
        { opacity: 0, offset: 0 }, { opacity: .98, offset: .18 },
        { opacity: .98, offset: .36 }, { opacity: 0, offset: 1 },
      ], { duration, fill: 'both' }));
      animations.push(tuning.animate([
        { transform: 'translateY(-100%) skewX(-8deg)', opacity: 0 },
        { transform: 'translateY(-25%) skewX(5deg)', opacity: .75, offset: .3 },
        { transform: 'translateY(100%) skewX(0deg)', opacity: 0 },
      ], { duration, easing: 'ease-out', fill: 'both' }));
    }
    animations.push(osd.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration, fill: 'both' }));
    pendingTune = onTune;
    tuneTimer = window.setTimeout(() => { const tune = pendingTune; pendingTune = undefined; tune?.(); }, kind === 'power' ? 0 : 110);
    finishTimer = window.setTimeout(clearTransition, duration);
  }

  function preview(channel: Channel) {
    menu.querySelector('[data-preview-channel]')!.textContent = `CH ${channel.number}`;
    menu.querySelector('[data-preview-title]')!.textContent = channel.label;
    menu.querySelector('[data-preview-description]')!.textContent = channel.description;
  }

  function setActive(channel: Channel) {
    active = channel;
    header.querySelector('[data-current-channel]')!.textContent = `CH ${channel.number}`;
    document.querySelectorAll<HTMLAnchorElement>('.primary-nav a, [data-station-link]').forEach(link => {
      if (link.hash === `#${channel.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function closeMenu(restoreFocus = false) {
    if (!isOpen) return;
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    delete root.dataset.stationOpen;
    inertElements.forEach(({ element, previous }) => { element.inert = previous; });
    inertElements = [];
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  function openMenu() {
    // Complete a requested destination before interrupting its visual cover.
    const tune = pendingTune;
    clearTransition();
    tune?.();
    isOpen = true;
    preview(active);
    toggle.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    root.dataset.stationOpen = 'true';
    inertElements = [...document.querySelectorAll<HTMLElement>('body > main, body > footer, body > .floating-whatsapp, body > .model-credit, body > .transmission-toggle')].map(element => ({ element, previous: element.inert }));
    inertElements.forEach(({ element }) => { element.inert = true; });
    (links.find(link => link.hash === `#${active.id}`) ?? links[0]).focus({ preventScroll: true });
  }

  function syncScroll() {
    scrollFrame = 0;
    const line = header.getBoundingClientRect().bottom + 100;
    const current = [...channels].reverse().find(channel => channel.section.getBoundingClientRect().top <= line) ?? channels[0];
    if (current !== active) setActive(current);
  }

  toggle.hidden = false;
  root.dataset.menuState = 'ready';
  root.dataset.tvTransitionState = 'idle';
  toggle.addEventListener('click', () => isOpen ? closeMenu(true) : openMenu());
  links.forEach((link, index) => {
    link.addEventListener('pointerenter', () => preview(channels[index]));
    link.addEventListener('focus', () => preview(channels[index]));
  });
  replay.addEventListener('click', () => { closeMenu(true); playTransition('power', active); });

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.hash === '#contenido') return;
    let id: string;
    try { id = decodeURIComponent(link.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const fromMenu = menu.contains(link);
    const keyboard = event.detail === 0;
    const targetTop = target.getBoundingClientRect().top;
    const channel = [...channels].reverse().find(item => item.section.getBoundingClientRect().top <= targetTop + 1) ?? channels[0];
    closeMenu();
    setActive(channel);
    const tune = () => {
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (fromMenu || keyboard) {
        const focusTarget = target.querySelector<HTMLElement>('h1, h2, h3') ?? target;
        if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: true });
      }
      document.querySelector('[data-channel-announcement]')!.textContent = `Canal ${channel.number}: ${channel.label}.`;
    };
    playTransition('channel', channel, tune);
  });

  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...header.querySelectorAll<HTMLElement>('a, button:not([disabled])'), ...menu.querySelectorAll<HTMLElement>('a, button:not([disabled])')].filter(element => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  function updateMotion() {
    root.dataset.tvMotion = motionAllowed() ? 'animated' : 'static';
    replay.disabled = !motionAllowed();
    if (!motionAllowed()) {
      const tune = pendingTune;
      clearTransition();
      tune?.();
    }
  }
  reduced.addEventListener('change', updateMotion);
  forced.addEventListener('change', updateMotion);
  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => { paused = event.detail; updateMotion(); }) as EventListener);
  document.addEventListener('visibilitychange', updateMotion);
  window.addEventListener('pagehide', () => { closeMenu(); clearTransition(); });
  window.addEventListener('popstate', () => { clearTransition(); closeMenu(); requestAnimationFrame(syncScroll); });
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll); }, { passive: true });
  window.addEventListener('resize', syncScroll, { passive: true });
  setActive(active);
  syncScroll();
  updateMotion();
  // Direct links arrive at their destination without an unrelated opening.
  let bootSeen = false;
  try {
    bootSeen = sessionStorage.getItem('lpm-tv-boot') === 'seen';
    sessionStorage.setItem('lpm-tv-boot', 'seen');
  } catch { /* Storage may be unavailable; the fail-open timer still applies. */ }
  if (!location.hash && !bootSeen) playLoadingTransition(active);
}

if (masthead) enhanceNavigation(masthead);
