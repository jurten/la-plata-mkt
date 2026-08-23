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

const contactForm = document.querySelector('[data-contact-form]');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

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
