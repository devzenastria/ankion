import { getBackendApiPublicEnv } from "./apiEnv";
import type {
  UsernameAuthDiagnostic,
  UsernameAuthStatus,
  UsernameLoginRequest,
  UsernameSignupRequest,
} from "./usernameAuthBoundary";

export type OwnAuthAccountDto = Readonly<{
  id: string;
  username: string;
}>;

export type OwnAuthSessionTokenDto = Readonly<{
  accountId: string;
  anonymousIdentityId: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: "Bearer";
  sessionId: string;
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
}>;

export type OwnAuthSessionReadDto = Readonly<{
  accountId: string;
  anonymousIdentityId: string | null;
  expiresAt: string;
  tokenType: "Bearer";
  sessionId: string;
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
}>;

export type OwnAuthMemorySession = Readonly<{
  account: OwnAuthAccountDto;
  session: OwnAuthSessionTokenDto;
}>;

export type OwnAuthUsernameResult = Readonly<{
  kind: "username_auth_boundary_result";
  status: UsernameAuthStatus;
  isSessionEstablished: boolean;
  isBackendAuthority: true;
  isServerConfirmed: boolean;
  isProductUnlockEnabled: false;
  safeMessage: string;
  diagnostic: UsernameAuthDiagnostic | null;
  ownAuthSession: OwnAuthMemorySession | null;
}>;

export type OwnAuthSessionReadResult = Readonly<
  | {
      status: "success";
      safeMessage: string;
      session: Readonly<{
        account: OwnAuthAccountDto;
        session: OwnAuthSessionReadDto;
      }>;
    }
  | {
      status:
        | "backend_unconfigured"
        | "invalid_session"
        | "network_failed"
        | "unavailable";
      safeMessage: string;
      session: null;
    }
>;

export type OwnAuthLogoutResult = Readonly<{
  status: "signed_out" | "backend_unconfigured" | "network_failed" | "unavailable";
  safeMessage: string;
}>;

type OwnAuthTokenSuccessCode =
  | "OWN_AUTH_SIGNUP_CREATED"
  | "OWN_AUTH_LOGIN_OK"
  | "OWN_AUTH_REFRESH_OK";

type OwnAuthTokenSuccessBody = Readonly<{
  ok: true;
  code: OwnAuthTokenSuccessCode;
  data: {
    account: OwnAuthAccountDto;
    session: OwnAuthSessionTokenDto;
  };
}>;

type OwnAuthSessionSuccessBody = Readonly<{
  ok: true;
  code: "OWN_AUTH_SESSION_OK";
  data: {
    account: OwnAuthAccountDto;
    session: OwnAuthSessionReadDto;
  };
}>;

type OwnAuthLogoutSuccessBody = Readonly<{
  ok: true;
  code: "OWN_AUTH_LOGOUT_OK";
}>;

type OwnAuthErrorBody = Readonly<{
  ok?: false;
  code?: string;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}>;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function createUsernameResult(
  status: UsernameAuthStatus,
  input: {
    isSessionEstablished: boolean;
    safeMessage: string;
    ownAuthSession?: OwnAuthMemorySession | null;
  },
): OwnAuthUsernameResult {
  return {
    kind: "username_auth_boundary_result",
    status,
    isSessionEstablished: input.isSessionEstablished,
    isBackendAuthority: true,
    isServerConfirmed: input.isSessionEstablished,
    isProductUnlockEnabled: false,
    safeMessage: input.safeMessage,
    diagnostic: null,
    ownAuthSession: input.ownAuthSession ?? null,
  };
}

function isAccountDto(value: unknown): value is OwnAuthAccountDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthAccountDto>;

  return hasText(candidate.id) && hasText(candidate.username);
}

function isSessionTokenDto(value: unknown): value is OwnAuthSessionTokenDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthSessionTokenDto>;

  return (
    hasText(candidate.accountId) &&
    (typeof candidate.anonymousIdentityId === "string" ||
      candidate.anonymousIdentityId === null) &&
    hasText(candidate.accessToken) &&
    hasText(candidate.refreshToken) &&
    hasText(candidate.expiresAt) &&
    candidate.tokenType === "Bearer" &&
    hasText(candidate.sessionId) &&
    typeof candidate.profileReady === "boolean" &&
    typeof candidate.anonymousIdentityReady === "boolean" &&
    typeof candidate.onboardingComplete === "boolean"
  );
}

