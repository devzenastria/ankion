import type { FastifyInstance, FastifyReply } from 'fastify';

import { readOwnAuthRouteGate } from '../lib/ownAuthRouteGate';

type OwnAuthNotReadyResponse = Readonly<{
  ok: false;
  code: 'OWN_AUTH_NOT_READY';
  message: 'Own auth is not ready yet.';
}>;

type OwnAuthRuntimeNotImplementedResponse = Readonly<{
  error: {
    code: 'OWN_AUTH_RUNTIME_NOT_IMPLEMENTED';
    message: 'Own auth runtime is enabled but this endpoint is not implemented yet.';
  };
}>;

const ownAuthNotReadyResponse: OwnAuthNotReadyResponse = {
  ok: false,
  code: 'OWN_AUTH_NOT_READY',
  message: 'Own auth is not ready yet.',
};

const ownAuthRuntimeNotImplementedResponse: OwnAuthRuntimeNotImplementedResponse =
  {
    error: {
      code: 'OWN_AUTH_RUNTIME_NOT_IMPLEMENTED',
      message:
        'Own auth runtime is enabled but this endpoint is not implemented yet.',
    },
  };

function sendOwnAuthNotReady(reply: FastifyReply) {
  return reply.status(503).send(ownAuthNotReadyResponse);
}

function sendOwnAuthRuntimeNotImplemented(reply: FastifyReply) {
  return reply.status(501).send(ownAuthRuntimeNotImplementedResponse);
}

function sendOwnAuthGateResponse(reply: FastifyReply) {
  const gate = readOwnAuthRouteGate();

  if (!gate.enabled) {
    return sendOwnAuthNotReady(reply);
  }

  return sendOwnAuthRuntimeNotImplemented(reply);
}

export async function registerOwnAuthRoutes(
  server: FastifyInstance,
): Promise<void> {
  server.post('/own-auth/signup', async function ownAuthSignupHandler(_, reply) {
    return sendOwnAuthGateResponse(reply);
  });

  server.post('/own-auth/login', async function ownAuthLoginHandler(_, reply) {
    return sendOwnAuthGateResponse(reply);
  });

  server.post('/own-auth/refresh', async function ownAuthRefreshHandler(_, reply) {
    return sendOwnAuthGateResponse(reply);
  });

  server.post('/own-auth/logout', async function ownAuthLogoutHandler(_, reply) {
    return sendOwnAuthGateResponse(reply);
  });

  server.get('/own-auth/session', async function ownAuthSessionHandler(_, reply) {
    return sendOwnAuthGateResponse(reply);
  });
}
