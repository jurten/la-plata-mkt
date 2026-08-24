const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const paletteLab = document.querySelector('[data-palette-lab]');

if (paletteLab) {
  const paletteToggle = paletteLab.querySelector('[data-palette-toggle]');
  const palettePanel = paletteLab.querySelector('[data-palette-panel]');
  const paletteOptions = [...paletteLab.querySelectorAll('[data-palette-option]')];
  const paletteStatus = paletteLab.querySelector('[data-palette-status]');
  const copyPaletteLink = paletteLab.querySelector('[data-copy-palette-link]');
  const paletteRouteLinks = [...document.querySelectorAll('[data-palette-route-link]')];
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const setPanelOpen = (isOpen) => {
    if (palettePanel) palettePanel.hidden = !isOpen;
    paletteToggle?.setAttribute('aria-expanded', String(isOpen));
  };

  paletteToggle?.addEventListener('click', () => {
    setPanelOpen(paletteToggle.getAttribute('aria-expanded') !== 'true');
  });

  paletteOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const palette = option.dataset.paletteOption;
      if (!palette) return;

      document.documentElement.dataset.palette = palette;
      paletteOptions.forEach((candidate) => {
        candidate.setAttribute('aria-pressed', String(candidate === option));
      });

      const activeName = option.querySelector('strong')?.textContent?.trim();
      const toggleName = paletteToggle?.querySelector('small');
      if (toggleName && activeName) toggleName.textContent = activeName;
      if (themeColor && option.dataset.themeColor) themeColor.setAttribute('content', option.dataset.themeColor);

      const url = new URL(window.location.href);
      url.searchParams.set('palettes', '1');
      url.searchParams.set('palette', palette);
      window.history.replaceState(null, '', url);
      paletteRouteLinks.forEach((link) => {
        const linkUrl = new URL(link.getAttribute('href') ?? '', window.location.origin);
        linkUrl.searchParams.set('palettes', '1');
        linkUrl.searchParams.set('palette', palette);
        link.setAttribute('href', `${linkUrl.pathname}${linkUrl.search}${linkUrl.hash}`);
      });
      if (paletteStatus) paletteStatus.textContent = `${activeName ?? 'Paleta'} activa`;
    });
  });

  copyPaletteLink?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (paletteStatus) paletteStatus.textContent = 'Enlace copiado';
    } catch {
      if (paletteStatus) paletteStatus.textContent = 'Copiá el enlace desde la barra del navegador';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && paletteToggle?.getAttribute('aria-expanded') === 'true') {
      setPanelOpen(false);
      paletteToggle.focus();
    }
  });
}

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

  contactForm
    .querySelectorAll('input[name="company"], input[name="contactName"], input[name="email"], textarea[name="issue"]')
    .forEach((field) => {
      const normalizedValue = field.value.trim();
      field.setCustomValidity('');

      if (field.minLength >= 0 && normalizedValue.length < field.minLength) {
        field.setCustomValidity(`Ingresá al menos ${field.minLength} caracteres sin contar espacios al principio o al final.`);
      } else if (field.maxLength >= 0 && normalizedValue.length > field.maxLength) {
        field.setCustomValidity(`Usá como máximo ${field.maxLength} caracteres.`);
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
