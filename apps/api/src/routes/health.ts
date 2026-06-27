import type { FastifyInstance } from 'fastify';

import { isSupabaseServerEnvReady } from '../config/env';
import { sendPublicError } from '../lib/httpErrors';

type HealthResponse = {
  ok: true;
  service: 'ankion-api';
};

type ReadyResponse = {
  ok: true;
  service: 'ankion-api';
  ready: true;
};

export async function registerHealthRoute(server: FastifyInstance) {
  server.get('/health', async function healthHandler() {
    const response: HealthResponse = {
      ok: true,
      service: 'ankion-api',
    };

    return response;
  });

  server.get('/ready', async function readyHandler(_, reply) {
    if (!isSupabaseServerEnvReady()) {
      return sendPublicError(reply, 503, 'BACKEND_CONFIGURATION_REQUIRED');
    }

    const response: ReadyResponse = {
      ok: true,
      service: 'ankion-api',
      ready: true,
    };

    return response;
  });
}
