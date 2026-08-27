import { describe, expect, it } from 'vitest';
import { createContactHandler, type ContactDependencies } from '../../src/lib/contact-handler';

const validPayload = {
  company: 'Inmobiliaria Horizonte',
  contactName: 'Ana Pérez',
  email: 'ana@example.com',
  phone: '  +54 9 221 555-1234  ',
  issue: 'Queremos ordenar las consultas de redes y hacer un mejor seguimiento comercial.',
  privacyAccepted: true,
  website: '',
  turnstileToken: 'verified-token',
};

describe('createContactHandler', () => {
  it('verifica spam, entrega una consulta normalizada y responde en modo live', async () => {
    const events: string[] = [];
    const delivered: unknown[] = [];
    const dependencies: ContactDependencies = {
      mode: 'live',
      verifySpam: async (token) => {
        events.push(`spam:${token}`);
        return true;
      },
      deliver: async (payload) => {
        events.push('deliver');
        delivered.push(payload);
      },
    };
    const handler = createContactHandler(dependencies);
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, delivery: 'live' });
    expect(events).toEqual(['spam:verified-token', 'deliver']);
    expect(delivered).toEqual([
      {
        company: 'Inmobiliaria Horizonte',
        contactName: 'Ana Pérez',
        email: 'ana@example.com',
        phone: '+54 9 221 555-1234',
        issue: 'Queremos ordenar las consultas de redes y hacer un mejor seguimiento comercial.',
        privacyAccepted: true,
        website: '',
      },
    ]);
  });

  it('responde 400 ante JSON inválido sin invocar dependencias', async () => {
    const events: string[] = [];
    const handler = createContactHandler({
      mode: 'demo',
      verifySpam: async () => {
        events.push('spam');
        return true;
      },
      deliver: async () => {
        events.push('deliver');
      },
    });
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid',
    });

    const response = await handler(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'invalid_json' });
    expect(events).toEqual([]);
  });

  it('responde 413 sin invocar dependencias cuando el cuerpo supera el límite', async () => {
    const events: string[] = [];
    const handler = createContactHandler({
      mode: 'demo',
      verifySpam: async () => {
        events.push('spam');
        return true;
      },
      deliver: async () => {
        events.push('deliver');
      },
    });
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validPayload, issue: 'x'.repeat(20_000) }),
    });

    const response = await handler(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'too_large' });
    expect(events).toEqual([]);
  });

  it('bloquea una consulta cuando falla la verificación antispam', async () => {
    const events: string[] = [];
    const handler = createContactHandler({
      mode: 'live',
      verifySpam: async () => false,
      deliver: async () => {
        events.push('deliver');
      },
    });
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const response = await handler(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'spam' });
    expect(events).toEqual([]);
  });
});
