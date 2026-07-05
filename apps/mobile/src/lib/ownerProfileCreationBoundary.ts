import { getBackendApiPublicEnv } from "./apiEnv";

export type OwnerProfileCreationRequest = Readonly<{
  displayName: string;
  shortBio: string;
  ageBand: string;
}>;

export type OwnerProfileCreationBoundaryRequest =
  OwnerProfileCreationRequest &
    Readonly<{
      refreshToken: string | null;
    }>;

export type OwnerProfileCreationBoundaryStatus =
  | "not_authenticated"
  | "client_unavailable"
  | "invalid_input"
  | "creation_requested"
  | "created"
  | "idempotent_existing"
  | "denied"
  | "network_failed"
  | "unknown_failed";

export type OwnerProfileCreationBoundaryResult = Readonly<{
  kind: "owner_profile_creation_boundary_result";
  phaseGate: "owner_profile_creation_boundary";
  status: OwnerProfileCreationBoundaryStatus;
  isServerConfirmed: boolean;
  isBackendAuthority: true;
  isOwnerProfileCreationEnabled: true;
  isProductUnlockEnabled: false;
  isListenerEnabled: false;
  isDurableSessionRequired: false;
  safeMessage: string;
}>;

type NormalizedOwnerProfileCreationInput = Readonly<{
  displayName: string;
  shortBio: string | null;
  ageBand: "18-24" | "25-34" | "35-44" | "45+";
}>;

type OwnerProfileCreationSuccessCode =
  | "OWN_AUTH_PROFILE_FOUNDATION_CREATED"
  | "OWN_AUTH_PROFILE_FOUNDATION_EXISTING";

type OwnerProfileCreationSuccessBody = Readonly<{
  ok: true;
  code: OwnerProfileCreationSuccessCode;
}>;

type OwnerProfileCreationErrorBody = Readonly<{
  ok?: false;
  code?: string;
  error?: {
    code?: string;
  };
}>;

const displayNameMinLength = 2;
const displayNameMaxLength = 32;
const shortBioMaxLength = 160;

function createResult(
  status: OwnerProfileCreationBoundaryStatus,
  safeMessage: string,
): OwnerProfileCreationBoundaryResult {
  return {
    kind: "owner_profile_creation_boundary_result",
    phaseGate: "owner_profile_creation_boundary",
    status,
    isServerConfirmed: status === "created" || status === "idempotent_existing",
    isBackendAuthority: true,
    isOwnerProfileCreationEnabled: true,
    isProductUnlockEnabled: false,
    isListenerEnabled: false,
    isDurableSessionRequired: false,
    safeMessage,
  };
}

function normalizeAgeBand(
  ageBand: string,
): NormalizedOwnerProfileCreationInput["ageBand"] | null {
  switch (ageBand.trim()) {
    case "18-24":
      return "18-24";
    case "25-34":
      return "25-34";
    case "35-44":
      return "35-44";
    case "45+":
      return "45+";
    default:
      return null;
  }
}

function normalizeInput(
  input: OwnerProfileCreationRequest,
): NormalizedOwnerProfileCreationInput | null {
  const displayName = input.displayName.trim();
  const shortBio = input.shortBio.trim();
  const ageBand = normalizeAgeBand(input.ageBand);

  if (
    displayName.length < displayNameMinLength ||
    displayName.length > displayNameMaxLength ||
    shortBio.length > shortBioMaxLength ||
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

function isSuccessBody(value: unknown): value is OwnerProfileCreationSuccessBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<OwnerProfileCreationSuccessBody>;

  return (
    candidate.ok === true &&
    (candidate.code === "OWN_AUTH_PROFILE_FOUNDATION_CREATED" ||
      candidate.code === "OWN_AUTH_PROFILE_FOUNDATION_EXISTING")
  );
}

function getSafeErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as OwnerProfileCreationErrorBody;
  const code = candidate.error?.code ?? candidate.code;

  return typeof code === "string" ? code : null;
}

function classifyBackendError(
  responseStatus: number,
  safeCode: string | null,
): OwnerProfileCreationBoundaryStatus {
  if (safeCode === "OWN_AUTH_INVALID_SESSION" || responseStatus === 401) {
    return "not_authenticated";
  }

  if (safeCode === "OWN_AUTH_INVALID_INPUT" || responseStatus === 400) {
    return "invalid_input";
  }

  if (
    safeCode === "OWN_AUTH_DATABASE_NOT_CONFIGURED" ||
    safeCode === "OWN_AUTH_DATABASE_UNAVAILABLE" ||
    responseStatus === 503
  ) {
    return "network_failed";
  }

  return "unknown_failed";
}

function getSafeMessage(status: OwnerProfileCreationBoundaryStatus): string {
  switch (status) {
    case "created":
      return "Profil temeli güvenli şekilde hazırlandı.";
    case "idempotent_existing":
      return "Profil temeli zaten hazır.";
    case "invalid_input":
      return "Bilgileri kontrol et.";
    case "not_authenticated":
    case "client_unavailable":
    case "creation_requested":
    case "denied":
    case "network_failed":
    case "unknown_failed":
      return "Profil kurulumu tamamlanamadı. Daha sonra tekrar dene.";
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestOwnerProfileCreation(
  input: OwnerProfileCreationBoundaryRequest,
): Promise<OwnerProfileCreationBoundaryResult> {
  const normalizedInput = normalizeInput(input);

  if (normalizedInput === null) {
    return createResult("invalid_input", getSafeMessage("invalid_input"));
  }

  const apiEnv = getBackendApiPublicEnv();

  if (!apiEnv.isConfigured || apiEnv.apiBaseUrl === null) {
    return createResult(
      "client_unavailable",
      getSafeMessage("client_unavailable"),
    );
  }

  if (input.refreshToken === null || input.refreshToken.trim().length === 0) {
    return createResult(
      "not_authenticated",
      getSafeMessage("not_authenticated"),
    );
  }

  try {
    const response = await fetch(
      `${apiEnv.apiBaseUrl}/own-auth/profile-foundation`,
      {
        body: JSON.stringify({
          ageBand: normalizedInput.ageBand,
          displayName: normalizedInput.displayName,
          shortBio: normalizedInput.shortBio ?? "",
        }),
        headers: {
          Authorization: `Bearer ${input.refreshToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
    const body = await readJsonSafely(response);

    if (response.ok && isSuccessBody(body)) {
      const status =
        body.code === "OWN_AUTH_PROFILE_FOUNDATION_EXISTING"
          ? "idempotent_existing"
          : "created";

      return createResult(status, getSafeMessage(status));
    }

    const status = classifyBackendError(response.status, getSafeErrorCode(body));

    return createResult(status, getSafeMessage(status));
  } catch {
    return createResult("network_failed", getSafeMessage("network_failed"));
  }
}
