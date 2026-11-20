import { validateContactPayload } from '../lib/contact-schema';

type Turnstile = { render: (el: HTMLElement, options: Record<string, unknown>) => string; getResponse: (id: string) => string; reset: (id: string) => void };
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const en = document.documentElement.lang === 'en';
  const copy = (es: string, english: string) => en ? english : es;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const another = form.querySelector<HTMLButtonElement>('[data-new-inquiry]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  submit.disabled = false;
  const fields = ['contactName', 'email', 'company', 'phone', 'issue', 'privacyAccepted', 'website'];
  const draftKey = 'lpm-contact-language-draft';
  let busy = false, received = false, widget: string | undefined;
  const api = () => (window as Window & { turnstile?: Turnstile }).turnstile;
  const values = () => Object.fromEntries(fields.map(name => {
    const field = form.elements.namedItem(name) as HTMLInputElement;
    return [name, field.type === 'checkbox' ? field.checked : field.value];
  }));
  const report = (message: string, state: string, focus = false) => {
    status.textContent = message; form.dataset.state = state;
    if (focus) status.focus();
  };
  // A draft exists only during a deliberate language change, in this tab.
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null');
    sessionStorage.removeItem(draftKey);
    if (draft && draft.destination === location.pathname && Date.now() - draft.created < 1_800_000 && Date.now() >= draft.created) {
      for (const name of fields) {
        const field = form.elements.namedItem(name) as HTMLInputElement;
        if (field.type === 'checkbox') field.checked = draft.values[name] === true;
        else if (typeof draft.values[name] === 'string') field.value = draft.values[name];
      }
    }
  } catch { /* Storage is optional; direct contact remains available. */ }
  document.querySelectorAll<HTMLAnchorElement>('[data-language-switcher] a').forEach(link => link.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('aria-current') || received) return;
    try { sessionStorage.setItem(draftKey, JSON.stringify({ created: Date.now(), destination: new URL(link.href).pathname, values: values() })); } catch { /* Private browsing may disable storage. */ }
  }));
  const messages: Record<string, string> = {
    contactName: copy('Escribí tu nombre, entre 2 y 80 caracteres.', 'Enter your name, between 2 and 80 characters.'),
    email: copy('Escribí un email válido.', 'Enter a valid email address.'),
    company: copy('La empresa puede tener hasta 120 caracteres.', 'The company name can contain up to 120 characters.'),
    phone: copy('Usá un teléfono válido con 7 a 15 dígitos.', 'Use a valid phone number with 7 to 15 digits.'),
    issue: copy('Escribí un mensaje de 20 a 2000 caracteres.', 'Write a message between 20 and 2000 characters.'),
    privacyAccepted: copy('Aceptá la política de privacidad para enviar.', 'Accept the privacy policy to send your inquiry.'),
  };
  if (form.dataset.siteKey) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      try {
        widget = api()?.render(form.querySelector<HTMLElement>('[data-turnstile]')!, {
          sitekey: form.dataset.siteKey, language: en ? 'en' : 'es',
          'error-callback': () => report(copy('No pudimos verificar el envío. Reintentá o usá WhatsApp.', 'Verification failed. Retry or use WhatsApp.'), 'spam'),
          'expired-callback': () => { if (widget) api()?.reset(widget); },
        });
      } catch { report(copy('No pudimos cargar la verificación. Recargá o usá WhatsApp.', 'Verification could not load. Reload or use WhatsApp.'), 'spam'); }
    };
    script.onerror = () => report(copy('No pudimos cargar la verificación. Recargá o usá WhatsApp.', 'Verification could not load. Reload or use WhatsApp.'), 'spam');
    document.head.append(script);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || received) return;
    form.querySelectorAll<HTMLElement>('[data-error]').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    const validation = validateContactPayload(values());
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const name = String(issue.path[0]);
        const error = form.querySelector<HTMLElement>(`[data-error="${name}"]`);
        if (error) error.textContent = messages[name] ?? copy('Revisá este campo.', 'Check this field.');
        (form.elements.namedItem(name) as HTMLElement | null)?.setAttribute('aria-invalid', 'true');
      }
      report(copy('Revisá los campos indicados antes de enviar.', 'Check the highlighted fields before sending.'), 'invalid');
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return;
    }
    const token = widget ? api()?.getResponse(widget) ?? '' : '';
    if (form.dataset.siteKey && !token) { report(copy('Completá la verificación antispam antes de enviar.', 'Complete the spam verification before sending.'), 'spam', true); return; }
    busy = true; submit.disabled = true; form.setAttribute('aria-busy', 'true');
    submit.textContent = copy('Enviando', 'Sending');
    report(copy('Estamos enviando tu consulta.', 'Sending your inquiry.'), 'sending');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...validation.data, locale: en ? 'en' : 'es', turnstileToken: token }), signal: AbortSignal.timeout(30_000) });
      const result = await response.json();
      if (response.ok && result.ok === true && result.delivery === 'live') {
        received = true;
        report(copy(`Recibimos tu consulta. Vamos a responder a ${validation.data.email}.`, `We received your inquiry. We’ll reply to ${validation.data.email}.`), 'received', true);
        another.hidden = false; submit.hidden = true;
        try { sessionStorage.removeItem(draftKey); } catch { /* Optional storage. */ }
      } else if (response.ok && result.ok === true && result.delivery === 'demo') {
        report(copy('Modo demostración: validamos los datos, pero no se envió ningún email. Podés contactarnos por WhatsApp o email.', 'Demo mode: your details were validated, but no email was sent. Contact us by WhatsApp or email.'), 'demo', true);
      } else if (response.status === 429) {
        const wait = Number(response.headers.get('retry-after'));
        report(copy(`Alcanzaste el límite de intentos. ${wait > 0 ? `Esperá ${Math.ceil(wait / 60)} minutos o usá WhatsApp.` : 'Esperá unos minutos o usá WhatsApp.'}`, `Too many attempts. ${wait > 0 ? `Wait ${Math.ceil(wait / 60)} minutes or use WhatsApp.` : 'Wait a few minutes or use WhatsApp.'}`), 'rate_limit', true);
      } else if (result.error === 'spam') {
        report(copy('No pudimos verificar el envío. Volvé a verificar o escribinos por WhatsApp.', 'Verification failed. Verify again or contact us on WhatsApp.'), 'spam', true);
      } else if (result.error === 'validation') {
        report(copy('Revisá los datos e intentá de nuevo. El mensaje sigue acá.', 'Check your details and retry. Your message is still here.'), 'invalid', true);
      } else throw new Error('delivery');
    } catch {
      report(copy('No pudimos confirmar el envío. El mensaje sigue acá. Reintentá o escribinos por WhatsApp.', 'We couldn’t confirm delivery. Your message is still here. Retry or contact us on WhatsApp.'), 'error', true);
    } finally {
      busy = false; submit.disabled = false; form.removeAttribute('aria-busy'); submit.textContent = copy('Enviar mensaje', 'Send message');
      if (widget) api()?.reset(widget);
    }
  });
  another.addEventListener('click', () => {
    form.reset(); received = false; another.hidden = true; submit.hidden = false;
    report('', 'ready'); (form.elements.namedItem('contactName') as HTMLElement).focus();
  });
}
