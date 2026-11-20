import { getTranslator } from '../lib/i18n';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const t = getTranslator(window.location.pathname);

gsap.registerPlugin(ScrollTrigger);

type AnchorRequest = { target: HTMLElement; top?: number };

function enhanceApproach(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-approach-track]')!;
  const stage = root.querySelector<HTMLElement>('[data-approach-stage]')!;
  const eye = root.querySelector<HTMLElement>('[data-approach-eye]')!;
  const returningEye = root.querySelector<HTMLElement>('[data-approach-return]')!;
  const brand = root.querySelector<HTMLElement>('[data-approach-brand]')!;
  const brandMark = brand.querySelector<HTMLElement>('.brand-logo')!;
  const panels = [...root.querySelectorAll<HTMLElement>('[data-approach-panel]')];
  const steps = [...root.querySelectorAll<HTMLAnchorElement>('[data-approach-step]')];
  const playback = root.querySelector<HTMLButtonElement>('[data-approach-playback-toggle]')!;
  const countdownLabel = root.querySelector<HTMLElement>('[data-approach-countdown]')!;
  const countdownBar = root.querySelector<HTMLElement>('[data-approach-countdown-bar]')!;
  const media = gsap.matchMedia();
  let paused = false;
  let autoplayPaused = false;

  function configure() {
    media.revert();
    if (paused) return;
    media.add({
      motion: '(prefers-reduced-motion: no-preference) and (forced-colors: none)',
      room: '(min-width: 701px) and (min-height: 620px), (max-width: 700px) and (min-height: 740px)',
    }, context => {
      if (!context.conditions?.motion || !context.conditions.room) return;
      root.dataset.approachEnabled = '';
      const mobile = () => stage.clientWidth <= 700;
      let start = 0;
      let distance = 0;
      let width = 0;
      let eyeWidth = 0;
      let current = -1;
      let frame = 0;
      let arrivalFrame = 0;
      let alive = true;
      let navigation: gsap.core.Tween | undefined;
      let navigationPosition: { top: number } | undefined;
      let countdown: gsap.core.Tween | undefined;
      let targetProgress = 0;
      const stops = [.1, .55, .95];
      const idleSeconds = 6;
      const copy = panels.map(panel => panel.querySelector<HTMLElement>('.approach-copy')!);

      function measure() {
        width = stage.clientWidth;
        const height = stage.clientHeight;
        distance = Math.round(height * 3);
        eyeWidth = Math.min(width * .34, height * .64, 520);
        if (mobile()) {
          // Reserve actual reading/control space first. Percentage-based copy
          // centring let long panels collide with the art or the scene index.
          const navTop = steps[0].parentElement!.offsetTop;
          const artTop = playback.offsetTop + playback.offsetHeight + 16;
          const copyHeight = Math.max(...copy.map(element => element.offsetHeight));
          const gap = 28;
          const copyTop = navTop - gap - copyHeight;
          const artHeight = Math.max(0, copyTop - gap - artTop);
          eyeWidth = Math.min(width * .54, artHeight / .87, 280);
          root.style.setProperty('--approach-art-center', `${artTop + artHeight / 2}px`);
          root.style.setProperty('--approach-copy-top', `${copyTop}px`);
        }
        root.style.setProperty('--approach-eye-width', `${eyeWidth}px`);
        root.style.setProperty('--approach-eye-start', `${width * (mobile() ? .46 : .265) - eyeWidth / 2}px`);
        root.style.setProperty('--approach-distance', `${distance}px`);
        start = track.getBoundingClientRect().top + scrollY;
        root.dataset.approachStart = String(start);
        root.dataset.approachEnd = String(start + distance);
      }

      // Scroll and idle playback share one reversible composition. A short
      // catch-up tween absorbs wheel steps without changing native scrolling.
      measure();
      const left = () => width * (mobile() ? .46 : .265) - eyeWidth / 2;
      const right = () => width * (mobile() ? .54 : .735) - eyeWidth / 2;
      const center = () => (width - eyeWidth) / 2;
      const fill = eye.querySelector<HTMLElement>('.approach-eye__fill')!;
      const outline = eye.querySelector<HTMLElement>('.approach-eye__outline')!;
      const letters = eye.querySelector<HTMLElement>('.approach-eye__letters')!;
      const code = eye.querySelector<HTMLElement>('.approach-eye__code')!;
      const returnLetters = returningEye.querySelector<HTMLElement>('.approach-eye__letters')!;
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      timeline
        .set(eye, { x: left, y: 0, yPercent: -50, scale: 1, rotation: -12, borderRadius: '78% 18% 78% 18%', opacity: 1 })
        .set([fill, letters], { opacity: 1 })
        .set([letters, code], { rotation: 12 })
        .set([outline, code, panels[1], panels[2], returningEye, brand], { opacity: 0 })
        .set(returningEye, { x: left, y: 0, yPercent: -50, scale: .65, rotation: -12, borderRadius: '78% 18% 78% 18%' })
        .set(returnLetters, { rotation: 12, opacity: 1 })
        .set(brandMark, { scale: .82 })
        .set(panels[0], { opacity: 1, y: 0 })
        .set([panels[1], panels[2]], { y: 18 })
        // Hold marketing, then sweep the eye across the whole composition.
        .to(panels[0], { y: -18, opacity: 0, duration: .11, ease: 'power2.inOut' }, .19)
        .to(eye, { x: right, rotation: 12, duration: .28, ease: 'power2.inOut' }, .19)
        .to(eye, { borderRadius: '50% 50% 50% 50%', duration: .14, ease: 'sine.inOut' }, .19)
        .to(eye, { borderRadius: '78% 18% 78% 18%', duration: .14, ease: 'sine.inOut' }, .33)
        .to(fill, { opacity: 0, duration: .14, ease: 'sine.inOut' }, .25)
        .to(outline, { opacity: 1, duration: .14, ease: 'sine.inOut' }, .25)
        .to(letters, { opacity: 0, rotation: -12, duration: .10, ease: 'power2.inOut' }, .24)
        .to(code, { opacity: 1, rotation: -12, duration: .10, ease: 'power2.out' }, .34)
        .to(panels[1], { opacity: 1, y: 0, duration: .12, ease: 'power2.out' }, .35)
        // Give technology room to read before its counterpart returns.
        .to(panels[1], { opacity: 0, y: -18, duration: .10, ease: 'power2.inOut' }, .64)
        .to(returningEye, { opacity: 1, duration: .10, ease: 'sine.inOut' }, .65)
        .to(eye, { scale: .76, duration: .12, ease: 'power2.inOut' }, .65)
        .fromTo(returningEye, { scale: .65 }, { scale: .76, duration: .12, ease: 'power2.inOut' }, .65)
        .to(eye, { x: center, y: () => mobile() ? 0 : -stage.clientHeight * (stage.clientHeight <= 850 ? .17 : .10), rotation: 0, duration: .13, ease: 'power2.inOut' }, .71)
        .to(returningEye, { x: center, y: () => mobile() ? 0 : -stage.clientHeight * (stage.clientHeight <= 850 ? .17 : .10), rotation: 0, duration: .13, ease: 'power2.inOut' }, .71)
        .to([code, returnLetters], { opacity: 0, duration: .055, ease: 'sine.inOut' }, .80)
        // Contact compresses the two contours; the official mark is revealed intact.
        .to([eye, returningEye], { scaleX: .46, scaleY: .78, duration: .04, ease: 'sine.inOut' }, .84)
        .to([eye, returningEye], { opacity: 0, duration: .05, ease: 'power2.inOut' }, .86)
        .to([eye, returningEye], { scale: .2, duration: .03, ease: 'power2.inOut' }, .88)
        .to(brand, { opacity: 1, duration: .05, ease: 'power3.out' }, .89)
        .to(brandMark, { scale: 1, duration: .05, ease: 'power3.out' }, .89)
        .to(panels[2], { opacity: 1, y: 0, duration: .07, ease: 'power2.out' }, .87)
        .to({}, { duration: .05 }, .95);

      function render(progress: number) {
        timeline.progress(progress);
        root.dataset.approachProgress = progress.toFixed(4);
        const next = progress < .35 ? 0 : progress < .85 ? 1 : 2;
        root.dataset.approachState = ['marketing', 'technology', 'method'][next];
        root.toggleAttribute('data-approach-moving', (progress > .19 && progress < .47) || (progress > .64 && progress < .94));
        if (current !== next) {
          current = next;
          panels.forEach((panel, index) => { panel.inert = index !== next; });
          steps.forEach((step, index) => {
            if (index === next) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
          });
        }
      }

      const pose = { progress: 0 };
      const setCountdown = gsap.quickSetter(countdownBar, 'scaleX');
      const smoothProgress = gsap.quickTo(pose, 'progress', {
        duration: .48, ease: 'power3.out', onUpdate: () => render(pose.progress),
      });
      function syncProgress(progress: number, immediate = false) {
        targetProgress = progress;
        if (immediate || progress === 0 || progress === 1) {
          smoothProgress.tween.pause();
          pose.progress = progress;
          render(progress);
        } else smoothProgress(progress);
      }

      function stopCountdown() {
        countdown?.kill();
        countdown = undefined;
        setCountdown(1);
      }
      function canAutoplay() {
        const rect = stage.getBoundingClientRect();
        const focused = document.activeElement;
        return alive && !autoplayPaused && !document.hidden && !navigation &&
          !root.closest('[inert]') && rect.top <= 128 && rect.bottom >= innerHeight * .85 &&
          scrollY <= start + distance &&
          !(focused instanceof HTMLElement && focused !== playback && stage.contains(focused) &&
            (focused.closest('[data-approach-panel]') || focused.matches(':focus-visible')));
      }
      function armCountdown() {
        stopCountdown();
        const complete = targetProgress >= .94;
        playback.disabled = complete;
        playback.setAttribute('aria-pressed', String(autoplayPaused));
        playback.setAttribute('aria-label', complete ? t("Recorrido completo") : autoplayPaused ? t('Reanudar avance automático') : t('Pausar avance automático'));
        root.toggleAttribute('data-approach-autoplay-paused', autoplayPaused);
        countdownLabel.textContent = complete ? t("Recorrido completo") : autoplayPaused ? t("Continuar recorrido") : t("Siguiente en 6 s");
        root.dataset.approachPlayback = complete ? 'complete' : autoplayPaused ? 'paused' : 'idle';
        if (complete || !canAutoplay()) return;
        root.dataset.approachPlayback = 'countdown';
        const clock = { remaining: idleSeconds };
        let lastSecond = idleSeconds;
        countdown = gsap.to(clock, {
          remaining: 0, duration: idleSeconds, ease: 'none',
          onUpdate: () => {
            setCountdown(clock.remaining / idleSeconds);
            const second = Math.ceil(clock.remaining);
            if (second !== lastSecond) {
              lastSecond = second;
              countdownLabel.textContent = t("Siguiente en {seconds} s", { seconds: second });
            }
          },
          onComplete: () => {
            countdown = undefined;
            if (canAutoplay()) travelTo(targetProgress < .525 ? stops[1] : stops[2], 2.8, true);
            else armCountdown();
          },
        });
      }

      const trigger = ScrollTrigger.create({
        id: 'lpm-approach', trigger: track,
        start: () => start, end: () => start + distance,
        onRefreshInit: () => { measure(); timeline.invalidate(); },
        onRefresh: self => { syncProgress(self.progress, true); armCountdown(); },
        onUpdate: self => syncProgress(self.progress),
      });

      const stopNavigation = () => {
        navigation?.kill();
        navigation = undefined;
        navigationPosition = undefined;
      };
      function travelTo(progress: number, duration: number, automatic = false) {
        stopNavigation();
        stopCountdown();
        root.dataset.approachPlayback = automatic ? 'playing' : 'navigating';
        countdownLabel.textContent = t("Avanzando");
        const position = navigationPosition = { top: scrollY };
        navigation = gsap.to(position, {
          top: start + distance * progress, duration, ease: 'power2.inOut',
          onUpdate: () => {
            window.scrollTo({ top: position.top, behavior: 'instant' });
            ScrollTrigger.update();
          },
          onComplete: () => { stopNavigation(); armCountdown(); },
        });
      }
      const interrupt = () => { stopNavigation(); armCountdown(); };
      const scroll = () => {
        // Scrollbar drags and external scrollTo calls interrupt playback too.
        if (navigationPosition && Math.abs(scrollY - navigationPosition.top) <= 2) return;
        interrupt();
      };
      const keydown = (event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interrupt();
      };
      const visibility = () => { stopNavigation(); armCountdown(); };
      const togglePlayback = () => { autoplayPaused = !autoplayPaused; interrupt(); };
      const navigate = (event: MouseEvent) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('[data-approach-step]');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        event.stopPropagation();
        const index = steps.indexOf(link);
        history.pushState(null, '', link.hash);
        travelTo(stops[index], 1.6);
      };
      stage.addEventListener('click', navigate);
      playback.addEventListener('click', togglePlayback);
      window.addEventListener('wheel', interrupt, { passive: true });
      window.addEventListener('touchstart', interrupt, { passive: true });
      window.addEventListener('pointerdown', interrupt, { passive: true });
      window.addEventListener('scroll', scroll, { passive: true });
      window.addEventListener('keydown', keydown);
      document.addEventListener('visibilitychange', visibility);

      function resolveAnchor(event: Event) {
        const detail = (event as CustomEvent<AnchorRequest>).detail;
        const index = panels.findIndex(panel => panel === detail.target || panel.contains(detail.target));
        if (index >= 0) detail.top = start + distance * stops[index];
        else if (detail.target === root) detail.top = start;
      }
      function arrive() {
        stopNavigation();
        const target = document.getElementById(location.hash.slice(1));
        if (!target || !panels.some(panel => panel === target || panel.contains(target))) return;
        const detail: AnchorRequest = { target };
        resolveAnchor(new CustomEvent('lpm:resolve-anchor', { detail }));
        if (detail.top !== undefined) {
          window.scrollTo({ top: detail.top, behavior: 'instant' });
          ScrollTrigger.update();
          syncProgress(targetProgress, true);
        }
        armCountdown();
      }
      const focus = (event: FocusEvent) => {
        stopNavigation();
        armCountdown();
        const target = event.target as HTMLElement;
        const index = panels.findIndex(panel => panel.contains(target));
        if (index < 0) return;
        window.scrollTo({ top: start + distance * stops[index], behavior: 'instant' });
        ScrollTrigger.update();
      };
      const blur = () => { queueMicrotask(() => { if (alive) armCountdown(); }); };
      const refresh = () => {
        stopNavigation();
        stopCountdown();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });
      };
      const initialArrival = () => {
        cancelAnimationFrame(arrivalFrame);
        // Wait until native fragment navigation and font layout have finished.
        void document.fonts.ready.then(() => {
          if (alive) arrivalFrame = requestAnimationFrame(() => { ScrollTrigger.refresh(); arrive(); });
        });
      };
      // HeroReveal delegates the three scene destinations to their reading stops.
      window.addEventListener('lpm:resolve-anchor', resolveAnchor);
      window.addEventListener('hashchange', arrive);
      window.addEventListener('popstate', arrive);
      window.addEventListener('pageshow', refresh);
      window.addEventListener('load', initialArrival, { once: true });
      stage.addEventListener('focusin', focus);
      stage.addEventListener('focusout', blur);
      const observer = new ResizeObserver(refresh);
      observer.observe(stage);
      copy.forEach(element => observer.observe(element));
      const menuObserver = new MutationObserver(visibility);
      const main = root.closest('main');
      if (main) menuObserver.observe(main, { attributes: true, attributeFilter: ['inert'] });
      void document.fonts.ready.then(() => { if (alive) refresh(); });
      syncProgress(trigger.progress, true);
      armCountdown();
      // Font/ResizeObserver refreshes must not cancel the initial hash arrival.
      if (document.readyState === 'complete') initialArrival();

      return () => {
        alive = false;
        stopNavigation();
        stopCountdown();
        smoothProgress.tween.kill();
        stage.removeEventListener('click', navigate);
        playback.removeEventListener('click', togglePlayback);
        window.removeEventListener('wheel', interrupt);
        window.removeEventListener('touchstart', interrupt);
        window.removeEventListener('pointerdown', interrupt);
        window.removeEventListener('scroll', scroll);
        window.removeEventListener('keydown', keydown);
        document.removeEventListener('visibilitychange', visibility);
        panels.forEach(panel => { panel.inert = false; });
        trigger.kill();
        timeline.revert();
        cancelAnimationFrame(frame);
        cancelAnimationFrame(arrivalFrame);
        observer.disconnect();
        menuObserver.disconnect();
        window.removeEventListener('lpm:resolve-anchor', resolveAnchor);
        window.removeEventListener('hashchange', arrive);
        window.removeEventListener('popstate', arrive);
        window.removeEventListener('pageshow', refresh);
        window.removeEventListener('load', initialArrival);
        stage.removeEventListener('focusin', focus);
        stage.removeEventListener('focusout', blur);
        steps.forEach(step => step.removeAttribute('aria-current'));
        // GSAP invalidation during resize can retain intermediate inline styles
        // as its revert baseline. These elements belong exclusively to this
        // controller: restore the original readable HTML on every teardown.
        for (const element of [eye, returningEye, fill, outline, letters, code, returnLetters, brand, brandMark, ...panels, ...copy, countdownBar]) {
          element.removeAttribute('style');
        }
        root.style.removeProperty('--approach-eye-width');
        root.style.removeProperty('--approach-eye-start');
        root.style.removeProperty('--approach-art-center');
        root.style.removeProperty('--approach-copy-top');
        root.style.removeProperty('--approach-distance');
        playback.disabled = false;
        for (const key of ['approachEnabled', 'approachProgress', 'approachState', 'approachStart', 'approachEnd', 'approachMoving', 'approachPlayback', 'approachAutoplayPaused']) delete root.dataset[key];
      };
    });
  }

  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => {
    paused = event.detail;
    configure();
  }) as EventListener);
  configure();
}

const root = document.querySelector<HTMLElement>('[data-approach]');
if (root) enhanceApproach(root);
