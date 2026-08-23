import type { APIRoute } from 'astro';
import { createContactHandler, type ContactDependencies } from '../../lib/contact-handler';
import { createDemoDelivery, createResendDelivery } from '../../lib/email';
import { createRateLimiter } from '../../lib/rate-limit';
import { createTurnstileVerifier, verifyDemoSubmission } from '../../lib/turnstile';

const apiKey = import.meta.env.RESEND_API_KEY ?? '';
const from = import.meta.env.CONTACT_FROM ?? '';
const to = import.meta.env.CONTACT_TO ?? 'laplatamarketing@gmail.com';
const turnstileSecret = import.meta.env.TURNSTILE_SECRET ?? '';
const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
const liveReady = Boolean(apiKey && from && turnstileSecret && turnstileSiteKey);

const dependencies: ContactDependencies = liveReady
  ? {
      mode: 'live',
      verifySpam: createTurnstileVerifier({ secret: turnstileSecret }),
      deliver: createResendDelivery({ apiKey, from, to }),
    }
  : {
      mode: 'demo',
      verifySpam: verifyDemoSubmission,
      deliver: createDemoDelivery(() => {
        console.info('[contact-demo] Consulta validada; entrega de email desactivada.');
      }),
    };

const handleContact = createContactHandler(dependencies);
const contactRateLimiter = createRateLimiter({ limit: 10, windowMs: 600_000 });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rateLimit = contactRateLimiter.check(clientAddress);
  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: 'rate_limit' },
      {
        status: 429,
        headers: {
          'cache-control': 'no-store',
          'retry-after': String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const response = await handleContact(request);
  response.headers.set('cache-control', 'no-store');
  return response;
};
