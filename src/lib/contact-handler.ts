import type { ContactPayload } from './contact-schema';
import { validateContactPayload } from './contact-schema';

export type ContactDeliveryMode = 'demo' | 'live';

export interface ContactDependencies {
  mode: ContactDeliveryMode;
  verifySpam: (token: string) => Promise<boolean>;
  deliver: (payload: ContactPayload) => Promise<void>;
}

const MAX_CONTACT_BODY_BYTES = 16_384;

type JsonBodyResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

function jsonError(error: 'invalid_json' | 'too_large', status: 400 | 413): JsonBodyResult {
  return { ok: false, response: Response.json({ ok: false, error }, { status }) };
}

async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength);
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
      return jsonError('invalid_json', 400);
    }
    if (declaredBytes > MAX_CONTACT_BODY_BYTES) {
      return jsonError('too_large', 413);
    }
  }

  if (!request.body) {
    return jsonError('invalid_json', 400);
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let totalBytes = 0;
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_CONTACT_BODY_BYTES) {
        await reader.cancel();
        return jsonError('too_large', 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();

    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return jsonError('invalid_json', 400);
    }

    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return jsonError('invalid_json', 400);
  }
}

export function createContactHandler(dependencies: ContactDependencies) {
  return async function handleContact(request: Request): Promise<Response> {
    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return parsed.response;
    }
    const body = parsed.body;
    const validation = validateContactPayload(body);

    if (!validation.success) {
      return Response.json({ ok: false, error: 'validation' }, { status: 400 });
    }

    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    const verified = await dependencies.verifySpam(token);

    if (!verified) {
      return Response.json({ ok: false, error: 'spam' }, { status: 400 });
    }

    await dependencies.deliver(validation.data);

    return Response.json({ ok: true, delivery: dependencies.mode });
  };
}
