import { initPortraitScroll } from './about-portrait-scroll';
import { initValueBlobs } from './about-value-blobs';

function initAboutPage() {
  const root = document.querySelector<HTMLElement>('[data-about-page]');
  if (!root || root.dataset.aboutReady) return;
  root.dataset.aboutReady = 'true';
  const destroyPortraitScroll = initPortraitScroll(root);
  const destroyValueBlobs = initValueBlobs(root);
  document.addEventListener('astro:before-swap', () => {
    destroyPortraitScroll();
    destroyValueBlobs();
  }, { once: true });
}
initAboutPage();
document.addEventListener('astro:page-load', initAboutPage);
