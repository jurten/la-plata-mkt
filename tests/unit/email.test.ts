import { describe, expect, it } from 'vitest';
import { createResendDelivery } from '../../src/lib/email';
import type { ContactPayload } from '../../src/lib/contact-schema';

const fakeCredential = ['fixture', 'only'].join('-');

const payload: ContactPayload = {
  company: 'Estudio Ejemplo',
  contactName: 'Ana Pérez',
  email: 'ana@example.com',
  issue: 'Necesitamos ordenar las consultas que llegan desde el sitio institucional.',
  privacyAccepted: true,
  website: '',
};

describe('createResendDelivery', () => {
  it('envía primero la notificación y luego la autorespuesta en español', async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const delivery = createResendDelivery({
      apiKey: fakeCredential,
      from: 'La Plata Marketing <hola@laplatamarketing.com>',
      to: 'laplatamarketing@gmail.com',
      fetchImpl: async (url, init) => {
        requests.push({ url: String(url), init: init ?? {} });
        return new Response(JSON.stringify({ id: `email-${requests.length}` }), { status: 200 });
      },
    });

    await delivery(payload);

    expect(requests).toHaveLength(2);
    expect(requests.map(({ url }) => url)).toEqual([
      'https://api.resend.com/emails',
      'https://api.resend.com/emails',
    ]);
    const notification = JSON.parse(String(requests[0].init.body));
    const autoReply = JSON.parse(String(requests[1].init.body));
    expect(notification).toMatchObject({
      to: ['laplatamarketing@gmail.com'],
      reply_to: 'ana@example.com',
      subject: 'Nueva consulta — Estudio Ejemplo',
    });
    expect(notification.text).toContain('Nueva consulta desde el sitio de La Plata Marketing');
    expect(notification.text).not.toContain('laplatamarketing.com');
    expect(notification.text).toContain('Necesitamos ordenar las consultas');
    expect(autoReply).toMatchObject({
      to: ['ana@example.com'],
      reply_to: 'laplatamarketing@gmail.com',
      subject: 'Recibimos tu consulta — La Plata Marketing',
    });
    expect(autoReply.text).toContain('Hola, Ana Pérez:');
  });

  it('conserva la consulta recibida si falla solamente la autorespuesta', async () => {
    const warnings: string[] = [];
    let requestCount = 0;
    const delivery = createResendDelivery({
      apiKey: fakeCredential,
      from: 'La Plata Marketing <hola@laplatamarketing.com>',
      to: 'laplatamarketing@gmail.com',
      fetchImpl: async () => {
        requestCount += 1;
        return new Response('{}', { status: requestCount === 1 ? 200 : 500 });
      },
      onWarning: (message) => warnings.push(message),
    });

    await expect(delivery(payload)).resolves.toBeUndefined();
    expect(requestCount).toBe(2);
    expect(warnings).toEqual(['La consulta se recibió, pero no pudo enviarse la autorespuesta.']);
  });

  it('propaga el fallo de la notificación y no intenta la autorespuesta', async () => {
    let requestCount = 0;
    const delivery = createResendDelivery({
      apiKey: fakeCredential,
      from: 'La Plata Marketing <hola@laplatamarketing.com>',
      to: 'laplatamarketing@gmail.com',
      fetchImpl: async () => {
        requestCount += 1;
        return new Response('{}', { status: 500 });
      },
    });

    await expect(delivery(payload)).rejects.toThrow('Email provider returned 500');
    expect(requestCount).toBe(1);
  });

  it('elimina CR y LF del asunto aunque el adaptador reciba datos sin validar', async () => {
    const requests: RequestInit[] = [];
    const delivery = createResendDelivery({
      apiKey: fakeCredential,
      from: 'La Plata Marketing <hola@laplatamarketing.com>',
      to: 'laplatamarketing@gmail.com',
      fetchImpl: async (_url, init) => {
        requests.push(init ?? {});
        return new Response('{}', { status: 200 });
      },
    });

    await delivery({ ...payload, company: 'Acme\r\nBcc: victim@example.com' });

    const notification = JSON.parse(String(requests[0].body));
    expect(notification.subject).toBe('Nueva consulta — Acme Bcc: victim@example.com');
    expect(notification.subject).not.toMatch(/[\r\n]/);
  });
});
