export type BackendProfileFoundationStatus =
  | "configured_false"
  | "session_missing"
  | "success"
  | "auth_required"
  | "auth_invalid"
  | "backend_configuration_required"
  | "read_failed"
  | "network_failed"
  | "unknown_failed";

export type BackendProfileFoundation = Readonly<{
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
}>;

export type BackendProfileFoundationResult = Readonly<{
  kind: "backend_profile_foundation_result";
  status: BackendProfileFoundationStatus;
  isConfigured: boolean;
  isSessionRequired: boolean;
  isBackendAuthority: false;
  isProductUnlockEnabled: false;
  profileFoundation: BackendProfileFoundation | null;
}>;

export type BackendProfileFoundationRequest = Readonly<{
  apiBaseUrl: string | null;
  accessToken: string | null;
}>;

type BackendProfileFoundationSuccessBody = Readonly<{
  ok: true;
  profileFoundation: BackendProfileFoundation;
}>;

type BackendProfileFoundationErrorBody = Readonly<{
  ok: false;
  error?: {
    code?: string;
  };
}>;

function createResult(
  status: BackendProfileFoundationStatus,
  input: {
    isConfigured: boolean;
    profileFoundation?: BackendProfileFoundation | null;
  },
): BackendProfileFoundationResult {
  return {
    kind: "backend_profile_foundation_result",
    status,
    isConfigured: input.isConfigured,
    isSessionRequired: status === "session_missing",
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
    profileFoundation: input.profileFoundation ?? null,
  };
}

function hasUsableValue(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSuccessBody(
  value: unknown,
): value is BackendProfileFoundationSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<BackendProfileFoundationSuccessBody>;

  return (
    candidate.ok === true &&
    typeof candidate.profileFoundation?.profileReady === "boolean" &&
    typeof candidate.profileFoundation.anonymousIdentityReady === "boolean"
  );
}

function getSafeErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as BackendProfileFoundationErrorBody;
  const code = candidate.error?.code;

  return typeof code === "string" ? code : null;
}

function mapBackendErrorStatus(
  httpStatus: number,
  safeCode: string | null,
): BackendProfileFoundationStatus {
  if (httpStatus === 401) {
    if (safeCode === "AUTH_REQUIRED") {
      return "auth_required";
    }

    if (
      safeCode === "AUTH_HEADER_INVALID" ||
      safeCode === "AUTH_TOKEN_INVALID"
    ) {
      return "auth_invalid";
    }
  }

  if (httpStatus === 503 && safeCode === "BACKEND_CONFIGURATION_REQUIRED") {
    return "backend_configuration_required";
  }

  if (httpStatus === 500 && safeCode === "PROFILE_FOUNDATION_READ_FAILED") {
    return "read_failed";
  }

  return "unknown_failed";
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getBackendProfileFoundation(
  request: BackendProfileFoundationRequest,
): Promise<BackendProfileFoundationResult> {
  if (!hasUsableValue(request.apiBaseUrl)) {
    return createResult("configured_false", {
      isConfigured: false,
    });
  }

  if (!hasUsableValue(request.accessToken)) {
    return createResult("session_missing", {
      isConfigured: true,
    });
  }

  try {
    const response = await fetch(
      `${request.apiBaseUrl}/v1/me/profile-foundation`,
      {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
        },
        method: "GET",
      },
    );
    const body = await readJsonSafely(response);

    if (response.ok && isSuccessBody(body)) {
      return createResult("success", {
        isConfigured: true,
        profileFoundation: {
          anonymousIdentityReady:
            body.profileFoundation.anonymousIdentityReady,
          onboardingComplete:
            body.profileFoundation.profileReady &&
            body.profileFoundation.anonymousIdentityReady,
          profileReady: body.profileFoundation.profileReady,
        },
      });
    }

    return createResult(
      mapBackendErrorStatus(response.status, getSafeErrorCode(body)),
      {
        isConfigured: true,
      },
    );
  } catch {
    return createResult("network_failed", {
      isConfigured: true,
    });
  }
}
