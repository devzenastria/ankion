export type UsernameValidationResult =
  | {
      ok: true;
      display: string;
      normalized: string;
    }
  | {
      ok: false;
      code: 'USERNAME_INVALID' | 'USERNAME_RESERVED';
    };

export type PasswordValidationResult =
  | {
      ok: true;
      password: string;
    }
  | {
      ok: false;
      code: 'PASSWORD_INVALID';
    };

export type RecoveryEmailValidationResult =
  | {
      ok: true;
      recoveryEmail: string | null;
      recoveryEmailNormalized: string | null;
    }
  | {
      ok: false;
      code: 'RECOVERY_EMAIL_INVALID';
    };

const usernameMinLength = 3;
const usernameMaxLength = 30;
const passwordMinLength = 8;
const passwordMaxLength = 128;
const recoveryEmailMaxLength = 320;
const usernamePattern = /^[a-z0-9][a-z0-9._]*[a-z0-9]$/;
const repeatedSeparatorPattern = /[._]{2,}/;

const fallbackReservedUsernames = new Set([
  'admin',
  'root',
  'support',
  'system',
  'ankion',
  'api',
  'auth',
  'login',
  'logout',
  'settings',
  'profile',
  'null',
  'undefined',
]);

export function isFallbackReservedUsername(username: string): boolean {
  return fallbackReservedUsernames.has(username);
}

export function normalizeUsername(input: unknown): UsernameValidationResult {
  if (typeof input !== 'string') {
    return {
      ok: false,
      code: 'USERNAME_INVALID',
    };
  }

  const display = input.trim();
  const normalized = display.normalize('NFKC').toLowerCase();

  if (
    normalized.length < usernameMinLength ||
    normalized.length > usernameMaxLength ||
    !usernamePattern.test(normalized) ||
    repeatedSeparatorPattern.test(normalized)
  ) {
    return {
      ok: false,
      code: 'USERNAME_INVALID',
    };
  }

  if (isFallbackReservedUsername(normalized)) {
    return {
      ok: false,
      code: 'USERNAME_RESERVED',
    };
  }

  return {
    ok: true,
    display,
    normalized,
  };
}

export function validatePassword(input: unknown): PasswordValidationResult {
  if (typeof input !== 'string') {
    return {
      ok: false,
      code: 'PASSWORD_INVALID',
    };
  }

  if (
    input.length < passwordMinLength ||
    input.length > passwordMaxLength
  ) {
    return {
      ok: false,
      code: 'PASSWORD_INVALID',
    };
  }

  return {
    ok: true,
    password: input,
  };
}

export function normalizeRecoveryEmail(
  input: unknown,
): RecoveryEmailValidationResult {
  if (input === undefined || input === null) {
    return {
      ok: true,
      recoveryEmail: null,
      recoveryEmailNormalized: null,
    };
  }

  if (typeof input !== 'string') {
    return {
      ok: false,
      code: 'RECOVERY_EMAIL_INVALID',
    };
  }

  const recoveryEmail = input.trim();

  if (recoveryEmail.length === 0) {
    return {
      ok: true,
      recoveryEmail: null,
      recoveryEmailNormalized: null,
    };
  }

  if (recoveryEmail.length > recoveryEmailMaxLength) {
    return {
      ok: false,
      code: 'RECOVERY_EMAIL_INVALID',
    };
  }

  return {
    ok: true,
    recoveryEmail,
    recoveryEmailNormalized: recoveryEmail.toLowerCase(),
  };
}
