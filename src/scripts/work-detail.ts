const backLinks = document.querySelectorAll<HTMLAnchorElement>('[data-work-back]');
try {
  const saved = JSON.parse(sessionStorage.getItem('lpm-work-return') ?? 'null');
  if (saved && saved.destination === location.pathname && Date.now() - saved.created < 3600000) {
    const url = new URL(saved.href, location.origin);
    if (url.origin === location.origin && ['/', '/en/', '/trabajos/', '/en/work/'].includes(url.pathname)) {
      backLinks.forEach(link => { link.href = url.href; });
    }
  }
} catch { /* The server-rendered index link is the fallback. */ }

// Native anchors retain a useful current chapter without taking over scrolling.
const chapterLinks = [...document.querySelectorAll<HTMLAnchorElement>('.work-chapters a')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) chapterLinks.forEach(link => {
    if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -65% 0px' });
chapterLinks.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
document.addEventListener('astro:before-swap', () => observer.disconnect(), { once: true });
