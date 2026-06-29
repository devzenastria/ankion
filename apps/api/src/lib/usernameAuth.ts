import { randomUUID } from 'node:crypto';

import { createClient } from '@supabase/supabase-js';

import {
  BackendConfigurationError,
  readSupabaseServerEnv,
} from '../config/env';
import {
  normalizeRecoveryEmail,
  normalizeUsername,
  validatePassword,
} from './usernameValidation';

export type UsernameAuthSessionDto = {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
  expires_in: number;
  token_type: string;
  user_id: string;
};

export type UsernameSignupDiagnosticStage =
  | 'USERNAME_SIGNUP_STAGE_VALIDATE_INPUT'
  | 'USERNAME_SIGNUP_STAGE_USERNAME_EXISTS_RPC'
  | 'USERNAME_SIGNUP_STAGE_AUTH_CREATE_USER'
  | 'USERNAME_SIGNUP_STAGE_CREATE_CREDENTIALS_RPC'
  | 'USERNAME_SIGNUP_STAGE_SIGN_IN'
  | 'USERNAME_SIGNUP_STAGE_CLEANUP_RPC'
  | 'USERNAME_LOGIN_STAGE_LOOKUP_IDENTIFIER_RPC';

export type UsernameSignupDiagnostic = {
  stage: UsernameSignupDiagnosticStage;
  errorCode?: string;
  errorStatus?: string | number;
  errorName?: string;
};

export type UsernameSignupInput = {
  username: unknown;
  password: unknown;
  recoveryEmail?: unknown;
  recoveryWarningAcknowledged?: unknown;
};

export type UsernameLoginInput = {
  username: unknown;
  password: unknown;
};

export type UsernameAuthResult =
  | {
      ok: true;
      session: UsernameAuthSessionDto;
    }
  | {
      ok: false;
      statusCode: 400 | 401 | 409 | 500 | 503;
      code:
        | 'BACKEND_CONFIGURATION_REQUIRED'
        | 'USERNAME_AUTH_INVALID_INPUT'
        | 'USERNAME_AUTH_FAILED'
        | 'USERNAME_UNAVAILABLE'
        | 'USERNAME_AUTH_UNAVAILABLE';
      message: string;
      diagnostic?: UsernameSignupDiagnostic;
    };

type UsernameAuthErrorStatusCode = Extract<
  UsernameAuthResult,
  { ok: false }
>['statusCode'];
type UsernameAuthErrorCode = Extract<
  UsernameAuthResult,
  { ok: false }
>['code'];

type SupabaseServerClient = ReturnType<typeof createSupabaseUsernameAuthClient>;

type UsernameIdentifierLookupRow = {
  owner_user_id: string;
  auth_identifier: string;
};

const loginFailedMessage = 'Kullanıcı adı veya parola hatalı.';
const usernameUnavailableMessage = 'Bu kullanıcı adı uygun değil.';
const invalidInputMessage = 'Bilgileri kontrol et.';
const unavailableMessage = 'İşlem şu anda tamamlanamadı. Daha sonra tekrar dene.';
const internalAuthIdentifierDomain = 'auth.ankion.internal';

function createSupabaseUsernameAuthClient() {
  const env = readSupabaseServerEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function createErrorResult(
  statusCode: UsernameAuthErrorStatusCode,
  code: UsernameAuthErrorCode,
  message: string,
  diagnostic?: UsernameSignupDiagnostic,
): UsernameAuthResult {
  const result: UsernameAuthResult = {
    ok: false,
    statusCode,
    code,
    message,
  };

  if (diagnostic !== undefined) {
    result.diagnostic = diagnostic;
  }

  return result;
}

function getSafeSupabaseErrorDiagnostic(
  stage: UsernameSignupDiagnosticStage,
  error: unknown,
): UsernameSignupDiagnostic {
  const candidate =
    typeof error === 'object' && error !== null
      ? (error as {
          code?: unknown;
          status?: unknown;
          name?: unknown;
        })
      : {};

  const diagnostic: UsernameSignupDiagnostic = {
    stage,
  };

  if (typeof candidate.code === 'string') {
    diagnostic.errorCode = candidate.code;
  }

  if (typeof candidate.status === 'string' || typeof candidate.status === 'number') {
    diagnostic.errorStatus = candidate.status;
  }

  if (typeof candidate.name === 'string') {
    diagnostic.errorName = candidate.name;
  }

  return diagnostic;
}

function createSessionDto(
  session: NonNullable<
    Awaited<ReturnType<SupabaseServerClient['auth']['signInWithPassword']>>['data']['session']
  >,
): UsernameAuthSessionDto {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? null,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user_id: session.user.id,
  };
}

