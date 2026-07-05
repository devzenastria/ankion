import { createHash, randomBytes } from 'node:crypto';

import type { FastifyInstance, FastifyReply } from 'fastify';

import { readOwnDbEnv } from '../config/ownDbEnv';
import { createOwnAuthPostgresRepository } from '../lib/ownAuthPostgresRepository';
import type {
  OwnAccountRecord,
  OwnAuthRepository,
  OwnPasswordCredentialRecord,
  OwnProfileReadinessRecord,
  OwnRefreshSessionRecord,
} from '../lib/ownAuthRepository';
import { readOwnAuthRouteGate } from '../lib/ownAuthRouteGate';
import { createOwnDbPostgresAdapter, OwnDbPostgresError } from '../lib/ownDbPostgresAdapter';
import {
  createOwnPasswordHash,
  verifyOwnPasswordHash,
} from '../lib/ownPasswordHashing';
import {
  createOwnRefreshToken,
  hashOwnRefreshToken,
} from '../lib/ownSessionTokens';
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

type OwnAuthErrorResponse = Readonly<{
  error: {
    code:
      | 'OWN_AUTH_DATABASE_NOT_CONFIGURED'
      | 'OWN_AUTH_DATABASE_UNAVAILABLE'
      | 'OWN_AUTH_INVALID_CREDENTIALS'
      | 'OWN_AUTH_INVALID_REQUEST'
      | 'OWN_AUTH_INVALID_SESSION'
      | 'OWN_AUTH_INVALID_INPUT'
      | 'OWN_AUTH_LOGIN_FAILED'
      | 'OWN_AUTH_LOGOUT_FAILED'
      | 'OWN_AUTH_PROFILE_FOUNDATION_FAILED'
      | 'OWN_AUTH_REFRESH_FAILED'
      | 'OWN_AUTH_SESSION_FAILED'
      | 'OWN_AUTH_SIGNUP_FAILED'
      | 'OWN_AUTH_USERNAME_TAKEN';
    message: string;
  };
}>;

type OwnAuthSessionTokenDto = Readonly<{
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
}>;

type OwnAuthSessionReadDto = Readonly<{
  accountId: string;
  anonymousIdentityId: string | null;
  expiresAt: string;
  tokenType: 'Bearer';
  sessionId: string;
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
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

type OwnAuthLoginOkResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_LOGIN_OK';
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

type OwnAuthRefreshOkResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_REFRESH_OK';
  data: {
    account: {
      id: string;
      username: string;
    };
    session: OwnAuthSessionTokenDto;
  };
}>;

type OwnAuthLogoutOkResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_LOGOUT_OK';
}>;

type OwnAuthSessionOkResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_SESSION_OK';
  data: {
    account: {
      id: string;
      username: string;
    };
    session: OwnAuthSessionReadDto;
  };
}>;

type OwnAuthProfileFoundationOkResponse = Readonly<{
  ok: true;
  code: 'OWN_AUTH_PROFILE_FOUNDATION_CREATED' | 'OWN_AUTH_PROFILE_FOUNDATION_EXISTING';
  data: {
    profileFoundation: OwnAuthSessionReadDto;
  };
}>;

type OwnAuthSignupResult = Readonly<{
  statusCode: 201 | 400 | 409 | 500 | 503;
  response: OwnAuthSignupCreatedResponse | OwnAuthErrorResponse;
}>;

type OwnAuthLoginResult = Readonly<{
  statusCode: 200 | 400 | 401 | 500 | 503;
  response: OwnAuthLoginOkResponse | OwnAuthErrorResponse;
}>;

type OwnAuthRefreshResult = Readonly<{
  statusCode: 200 | 400 | 401 | 500 | 503;
  response: OwnAuthRefreshOkResponse | OwnAuthErrorResponse;
}>;

type OwnAuthLogoutResult = Readonly<{
  statusCode: 200 | 400 | 500 | 503;
  response: OwnAuthLogoutOkResponse | OwnAuthErrorResponse;
}>;

