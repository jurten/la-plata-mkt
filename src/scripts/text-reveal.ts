import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import '../styles/text-reveal.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Flim / ToyFight: masked lines, 0.8s, 0.1s stagger, power3.inOut.
// Leave the server-rendered text visible until its entrance can actually run.
async function initializeTextReveal() {
  await document.fonts.ready;
  const media = gsap.matchMedia();
  let paused = false;
  const configure = () => {
    media.revert();
    if (paused) return;
    media.add('(prefers-reduced-motion: no-preference) and (forced-colors: none)', () => {
      const splits: SplitText[] = [];
      const animations: gsap.core.Tween[] = [];
      const wrappers: HTMLElement[] = [];
      const pending = new Set<HTMLElement>();
      const excluded = 'svg, script, style, noscript, textarea, input, select, [aria-live], [role="status"], [role="alert"], .field-error, .hp-field, [data-current-channel], [data-preview-title], [data-preview-description], [data-preview-channel], [data-perspective-caption], [data-perspective-explore-label], #mode-label, [data-tv-transition]';
      const selector = 'h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, a, button, label, summary, span, strong, em, small';
      const candidates = [...document.body.querySelectorAll<HTMLElement>(selector)]
        .filter(el => el.textContent?.trim() && !el.closest(excluded));
      const selected = new Set<HTMLElement>();

      for (const el of candidates) {
        if ([...selected].some(parent => parent.contains(el))) continue;
        // Keep flex children, SVG icons, nested actions, and native controls intact.
        const layout = getComputedStyle(el).display;
        if (el.querySelector('svg, input, button, p, h2, h3, ul, ol, details') || /flex|grid/.test(layout)) {
          for (const node of [...el.childNodes]) {
            if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
            const wrapper = document.createElement('span');
            wrapper.className = 'text-reveal-run';
            node.before(wrapper);
            wrapper.append(node);
            wrappers.push(wrapper);
            selected.add(wrapper);
          }
        } else {
          selected.add(el);
        }
      }

      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting || el.closest('[hidden], [inert]') || !el.checkVisibility({ visibilityProperty: true })) continue;
          observer.unobserve(el);
          pending.delete(el);
          try {
            let completed = false;
            const split = SplitText.create(el, {
              type: 'lines', mask: 'lines', autoSplit: true,
              linesClass: 'text-reveal-line',
              // Line wrappers keep native reading order. Preserve label/control
              // relationships and inline links instead of adding aria-labels.
              aria: 'none',
              deepSlice: false,
              onSplit(self) {
                if (completed) return;
                const tween = gsap.fromTo(self.lines, { yPercent: 100 }, {
                  yPercent: 0, duration: .8, stagger: .1, ease: 'power3.inOut',
                  scrollTrigger: {
                    trigger: el, once: true,
                    // Keep a negative start for text already visible at scroll 0.
                    // Final footer lines must also reveal before scroll runs out.
                    start: () => el.getBoundingClientRect().top + scrollY - innerHeight * .9 > ScrollTrigger.maxScroll(window)
                      ? ScrollTrigger.maxScroll(window) - 1 : 'top 90%',
                  },
                  onComplete: () => { completed = true; },
                });
                animations.push(tween);
                return tween;
              },
            });
            splits.push(split);
          } catch {
            // A failed enhancement must never make the content unavailable.
            splits.find(split => split.elements.includes(el))?.revert();
          }
        }
      });

      for (const el of selected) { pending.add(el); observer.observe(el); }
      // Menus, disclosures and the sticky hero can expose previously hidden text.
      const visibility = new MutationObserver(() => {
        for (const el of pending) { observer.unobserve(el); observer.observe(el); }
      });
      visibility.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'inert'] });
      const focus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        animations.forEach(animation => {
          if (animation.targets().some(line => target.contains(line as Node))) animation.progress(1);
        });
      };
      document.addEventListener('focusin', focus);
      return () => {
        observer.disconnect();
        visibility.disconnect();
        document.removeEventListener('focusin', focus);
        animations.forEach(animation => { animation.scrollTrigger?.kill(); animation.revert(); });
        splits.forEach(split => split.revert());
        wrappers.forEach(wrapper => wrapper.replaceWith(...wrapper.childNodes));
      };
    });
  };
  configure();
  window.addEventListener('lpm:transmission-pause', ((event: CustomEvent<boolean>) => {
    paused = event.detail;
    configure();
  }) as EventListener);
}

void initializeTextReveal();
