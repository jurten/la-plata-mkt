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

const contactForm = document.querySelector('[data-contact-form]');
const floatingContact = document.querySelector('[data-floating-whatsapp]');
const contactSection = document.querySelector('#contacto');
if (floatingContact && contactSection && 'IntersectionObserver' in window) {
  // Contact has its own action; keep the floating control clear of form fields.
  new IntersectionObserver((entries) => {
    floatingContact.hidden = entries.some((entry) => entry.isIntersecting);
  }, { threshold: 0 }).observe(contactSection);
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  contactForm
    .querySelectorAll('input[name="company"], input[name="contactName"], input[name="email"], input[name="phone"], textarea[name="issue"]')
    .forEach((field) => {
      const normalizedValue = field.value.trim();
      field.setCustomValidity('');

      if (field.minLength >= 0 && normalizedValue.length < field.minLength) {
        field.setCustomValidity(`Ingresá al menos ${field.minLength} caracteres sin contar espacios al principio o al final.`);
      } else if (field.maxLength >= 0 && normalizedValue.length > field.maxLength) {
        field.setCustomValidity(`Usá como máximo ${field.maxLength} caracteres.`);
      } else if (field.name === 'phone' && normalizedValue !== '') {
        const digitCount = normalizedValue.replace(/\D/g, '').length;
        const hasValidPhoneSyntax = /^\+?[\d\s().-]+$/.test(normalizedValue);
        if (!hasValidPhoneSyntax || digitCount < 7 || digitCount > 15) {
          field.setCustomValidity('Ingresá un celular válido con código de área (7 a 15 dígitos).');
        }
      }

      field.value = normalizedValue;
    });

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const button = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('[role="status"]');
  const formData = new FormData(contactForm);
  const originalLabel = button?.innerHTML ?? '';

  const payload = {
    company: formData.get('company'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    issue: formData.get('issue'),
    privacyAccepted: formData.get('privacyAccepted') === 'true',
    website: formData.get('website') ?? '',
    turnstileToken: formData.get('cf-turnstile-response') ?? '',
  };

  if (button) {
    button.disabled = true;
    button.textContent = 'Enviando…';
  }
  contactForm.dataset.submissionState = 'sending';
  contactForm.setAttribute('aria-busy', 'true');
  if (status) status.textContent = '';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? 'request_failed');
    }

    if (status) {
      status.textContent = result.delivery === 'demo'
        ? 'Modo demo: la consulta fue validada, pero el email todavía no fue enviado.'
        : '¡Listo! Recibimos tu consulta.';
      status.focus();
    }
    contactForm.dataset.submissionState = 'success';
    contactForm.reset();
    window.history.replaceState(null, '', '#contacto');
  } catch {
    contactForm.dataset.submissionState = 'error';
    if (status) {
      status.textContent = 'No pudimos enviar la consulta. Probá de nuevo o escribinos a ceo@laplatamarketing.com.';
      status.focus();
    }
  } finally {
    window.turnstile?.reset?.();
    if (button) {
      button.disabled = false;
      button.innerHTML = originalLabel;
    }
    contactForm.removeAttribute('aria-busy');
  }
});
