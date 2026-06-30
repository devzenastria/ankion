import type { FastifyBaseLogger } from 'fastify';

import type {
  UsernameSignupDiagnostic,
  UsernameSignupDiagnosticStage,
} from './usernameAuth';

type AuthTelemetryEventName =
  | 'username_signup_accepted'
  | 'username_signup_rejected'
  | 'username_signup_failed'
  | 'username_signup_rate_limited'
  | 'username_login_accepted'
  | 'username_login_rejected'
  | 'username_login_failed'
  | 'username_login_rate_limited';

type AuthTelemetrySurface = 'username_signup' | 'username_login';

type AuthTelemetryOutcome = 'accepted' | 'rejected' | 'failed' | 'rate_limited';

type AuthTelemetryStage =
  | 'validation'
  | 'username_availability'
  | 'auth_user_create'
  | 'credential_create'
  | 'session_issuance'
  | 'cleanup'
  | 'identifier_lookup';

type AuthTelemetryInput = {
  event: AuthTelemetryEventName;
  authSurface: AuthTelemetrySurface;
  outcome: AuthTelemetryOutcome;
  statusCode: number;
  code?: string | undefined;
  requestId?: string | undefined;
  diagnostic?: UsernameSignupDiagnostic | undefined;
  stage?: AuthTelemetryStage | undefined;
  cleanupAttempted?: boolean | undefined;
  cleanupSucceeded?: boolean | undefined;
  rateLimited?: boolean | undefined;
};

type AuthTelemetryRecord = {
  event: AuthTelemetryEventName;
  authSurface: AuthTelemetrySurface;
  outcome: AuthTelemetryOutcome;
  statusCode: number;
  timestamp: string;
  code?: string;
  requestId?: string;
  stage?: AuthTelemetryStage;
  cleanupAttempted?: boolean;
  cleanupSucceeded?: boolean;
  rateLimited?: boolean;
};

const diagnosticStageMap: Record<
  UsernameSignupDiagnosticStage,
  AuthTelemetryStage
> = {
  USERNAME_SIGNUP_STAGE_VALIDATE_INPUT: 'validation',
  USERNAME_SIGNUP_STAGE_USERNAME_EXISTS_RPC: 'username_availability',
  USERNAME_SIGNUP_STAGE_AUTH_CREATE_USER: 'auth_user_create',
  USERNAME_SIGNUP_STAGE_CREATE_CREDENTIALS_RPC: 'credential_create',
  USERNAME_SIGNUP_STAGE_SIGN_IN: 'session_issuance',
  USERNAME_SIGNUP_STAGE_CLEANUP_RPC: 'cleanup',
  USERNAME_LOGIN_STAGE_VALIDATE_INPUT: 'validation',
  USERNAME_LOGIN_STAGE_LOOKUP_IDENTIFIER_RPC: 'identifier_lookup',
  USERNAME_LOGIN_STAGE_SIGN_IN: 'session_issuance',
};

function getTelemetryLevel(outcome: AuthTelemetryOutcome): 'info' | 'warn' {
  return outcome === 'accepted' ? 'info' : 'warn';
}

function getTelemetryStage(input: AuthTelemetryInput): AuthTelemetryStage | undefined {
  if (input.stage !== undefined) {
    return input.stage;
  }

  if (input.diagnostic === undefined) {
    return undefined;
  }

  return diagnosticStageMap[input.diagnostic.stage];
}

export function emitAuthTelemetry(
  logger: FastifyBaseLogger,
  input: AuthTelemetryInput,
): void {
  const telemetry: AuthTelemetryRecord = {
    event: input.event,
    authSurface: input.authSurface,
    outcome: input.outcome,
    statusCode: input.statusCode,
    timestamp: new Date().toISOString(),
  };

  const stage = getTelemetryStage(input);

  if (input.code !== undefined) {
    telemetry.code = input.code;
  }

  if (input.requestId !== undefined) {
    telemetry.requestId = input.requestId;
  }

  if (stage !== undefined) {
    telemetry.stage = stage;
  }

  if (input.cleanupAttempted !== undefined) {
    telemetry.cleanupAttempted = input.cleanupAttempted;
  }

  if (input.cleanupSucceeded !== undefined) {
    telemetry.cleanupSucceeded = input.cleanupSucceeded;
  }

  if (input.rateLimited !== undefined) {
    telemetry.rateLimited = input.rateLimited;
  }

  logger[getTelemetryLevel(input.outcome)](
    {
      authTelemetry: telemetry,
    },
    'auth telemetry',
  );
}
