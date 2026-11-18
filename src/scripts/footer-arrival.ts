// Upstream scroll scenes change page height during startup. Resolve footer
// fragments after their initial layout without overriding a visitor's input.
const initialHash = location.hash;
if (initialHash === '#contacto' || initialHash === '#faq' || initialHash === '#como-trabajamos') {
  const events = new AbortController();
  const { signal } = events;
  const cancel = () => events.abort();
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    window.addEventListener(type, cancel, { once: true, passive: true, signal });
  }
  window.addEventListener('pagehide', cancel, { once: true, signal });

  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), { once: true, signal }));

  void Promise.all([loaded, document.fonts.ready]).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!signal.aborted && location.hash === initialHash) {
        const targetId = initialHash === '#faq' ? 'como-trabajamos' : initialHash.slice(1);
        document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      events.abort();
    }));
  });
}