type OwnAuthSessionResult = Readonly<{
  statusCode: 200 | 401 | 500 | 503;
  response: OwnAuthSessionOkResponse | OwnAuthErrorResponse;
}>;

type OwnAuthProfileFoundationResult = Readonly<{
  statusCode: 200 | 201 | 400 | 401 | 500 | 503;
  response: OwnAuthProfileFoundationOkResponse | OwnAuthErrorResponse;
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

function sendOwnAuthNotReady(reply: FastifyReply) {
  return reply.status(503).send(ownAuthNotReadyResponse);
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

function sendOwnAuthLoginResult(
  reply: FastifyReply,
  result: OwnAuthLoginResult,
) {
  return reply.status(result.statusCode).send(result.response);
}

function sendOwnAuthRefreshResult(
  reply: FastifyReply,
  result: OwnAuthRefreshResult,
) {
  return reply.status(result.statusCode).send(result.response);
}

function sendOwnAuthLogoutResult(
  reply: FastifyReply,
  result: OwnAuthLogoutResult,
) {
  return reply.status(result.statusCode).send(result.response);
}

function sendOwnAuthSessionResult(
  reply: FastifyReply,
  result: OwnAuthSessionResult,
) {
  return reply.status(result.statusCode).send(result.response);
}

function sendOwnAuthProfileFoundationResult(
  reply: FastifyReply,
  result: OwnAuthProfileFoundationResult,
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

function hasUnsupportedLoginField(input: Record<string, unknown>): boolean {
  const supportedFields = new Set(['password', 'username']);

  return Object.keys(input).some((key) => !supportedFields.has(key));
}

function hasUnsupportedRefreshTokenField(
  input: Record<string, unknown>,
): boolean {
  const supportedFields = new Set(['refreshToken']);

  return Object.keys(input).some((key) => !supportedFields.has(key));
}

function hasUnsupportedProfileFoundationField(
  input: Record<string, unknown>,
): boolean {
  const supportedFields = new Set(['ageBand', 'displayName', 'shortBio']);

  return Object.keys(input).some((key) => !supportedFields.has(key));
}

function readRefreshTokenFromBody(input: unknown): string | null {
  if (!isPlainObject(input) || hasUnsupportedRefreshTokenField(input)) {
    return null;
  }

  const refreshToken = input.refreshToken;

  if (typeof refreshToken !== 'string') {
    return null;
  }

  const trimmedRefreshToken = refreshToken.trim();

  return trimmedRefreshToken.length >= 20 && trimmedRefreshToken.length <= 512
    ? trimmedRefreshToken
    : null;
}

function readBearerRefreshToken(authorization: unknown): string | null {
  if (typeof authorization !== 'string') {
    return null;
  }

  const parts = authorization.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const refreshToken = parts[1] ?? '';

  return refreshToken.length >= 20 && refreshToken.length <= 512
    ? refreshToken
    : null;
}

type ProfileFoundationInput = Readonly<{
  displayName: string;
  shortBio: string | null;
  ageBand: '18_24' | '25_34' | '35_44' | '45_plus';
}>;

function normalizeProfileFoundationAgeBand(
  value: unknown,
): ProfileFoundationInput['ageBand'] | null {
  if (typeof value !== 'string') {
    return null;
  }

  switch (value.trim()) {
    case '18-24':
      return '18_24';
    case '25-34':
      return '25_34';
    case '35-44':
      return '35_44';
    case '45+':
      return '45_plus';
    default:
      return null;
  }
}

function readProfileFoundationInput(input: unknown): ProfileFoundationInput | null {
  if (!isPlainObject(input) || hasUnsupportedProfileFoundationField(input)) {
    return null;
  }

  if (typeof input.displayName !== 'string') {
    return null;
  }

  const displayName = input.displayName.trim();
  const shortBio =
    typeof input.shortBio === 'string' ? input.shortBio.trim() : '';
  const ageBand = normalizeProfileFoundationAgeBand(input.ageBand);

  if (
    displayName.length < 2 ||
    displayName.length > 32 ||
    shortBio.length > 160 ||
    ageBand === null
  ) {
    return null;
  }

  return {
    ageBand,
    displayName,
    shortBio: shortBio.length > 0 ? shortBio : null,
  };
}

function createRecoveryContactHash(recoveryEmailNormalized: string): string {
  return createHash('sha256').update(recoveryEmailNormalized, 'utf8').digest('hex');
}

function createOwnAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

function createAnonymousPublicHandle(): string {
  return `anon_${randomBytes(9).toString('base64url').toLowerCase()}`;
}

function createAnonymousVisualSeed(): string {
  return `voice-${randomBytes(8).toString('hex')}`;
}

function getRefreshSessionExpiresAt(): string {
  return new Date(Date.now() + refreshSessionTtlMs).toISOString();
}

function isActiveRefreshSession(session: OwnRefreshSessionRecord): boolean {
  return (
    session.sessionStatus === 'active' &&
    session.revokedAt === null &&
    Date.parse(session.expiresAt) > Date.now()
  );
}

function createSessionTokenDto(
  session: OwnRefreshSessionRecord,
  profileReadiness: OwnProfileReadinessRecord,
  refreshToken: string,
): OwnAuthSessionTokenDto {
  return {
    accessToken: createOwnAccessToken(),
    accountId: session.accountId,
    anonymousIdentityId: profileReadiness.anonymousIdentityId,
    anonymousIdentityReady: profileReadiness.anonymousIdentityReady,
    expiresAt: session.expiresAt,
    onboardingComplete: profileReadiness.onboardingComplete,
    profileReady: profileReadiness.profileReady,
    refreshToken,
    sessionId: session.id,
    tokenType: 'Bearer',
  };
}

function createSessionReadDto(
  session: OwnRefreshSessionRecord,
  profileReadiness: OwnProfileReadinessRecord,
): OwnAuthSessionReadDto {
  return {
    accountId: session.accountId,
    anonymousIdentityId: profileReadiness.anonymousIdentityId,
    anonymousIdentityReady: profileReadiness.anonymousIdentityReady,
    expiresAt: session.expiresAt,
    onboardingComplete: profileReadiness.onboardingComplete,
    profileReady: profileReadiness.profileReady,
    sessionId: session.id,
    tokenType: 'Bearer',
  };
}

function createAccountDto(
  account: OwnAccountRecord,
  passwordCredential: OwnPasswordCredentialRecord,
) {
  return {
    id: account.id,
    username: passwordCredential.usernameNormalized,
  };
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

function createInvalidCredentialsResult(): OwnAuthLoginResult {
  return {
    response: createOwnAuthErrorResponse(
      'OWN_AUTH_INVALID_CREDENTIALS',
      'Username or password is invalid.',
    ),
    statusCode: 401,
  };
}

async function loginWithOwnAuth(input: unknown): Promise<OwnAuthLoginResult> {
  if (!isPlainObject(input) || hasUnsupportedLoginField(input)) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_INVALID_INPUT',
        'Check login input.',
      ),
      statusCode: 400,
    };
  }

  const username = normalizeUsername(input.username);
  const password = validatePassword(input.password);

  if (!username.ok || !password.ok) {
    return createInvalidCredentialsResult();
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

  const refreshToken = createOwnRefreshToken();
  const refreshSessionExpiresAt = getRefreshSessionExpiresAt();

  try {
    const accountWithCredential =
      await repositoryResult.repository.readAccountByNormalizedUsername(
        username.normalized,
      );

    if (
      accountWithCredential === null ||
      accountWithCredential.account.lifecycleState !== 'active' ||
      accountWithCredential.passwordCredential.credentialStatus !== 'active'
    ) {
      return createInvalidCredentialsResult();
    }

    const passwordMatches = await verifyOwnPasswordHash(
      password.password,
      accountWithCredential.passwordCredential.passwordHash,
    );

    if (!passwordMatches) {
      return createInvalidCredentialsResult();
    }

    const login = await repositoryResult.repository.withTransaction(
      async (repository) => {
        const refreshSession = await repository.createRefreshSession({
          accountId: accountWithCredential.account.id,
          expiresAt: refreshSessionExpiresAt,
          refreshTokenHash: refreshToken.tokenHash,
        });
        const profileReadiness = await repository.readProfileReadinessForSessionDto(
          accountWithCredential.account.id,
        );

        return {
          profileReadiness,
          refreshSession,
        };
      },
    );

    return {
      response: {
        code: 'OWN_AUTH_LOGIN_OK',
        data: {
          account: {
            id: accountWithCredential.account.id,
            username:
              accountWithCredential.passwordCredential.usernameNormalized,
          },
          session: {
            accessToken: createOwnAccessToken(),
            accountId: accountWithCredential.account.id,
            anonymousIdentityId: login.profileReadiness.anonymousIdentityId,
            anonymousIdentityReady:
              login.profileReadiness.anonymousIdentityReady,
            expiresAt: login.refreshSession.expiresAt,
            onboardingComplete: login.profileReadiness.onboardingComplete,
            profileReady: login.profileReadiness.profileReady,
            refreshToken: refreshToken.token,
            sessionId: login.refreshSession.id,
            tokenType: 'Bearer',
          },
        },
        ok: true,
      },
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
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
        'OWN_AUTH_LOGIN_FAILED',
        'Own auth login could not be completed.',
      ),
      statusCode: 500,
    };
  }
}

type OwnActiveRefreshSessionContext = Readonly<{
  account: OwnAccountRecord;
  passwordCredential: OwnPasswordCredentialRecord;
  profileReadiness: OwnProfileReadinessRecord;
  refreshSession: OwnRefreshSessionRecord;
}>;

function createInvalidRequestResult(): OwnAuthRefreshResult {
  return {
    response: createOwnAuthErrorResponse(
      'OWN_AUTH_INVALID_REQUEST',
      'Check own auth request input.',
    ),
    statusCode: 400,
  };
}

function createInvalidLogoutRequestResult(): OwnAuthLogoutResult {
  return {
    response: createOwnAuthErrorResponse(
      'OWN_AUTH_INVALID_REQUEST',
      'Check own auth request input.',
    ),
    statusCode: 400,
  };
}

function createInvalidSessionResult(): OwnAuthRefreshResult {
  return {
    response: createOwnAuthErrorResponse(
      'OWN_AUTH_INVALID_SESSION',
      'Own auth session is invalid.',
    ),
    statusCode: 401,
  };
}

function createSessionLookupInvalidResult(): OwnAuthSessionResult {
  return {
    response: createOwnAuthErrorResponse(
      'OWN_AUTH_INVALID_SESSION',
      'Own auth session is invalid.',
    ),
    statusCode: 401,
  };
}

async function readActiveRefreshSessionContext(
  repository: OwnAuthRepository,
  refreshToken: string,
): Promise<OwnActiveRefreshSessionContext | null> {
  const refreshSession = await repository.readRefreshSessionByTokenHash(
    hashOwnRefreshToken(refreshToken),
  );

  if (refreshSession === null || !isActiveRefreshSession(refreshSession)) {
    return null;
  }

  const account = await repository.readAccountById(refreshSession.accountId);

  if (account === null || account.lifecycleState !== 'active') {
    return null;
  }

  const passwordCredential = await repository.readPasswordCredentialByAccountId(
    account.id,
  );

  if (
    passwordCredential === null ||
    passwordCredential.credentialStatus !== 'active'
  ) {
    return null;
  }

  const profileReadiness = await repository.readProfileReadinessForSessionDto(
    account.id,
  );

  return {
    account,
    passwordCredential,
    profileReadiness,
    refreshSession,
  };
}

async function refreshWithOwnAuth(input: unknown): Promise<OwnAuthRefreshResult> {
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

  const refreshToken = readRefreshTokenFromBody(input);

  if (refreshToken === null) {
    return createInvalidRequestResult();
  }

  const nextRefreshToken = createOwnRefreshToken();
  const nextRefreshSessionExpiresAt = getRefreshSessionExpiresAt();

  try {
    const refresh = await repositoryResult.repository.withTransaction(
      async (repository) => {
        const context = await readActiveRefreshSessionContext(
          repository,
          refreshToken,
        );

        if (context === null) {
          return null;
        }

        const nextRefreshSession = await repository.rotateRefreshSession({
          nextExpiresAt: nextRefreshSessionExpiresAt,
          nextRefreshTokenHash: nextRefreshToken.tokenHash,
          previousSessionId: context.refreshSession.id,
        });

        const profileReadiness = await repository.readProfileReadinessForSessionDto(
          context.account.id,
        );

        return {
          account: context.account,
          passwordCredential: context.passwordCredential,
          profileReadiness,
          refreshSession: nextRefreshSession,
        };
      },
    );

    if (refresh === null) {
      return createInvalidSessionResult();
    }

    return {
      response: {
        code: 'OWN_AUTH_REFRESH_OK',
        data: {
          account: createAccountDto(
            refresh.account,
            refresh.passwordCredential,
          ),
          session: createSessionTokenDto(
            refresh.refreshSession,
            refresh.profileReadiness,
            nextRefreshToken.token,
          ),
        },
        ok: true,
      },
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
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
        'OWN_AUTH_REFRESH_FAILED',
        'Own auth refresh could not be completed.',
      ),
      statusCode: 500,
    };
  }
}