function createInternalAuthIdentifier(): string {
  return `account_${randomUUID()}@${internalAuthIdentifierDomain}`;
}

async function getClientOrError(): Promise<
  | {
      ok: true;
      client: SupabaseServerClient;
    }
  | {
      ok: false;
      result: UsernameAuthResult;
    }
> {
  try {
    return {
      ok: true,
      client: createSupabaseUsernameAuthClient(),
    };
  } catch (error) {
    if (error instanceof BackendConfigurationError) {
      return {
        ok: false,
        result: createErrorResult(
          503,
          'BACKEND_CONFIGURATION_REQUIRED',
          unavailableMessage,
        ),
      };
    }

    return {
      ok: false,
      result: createErrorResult(500, 'USERNAME_AUTH_UNAVAILABLE', unavailableMessage),
    };
  }
}

async function isUsernameTaken(
  client: SupabaseServerClient,
  usernameNormalized: string,
): Promise<
  | {
      ok: true;
      usernameTaken: boolean;
    }
  | {
      ok: false;
      diagnostic: UsernameSignupDiagnostic;
    }
> {
  const { data, error } = await client.rpc('username_auth_username_exists', {
    p_username_normalized: usernameNormalized,
  });

  if (error !== null) {
    return {
      ok: false,
      diagnostic: getSafeSupabaseErrorDiagnostic(
        'USERNAME_SIGNUP_STAGE_USERNAME_EXISTS_RPC',
        error,
      ),
    };
  }

  return {
    ok: true,
    usernameTaken: data === true,
  };
}

async function cleanupCreatedAuthUser(
  client: SupabaseServerClient,
  ownerUserId: string,
): Promise<void> {
  try {
    await client.auth.admin.deleteUser(ownerUserId);
  } catch {
    // Best-effort cleanup only. The public response remains generic.
  }
}

async function cleanupCreatedUsernameArtifacts(
  client: SupabaseServerClient,
  ownerUserId: string,
): Promise<void> {
  try {
    await client.rpc('username_auth_cleanup_account_credentials', {
      p_owner_user_id: ownerUserId,
    });
  } catch {
    // Best-effort cleanup only. The public response remains generic.
  }
}

async function cleanupCreatedSignupState(
  client: SupabaseServerClient,
  ownerUserId: string,
): Promise<void> {
  await cleanupCreatedUsernameArtifacts(client, ownerUserId);
  await cleanupCreatedAuthUser(client, ownerUserId);
}

async function signInWithInternalIdentifier(
  client: SupabaseServerClient,
  authIdentifier: string,
  password: string,
  diagnostic?: UsernameSignupDiagnostic,
): Promise<UsernameAuthResult> {
  const { data, error } = await client.auth.signInWithPassword({
    email: authIdentifier,
    password,
  });

  if (error !== null || data.session === null) {
    return createErrorResult(
      401,
      'USERNAME_AUTH_FAILED',
      loginFailedMessage,
      diagnostic,
    );
  }

  return {
    ok: true,
    session: createSessionDto(data.session),
  };
}

