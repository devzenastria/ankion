import { createHash, randomBytes } from 'node:crypto';

import type { FastifyInstance, FastifyReply } from 'fastify';

import { readOwnDbEnv } from '../config/ownDbEnv';
import { createOwnAuthPostgresRepository } from '../lib/ownAuthPostgresRepository';
import type { OwnAuthRepository } from '../lib/ownAuthRepository';
import { readOwnAuthRouteGate } from '../lib/ownAuthRouteGate';
import { createOwnDbPostgresAdapter, OwnDbPostgresError } from '../lib/ownDbPostgresAdapter';
import { createOwnPasswordHash } from '../lib/ownPasswordHashing';
import { createOwnRefreshToken } from '../lib/ownSessionTokens';
import {
  normalizeRecoveryEmail,
  normalizeUsername,
  validatePassword,
} from '../lib/usernameValidation';

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

type OwnAuthErrorResponse = Readonly<{
  error: {
    code:
      | 'OWN_AUTH_DATABASE_NOT_CONFIGURED'
      | 'OWN_AUTH_DATABASE_UNAVAILABLE'
      | 'OWN_AUTH_INVALID_INPUT'
      | 'OWN_AUTH_SIGNUP_FAILED'
      | 'OWN_AUTH_USERNAME_TAKEN';
    message: string;
  };
}>;

type OwnAuthSignupCreatedResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_SIGNUP_CREATED';
  data: {
    account: {
      id: string;
      username: string;
    };
    session: {
      accountId: string;
      anonymousIdentityId: string | null;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      tokenType: 'Bearer';
      sessionId: string;
      profileReady: boolean;
      anonymousIdentityReady: boolean;
      onboardingComplete: boolean;
    };
  };
}>;

type OwnAuthSignupResult = Readonly<{
  statusCode: 201 | 400 | 409 | 500 | 503;
  response: OwnAuthSignupCreatedResponse | OwnAuthErrorResponse;
}>;

type OwnAuthRepositoryCache = {
  key: string;
  repository: OwnAuthRepository;
};

const refreshSessionTtlMs = 30 * 24 * 60 * 60 * 1000;
let ownAuthRepositoryCache: OwnAuthRepositoryCache | null = null;

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

function createOwnAuthErrorResponse(
  code: OwnAuthErrorResponse['error']['code'],
  message: string,
): OwnAuthErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}

function sendOwnAuthSignupResult(
  reply: FastifyReply,
  result: OwnAuthSignupResult,
) {
  return reply.status(result.statusCode).send(result.response);
}

