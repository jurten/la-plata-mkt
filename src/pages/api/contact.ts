import type { APIRoute } from 'astro';
import { resolveClientAddress } from '../../lib/client-address';
import { createContactHandler, type ContactDependencies } from '../../lib/contact-handler';
import { createDemoDelivery, createResendDelivery } from '../../lib/email';
import { createRateLimiter } from '../../lib/rate-limit';
import { readRuntimeEnv } from '../../lib/runtime-env';
import { createTurnstileVerifier, verifyDemoSubmission } from '../../lib/turnstile';

const apiKey = readRuntimeEnv('RESEND_API_KEY') ?? '';
const from = readRuntimeEnv('CONTACT_FROM', import.meta.env.CONTACT_FROM) ?? '';
const to =
  readRuntimeEnv('CONTACT_TO', import.meta.env.CONTACT_TO) ?? 'ceo@laplatamarketing.com';
const turnstileSecret = readRuntimeEnv('TURNSTILE_SECRET') ?? '';
const turnstileSiteKey =
  readRuntimeEnv('PUBLIC_TURNSTILE_SITE_KEY', import.meta.env.PUBLIC_TURNSTILE_SITE_KEY) ?? '';
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

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const clientAddress = resolveClientAddress(request, () => context.clientAddress);
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
