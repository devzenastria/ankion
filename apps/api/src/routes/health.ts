import type { FastifyInstance } from 'fastify';

type HealthResponse = {
  ok: true;
  service: 'ankion-api';
};

export async function registerHealthRoute(server: FastifyInstance) {
  server.get('/health', async function healthHandler() {
    const response: HealthResponse = {
      ok: true,
      service: 'ankion-api',
    };

    return response;
  });
}
