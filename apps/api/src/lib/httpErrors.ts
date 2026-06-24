import type { FastifyReply } from 'fastify';

export type PublicErrorCode =
  | 'AUTH_REQUIRED'
  | 'AUTH_HEADER_INVALID'
  | 'AUTH_TOKEN_INVALID'
  | 'BACKEND_CONFIGURATION_REQUIRED'
  | 'PROFILE_FOUNDATION_READ_FAILED';

export type PublicErrorResponse = {
  ok: false;
  error: {
    code: PublicErrorCode;
  };
};

export function sendPublicError(
  reply: FastifyReply,
  statusCode: 401 | 500 | 503,
  code: PublicErrorCode,
): FastifyReply {
  const response: PublicErrorResponse = {
    ok: false,
    error: {
      code,
    },
  };

  return reply.status(statusCode).send(response);
}
