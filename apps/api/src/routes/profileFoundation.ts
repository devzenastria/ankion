import type { FastifyInstance } from 'fastify';

import { parseBearerToken } from '../lib/bearerToken';
import { sendPublicError } from '../lib/httpErrors';
import { readProfileFoundationForAccessToken } from '../lib/supabaseServer';

type ProfileFoundationResponse = {
  ok: true;
  profileFoundation: {
    profileReady: boolean;
    anonymousIdentityReady: boolean;
  };
};

export async function registerProfileFoundationRoute(server: FastifyInstance) {
  server.get(
    '/v1/me/profile-foundation',
    async function profileFoundationHandler(request, reply) {
      const bearerToken = parseBearerToken(request.headers.authorization);

      if (!bearerToken.ok) {
        return sendPublicError(reply, 401, bearerToken.code);
      }

      const result = await readProfileFoundationForAccessToken(
        bearerToken.token,
      );

      if (!result.ok) {
        if (result.code === 'AUTH_TOKEN_INVALID') {
          return sendPublicError(reply, 401, result.code);
        }

        if (result.code === 'BACKEND_CONFIGURATION_REQUIRED') {
          return sendPublicError(reply, 503, result.code);
        }

        return sendPublicError(reply, 500, result.code);
      }

      const response: ProfileFoundationResponse = {
        ok: true,
        profileFoundation: result.profileFoundation,
      };

      return response;
    },
  );
}
