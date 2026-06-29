import type { FastifyInstance } from 'fastify';

import {
  loginWithUsernamePassword,
  signupWithUsernamePassword,
  type UsernameAuthResult,
} from '../lib/usernameAuth';
import { getClientRateLimitKey } from '../lib/requestIdentity';

const authAttemptWindowMs = 60_000;
const authAttemptMaxRequests = 20;

type AuthAttemptBucket = {
  count: number;
  resetAt: number;
};

type UsernameAuthErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type UsernameAuthSuccessResponse = {
  ok: true;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number | null;
    expires_in: number;
    token_type: string;
    user_id: string;
  };
};

const authAttemptBuckets = new Map<string, AuthAttemptBucket>();

function sendUsernameAuthResult(result: UsernameAuthResult) {
  if (result.ok) {
    const response: UsernameAuthSuccessResponse = {
      ok: true,
      session: result.session,
    };

    return response;
  }

  const response: UsernameAuthErrorResponse = {
    ok: false,
    error: {
      code: result.code,
      message: result.message,
    },
  };

  return {
    response,
    statusCode: result.statusCode,
  };
}

function isAuthAttemptLimited(key: string, now: number): boolean {
  const existingBucket = authAttemptBuckets.get(key);

  if (existingBucket === undefined || existingBucket.resetAt <= now) {
    authAttemptBuckets.set(key, {
      count: 1,
      resetAt: now + authAttemptWindowMs,
    });

    return false;
  }

  existingBucket.count += 1;

  return existingBucket.count > authAttemptMaxRequests;
}

function sendAuthRateLimitResponse() {
  return {
    ok: false,
    error: {
      code: 'USERNAME_AUTH_RATE_LIMITED',
      message: 'Çok fazla deneme. Daha sonra tekrar dene.',
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function registerUsernameAuthRoutes(
  server: FastifyInstance,
): Promise<void> {
  server.post('/v1/auth/signup', async function signupHandler(request, reply) {
    if (
      isAuthAttemptLimited(`signup:${getClientRateLimitKey(request)}`, Date.now())
    ) {
      return reply.status(429).send(sendAuthRateLimitResponse());
    }

    if (!isPlainObject(request.body)) {
      return reply.status(400).send({
        ok: false,
        error: {
          code: 'USERNAME_AUTH_INVALID_INPUT',
          message: 'Bilgileri kontrol et.',
        },
      });
    }

    const result = await signupWithUsernamePassword({
      username: request.body.username,
      password: request.body.password,
      recoveryEmail: request.body.recoveryEmail,
      recoveryWarningAcknowledged: request.body.recoveryWarningAcknowledged,
    });

    if (!result.ok && result.diagnostic !== undefined) {
      request.log.warn(
        {
          usernameSignupDiagnostic: result.diagnostic,
        },
        'username signup diagnostic',
      );
    }

    const output = sendUsernameAuthResult(result);

    if ('statusCode' in output) {
      return reply.status(output.statusCode).send(output.response);
    }

    return output;
  });

  server.post('/v1/auth/login', async function loginHandler(request, reply) {
    if (
      isAuthAttemptLimited(`login:${getClientRateLimitKey(request)}`, Date.now())
    ) {
      return reply.status(429).send(sendAuthRateLimitResponse());
    }

    if (!isPlainObject(request.body)) {
      return reply.status(401).send({
        ok: false,
        error: {
          code: 'USERNAME_AUTH_FAILED',
          message: 'Kullanıcı adı veya parola hatalı.',
        },
      });
    }

    const result = await loginWithUsernamePassword({
      username: request.body.username,
      password: request.body.password,
    });
    const output = sendUsernameAuthResult(result);

    if ('statusCode' in output) {
      return reply.status(output.statusCode).send(output.response);
    }

    return output;
  });
}
