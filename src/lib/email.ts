import type { ContactPayload } from './contact-schema';

interface ResendDeliveryOptions {
  apiKey: string;
  from: string;
  to: string;
  fetchImpl?: typeof fetch;
  onWarning?: (message: string) => void;
}

interface ResendMessage {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
}

export function createResendDelivery({
  apiKey,
  from,
  to,
  fetchImpl = fetch,
  onWarning = console.warn,
}: ResendDeliveryOptions) {
  const send = async (message: ResendMessage) => {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Email provider returned ${response.status}`);
    }
  };

  return async function deliver(payload: ContactPayload): Promise<void> {
    const subjectCompany = payload.company.replace(/[\r\n]+/g, ' ').trim();

    await send({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Nueva consulta — ${subjectCompany}`,
      text: [
        'Nueva consulta desde el sitio de La Plata Marketing',
        '',
        `Empresa: ${payload.company}`,
        `Contacto: ${payload.contactName}`,
        `Email: ${payload.email}`,
        '',
        'Problema o necesidad:',
        payload.issue,
      ].join('\n'),
    });

    try {
      await send({
        from,
        to: [payload.email],
        reply_to: to,
        subject: 'Recibimos tu consulta — La Plata Marketing',
        text: [
          `Hola, ${payload.contactName}:`,
          '',
          'Gracias por contarnos qué querés mejorar. Recibimos tu consulta correctamente y vamos a revisar el contexto que compartiste.',
          '',
          'Si necesitás agregar información, podés responder a este email.',
          '',
          'La Plata Marketing',
          to,
        ].join('\n'),
      });
    } catch {
      onWarning('La consulta se recibió, pero no pudo enviarse la autorespuesta.');
    }
  };
}

export function createDemoDelivery(onDelivery: () => void = () => undefined) {
  return async function deliverDemo(): Promise<void> {
    onDelivery();
  };
}
