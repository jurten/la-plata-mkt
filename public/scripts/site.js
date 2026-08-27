const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  nav?.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
    toggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    toggle?.focus();
  }
});

const motionTargets = [...document.querySelectorAll('[data-motion]')];

if (motionTargets.length > 0) {
  let motionPreference = null;
  try {
    motionPreference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  } catch {
    motionPreference = null;
  }
  let observer;

  const revealAllMotionTargets = () => {
    motionTargets.forEach((target) => target.classList.add('is-in-view'));
  };

  const failOpenMotion = () => {
    observer?.disconnect();
    observer = undefined;
    delete document.documentElement.dataset.motionState;
    revealAllMotionTargets();
  };

  const observeMotionTargets = () => {
    if (typeof window.IntersectionObserver !== 'function') {
      revealAllMotionTargets();
      return;
    }

    try {
      observer ??= new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '-22% 0px -22%', threshold: 0.18 });

      motionTargets
        .filter((target) => !target.classList.contains('is-in-view'))
        .forEach((target) => observer.observe(target));
    } catch {
      observer = undefined;
      revealAllMotionTargets();
    }
  };

  const syncMotionPreference = () => {
    try {
      if (typeof motionPreference?.matches !== 'boolean') {
        failOpenMotion();
        return false;
      }

      if (motionPreference.matches) {
        document.documentElement.dataset.motionState = 'reduced';
        observer?.disconnect();
        revealAllMotionTargets();
        return true;
      }

      if (document.documentElement.dataset.motionState === 'reduced') {
        motionTargets.forEach((target) => target.classList.remove('is-in-view'));
      }
      document.documentElement.dataset.motionState = 'ready';
      observeMotionTargets();
      return true;
    } catch {
      failOpenMotion();
      return false;
    }
  };

  if (motionPreference && syncMotionPreference()) {
    try {
      if (typeof motionPreference.addEventListener === 'function') {
        motionPreference.addEventListener('change', syncMotionPreference);
      } else {
        const addLegacyListener = Reflect.get(motionPreference, 'addListener');
        if (typeof addLegacyListener === 'function') {
          addLegacyListener.call(motionPreference, syncMotionPreference);
        }
      }
    } catch {
      failOpenMotion();
    }
  } else {
    failOpenMotion();
  }
}

const contactForm = document.querySelector('[data-contact-form]');

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
    contactForm.reset();
    window.history.replaceState(null, '', '#contacto');
  } catch {
    if (status) {
      status.textContent = 'No pudimos enviar la consulta. Probá de nuevo o escribinos a laplatamarketing@gmail.com.';
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
