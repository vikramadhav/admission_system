/** Cross-origin headers the real IDAM and API must also send to the portal origin. */
export function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': 'http://localhost:4200',
    'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, accept-language, if-match, idempotency-key',
    'access-control-expose-headers': 'etag, x-request-id',
  };
}
