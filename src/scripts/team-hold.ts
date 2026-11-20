import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const hold = document.querySelector<HTMLElement>('[data-team-hold]');
if (hold) {
  const section = hold.querySelector<HTMLElement>('#nosotros')!;
  const media = gsap.matchMedia();
  media.add('(min-height: 650px) and (prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
    hold.dataset.holdEnabled = '';
    const publish = (progress: number | null) => {
      section.style.setProperty('--team-scroll-progress', String(progress ?? 0));
      window.dispatchEvent(new CustomEvent('lpm:team-scroll', { detail: { container: section, progress } }));
    };
    const trigger = ScrollTrigger.create({ trigger: hold, start: 'top top', end: () => `+=${hold.offsetHeight - section.offsetHeight}`, invalidateOnRefresh: true, onUpdate: self => publish(self.progress), onRefresh: self => publish(self.progress) });
    publish(trigger.progress);
    return () => { trigger.kill(); delete hold.dataset.holdEnabled; publish(null); };
  });
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
  // The hold changes document height after native fragment positioning.
  // Restore direct arrivals once that layout settles, unless the visitor acts.
  const arrival = new AbortController();
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(type, () => arrival.abort(), { once: true, passive: true, signal: arrival.signal });
  const initialHash = location.hash;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), { once: true }));
  void Promise.all([loaded, document.fonts.ready]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!arrival.signal.aborted && navigation?.type !== 'back_forward' && initialHash && location.hash === initialHash) {
      let target: HTMLElement | null = null;
      try { target = document.getElementById(decodeURIComponent(initialHash.slice(1))); } catch { /* Invalid fragments leave the page readable. */ }
      if (target) {
        const top = (target === section ? hold : target).getBoundingClientRect().top + scrollY - 112;
        window.dispatchEvent(new Event('lpm:anchor-arrival'));
        window.scrollTo({ top, behavior: 'instant' });
      }
    }
    arrival.abort();
  })));
  document.addEventListener('astro:before-swap', () => media.revert(), { once: true });
}