async function logoutWithOwnAuth(input: unknown): Promise<OwnAuthLogoutResult> {
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

  const refreshToken = readRefreshTokenFromBody(input);

  if (refreshToken === null) {
    return createInvalidLogoutRequestResult();
  }

  try {
    const refreshSession =
      await repositoryResult.repository.readRefreshSessionByTokenHash(
        hashOwnRefreshToken(refreshToken),
      );

    if (refreshSession !== null && isActiveRefreshSession(refreshSession)) {
      await repositoryResult.repository.revokeRefreshSession({
        reasonCode: 'user_logout',
        sessionId: refreshSession.id,
      });
    }

    return {
      response: {
        code: 'OWN_AUTH_LOGOUT_OK',
        ok: true,
      },
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
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
        'OWN_AUTH_LOGOUT_FAILED',
        'Own auth logout could not be completed.',
      ),
      statusCode: 500,
    };
  }
}

async function readSessionWithOwnAuth(
  authorization: unknown,
): Promise<OwnAuthSessionResult> {
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

  const refreshToken = readBearerRefreshToken(authorization);

  if (refreshToken === null) {
    return createSessionLookupInvalidResult();
  }

  try {
    const context = await readActiveRefreshSessionContext(
      repositoryResult.repository,
      refreshToken,
    );

    if (context === null) {
      return createSessionLookupInvalidResult();
    }

    return {
      response: {
        code: 'OWN_AUTH_SESSION_OK',
        data: {
          account: createAccountDto(
            context.account,
            context.passwordCredential,
          ),
          session: createSessionReadDto(
            context.refreshSession,
            context.profileReadiness,
          ),
        },
        ok: true,
      },
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
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
        'OWN_AUTH_SESSION_FAILED',
        'Own auth session could not be read.',
      ),
      statusCode: 500,
    };
  }
}

