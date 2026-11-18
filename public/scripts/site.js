const root = document.documentElement;

// A single authored scene: widen the view from one inquiry to the whole system.
const study = document.querySelector('[data-perspective-study]');
const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
if (study) {
  const controls = study.querySelector('[data-perspective-controls]');
  const choices = [...study.querySelectorAll('[data-perspective-view]')];
  const caption = study.querySelector('[data-perspective-caption]');
  const explore = study.querySelector('[data-perspective-explore]');
  const exploreLabel = study.querySelector('[data-perspective-explore-label]');
  const setPerspective = (view) => {
    const safeView = view === 'piece' ? 'piece' : 'whole';
    study.dataset.view = safeView;
    choices.forEach((choice) => choice.setAttribute('aria-pressed', String(choice.dataset.perspectiveView === safeView)));
    if (caption) caption.textContent = safeView === 'piece'
      ? 'Una consulta aislada cuenta sólo una parte.'
      : 'Las piezas se potencian cuando trabajan juntas.';
    if (exploreLabel) exploreLabel.textContent = safeView === 'piece' ? 'Ampliar la mirada' : 'Volver a una pieza';
  };
  if (controls) controls.hidden = false;
  if (explore) explore.hidden = false;
  choices.forEach((choice) => choice.addEventListener('click', () => setPerspective(choice.dataset.perspectiveView)));
  explore?.addEventListener('click', () => setPerspective(study.dataset.view === 'piece' ? 'whole' : 'piece'));
  setPerspective(motionPreference?.matches ? 'whole' : 'piece');
  requestAnimationFrame(() => { study.dataset.enhanced = 'true'; });
  motionPreference?.addEventListener?.('change', () => {
    if (motionPreference.matches) {
      setPerspective('whole');
      study.getAnimations?.({ subtree: true }).forEach((animation) => animation.finish());
    }
  });
}

const themeButtons = [...document.querySelectorAll('[data-theme-toggle]')];
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

const applyTheme = (theme, persist = false) => {
  const safeTheme = explicitThemes.has(theme) ? theme : 'auto';
  const resolvedTheme = safeTheme === 'auto'
    ? (systemPrefersDark() ? 'dark' : 'light')
    : safeTheme;
  root.dataset.theme = safeTheme;

  if (persist) {
    try {
      localStorage.setItem('lpm-theme', safeTheme);
    } catch {
      // Theme persistence is optional; the controls still work for this page view.
    }
  }

  themeButtons.forEach((button) => {
    button.removeAttribute('disabled');
    button.setAttribute('aria-checked', String(resolvedTheme === 'dark'));
    button.title = resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  });

  const dark = resolvedTheme === 'dark';
  if (themeMeta) themeMeta.setAttribute('content', dark ? '#060917' : '#EEF2FF');
  if (themeLabel) {
    themeLabel.textContent = safeTheme === 'auto'
      ? `Identidad visual / Sistema ${dark ? 'oscuro' : 'claro'}`
      : dark
        ? 'Identidad visual / Pantalla nocturna'
        : 'Identidad visual / Señal viva';
  }
};

let storedTheme = 'auto';
try {
  storedTheme = localStorage.getItem('lpm-theme') || 'auto';
} catch {
  storedTheme = 'auto';
}
applyTheme(storedTheme);

themeButtons.forEach((button) => {
  button.addEventListener('click', () => applyTheme(button.getAttribute('aria-checked') === 'true' ? 'light' : 'dark', true));
});

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
if (floatingContact && contactSection && 'IntersectionObserver' in window) {
  // The footer has its own direct action; avoid showing a duplicate floating link.
  new IntersectionObserver((entries) => {
    floatingContact.hidden = entries.some((entry) => entry.isIntersecting);
  }, { threshold: 0 }).observe(contactSection);
}
