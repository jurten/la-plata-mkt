// Run before the first paint so a document reload never exposes a bare frame.
(() => {
  const root = document.documentElement;
  root.dataset.navVariant = 'circle';
  try {
    sessionStorage.removeItem('lpm-nav-variant');
    const pending = JSON.parse(sessionStorage.getItem('lpm-nav-pending') || 'null');
    sessionStorage.removeItem('lpm-nav-pending');
    const destination = pending && new URL(pending.href, location.href);
    if (!destination || destination.origin !== location.origin || destination.pathname !== location.pathname || destination.search !== location.search || Date.now() - pending.created > 15000) return;
    if (matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches) return;
    root.dataset.navArrival = 'pending';
    // Leave the page readable even if the enhancement bundle fails to load.
    window.setTimeout(() => {
      if (!root.dataset.navArrival) return;
      delete root.dataset.navArrival;
      document.querySelector('[data-page-transition]')?.setAttribute('hidden', '');
    }, 4000);
  } catch { /* Storage-disabled browsers retain ordinary document navigation. */ }
})();
