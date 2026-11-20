const root = document.documentElement;

const english = root.lang === 'en';

const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeLabel = document.querySelector('#mode-label');
const explicitThemes = new Set(['light', 'dark']);
let colorPreference;

try {
  colorPreference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined;
} catch {
  colorPreference = undefined;
}

const systemPrefersDark = () => {
  try {
    return colorPreference?.matches === true;
  } catch {
    return false;
  }
};

const applyTheme = (theme) => {
  const safeTheme = explicitThemes.has(theme) ? theme : 'auto';
  const resolvedTheme = safeTheme === 'auto'
    ? (systemPrefersDark() ? 'dark' : 'light')
    : safeTheme;
  root.dataset.theme = safeTheme;

  const dark = resolvedTheme === 'dark';
  if (themeMeta) themeMeta.setAttribute('content', dark ? '#11151C' : '#EEF2FF');
  if (themeLabel) {
    themeLabel.textContent = safeTheme === 'auto'
      ? (english ? `Visual identity / System ${dark ? 'dark' : 'light'}` : `Identidad visual / Sistema ${dark ? 'oscuro' : 'claro'}`)
      : dark
        ? (english ? 'Visual identity / Night screen' : 'Identidad visual / Pantalla nocturna')
        : (english ? 'Visual identity / Live signal' : 'Identidad visual / Señal viva');
  }
};

let storedTheme = 'auto';
try {
  storedTheme = localStorage.getItem('lpm-theme') || 'auto';
} catch {
  storedTheme = 'auto';
}
applyTheme(storedTheme);

try {
  colorPreference?.addEventListener?.('change', () => {
    if (root.dataset.theme === 'auto') applyTheme('auto');
  });
} catch {
  // A missing system-preference listener must not block navigation or the form.
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

if (toggle && nav && !toggle.closest('[data-tv-navigation]')) {
  root.dataset.menuState = 'ready';
  const closeMenu = (returnFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  document.querySelector('.topbar')?.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  window.matchMedia?.('(min-width: 1001px)').addEventListener?.('change', () => closeMenu());
}

const floatingContact = document.querySelector('[data-floating-whatsapp]');
const contactSection = document.querySelector('#contacto');
if (floatingContact && 'IntersectionObserver' in window) {
  const hero = document.querySelector('#inicio');
  const reveal = document.querySelector('[data-hero-reveal]');
  let pastHero = !hero || hero.getBoundingClientRect().bottom <= 0;
  const contactBounds = contactSection?.getBoundingClientRect();
  let contactVisible = !!contactBounds && contactBounds.top < innerHeight && contactBounds.bottom > 0;
  const coveredControls = new Set();
  const syncFloatingContact = () => {
    // Reveal the contact action as soon as the hero opens its masked edge.
    const heroOpened = reveal?.hasAttribute('data-reveal-enabled')
      ? ['moving', 'complete'].includes(reveal.dataset.revealState) : pastHero;
    const hidden = !heroOpened || contactVisible || coveredControls.size > 0;
    if (floatingContact.hidden !== hidden) floatingContact.hidden = hidden;
  };
  const sections = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
      if (entry.target === contactSection) contactVisible = entry.isIntersecting;
    }
    syncFloatingContact();
  }, { threshold: 0 });
  if (hero) sections.observe(hero);
  if (contactSection) sections.observe(contactSection);
  const controlClearance = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) coveredControls.add(entry.target);
      else coveredControls.delete(entry.target);
    }
    syncFloatingContact();
  }, { rootMargin: '-65% 0px 0px 0px' });
  document.querySelectorAll('.interior-page .flowing-team__list, .interior-page .team-profile, .interior-page .project-card .inline-link').forEach(element => controlClearance.observe(element));
  if (reveal) new MutationObserver(syncFloatingContact).observe(reveal, {
    attributes: true, attributeFilter: ['data-reveal-enabled', 'data-reveal-state'],
  });
  syncFloatingContact();
}
