import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swiper from 'swiper';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

gsap.registerPlugin(ScrollTrigger);

async function initializePortfolio() {
  await document.fonts.ready;
  const root = document.querySelector<HTMLElement>('[data-portfolio-reveal]');
  if (!root) return;
  const section = root.querySelector<HTMLElement>('.featured-work')!;
  const stage = root.querySelector<HTMLElement>('.featured-stage')!;
  const belt = root.querySelector<HTMLElement>('.featured-belt')!;
  const about = root.querySelector<HTMLElement>('.featured-about')!;
  const aboutContent = root.querySelector<HTMLElement>('.featured-about__content')!;
  const projects = [...root.querySelectorAll<HTMLElement>('[data-featured-project]')];
  const panels = [...belt.querySelectorAll<HTMLElement>('.featured-panel')];
  const progressBar = root.querySelector<HTMLElement>('.featured-progress i')!;
  const media = gsap.matchMedia();
  const publishTeamProgress = (progress: number | null) => {
    window.dispatchEvent(new CustomEvent('lpm:team-scroll', { detail: { container: aboutContent, progress } }));
  };

  media.add('(min-width: 1251px) and (hover: hover) and (pointer: fine) and (min-height: 600px) and (prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
    root.dataset.enhanced = 'true';
    let aboutLocked: boolean | undefined;
    const lockAbout = (locked: boolean) => {
      if (aboutLocked === locked) return;
      aboutLocked = locked;
      about.toggleAttribute('data-team-locked', locked);
    };
    let start = 0, travel = 0, exitDistance = 0, distance = 0, holdDistance = 0;
    const measure = () => {
      travel = innerWidth * 1.5;
      exitDistance = document.documentElement.clientHeight * .85;
      distance = travel + exitDistance;
      root.style.setProperty('--featured-distance', `${distance}px`);
      root.style.setProperty('--featured-exit-distance', `${exitDistance}px`);
      start = section.getBoundingClientRect().top + scrollY;
      holdDistance = Math.max(1, about.offsetHeight - aboutContent.offsetHeight - exitDistance);
    };
    const render = (progress: number) => {
      const position = progress * distance;
      const rail = Math.min(position, travel);
      // Keep ScrollTrigger's exact endpoint: recomputing it can yield 0.9999999999999999.
      const exit = progress >= 1 ? 1 : gsap.utils.clamp(0, 1, (position - travel) / exitDistance);
      gsap.set(belt, { x: -rail });
      // The entire rail withdraws to the left, uncovering About at rest.
      gsap.set(stage, { x: -exit * innerWidth });
      gsap.set(progressBar, { scaleX: progress });
      projects.forEach((project, index) => {
        const entry = gsap.utils.clamp(0, 1, (rail - (index - .65) * innerWidth * .5) / (innerWidth * .45));
        const inner = project.querySelector<HTMLElement>('.featured-project-inner');
        gsap.set(inner, { y: (1 - entry) * 180, rotationX: (1 - entry) * -12, transformPerspective: 1200 });
      });
      // Offscreen panels never trap keyboard focus during the horizontal pass.
      panels.forEach((panel, index) => {
        const left = index * innerWidth * .5 - rail - exit * innerWidth;
        panel.inert = left + innerWidth * .5 <= 0 || left >= innerWidth;
      });
      const exitComplete = exit >= 1;
      stage.inert = exitComplete;
      stage.toggleAttribute('data-featured-exited', exitComplete);
      // Leave page scrolling native while the team controls wait for the full exit.
      lockAbout(!exitComplete);
    };
    measure();
    const trigger = ScrollTrigger.create({
      trigger: section, start: 'top top', end: () => `+=${distance}`,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onRefresh: self => render(self.progress),
      onUpdate: self => render(self.progress),
    });
    render(trigger.progress);
    // A separate native-scroll range acknowledges the formerly stationary hold.
    // Absolute progress makes reverse scroll, hashes and resize deterministic.
    const renderHold = (progress: number) => {
      aboutContent.style.setProperty('--team-scroll-progress', String(progress));
      publishTeamProgress(progress);
    };
    const holdTrigger = ScrollTrigger.create({
      trigger: about,
      start: () => start + distance,
      end: () => start + distance + holdDistance,
      invalidateOnRefresh: true,
      onRefresh: self => renderHold(self.progress),
      onUpdate: self => renderHold(self.progress),
    });
    renderHold(holdTrigger.progress);
    const resolveAnchor = (event: Event) => {
      const detail = (event as CustomEvent<{ target: HTMLElement; top?: number }>).detail;
      if (detail.target === section) detail.top = start;
      else if (about.contains(detail.target)) {
        // Native scroll positions round to CSS pixels; never land short of the full exit.
        detail.top = Math.ceil(start + distance + (detail.target.getBoundingClientRect().top - aboutContent.getBoundingClientRect().top));
      } else {
        const panelIndex = panels.findIndex(panel => panel === detail.target || panel.contains(detail.target));
        if (panelIndex >= 0) detail.top = start + Math.max(0, panelIndex - .5) * innerWidth * .5;
      }
    };
    const followHash = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target || !root.contains(target)) return;
      const detail = { target, top: undefined as number | undefined };
      resolveAnchor(new CustomEvent('lpm:resolve-anchor', { detail }));
      if (detail.top !== undefined) {
        window.scrollTo({ top: detail.top, behavior: 'instant' });
        ScrollTrigger.update();
      }
    };
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !root.contains(link)) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target || !root.contains(target)) return;
      event.preventDefault();
      history.pushState(null, '', link.hash);
      followHash();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    window.addEventListener('lpm:resolve-anchor', resolveAnchor);
    window.addEventListener('hashchange', followHash);
    window.addEventListener('popstate', followHash);
    root.addEventListener('click', followLink);
    ScrollTrigger.refresh();
    let frame = 0;
    const initialArrival = () => {
      // Run after native fragment positioning and its scroll-padding adjustment.
      frame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        followHash();
      });
    };
    if (document.readyState === 'complete') initialArrival();
    else window.addEventListener('load', initialArrival, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', initialArrival);
      trigger.kill();
      holdTrigger.kill();
      aboutContent.style.removeProperty('--team-scroll-progress');
      publishTeamProgress(null);
      window.removeEventListener('lpm:resolve-anchor', resolveAnchor);
      window.removeEventListener('hashchange', followHash);
      window.removeEventListener('popstate', followHash);
      root.removeEventListener('click', followLink);
      delete root.dataset.enhanced;
      root.style.removeProperty('--featured-distance');
      root.style.removeProperty('--featured-exit-distance');
      for (const panel of panels) panel.inert = false;
      stage.inert = false;
      stage.removeAttribute('data-featured-exited');
      lockAbout(false);
      gsap.set([belt, stage, about, progressBar, ...projects.map(p => p.firstElementChild)], { clearProps: 'transform,clipPath' });
    };
  });

  // Touch exploration never consumes the page's vertical scroll range.
  media.add('((max-width: 1250px) or (hover: none) or (pointer: coarse)) and (forced-colors: none)', () => {
    const gallery = root.querySelector<HTMLElement>('.featured-gallery')!;
    const slides = root.querySelector<HTMLElement>('.featured-slides')!;
    let swiper: Swiper;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    root.dataset.touchPortfolio = '';
    gallery.classList.add('swiper');
    gallery.tabIndex = 0;
    slides.classList.add('swiper-wrapper');
    projects.forEach(project => project.classList.add('swiper-slide'));
    const update = () => {
      projects.forEach((project, index) => { project.inert = index !== swiper.activeIndex; });
    };
    const mount = (index = 0) => {
      swiper = new Swiper(gallery, {
        modules: [EffectCoverflow],
        effect: reduced.matches ? 'slide' : 'coverflow',
        initialSlide: index,
        speed: reduced.matches ? 0 : 450,
        slidesPerView: 1,
        centeredSlides: true,
        grabCursor: true,
        touchAngle: 35,
        touchStartPreventDefault: false,
        nested: false,
        coverflowEffect: { rotate: 32, stretch: 24, depth: 140, modifier: 1, slideShadows: false },
      });
      swiper.on('slideChange', update);
      update();
    };
    const remount = () => {
      const index = swiper.activeIndex;
      swiper.destroy(true, true);
      gallery.classList.remove('swiper-backface-hidden');
      mount(index);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      if (event.key === 'ArrowRight') swiper.slideNext(); else swiper.slidePrev();
    };
    const selectAnchor = (target: HTMLElement) => {
      const index = projects.findIndex(project => project === target || project.contains(target));
      if (index >= 0) swiper.slideTo(index, 0);
    };
    const onAnchor = (event: Event) => selectAnchor((event as CustomEvent<{ target: HTMLElement }>).detail.target);
    const onHash = () => {
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      if (target) selectAnchor(target);
    };
    mount();
    onHash();
    gallery.addEventListener('keydown', onKey);
    reduced.addEventListener('change', remount);
    window.addEventListener('lpm:resolve-anchor', onAnchor);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => {
      swiper.destroy(true, true);
      gallery.removeEventListener('keydown', onKey);
      reduced.removeEventListener('change', remount);
      window.removeEventListener('lpm:resolve-anchor', onAnchor);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
      gallery.classList.remove('swiper', 'swiper-backface-hidden');
      gallery.removeAttribute('tabindex');
      slides.classList.remove('swiper-wrapper');
      projects.forEach(project => { project.classList.remove('swiper-slide'); project.inert = false; });
      delete root.dataset.touchPortfolio;
    };
  });

  // The existing independent team hold also applies to tablet layouts.
  media.add('((max-width: 1250px) or (hover: none) or (pointer: coarse)) and (min-height: 600px) and (prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
    root.setAttribute('data-team-scroll-mobile', '');
    const render = (progress: number) => {
      aboutContent.style.setProperty('--team-scroll-progress', String(progress));
      publishTeamProgress(progress);
    };
    const trigger = ScrollTrigger.create({
      trigger: about,
      start: 'top top',
      end: () => `+=${about.offsetHeight - aboutContent.offsetHeight}`,
      invalidateOnRefresh: true,
      onRefresh: self => render(self.progress),
      onUpdate: self => render(self.progress),
    });
    render(trigger.progress);
    return () => {
      trigger.kill();
      root.removeAttribute('data-team-scroll-mobile');
      aboutContent.style.removeProperty('--team-scroll-progress');
      publishTeamProgress(null);
    };
  });

  // On touch/reduced-motion layouts the rail is ordinary document flow. The
  // upstream scenes still resize at startup, so restore team arrivals only
  // after that layout, and never after a visitor has started interacting.
  const staticAboutTop = (target: HTMLElement) => about.getBoundingClientRect().top + scrollY
    + target.getBoundingClientRect().top - aboutContent.getBoundingClientRect().top;
  const staticArrival = () => {
    if (root.hasAttribute('data-enhanced')) return;
    let target: HTMLElement | null;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return; }
    if (!target || !about.contains(target)) return;
    window.scrollTo({ top: staticAboutTop(target), behavior: 'instant' });
  };
  const resolveStaticAnchor = (event: Event) => {
    if (root.hasAttribute('data-enhanced')) return;
    const detail = (event as CustomEvent<{ target: HTMLElement; top?: number }>).detail;
    if (about.contains(detail.target)) detail.top = staticAboutTop(detail.target);
  };
  const arrivalEvents = new AbortController();
  const cancelArrival = () => arrivalEvents.abort();
  for (const type of ['wheel', 'pointerdown', 'touchstart', 'keydown']) window.addEventListener(type, cancelArrival, { once: true, passive: true, signal: arrivalEvents.signal });
  const initialHash = location.hash;
  const loaded = document.readyState === 'complete' ? Promise.resolve()
    : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), { once: true }));
  let arrivalFrame = 0;
  void loaded.then(() => {
    arrivalFrame = requestAnimationFrame(() => {
      arrivalFrame = requestAnimationFrame(() => {
        if (!arrivalEvents.signal.aborted && location.hash === initialHash) staticArrival();
        arrivalEvents.abort();
      });
    });
  });
  window.addEventListener('lpm:resolve-anchor', resolveStaticAnchor);
  window.addEventListener('hashchange', staticArrival);
  window.addEventListener('popstate', staticArrival);
  document.addEventListener('astro:before-swap', () => {
    cancelAnimationFrame(arrivalFrame);
    arrivalEvents.abort();
    window.removeEventListener('lpm:resolve-anchor', resolveStaticAnchor);
    window.removeEventListener('hashchange', staticArrival);
    window.removeEventListener('popstate', staticArrival);
    media.revert();
  }, { once: true });
}

initializePortfolio();
