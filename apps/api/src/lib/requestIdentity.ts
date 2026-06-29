import { isIP } from 'node:net';

import type { FastifyRequest } from 'fastify';

const unidentifiedClientKey = 'unidentified';

function getHeaderValue(request: FastifyRequest, headerName: string): string | null {
  const rawValue = request.headers[headerName];

  if (Array.isArray(rawValue)) {
    return rawValue[0] ?? null;
  }

  return typeof rawValue === 'string' ? rawValue : null;
}

function normalizeIpCandidate(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const candidate = value.trim();

  if (candidate.length === 0) {
    return null;
  }

  return isIP(candidate) === 0 ? null : candidate;
}

function getFirstForwardedIp(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const [firstForwardedValue] = value.split(',');

  return normalizeIpCandidate(firstForwardedValue);
}

export function getClientRateLimitKey(request: FastifyRequest): string {
  const cloudflareIp = normalizeIpCandidate(
    getHeaderValue(request, 'cf-connecting-ip'),
  );

  if (cloudflareIp !== null) {
    return `ip:${cloudflareIp}`;
  }

  // Railway receives traffic through trusted proxy infrastructure. Use only
  // the first syntactically valid forwarded IP as a coarse rate-limit key.
  const forwardedIp = getFirstForwardedIp(
    getHeaderValue(request, 'x-forwarded-for'),
  );

  if (forwardedIp !== null) {
    return `ip:${forwardedIp}`;
  }

  const requestIp = normalizeIpCandidate(request.ip);

  if (requestIp !== null) {
    return `ip:${requestIp}`;
  }

  return unidentifiedClientKey;
}
