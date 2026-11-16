import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnchorRequest = { target: HTMLElement; top?: number };

function enhanceApproach(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-approach-track]')!;
  const stage = root.querySelector<HTMLElement>('[data-approach-stage]')!;
  const eye = root.querySelector<HTMLElement>('[data-approach-eye]')!;
  const returningEye = root.querySelector<HTMLElement>('[data-approach-return]')!;
  const brand = root.querySelector<HTMLElement>('[data-approach-brand]')!;
  const panels = [...root.querySelectorAll<HTMLElement>('[data-approach-panel]')];
  const steps = [...root.querySelectorAll<HTMLAnchorElement>('[data-approach-step]')];
  const media = gsap.matchMedia();
  let paused = false;

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
      let alive = true;
      const stops = [.1, .55, .95];

      function measure() {
        width = stage.clientWidth;
        const height = stage.clientHeight;
        distance = Math.round(height * 3);
        eyeWidth = mobile() ? Math.min(width * .62, 340) : Math.min(width * .34, height * .64, 520);
        root.style.setProperty('--approach-eye-width', `${eyeWidth}px`);
        root.style.setProperty('--approach-eye-start', `${width * (mobile() ? .40 : .265) - eyeWidth / 2}px`);
        root.style.setProperty('--approach-distance', `${distance}px`);
        start = track.getBoundingClientRect().top + scrollY;
        root.dataset.approachStart = String(start);
        root.dataset.approachEnd = String(start + distance);
      }

      // A single reversible timeline owns masks, contours, symbols and collision.
      // No time-based playback can fall behind a fast scroll or a history jump.
      measure();
      const left = () => width * (mobile() ? .40 : .265) - eyeWidth / 2;
      const right = () => width * (mobile() ? .60 : .735) - eyeWidth / 2;
      const center = () => (width - eyeWidth) / 2;
      const fill = eye.querySelector<HTMLElement>('.approach-eye__fill')!;
      const outline = eye.querySelector<HTMLElement>('.approach-eye__outline')!;
      const letters = eye.querySelector<HTMLElement>('.approach-eye__letters')!;
      const code = eye.querySelector<HTMLElement>('.approach-eye__code')!;
      const copy = panels.map(panel => panel.querySelector<HTMLElement>('.approach-copy')!);
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      timeline
        .set(eye, { x: left, y: 0, yPercent: -50, scale: 1, rotation: -12, borderRadius: '78% 18% 78% 18%', opacity: 1 })
        .set([fill, letters], { opacity: 1 })
        .set([letters, code], { rotation: 12 })
        .set([outline, code, panels[1], panels[2], returningEye, brand], { opacity: 0 })
        .set(returningEye, { x: left, y: 0, yPercent: -50, scale: .65, rotation: -12, borderRadius: '78% 18% 78% 18%' })
        .set(returningEye.querySelector('.approach-eye__letters'), { rotation: 12 })
        .set(brand, { scale: .65 })
        .set(panels[0], { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        .set(panels[1], { clipPath: 'inset(0% 100% 0% 0%)' })
        // Hold marketing, then sweep the eye across the whole composition.
        .to(panels[0], { clipPath: 'inset(0% 0% 0% 100%)', opacity: 0, duration: .18 }, .20)
        .to(eye, { x: right, rotation: 12, duration: .25, ease: 'power2.inOut' }, .20)
        .to(eye, { borderRadius: '50% 50% 50% 50%', duration: .115 }, .20)
        .to(eye, { borderRadius: '78% 18% 78% 18%', duration: .135 }, .315)
        .to(fill, { opacity: 0, duration: .15 }, .26)
        .to(outline, { opacity: 1, duration: .15 }, .26)
        .to(letters, { opacity: 0, rotation: -12, duration: .12 }, .25)
        .to(code, { opacity: 1, rotation: -12, duration: .12 }, .33)
        .to(panels[1], { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: .18 }, .29)
        // Give technology room to read before its counterpart returns.
        .to(panels[1], { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', duration: .09 }, .65)
        .to(returningEye, { opacity: 1, duration: .06 }, .66)
        .to(eye, { scale: .76, duration: .08, ease: 'power2.out' }, .66)
        .fromTo(returningEye, { scale: .65 }, { scale: .76, duration: .08, ease: 'power2.out' }, .66)
        .to(eye, { x: center, y: () => mobile() ? 0 : -stage.clientHeight * .10, rotation: 0, duration: .10, ease: 'power2.in' }, .74)
        .to(returningEye, { x: center, y: () => mobile() ? 0 : -stage.clientHeight * .10, rotation: 0, duration: .10, ease: 'power2.in' }, .74)
        // Contact compresses the two contours; the official mark is revealed intact.
        .to([eye, returningEye], { scaleX: .36, scaleY: .82, duration: .025, ease: 'power2.out' }, .84)
        .to([eye, returningEye], { scale: .15, opacity: 0, duration: .045, ease: 'power2.in' }, .865)
        .to(brand, { opacity: 1, scale: 1, duration: .045, ease: 'expo.out' }, .865)
        .to(panels[2], { opacity: 1, duration: .045 }, .865)
        .fromTo(copy[2], { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .045 }, .865)
        .to({}, { duration: .05 }, .95);

      function render(progress: number) {
        timeline.progress(progress);
        root.dataset.approachProgress = progress.toFixed(4);
        const next = progress < .29 ? 0 : progress < .80 ? 1 : 2;
        root.dataset.approachState = ['marketing', 'technology', 'method'][next];
        root.toggleAttribute('data-approach-moving', (progress > .20 && progress < .47) || (progress > .65 && progress < .91));
        if (current !== next) {
          current = next;
          steps.forEach((step, index) => {
            if (index === next) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
          });
        }
      }

      const trigger = ScrollTrigger.create({
        id: 'lpm-approach', trigger: track,
        start: () => start, end: () => start + distance,
        onRefreshInit: () => { measure(); timeline.invalidate(); },
        onRefresh: self => render(self.progress),
        onUpdate: self => render(self.progress),
      });

      function resolveAnchor(event: Event) {
        const detail = (event as CustomEvent<AnchorRequest>).detail;
        const index = panels.findIndex(panel => panel === detail.target || panel.contains(detail.target));
        if (index >= 0) detail.top = start + distance * stops[index];
        else if (detail.target === root) detail.top = start;
      }
      function arrive() {
        const target = document.getElementById(location.hash.slice(1));
        if (!target || !panels.some(panel => panel === target || panel.contains(target))) return;
        const detail: AnchorRequest = { target };
        resolveAnchor(new CustomEvent('lpm:resolve-anchor', { detail }));
        if (detail.top !== undefined) {
          window.scrollTo({ top: detail.top, behavior: 'instant' });
          ScrollTrigger.update();
        }
      }
      const focus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        const index = panels.findIndex(panel => panel.contains(target));
        if (index < 0) return;
        window.scrollTo({ top: start + distance * stops[index], behavior: 'instant' });
        ScrollTrigger.update();
      };
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });
      };
      // HeroReveal delegates the three scene destinations to their reading stops.
      window.addEventListener('lpm:resolve-anchor', resolveAnchor);
      window.addEventListener('hashchange', arrive);
      window.addEventListener('popstate', arrive);
      window.addEventListener('pageshow', refresh);
      stage.addEventListener('focusin', focus);
      const observer = new ResizeObserver(refresh);
      observer.observe(stage);
      void document.fonts.ready.then(() => { if (alive) refresh(); });
      render(trigger.progress);
      frame = requestAnimationFrame(() => { if (alive) { ScrollTrigger.refresh(); arrive(); } });

      return () => {
        alive = false;
        trigger.kill();
        timeline.revert();
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('lpm:resolve-anchor', resolveAnchor);
        window.removeEventListener('hashchange', arrive);
        window.removeEventListener('popstate', arrive);
        window.removeEventListener('pageshow', refresh);
        stage.removeEventListener('focusin', focus);
        steps.forEach(step => step.removeAttribute('aria-current'));
        // GSAP invalidation during resize can retain intermediate inline styles
        // as its revert baseline. These elements belong exclusively to this
        // controller: restore the original readable HTML on every teardown.
        for (const element of [eye, returningEye, fill, outline, letters, code, brand, ...panels, copy[2], returningEye.querySelector<HTMLElement>('.approach-eye__letters')!]) {
          element.removeAttribute('style');
        }
        root.style.removeProperty('--approach-eye-width');
        root.style.removeProperty('--approach-eye-start');
        root.style.removeProperty('--approach-distance');
        for (const key of ['approachEnabled', 'approachProgress', 'approachState', 'approachStart', 'approachEnd', 'approachMoving']) delete root.dataset[key];
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
