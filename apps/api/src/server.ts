import fastify from 'fastify';
import type { FastifyError } from 'fastify';

import { sendPublicError } from './lib/httpErrors';
import { registerRequestGuards } from './lib/requestGuards';
import { registerHealthRoute } from './routes/health';
import { registerProfileFoundationRoute } from './routes/profileFoundation';

export type BuildServerOptions = {
  logger?: boolean;
};

const bodyLimitBytes = 32 * 1024;

const redactedLogPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'authorization',
  'access_token',
  'refresh_token',
  'service_role',
  'SUPABASE_SERVICE_ROLE_KEY',
  'token',
  'password',
];

export async function buildServer(options: BuildServerOptions = {}) {
  const server = fastify({
    bodyLimit: bodyLimitBytes,
    logger:
      options.logger === false
        ? false
        : {
            redact: {
              paths: redactedLogPaths,
              censor: '[redacted]',
            },
          },
  });

  server.setErrorHandler(function publicErrorHandler(
    error: FastifyError,
    _,
    reply,
  ) {
    if (
      error.code === 'FST_ERR_CTP_BODY_TOO_LARGE' ||
      error.statusCode === 413
    ) {
      return sendPublicError(reply, 413, 'request_too_large');
    }

    return sendPublicError(reply, 500, 'unexpected_server_error');
  });

  await registerRequestGuards(server);
  await registerHealthRoute(server);
  await registerProfileFoundationRoute(server);

  return server;
}
