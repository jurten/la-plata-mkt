import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

async function initializePortfolio() {
  await document.fonts.ready;
  const root = document.querySelector<HTMLElement>('[data-portfolio-reveal]');
  if (!root) return;
  const section = root.querySelector<HTMLElement>('.featured-work')!;
  const stage = root.querySelector<HTMLElement>('.featured-stage')!;
  const belt = root.querySelector<HTMLElement>('.featured-belt')!;
  const about = root.querySelector<HTMLElement>('.featured-about')!;
  const projects = [...root.querySelectorAll<HTMLElement>('[data-featured-project]')];
  const panels = [...belt.children] as HTMLElement[];
  const progressBar = root.querySelector<HTMLElement>('.featured-progress i')!;
  const media = gsap.matchMedia();

  media.add('(min-width: 701px) and (min-height: 600px) and (prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
    root.dataset.enhanced = 'true';
    let start = 0, travel = 0, exitDistance = 0, distance = 0;
    const measure = () => {
      travel = innerWidth * 1.5;
      exitDistance = document.documentElement.clientHeight * .85;
      distance = travel + exitDistance;
      root.style.setProperty('--featured-distance', `${distance}px`);
      start = section.getBoundingClientRect().top + scrollY;
    };
    const render = (progress: number) => {
      const position = progress * distance;
      const rail = Math.min(position, travel);
      const exit = gsap.utils.clamp(0, 1, (position - travel) / exitDistance);
      gsap.set(belt, { x: -rail });
      // The entire rail withdraws to the left, uncovering About at rest.
      gsap.set(stage, { x: -exit * innerWidth });
      gsap.set(about, { y: position >= travel ? -(distance - position) : -exitDistance });
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
      stage.inert = exit >= 1;
      about.inert = position < travel;
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
    const resolveAnchor = (event: Event) => {
      const detail = (event as CustomEvent<{ target: HTMLElement; top?: number }>).detail;
      if (detail.target === section) detail.top = start;
      else if (about.contains(detail.target)) {
        detail.top = start + distance + (detail.target.getBoundingClientRect().top - about.getBoundingClientRect().top);
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
    const frame = requestAnimationFrame(followHash);
    return () => {
      cancelAnimationFrame(frame);
      trigger.kill();
      window.removeEventListener('lpm:resolve-anchor', resolveAnchor);
      window.removeEventListener('hashchange', followHash);
      window.removeEventListener('popstate', followHash);
      root.removeEventListener('click', followLink);
      delete root.dataset.enhanced;
      root.style.removeProperty('--featured-distance');
      for (const panel of panels) panel.inert = false;
      stage.inert = false;
      about.inert = false;
      gsap.set([belt, stage, about, progressBar, ...projects.map(p => p.firstElementChild)], { clearProps: 'transform,clipPath' });
    };
  });
}

initializePortfolio();
