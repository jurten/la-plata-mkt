import { gsap } from 'gsap';
import Swiper from 'swiper';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
async function initializePortfolio() {
  await document.fonts.ready;
  const root = document.querySelector<HTMLElement>('[data-portfolio-reveal]');
  if (!root) return;
  const projects = [...root.querySelectorAll<HTMLElement>('[data-featured-project]')];
  const media = gsap.matchMedia();
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


  document.addEventListener('astro:before-swap', () => media.revert(), { once: true });
}
initializePortfolio();