export async function signupWithUsernamePassword(
  input: UsernameSignupInput,
): Promise<UsernameAuthResult> {
  const username = normalizeUsername(input.username);
  const password = validatePassword(input.password);
  const recoveryEmail = normalizeRecoveryEmail(input.recoveryEmail);

  if (!username.ok) {
    if (username.code === 'USERNAME_RESERVED') {
      return createErrorResult(409, 'USERNAME_UNAVAILABLE', usernameUnavailableMessage);
    }

    return createErrorResult(
      400,
      'USERNAME_AUTH_INVALID_INPUT',
      invalidInputMessage,
      {
        stage: 'USERNAME_SIGNUP_STAGE_VALIDATE_INPUT',
      },
    );
  }

  if (!password.ok || !recoveryEmail.ok) {
    return createErrorResult(
      400,
      'USERNAME_AUTH_INVALID_INPUT',
      invalidInputMessage,
      {
        stage: 'USERNAME_SIGNUP_STAGE_VALIDATE_INPUT',
      },
    );
  }

  if (input.recoveryWarningAcknowledged !== true) {
    return createErrorResult(
      400,
      'USERNAME_AUTH_INVALID_INPUT',
      invalidInputMessage,
      {
        stage: 'USERNAME_SIGNUP_STAGE_VALIDATE_INPUT',
      },
    );
  }

  const clientResult = await getClientOrError();

  if (!clientResult.ok) {
    return clientResult.result;
  }

  const { client } = clientResult;
  const usernameTakenResult = await isUsernameTaken(client, username.normalized);

  if (!usernameTakenResult.ok) {
    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      usernameTakenResult.diagnostic,
    );
  }

  if (usernameTakenResult.usernameTaken) {
    return createErrorResult(409, 'USERNAME_UNAVAILABLE', usernameUnavailableMessage);
  }

  const authIdentifier = createInternalAuthIdentifier();
  const { data: createUserData, error: createUserError } =
    await client.auth.admin.createUser({
      email: authIdentifier,
      password: password.password,
      email_confirm: true,
      user_metadata: {
        auth_kind: 'username_password',
      },
    });

  if (createUserError !== null || createUserData.user === null) {
    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      getSafeSupabaseErrorDiagnostic(
        'USERNAME_SIGNUP_STAGE_AUTH_CREATE_USER',
        createUserError,
      ),
    );
  }

  const ownerUserId = createUserData.user.id;

  const credentialsResult = await client.rpc(
    'username_auth_create_account_credentials',
    {
      p_owner_user_id: ownerUserId,
      p_username_display: username.display,
      p_username_normalized: username.normalized,
      p_auth_identifier: authIdentifier,
      p_recovery_email: recoveryEmail.recoveryEmail,
      p_recovery_email_normalized: recoveryEmail.recoveryEmailNormalized,
      p_recovery_warning_acknowledged: true,
    },
  );

  if (credentialsResult.error !== null) {
    await cleanupCreatedSignupState(client, ownerUserId);

    if (credentialsResult.error.code === '23505') {
      return createErrorResult(
        409,
        'USERNAME_UNAVAILABLE',
        usernameUnavailableMessage,
      );
    }

    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      getSafeSupabaseErrorDiagnostic(
        'USERNAME_SIGNUP_STAGE_CREATE_CREDENTIALS_RPC',
        credentialsResult.error,
      ),
    );
  }

  const signInResult = await signInWithInternalIdentifier(
    client,
    authIdentifier,
    password.password,
    {
      stage: 'USERNAME_SIGNUP_STAGE_SIGN_IN',
    },
  );

  if (!signInResult.ok) {
    await cleanupCreatedSignupState(client, ownerUserId);

    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      signInResult.diagnostic ?? {
        stage: 'USERNAME_SIGNUP_STAGE_SIGN_IN',
      },
    );
  }

  return signInResult;
}

export async function loginWithUsernamePassword(
  input: UsernameLoginInput,
): Promise<UsernameAuthResult> {
  const username = normalizeUsername(input.username);
  const password = validatePassword(input.password);

  if (!username.ok || !password.ok) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  const clientResult = await getClientOrError();

  if (!clientResult.ok) {
    return clientResult.result;
  }

  const { client } = clientResult;
  const { data: identifierRows, error: identifierError } = await client.rpc(
    'username_auth_lookup_identifier',
    {
      p_username_normalized: username.normalized,
    },
  );

  if (identifierError !== null || !Array.isArray(identifierRows)) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  if (identifierRows.length !== 1) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  const identifierRow = (identifierRows as UsernameIdentifierLookupRow[])[0];

  if (identifierRow === undefined) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  return signInWithInternalIdentifier(
    client,
    identifierRow.auth_identifier,
    password.password,
  );
}