function isSessionReadDto(value: unknown): value is OwnAuthSessionReadDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthSessionReadDto>;

  return (
    hasText(candidate.accountId) &&
    (typeof candidate.anonymousIdentityId === "string" ||
      candidate.anonymousIdentityId === null) &&
    hasText(candidate.expiresAt) &&
    candidate.tokenType === "Bearer" &&
    hasText(candidate.sessionId) &&
    typeof candidate.profileReady === "boolean" &&
    typeof candidate.anonymousIdentityReady === "boolean" &&
    typeof candidate.onboardingComplete === "boolean"
  );
}

function isOwnAuthTokenSuccessBody(
  value: unknown,
  expectedCode: OwnAuthTokenSuccessCode,
): value is OwnAuthTokenSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthTokenSuccessBody>;

  return (
    candidate.ok === true &&
    candidate.code === expectedCode &&
    isAccountDto(candidate.data?.account) &&
    isSessionTokenDto(candidate.data.session)
  );
}

function isOwnAuthSessionSuccessBody(
  value: unknown,
): value is OwnAuthSessionSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthSessionSuccessBody>;

  return (
    candidate.ok === true &&
    candidate.code === "OWN_AUTH_SESSION_OK" &&
    isAccountDto(candidate.data?.account) &&
    isSessionReadDto(candidate.data.session)
  );
}

function isOwnAuthLogoutSuccessBody(
  value: unknown,
): value is OwnAuthLogoutSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnAuthLogoutSuccessBody>;

  return candidate.ok === true && candidate.code === "OWN_AUTH_LOGOUT_OK";
}

function getSafeErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as OwnAuthErrorBody;
  const code = candidate.error?.code ?? candidate.code;

  return typeof code === "string" ? code : null;
}

function mapOwnAuthErrorToUsernameResult(
  responseStatus: number,
  safeCode: string | null,
): OwnAuthUsernameResult {
  switch (safeCode) {
    case "OWN_AUTH_INVALID_INPUT":
    case "OWN_AUTH_INVALID_REQUEST":
      return createUsernameResult("invalid_input", {
        isSessionEstablished: false,
        safeMessage: "Bilgileri kontrol et.",
      });
    case "OWN_AUTH_USERNAME_TAKEN":
      return createUsernameResult("username_unavailable", {
        isSessionEstablished: false,
        safeMessage: "Bu kullanici adi uygun degil.",
      });
    case "OWN_AUTH_INVALID_CREDENTIALS":
      return createUsernameResult("auth_failed", {
        isSessionEstablished: false,
        safeMessage: "Kullanici adi veya parola hatali.",
      });
    case "OWN_AUTH_NOT_READY":
    case "OWN_AUTH_DATABASE_NOT_CONFIGURED":
    case "OWN_AUTH_DATABASE_UNAVAILABLE":
      return createUsernameResult("unavailable", {
        isSessionEstablished: false,
        safeMessage: "Islem su anda tamamlanamadi. Daha sonra tekrar dene.",
      });
    default:
      return createUsernameResult(responseStatus === 429 ? "rate_limited" : "unavailable", {
        isSessionEstablished: false,
        safeMessage:
          responseStatus === 429
            ? "Cok fazla deneme. Daha sonra tekrar dene."
            : "Islem su anda tamamlanamadi. Daha sonra tekrar dene.",
      });
  }
}

function mapOwnAuthSessionError(
  safeCode: string | null,
): OwnAuthSessionReadResult {
  switch (safeCode) {
    case "OWN_AUTH_INVALID_SESSION":
      return {
        status: "invalid_session",
        safeMessage: "Oturum gecersiz.",
        session: null,
      };
    case "OWN_AUTH_NOT_READY":
    case "OWN_AUTH_DATABASE_NOT_CONFIGURED":
      return {
        status: "backend_unconfigured",
        safeMessage: "Own auth oturum okuma hazir degil.",
        session: null,
      };
    case "OWN_AUTH_DATABASE_UNAVAILABLE":
    default:
      return {
        status: "unavailable",
        safeMessage: "Oturum guvenli sekilde okunamadi.",
        session: null,
      };
  }
}

