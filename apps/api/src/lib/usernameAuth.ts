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
  | 'USERNAME_SIGNUP_STAGE_USERNAME_TAKEN_LOOKUP'
  | 'USERNAME_SIGNUP_STAGE_AUTH_CREATE_USER'
  | 'USERNAME_SIGNUP_STAGE_INSERT_USERNAME'
  | 'USERNAME_SIGNUP_STAGE_INSERT_AUTH_IDENTIFIER'
  | 'USERNAME_SIGNUP_STAGE_INSERT_RECOVERY'
  | 'USERNAME_SIGNUP_STAGE_SIGN_IN'
  | 'USERNAME_SIGNUP_STAGE_CLEANUP';

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

type UsernameRow = {
  owner_user_id: string;
};

type AuthIdentifierRow = {
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
): Promise<boolean | null> {
  const { count, error } = await client
    .from('account_usernames')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('username_normalized', usernameNormalized)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (error !== null) {
    return null;
  }

  return (count ?? 0) > 0;
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
    await client
      .schema('private')
      .from('account_recovery_contacts')
      .delete()
      .eq('owner_user_id', ownerUserId);
  } catch {
    // Best-effort cleanup only. The public response remains generic.
  }

  try {
    await client
      .schema('private')
      .from('account_auth_identifiers')
      .delete()
      .eq('owner_user_id', ownerUserId);
  } catch {
    // Best-effort cleanup only. The public response remains generic.
  }

  try {
    await client
      .from('account_usernames')
      .delete()
      .eq('owner_user_id', ownerUserId);
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
  const usernameTaken = await isUsernameTaken(client, username.normalized);

  if (usernameTaken === null) {
    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      {
        stage: 'USERNAME_SIGNUP_STAGE_USERNAME_TAKEN_LOOKUP',
      },
    );
  }

  if (usernameTaken) {
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

  const usernameInsert = await client.from('account_usernames').insert({
    owner_user_id: ownerUserId,
    username_display: username.display,
    username_normalized: username.normalized,
  });

  if (usernameInsert.error !== null) {
    await cleanupCreatedAuthUser(client, ownerUserId);

    if (usernameInsert.error.code === '23505') {
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
        'USERNAME_SIGNUP_STAGE_INSERT_USERNAME',
        usernameInsert.error,
      ),
    );
  }

  const identifierInsert = await client
    .schema('private')
    .from('account_auth_identifiers')
    .insert({
      owner_user_id: ownerUserId,
      auth_identifier: authIdentifier,
    });

  if (identifierInsert.error !== null) {
    await cleanupCreatedSignupState(client, ownerUserId);

    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      getSafeSupabaseErrorDiagnostic(
        'USERNAME_SIGNUP_STAGE_INSERT_AUTH_IDENTIFIER',
        identifierInsert.error,
      ),
    );
  }

  const recoveryInsert = await client
    .schema('private')
    .from('account_recovery_contacts')
    .insert({
      owner_user_id: ownerUserId,
      recovery_email: recoveryEmail.recoveryEmail,
      recovery_email_normalized: recoveryEmail.recoveryEmailNormalized,
      recovery_warning_acknowledged: true,
    });

  if (recoveryInsert.error !== null) {
    await cleanupCreatedSignupState(client, ownerUserId);

    return createErrorResult(
      500,
      'USERNAME_AUTH_UNAVAILABLE',
      unavailableMessage,
      getSafeSupabaseErrorDiagnostic(
        'USERNAME_SIGNUP_STAGE_INSERT_RECOVERY',
        recoveryInsert.error,
      ),
    );
  }

  return signInWithInternalIdentifier(
    client,
    authIdentifier,
    password.password,
    {
      stage: 'USERNAME_SIGNUP_STAGE_SIGN_IN',
    },
  );
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
  const { data: usernameRow, error: usernameError } = await client
    .from('account_usernames')
    .select('owner_user_id')
    .eq('username_normalized', username.normalized)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle<UsernameRow>();

  if (usernameError !== null || usernameRow === null) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  const { data: identifierRow, error: identifierError } = await client
    .schema('private')
    .from('account_auth_identifiers')
    .select('auth_identifier')
    .eq('owner_user_id', usernameRow.owner_user_id)
    .maybeSingle<AuthIdentifierRow>();

  if (identifierError !== null || identifierRow === null) {
    return createErrorResult(401, 'USERNAME_AUTH_FAILED', loginFailedMessage);
  }

  return signInWithInternalIdentifier(
    client,
    identifierRow.auth_identifier,
    password.password,
  );
}
