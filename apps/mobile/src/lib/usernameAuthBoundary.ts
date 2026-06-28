import { getBackendApiPublicEnv } from "./apiEnv";
import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type UsernameSignupRequest = Readonly<{
  username: string;
  password: string;
  recoveryEmail: string;
  recoveryWarningAcknowledged: boolean;
}>;

export type UsernameLoginRequest = Readonly<{
  username: string;
  password: string;
}>;

export type UsernameAuthStatus =
  | "success"
  | "backend_unconfigured"
  | "client_unavailable"
  | "invalid_input"
  | "username_unavailable"
  | "auth_failed"
  | "rate_limited"
  | "unavailable"
  | "network_failed"
  | "session_set_failed";

export type UsernameAuthDiagnostic = Readonly<{
  marker: "USERNAME_AUTH_SET_SESSION_FAILED";
  errorName: string | null;
  errorStatus: number | null;
  accessTokenPresent: boolean;
  refreshTokenPresent: boolean;
}>;

export type UsernameAuthResult = Readonly<{
  kind: "username_auth_boundary_result";
  status: UsernameAuthStatus;
  isSessionEstablished: boolean;
  isBackendAuthority: false;
  isServerConfirmed: false;
  isProductUnlockEnabled: false;
  safeMessage: string;
  diagnostic: UsernameAuthDiagnostic | null;
}>;

type UsernameAuthSuccessBody = Readonly<{
  ok: true;
  session: {
    access_token: string;
    refresh_token: string;
  };
}>;

type UsernameAuthErrorBody = Readonly<{
  ok: false;
  error?: {
    code?: string;
    message?: string;
  };
}>;

function createResult(
  status: UsernameAuthStatus,
  isSessionEstablished: boolean,
  safeMessage: string,
  diagnostic: UsernameAuthDiagnostic | null = null,
): UsernameAuthResult {
  return {
    kind: "username_auth_boundary_result",
    status,
    isSessionEstablished,
    isBackendAuthority: false,
    isServerConfirmed: false,
    isProductUnlockEnabled: false,
    safeMessage,
    diagnostic,
  };
}

function getSafeSetSessionDiagnostic(
  error: unknown,
  responseBody: UsernameAuthSuccessBody,
): UsernameAuthDiagnostic {
  const candidate =
    typeof error === "object" && error !== null
      ? (error as { name?: unknown; status?: unknown })
      : null;
  const errorName =
    typeof candidate?.name === "string" && candidate.name.length > 0
      ? candidate.name
      : null;
  const errorStatus =
    typeof candidate?.status === "number" && Number.isFinite(candidate.status)
      ? candidate.status
      : null;

  return {
    marker: "USERNAME_AUTH_SET_SESSION_FAILED",
    errorName,
    errorStatus,
    accessTokenPresent: responseBody.session.access_token.length > 0,
    refreshTokenPresent: responseBody.session.refresh_token.length > 0,
  };
}

function isSuccessBody(value: unknown): value is UsernameAuthSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<UsernameAuthSuccessBody>;

  return (
    candidate.ok === true &&
    typeof candidate.session?.access_token === "string" &&
    candidate.session.access_token.length > 0 &&
    typeof candidate.session.refresh_token === "string" &&
    candidate.session.refresh_token.length > 0
  );
}

function getSafeErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as UsernameAuthErrorBody;
  const code = candidate.error?.code;

  return typeof code === "string" ? code : null;
}

function getSafeMessageForError(code: string | null): UsernameAuthResult {
  switch (code) {
    case "USERNAME_UNAVAILABLE":
      return createResult(
        "username_unavailable",
        false,
        "Bu kullanıcı adı uygun değil.",
      );
    case "USERNAME_AUTH_FAILED":
      return createResult(
        "auth_failed",
        false,
        "Kullanıcı adı veya parola hatalı.",
      );
    case "USERNAME_AUTH_INVALID_INPUT":
      return createResult("invalid_input", false, "Bilgileri kontrol et.");
    case "USERNAME_AUTH_RATE_LIMITED":
      return createResult(
        "rate_limited",
        false,
        "Çok fazla deneme. Daha sonra tekrar dene.",
      );
    case "BACKEND_CONFIGURATION_REQUIRED":
    case "USERNAME_AUTH_UNAVAILABLE":
    default:
      return createResult(
        "unavailable",
        false,
        "İşlem şu anda tamamlanamadı. Daha sonra tekrar dene.",
      );
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestUsernameAuth(
  path: "/v1/auth/signup" | "/v1/auth/login",
  body: UsernameSignupRequest | UsernameLoginRequest,
): Promise<UsernameAuthResult> {
  const apiEnv = getBackendApiPublicEnv();

  if (!apiEnv.isConfigured || apiEnv.apiBaseUrl === null) {
    return createResult(
      "backend_unconfigured",
      false,
      "Backend API adresi yapılandırılmadı.",
    );
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return createResult(
      "client_unavailable",
      false,
      "Oturum istemcisi hazır değil.",
    );
  }

  try {
    const response = await fetch(`${apiEnv.apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const responseBody = await readJsonSafely(response);

    if (!response.ok || !isSuccessBody(responseBody)) {
      return getSafeMessageForError(getSafeErrorCode(responseBody));
    }

    const { error } = await boundary.client.auth.setSession({
      access_token: responseBody.session.access_token,
      refresh_token: responseBody.session.refresh_token,
    });

    if (error !== null) {
      return createResult(
        "session_set_failed",
        false,
        "Oturum güvenli şekilde başlatılamadı. Tekrar dene.",
        getSafeSetSessionDiagnostic(error, responseBody),
      );
    }

    return createResult("success", true, "Oturum açıldı.");
  } catch {
    return createResult(
      "network_failed",
      false,
      "Bağlantı kurulamadı. Tekrar deneyebilirsin.",
    );
  }
}

export async function requestUsernameSignup(
  input: UsernameSignupRequest,
): Promise<UsernameAuthResult> {
  return requestUsernameAuth("/v1/auth/signup", input);
}

export async function requestUsernameLogin(
  input: UsernameLoginRequest,
): Promise<UsernameAuthResult> {
  return requestUsernameAuth("/v1/auth/login", input);
}
