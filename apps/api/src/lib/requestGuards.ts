import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { sendPublicError } from './httpErrors';

const corsAllowedMethods = 'GET,OPTIONS';
const corsAllowedHeaders = 'Authorization,Content-Type';
const corsMaxAgeSeconds = 600;
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 120;
const rateLimitSkippedPaths = new Set(['/health', '/ready']);

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function setCorsHeaders(reply: FastifyReply, origin: string | undefined): void {
  if (origin !== undefined) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Vary', 'Origin');
  }

  reply.header('Access-Control-Allow-Methods', corsAllowedMethods);
  reply.header('Access-Control-Allow-Headers', corsAllowedHeaders);
  reply.header('Access-Control-Max-Age', String(corsMaxAgeSeconds));
}

function isOriginAllowed(origin: string | undefined): boolean {
  return origin === undefined || origin.trim().length === 0;
}

function getRateLimitKey(request: FastifyRequest): string {
  return request.ip;
}

function isRateLimited(request: FastifyRequest, now: number): boolean {
  if (rateLimitSkippedPaths.has(request.url)) {
    return false;
  }

  const key = getRateLimitKey(request);
  const existingBucket = rateLimitBuckets.get(key);

  if (existingBucket === undefined || existingBucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });

    return false;
  }

  existingBucket.count += 1;

  return existingBucket.count > rateLimitMaxRequests;
}

export async function registerRequestGuards(
  server: FastifyInstance,
): Promise<void> {
  server.addHook('onRequest', async function requestGuard(request, reply) {
    const origin = request.headers.origin;
    const normalizedOrigin = typeof origin === 'string' ? origin.trim() : '';
    const safeOrigin =
      normalizedOrigin.length > 0 ? normalizedOrigin : undefined;

    if (!isOriginAllowed(safeOrigin)) {
      return sendPublicError(reply, 403, 'cors_not_allowed');
    }

    setCorsHeaders(reply, safeOrigin);

    if (request.method === 'OPTIONS') {
      return reply.status(204).send();
    }

    if (isRateLimited(request, Date.now())) {
      return sendPublicError(reply, 429, 'rate_limited');
    }
  });
}
