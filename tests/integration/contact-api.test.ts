import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { POST } from '../../src/pages/api/contact';

function contactRequest(body: string, contentLength?: number): Request {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(contentLength === undefined ? {} : { 'content-length': String(contentLength) }),
    },
    body,
  });
}

async function postRequest(request: Request): Promise<Response> {
  return POST({
    request,
    clientAddress: '203.0.113.77',
  } as APIContext);
}

async function post(body: string, contentLength?: number): Promise<Response> {
  return postRequest(contactRequest(body, contentLength));
}

class ObservableRequest extends Request {
  bodyAccessCount = 0;

  override get body(): Request['body'] {
    this.bodyAccessCount += 1;
    return super.body;
  }
}

describe('contact API rate-limit ordering', () => {
  it('responde 429 antes de analizar el cuerpo del intento once', async () => {
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await post('{invalid');
      expect(response.status).toBe(400);
    }

    const request = new ObservableRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid',
    });
    const response = await postRequest(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'rate_limit' });
    expect(request.bodyAccessCount).toBe(0);
    const retryAfter = Number(response.headers.get('retry-after'));
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(600);
  });
});
