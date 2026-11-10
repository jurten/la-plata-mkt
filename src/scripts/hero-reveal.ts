import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnchorRequest = { target: HTMLElement; top?: number };

function enhanceReveal(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>('#inicio')!;
  const services = root.querySelector<HTMLElement>('#soluciones')!;
  const heroTrack = root.querySelector<HTMLElement>('[data-hero-track]')!;
  const servicesTrack = root.querySelector<HTMLElement>('[data-services-track]')!;
  const visual = root.querySelector<HTMLElement>('[data-hero-visual]')!;
  const windowSurface = root.querySelector<HTMLElement>('[data-hero-window]')!;
  const parallax = root.querySelector<HTMLElement>('[data-hero-parallax]')!;
  const silhouette = root.querySelector<SVGPathElement>('[data-hero-silhouette]')!;
  const copy = [...hero.querySelectorAll<HTMLElement>('.hero-copy, .hero-footer')];
  const originalHeroInert = hero.inert;
  const originalServicesInert = services.inert;
  let initialArrival = true;
  let paused = false;
  let media: gsap.MatchMedia;
  let restoreFrame = 0;
  let pendingReadingOffset: number | undefined;
  const scrollTo = (top: number) => {
    ScrollTrigger.getScrollFunc(window)(top);
    ScrollTrigger.update();
  };

  function configure() {
    media?.revert();
    media = gsap.matchMedia();
    if (paused) return;
    media.add('(prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
      let height = 0, viewport = 0, width = 0, lead = 0, distance = 0;
      let cover = 0, fit = 0, centerY = 0, start = 0, end = 0, servicesTop = 0, focusY = 0;
      let revealing = false;
      let refreshFrame = 0;
      let alive = true;
      const naturalServicesTop = services.getBoundingClientRect().top + scrollY;
      const readingOffset = pendingReadingOffset ?? (scrollY >= naturalServicesTop ? scrollY - naturalServicesTop : undefined);
      pendingReadingOffset = undefined;
      cancelAnimationFrame(restoreFrame);
      let arrivalFrame = 0;
      const state = { mask: 1, scale: 1, y: 0, contentY: 0, copyOpacity: 1, opacity: 1, progress: 0 };
      const clamp = gsap.utils.clamp(0, 1);
      const out = gsap.parseEase('power2.out');
      const inOut = gsap.parseEase('power2.inOut');
      const close = gsap.parseEase('power2.in');
      const mix = gsap.utils.interpolate;
      const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
      const cursor = { x: 0, y: 0 };
      const xTo = gsap.quickTo(windowSurface, 'x', { duration: .65, ease: 'power3.out' });
      const yTo = gsap.quickTo(windowSurface, 'y', { duration: .65, ease: 'power3.out' });
      const rotateXTo = gsap.quickTo(windowSurface, 'rotationX', { duration: .5, ease: 'power3.out' });
      const rotateYTo = gsap.quickTo(windowSurface, 'rotationY', { duration: .5, ease: 'power3.out' });
      const imageXTo = gsap.quickTo(parallax, 'x', { duration: .65, ease: 'power3.out' });
      const imageYTo = gsap.quickTo(parallax, 'y', { duration: .65, ease: 'power3.out' });
      const cursorTweens = [xTo, yTo, rotateXTo, rotateYTo, imageXTo, imageYTo];
      let drifting = false;

      function positionWindow() {
        const active = finePointer.matches && state.progress > .0001 && state.progress < .9999
          && !document.hidden && document.documentElement.dataset.stationOpen !== 'true';
        if (!active) {
          if (drifting) {
            for (const move of cursorTweens) { move(0, 0); move.tween.progress(1).pause(); }
            drifting = false;
          }
          return;
        }
        drifting = true;
        const amount = out(clamp(state.progress / .2)) * state.opacity;
        const x = cursor.x * Math.min(30, width * .02) * amount;
        const y = cursor.y * Math.min(20, viewport * .02) * amount;
        xTo(x); yTo(y);
        // Zentry's frame projects its mask in 3D while the media follows more
        // gently. Keep that depth relationship within the exact LPM contour.
        rotateXTo(cursor.y * 10.8 * amount);
        rotateYTo(-cursor.x * 10.8 * amount);
        imageXTo(-x * .6); imageYTo(-y * .6);
      }
      const pointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || !finePointer.matches) return;
        cursor.x = clamp(event.clientX / width) * 2 - 1;
        cursor.y = clamp(event.clientY / viewport) * 2 - 1;
        positionWindow();
      };
      const centerWindow = () => { cursor.x = cursor.y = 0; positionWindow(); };

      function measure() {
        width = hero.clientWidth;
        height = hero.offsetHeight;
        // clientHeight stays stable as mobile browser chrome changes.
        viewport = document.documentElement.clientHeight;
        lead = Math.max(0, height - viewport);
        distance = Math.round(viewport * (width <= 700 ? 1.08 : 1.25));
        centerY = lead + Math.min(viewport, height) / 2;
        const portrait = hero.querySelector<HTMLElement>('[data-spatial-portrait]')!;
        focusY = width <= 700 ? centerY - (portrait.offsetTop + portrait.offsetHeight * .62) : 0;
        cover = Math.max(width / 1154, height / 752) * 4;
        fit = Math.min(width * .94 / 1154, viewport * .88 / 752);
        start = root.getBoundingClientRect().top + scrollY + lead;
        end = start + distance;
        root.style.setProperty('--reveal-top', `${-lead}px`);
        root.style.setProperty('--reveal-height', `${height}px`);
        heroTrack.style.height = `${height + distance}px`;
        // Place the heading immediately below the closing point, accounting
        // for its own existing section padding instead of adding a blank screen.
        const headerHeight = document.querySelector<HTMLElement>('[data-tv-navigation]')?.offsetHeight ?? 92;
        const sectionPadding = parseFloat(getComputedStyle(services).paddingTop) || 0;
        const closingPoint = centerY - lead - viewport * .3;
        const breathingRoom = Math.max(headerHeight, Math.round(closingPoint + 32 - sectionPadding)) + 16;
        servicesTop = end + breathingRoom;
        servicesTrack.style.marginTop = `${breathingRoom - Math.min(height, viewport)}px`;
        visual.style.transformOrigin = `${width / 2}px ${centerY}px`;
        root.dataset.revealStart = String(start);
        root.dataset.revealEnd = String(end);
        root.dataset.revealServices = String(servicesTop);
      }

      function render(progress = state.progress) {
        // Derive every pose from absolute scroll progress. A layout refresh or
        // reversal therefore cannot capture an intermediate pose as a new start.
        state.progress = progress;
        const opening = out(clamp(progress / .38));
        const retreat = inOut(clamp((progress - .38) / .45));
        const exit = close(clamp((progress - .83) / .17));
        state.mask = mix(cover, fit, opening);
        state.contentY = focusY * opening;
        state.copyOpacity = 1 - out(clamp(progress / .25));
        state.scale = progress <= .38 ? mix(1, .84, opening) : progress <= .83 ? mix(.84, .14, retreat) : mix(.14, .015, exit);
        state.y = progress <= .38 ? -viewport * .025 * opening : progress <= .83 ? mix(-viewport * .025, -viewport * .2, retreat) : mix(-viewport * .2, -viewport * .3, exit);
        state.opacity = 1 - exit;
        const nextRevealing = progress > .0001;
        root.dataset.revealProgress = progress.toFixed(4);
        root.dataset.revealState = progress >= .9999 ? 'complete' : nextRevealing ? 'moving' : 'idle';
        const tx = width / 2 - 577 * state.mask;
        const ty = centerY - 376 * state.mask;
        silhouette.setAttribute('transform', `translate(${tx} ${ty}) scale(${state.mask})`);
        visual.style.transform = nextRevealing ? `translate3d(0,${state.y}px,0) scale(${state.scale})` : 'none';
        const pivotY = centerY + state.y;
        windowSurface.style.transformOrigin = `${width / 2}px ${pivotY}px`;
        root.style.setProperty('--reveal-pivot-y', `${pivotY}px`);
        visual.style.opacity = String(state.opacity);
        hero.style.transform = nextRevealing ? `translate3d(0,${state.contentY}px,0)` : 'none';
        for (const element of copy) element.style.opacity = String(state.copyOpacity);
        // Preserve an existing keyboard focus, while excluding hidden controls
        // from subsequent tab navigation. Never move focus because of scrolling.
        hero.inert = originalHeroInert || (nextRevealing && !hero.contains(document.activeElement));
        positionWindow();
        if (revealing !== nextRevealing) {
          revealing = nextRevealing;
          hero.dispatchEvent(new CustomEvent('lpm:hero-reveal', { detail: revealing }));
        }
      }

      root.dataset.revealEnabled = '';
      measure();
      const trigger = ScrollTrigger.create({
        id: 'lpm-hero-reveal', trigger: root,
        start: () => start, end: () => end,
        onRefreshInit: measure,
        onUpdate: self => render(self.progress),
        onRefresh: self => render(self.progress),
      });

      function resolveAnchor(event: Event) {
        const detail = (event as CustomEvent<AnchorRequest>).detail;
        if (detail.target === hero) detail.top = start - lead;
        else if (services.contains(detail.target)) {
          detail.top = servicesTop + (detail.target === services ? 0 : detail.target.getBoundingClientRect().top - services.getBoundingClientRect().top - 120);
        }
      }
      const refresh = () => {
        if (refreshFrame) return;
        refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; if (alive) trigger.refresh(); });
      };
      const focusIn = (event: FocusEvent) => {
        // Programmatic/keyboard return to a hero control restores its full scene.
        if (state.progress > 0 && hero.contains(event.target as Node)) {
          window.scrollTo({ top: start - lead, behavior: 'instant' });
          ScrollTrigger.update();
        }
      };
      const focusOut = () => queueMicrotask(() => { if (alive) render(); });
      const keyboardExit = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || state.progress <= 0 || !hero.contains(document.activeElement)) return;
        // A deliberate Tab exits the shrinking scene to a full-size control.
        event.preventDefault();
        scrollTo(event.shiftKey ? start - lead : servicesTop);
        render(event.shiftKey ? 0 : 1);
        const target = event.shiftKey
          ? document.querySelector<HTMLElement>('[data-tv-navigation] a')
          : services.querySelector<HTMLElement>('summary, a, button');
        target?.focus({ preventScroll: true });
      };
      const arrival = () => {
        let id: string;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target || !root.contains(target)) return;
        const detail: AnchorRequest = { target };
        resolveAnchor(new CustomEvent('lpm:resolve-anchor', { detail }));
        if (detail.top !== undefined) scrollTo(detail.top);
      };
      window.addEventListener('lpm:resolve-anchor', resolveAnchor);
      window.addEventListener('hashchange', arrival);
      window.addEventListener('popstate', arrival);
      window.addEventListener('pageshow', refresh);
      window.addEventListener('pointermove', pointerMove, { passive: true });
      window.addEventListener('blur', centerWindow);
      document.documentElement.addEventListener('pointerleave', centerWindow);
      document.addEventListener('visibilitychange', centerWindow);
      finePointer.addEventListener('change', centerWindow);
      hero.addEventListener('focusin', focusIn);
      hero.addEventListener('keydown', keyboardExit);
      root.addEventListener('focusout', focusOut);
      const observer = new ResizeObserver(() => { measure(); refresh(); });
      observer.observe(hero);
      observer.observe(services);
      void document.fonts.ready.then(() => { if (alive) refresh(); });
      trigger.refresh();
      if (readingOffset !== undefined) {
        // matchMedia restores its recorded scroll after running setup/cleanup.
        // Apply our semantic destination after that transaction finishes.
        arrivalFrame = requestAnimationFrame(() => { if (alive) scrollTo(servicesTop + readingOffset); });
      }
      render();
      if (initialArrival) {
        initialArrival = false;
        if (readingOffset === undefined) arrivalFrame = requestAnimationFrame(() => { if (alive && location.hash) arrival(); });
      }

      return () => {
        alive = false;
        cancelAnimationFrame(refreshFrame);
        cancelAnimationFrame(arrivalFrame);
        observer.disconnect();
        window.removeEventListener('lpm:resolve-anchor', resolveAnchor);
        window.removeEventListener('hashchange', arrival);
        window.removeEventListener('popstate', arrival);
        window.removeEventListener('pageshow', refresh);
        window.removeEventListener('pointermove', pointerMove);
        window.removeEventListener('blur', centerWindow);
        document.documentElement.removeEventListener('pointerleave', centerWindow);
        document.removeEventListener('visibilitychange', centerWindow);
        finePointer.removeEventListener('change', centerWindow);
        hero.removeEventListener('focusin', focusIn);
        hero.removeEventListener('keydown', keyboardExit);
        root.removeEventListener('focusout', focusOut);
        const offset = scrollY > start + 1 ? Math.max(0, scrollY - servicesTop) : undefined;
        heroTrack.removeAttribute('style');
        servicesTrack.removeAttribute('style');
        visual.removeAttribute('style');
        windowSurface.removeAttribute('style');
        parallax.removeAttribute('style');
        hero.style.removeProperty('transform');
        for (const element of copy) element.style.removeProperty('opacity');
        root.removeAttribute('style');
        for (const key of ['revealEnabled', 'revealState', 'revealStart', 'revealEnd', 'revealServices', 'revealProgress']) delete root.dataset[key];
        hero.inert = originalHeroInert;
        services.inert = originalServicesInert;
        hero.dispatchEvent(new CustomEvent('lpm:hero-reveal', { detail: false }));
        if (offset !== undefined) {
          pendingReadingOffset = offset;
          restoreFrame = requestAnimationFrame(() => {
            if (!root.hasAttribute('data-reveal-enabled')) {
              scrollTo(services.getBoundingClientRect().top + scrollY + offset);
              pendingReadingOffset = undefined;
            }
          });
        }
      };
    });
  }
  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => {
    paused = event.detail;
    configure();
  }) as EventListener);
  configure();
}

const root = document.querySelector<HTMLElement>('[data-hero-reveal]');
if (root) enhanceReveal(root);