async function createProfileFoundationWithOwnAuth(
  authorization: unknown,
  body: unknown,
): Promise<OwnAuthProfileFoundationResult> {
  const profileInput = readProfileFoundationInput(body);

  if (profileInput === null) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_INVALID_INPUT',
        'Check profile foundation input.',
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

  const refreshToken = readBearerRefreshToken(authorization);

  if (refreshToken === null) {
    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_INVALID_SESSION',
        'Own auth session is invalid.',
      ),
      statusCode: 401,
    };
  }

  try {
    const result = await repositoryResult.repository.withTransaction(
      async (repository) => {
        const context = await readActiveRefreshSessionContext(
          repository,
          refreshToken,
        );

        if (context === null) {
          return null;
        }

        if (context.profileReadiness.onboardingComplete) {
          return {
            code: 'OWN_AUTH_PROFILE_FOUNDATION_EXISTING' as const,
            profileReadiness: context.profileReadiness,
            refreshSession: context.refreshSession,
          };
        }

        await repository.createInitialIdentityProfileFoundation({
          accountId: context.account.id,
          displayLabel: 'Anonim kullanıcı',
          privateBio: profileInput.shortBio,
          privateDisplayName: profileInput.displayName,
          publicHandle: createAnonymousPublicHandle(),
          visualSeed: createAnonymousVisualSeed(),
        });

        const profileReadiness = await repository.readProfileReadinessForSessionDto(
          context.account.id,
        );

        return {
          code: 'OWN_AUTH_PROFILE_FOUNDATION_CREATED' as const,
          profileReadiness,
          refreshSession: context.refreshSession,
        };
      },
    );

    if (result === null) {
      return {
        response: createOwnAuthErrorResponse(
          'OWN_AUTH_INVALID_SESSION',
          'Own auth session is invalid.',
        ),
        statusCode: 401,
      };
    }

    return {
      response: {
        code: result.code,
        data: {
          profileFoundation: createSessionReadDto(
            result.refreshSession,
            result.profileReadiness,
          ),
        },
        ok: true,
      },
      statusCode:
        result.code === 'OWN_AUTH_PROFILE_FOUNDATION_CREATED' ? 201 : 200,
    };
  } catch (error) {
    if (error instanceof OwnDbPostgresError) {
      if (error.code === 'connection_unavailable') {
        return {
          response: createOwnAuthErrorResponse(
            'OWN_AUTH_DATABASE_UNAVAILABLE',
            'Own auth database is unavailable.',
          ),
          statusCode: 503,
        };
      }

      if (error.code === 'constraint_violation' || error.code === 'unique_violation') {
        return {
          response: createOwnAuthErrorResponse(
            'OWN_AUTH_INVALID_INPUT',
            'Check profile foundation input.',
          ),
          statusCode: 400,
        };
      }
    }

    return {
      response: createOwnAuthErrorResponse(
        'OWN_AUTH_PROFILE_FOUNDATION_FAILED',
        'Own auth profile foundation could not be completed.',
      ),
      statusCode: 500,
    };
  }
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

  server.post('/own-auth/login', async function ownAuthLoginHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthLoginResult(reply, await loginWithOwnAuth(request.body));
  });

  server.post('/own-auth/refresh', async function ownAuthRefreshHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthRefreshResult(
      reply,
      await refreshWithOwnAuth(request.body),
    );
  });

  server.post('/own-auth/logout', async function ownAuthLogoutHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthLogoutResult(
      reply,
      await logoutWithOwnAuth(request.body),
    );
  });

  server.get('/own-auth/session', async function ownAuthSessionHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthSessionResult(
      reply,
      await readSessionWithOwnAuth(request.headers.authorization),
    );
  });

  server.post('/own-auth/profile-foundation', async function ownAuthProfileFoundationHandler(request, reply) {
    const gate = readOwnAuthRouteGate();

    if (!gate.enabled) {
      return sendOwnAuthNotReady(reply);
    }

    return sendOwnAuthProfileFoundationResult(
      reply,
      await createProfileFoundationWithOwnAuth(
        request.headers.authorization,
        request.body,
      ),
    );
  });
}