function getOwnAuthRepositoryFromEnv():
  | {
      ok: true;
      repository: OwnAuthRepository;
    }
  | {
      ok: false;
    } {
  const ownDbEnv = readOwnDbEnv();

  if (!ownDbEnv.configured) {
    return {
      ok: false,
    };
  }

  const cacheKey = `${ownDbEnv.databaseUrl}\n${ownDbEnv.sslMode}`;

  if (ownAuthRepositoryCache?.key === cacheKey) {
    return {
      ok: true,
      repository: ownAuthRepositoryCache.repository,
    };
  }

  const db = createOwnDbPostgresAdapter({
    connectionTimeoutMillis: 3_000,
    databaseUrl: ownDbEnv.databaseUrl,
    maxPoolSize: 5,
    sslMode: ownDbEnv.sslMode,
  });
  const repository = createOwnAuthPostgresRepository(db);

  ownAuthRepositoryCache = {
    key: cacheKey,
    repository,
  };

  return {
    ok: true,
    repository,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function hasUnsupportedSignupField(input: Record<string, unknown>): boolean {
  const supportedFields = new Set(['email', 'password', 'recoveryEmail', 'username']);

  return Object.keys(input).some((key) => !supportedFields.has(key));
}

function createRecoveryContactHash(recoveryEmailNormalized: string): string {
  return createHash('sha256').update(recoveryEmailNormalized, 'utf8').digest('hex');
}

function createOwnAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

function getRefreshSessionExpiresAt(): string {
  return new Date(Date.now() + refreshSessionTtlMs).toISOString();
}

async function signupWithOwnAuth(input: unknown): Promise<OwnAuthSignupResult> {
  if (!isPlainObject(input) || hasUnsupportedSignupField(input)) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_INVALID_INPUT',
        'Check signup input.',
      ),
      statusCode: 400,
    };
  }

  const username = normalizeUsername(input.username);
  const password = validatePassword(input.password);
  const recoveryEmail = normalizeRecoveryEmail(
    input.email ?? input.recoveryEmail,
  );

  if (!username.ok || !password.ok || !recoveryEmail.ok) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_INVALID_INPUT',
        'Check signup input.',
      ),
      statusCode: 400,
    };
  }

  const repositoryResult = getOwnAuthRepositoryFromEnv();

  if (!repositoryResult.ok) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_DATABASE_NOT_CONFIGURED',
        'Own auth database is not configured.',
      ),
      statusCode: 503,
    };
  }

  const passwordHash = await createOwnPasswordHash(password.password);
  const refreshToken = createOwnRefreshToken();
  const refreshSessionExpiresAt = getRefreshSessionExpiresAt();

  try {
    const signup = await repositoryResult.repository.withTransaction(
      async (repository) => {
        const existingAccount = await repository.readAccountByNormalizedUsername(
          username.normalized,
        );

        if (existingAccount !== null) {
          return null;
        }

        const account = await repository.createAccount({
          lifecycleState: 'active',
        });
        const passwordCredential = await repository.createPasswordCredential({
          accountId: account.id,
          passwordHash,
          usernameDisplay: username.display,
          usernameNormalized: username.normalized,
        });

        if (recoveryEmail.recoveryEmailNormalized !== null) {
          await repository.upsertRecoveryContact({
            accountId: account.id,
            contactKind: 'email',
            contactValueHash: createRecoveryContactHash(
              recoveryEmail.recoveryEmailNormalized,
            ),
            contactValueNormalized: recoveryEmail.recoveryEmailNormalized,
          });
        }

        const refreshSession = await repository.createRefreshSession({
          accountId: account.id,
          expiresAt: refreshSessionExpiresAt,
          refreshTokenHash: refreshToken.tokenHash,
        });
        const profileReadiness = await repository.readProfileReadinessForSessionDto(
          account.id,
        );

        return {
          account,
          passwordCredential,
          profileReadiness,
          refreshSession,
        };
      },
    );

    if (signup === null) {
      return {
        response: createOwnAuthErrorResponse(
          'OWN_AUTH_USERNAME_TAKEN',
          'Username is already taken.',
        ),
        statusCode: 409,
      };
    }

    return {
      response: {
        code: 'OWN_AUTH_SIGNUP_CREATED',
        data: {
          account: {
            id: signup.account.id,
            username: signup.passwordCredential.usernameNormalized,
          },
          session: {
            accessToken: createOwnAccessToken(),
            accountId: signup.account.id,
            anonymousIdentityId: signup.profileReadiness.anonymousIdentityId,
            anonymousIdentityReady:
              signup.profileReadiness.anonymousIdentityReady,
            expiresAt: signup.refreshSession.expiresAt,
            onboardingComplete: signup.profileReadiness.onboardingComplete,
            profileReady: signup.profileReadiness.profileReady,
            refreshToken: refreshToken.token,
            sessionId: signup.refreshSession.id,
            tokenType: 'Bearer',
          },
        },
        ok: true,
      },
      statusCode: 201,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
      if (error.code === 'unique_violation') {
        return {
          response: createOwnAuthErrorResponse(
            'OWN_AUTH_USERNAME_TAKEN',
            'Username is already taken.',
          ),
          statusCode: 409,
        };
      }

      if (error.code === 'connection_unavailable') {
        return {
          response: createOwnAuthErrorResponse(
            'OWN_AUTH_DATABASE_UNAVAILABLE',
            'Own auth database is unavailable.',
          ),
          statusCode: 503,
        };
      }
    }

    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_SIGNUP_FAILED',
        'Own auth signup could not be completed.',
      ),
      statusCode: 500,
    };
  }
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
  server.post('/own-auth/signup', async function ownAuthSignupHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthSignupResult(reply, await signupWithOwnAuth(request.body));
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
