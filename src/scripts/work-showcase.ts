function initializeWorkShowcase() {
  document.querySelectorAll<HTMLElement>('[data-work-list]').forEach(root => {
    const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-work-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-work-item]')];
    const status = root.querySelector<HTMLElement>('[data-work-status]');
    const select = (value: string) => {
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workFilter === value)));
      let visible = 0;
      items.forEach(item => {
        item.hidden = value !== 'all' && !item.dataset.services?.split(' ').includes(value);
        if (!item.hidden) visible++;
      });
      if (status) status.textContent = (status.dataset.countLabel ?? '{count}').replace('{count}', String(visible));
      window.dispatchEvent(new Event('lpm:work-layout'));
    };
    filters.forEach(button => button.addEventListener('click', () => select(button.dataset.workFilter!)));
    root.querySelector<HTMLElement>('.work-filters')!.hidden = false;
    root.querySelectorAll<HTMLAnchorElement>('[data-work-link]').forEach(link => link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      try {
        sessionStorage.setItem('lpm-work-return', JSON.stringify({ href: location.pathname + location.search + '#' + link.closest('article')!.id, destination: new URL(link.href).pathname, created: Date.now() }));
      } catch { /* Native links remain usable when storage is unavailable. */ }
    }));
    const revealHash = () => {
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      if (items.some(item => item.id === id && item.hidden)) select('all');
    };
    window.addEventListener('hashchange', revealHash);
    revealHash();
  });
}
initializeWorkShowcase();
