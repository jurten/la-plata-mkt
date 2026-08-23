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

function observableBodyRequest() {
  let pullCount = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      pullCount += 1;
      controller.enqueue(new TextEncoder().encode('{invalid'));
      controller.close();
    },
  }, { highWaterMark: 0 });
  const request = new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

  return { request, getPullCount: () => pullCount };
}

describe('contact API rate-limit ordering', () => {
  it('responde 429 antes de analizar el cuerpo del intento once', async () => {
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await post('{invalid');
      expect(response.status).toBe(400);
    }

    const { request, getPullCount } = observableBodyRequest();
    const response = await postRequest(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'rate_limit' });
    expect(getPullCount()).toBe(0);
    await expect(request.text()).resolves.toBe('{invalid');
    expect(getPullCount()).toBeGreaterThan(0);
    const retryAfter = Number(response.headers.get('retry-after'));
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(600);
  });
});
