function isIpLiteral(value: string): boolean {
  if (value.length === 0 || value.length > 45) return false;

  if (value.includes('.')) {
    const octets = value.split('.');
    return (
      octets.length === 4 &&
      octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
    );
  }

  if (!value.includes(':') || !/^[\da-f:]+$/i.test(value)) return false;

  try {
    new URL(`http://[${value}]/`);
    return true;
  } catch {
    return false;
  }
}

export function resolveClientAddress(request: Request, adapterAddress: () => string): string {
  const cloudflareAddress = request.headers.get('cf-connecting-ip')?.trim() ?? '';
  if (isIpLiteral(cloudflareAddress)) return cloudflareAddress;

  try {
    const fallback = adapterAddress().trim();
    return isIpLiteral(fallback) ? fallback : 'unknown';
  } catch {
    return 'unknown';
  }
}