function mapOwnAuthLogoutError(safeCode: string | null): OwnAuthLogoutResult {
  switch (safeCode) {
    case "OWN_AUTH_NOT_READY":
    case "OWN_AUTH_DATABASE_NOT_CONFIGURED":
      return {
        status: "backend_unconfigured",
        safeMessage: "Own auth cikis hazir degil.",
      };
    case "OWN_AUTH_DATABASE_UNAVAILABLE":
    case "OWN_AUTH_LOGOUT_FAILED":
    default:
      return {
        status: "unavailable",
        safeMessage: "Cikis sunucu tarafinda tamamlanamadi.",
      };
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiBaseUrl(): string | null {
  const apiEnv = getBackendApiPublicEnv();

  return apiEnv.isConfigured ? apiEnv.apiBaseUrl : null;
}

async function requestOwnAuthToken(
  path: "/own-auth/signup" | "/own-auth/login" | "/own-auth/refresh",
  body: Readonly<Record<string, string>>,
  expectedCode: OwnAuthTokenSuccessCode,
): Promise<OwnAuthUsernameResult> {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl === null) {
    return createUsernameResult("backend_unconfigured", {
      isSessionEstablished: false,
      safeMessage: "Backend API adresi yapilandirilmadi.",
    });
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const responseBody = await readJsonSafely(response);

    if (!response.ok || !isOwnAuthTokenSuccessBody(responseBody, expectedCode)) {
      return mapOwnAuthErrorToUsernameResult(
        response.status,
        getSafeErrorCode(responseBody),
      );
    }

    return createUsernameResult("success", {
      isSessionEstablished: true,
      ownAuthSession: {
        account: responseBody.data.account,
        session: responseBody.data.session,
      },
      safeMessage: "Oturum acildi.",
    });
  } catch {
    return createUsernameResult("network_failed", {
      isSessionEstablished: false,
      safeMessage: "Baglanti kurulamadi. Tekrar deneyebilirsin.",
    });
  }
}

export async function requestOwnAuthSignup(
  input: UsernameSignupRequest,
): Promise<OwnAuthUsernameResult> {
  const body: Record<string, string> = {
    password: input.password,
    username: input.username,
  };
  const recoveryEmail = input.recoveryEmail.trim();

  if (recoveryEmail.length > 0) {
    body.recoveryEmail = recoveryEmail;
  }

  return requestOwnAuthToken(
    "/own-auth/signup",
    body,
    "OWN_AUTH_SIGNUP_CREATED",
  );
}

export async function requestOwnAuthLogin(
  input: UsernameLoginRequest,
): Promise<OwnAuthUsernameResult> {
  return requestOwnAuthToken(
    "/own-auth/login",
    {
      password: input.password,
      username: input.username,
    },
    "OWN_AUTH_LOGIN_OK",
  );
}

export async function requestOwnAuthRefresh(
  refreshToken: string,
): Promise<OwnAuthUsernameResult> {
  return requestOwnAuthToken(
    "/own-auth/refresh",
    {
      refreshToken,
    },
    "OWN_AUTH_REFRESH_OK",
  );
}

export async function readOwnAuthSession(
  refreshToken: string,
): Promise<OwnAuthSessionReadResult> {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl === null) {
    return {
      status: "backend_unconfigured",
      safeMessage: "Backend API adresi yapilandirilmadi.",
      session: null,
    };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/own-auth/session`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      method: "GET",
    });
    const responseBody = await readJsonSafely(response);

    if (response.ok && isOwnAuthSessionSuccessBody(responseBody)) {
      return {
        status: "success",
        safeMessage: "Oturum hazir.",
        session: responseBody.data,
      };
    }

    return mapOwnAuthSessionError(getSafeErrorCode(responseBody));
  } catch {
    return {
      status: "network_failed",
      safeMessage: "Baglanti kurulamadi. Tekrar deneyebilirsin.",
      session: null,
    };
  }
}

export async function requestOwnAuthLogout(
  refreshToken: string,
): Promise<OwnAuthLogoutResult> {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl === null) {
    return {
      status: "backend_unconfigured",
      safeMessage: "Backend API adresi yapilandirilmadi.",
    };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/own-auth/logout`, {
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const responseBody = await readJsonSafely(response);

    if (response.ok && isOwnAuthLogoutSuccessBody(responseBody)) {
      return {
        status: "signed_out",
        safeMessage: "Cikis yapildi.",
      };
    }

    return mapOwnAuthLogoutError(getSafeErrorCode(responseBody));
  } catch {
    return {
      status: "network_failed",
      safeMessage: "Cikis sunucu tarafinda tamamlanamadi.",
    };
  }
}
