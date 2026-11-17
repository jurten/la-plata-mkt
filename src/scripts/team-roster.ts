export function initTeamRosters() {
  document.querySelectorAll<HTMLElement>('[data-team-roster]').forEach(roster => {
    if (roster.dataset.teamInitialized) return;
    roster.dataset.teamInitialized = '';
    const wheel = roster.querySelector<HTMLElement>('[data-option-wheel]');
    const profiles = Array.from(roster.querySelectorAll<HTMLElement>('[data-team-profile]'));
    const previous = roster.querySelector<HTMLButtonElement>('[data-team-previous]');
    const next = roster.querySelector<HTMLButtonElement>('[data-team-next]');
    const navigation = roster.querySelector<HTMLElement>('[data-team-navigation]');
    const status = roster.querySelector<HTMLElement>('[data-team-status]');
    if (!wheel || !profiles.length) return;
    const events = new AbortController();
    const { signal } = events;
    const forced = matchMedia('(forced-colors: active)');
    const gate = roster.closest<HTMLElement>('.featured-about');
    const isLocked = () => gate?.hasAttribute('data-team-locked') ?? false;
    let active = Number(wheel.dataset.selected) || 0;

    const render = (announce = false) => {
      const enhanced = !forced.matches;
      roster.toggleAttribute('data-team-ready', enhanced);
      if (navigation) navigation.hidden = !enhanced;
      wheel.setAttribute('aria-describedby', 'team-wheel-hint');
      profiles.forEach((profile, index) => {
        profile.hidden = enhanced && index !== active;
        profile.classList.toggle('is-active', index === active);
      });
      const locked = isLocked();
      if (previous) previous.disabled = locked || active === 0;
      if (next) next.disabled = locked || active === profiles.length - 1;
      if (wheel.getAttribute('role') === 'listbox') {
        wheel.setAttribute('aria-disabled', String(locked));
        wheel.tabIndex = locked ? -1 : 0;
      }
      if (locked && document.activeElement instanceof HTMLElement && roster.contains(document.activeElement)) document.activeElement.blur();
      if (announce && status) {
        const profile = profiles[active];
        const name = profile.querySelector('[data-team-current-name]')?.textContent?.trim();
        const role = profile.querySelector('[data-team-current-role]')?.textContent?.trim();
        status.textContent = `${name}, ${role}`;
      }
    };

    wheel.addEventListener('option-wheel:change', event => {
      active = (event as CustomEvent<{ index: number }>).detail.index;
      render(true);
    }, { signal });
    const step = (delta: number) => { if (!isLocked()) wheel.dispatchEvent(new CustomEvent('option-wheel:step', { detail: delta })); };
    previous?.addEventListener('click', () => step(-1), { signal });
    next?.addEventListener('click', () => step(1), { signal });
    forced.addEventListener('change', () => render(), { signal });
    roster.addEventListener('focusin', event => {
      if (isLocked() && event.target instanceof HTMLElement) event.target.blur();
    }, { signal });
    const gateObserver = new MutationObserver(() => render());
    if (gate) gateObserver.observe(gate, { attributes: true, attributeFilter: ['data-team-locked'] });
    render();
    document.addEventListener('astro:before-swap', () => { gateObserver.disconnect(); events.abort(); }, { once: true });
  });
}
