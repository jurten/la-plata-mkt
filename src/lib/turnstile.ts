interface TurnstileOptions {
  secret: string;
  fetchImpl?: typeof fetch;
}

export function createTurnstileVerifier({ secret, fetchImpl = fetch }: TurnstileOptions) {
  return async function verifyTurnstile(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const body = new URLSearchParams({ secret, response: token });

    try {
      const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!response.ok) {
        return false;
      }

      const result = (await response.json()) as { success?: boolean };
      return result.success === true;
    } catch {
      return false;
    }
  };
}

export async function verifyDemoSubmission(): Promise<boolean> {
  return true;
}
