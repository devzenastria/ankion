import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type OwnerProfileCreationRequest = Readonly<{
  displayName: string;
  shortBio: string;
  ageBand: string;
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
  isBackendAuthority: false;
  isOwnerProfileCreationEnabled: true;
  isProductUnlockEnabled: false;
  isListenerEnabled: false;
  isDurableSessionRequired: false;
  safeMessage: string;
}>;

type NormalizedOwnerProfileCreationInput = Readonly<{
  displayName: string;
  shortBio: string | null;
  rpcAgeBand: "18_24" | "25_34" | "35_44" | "45_plus";
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
    isBackendAuthority: false,
    isOwnerProfileCreationEnabled: true,
    isProductUnlockEnabled: false,
    isListenerEnabled: false,
    isDurableSessionRequired: false,
    safeMessage,
  };
}

function normalizeAgeBand(
  ageBand: string,
): NormalizedOwnerProfileCreationInput["rpcAgeBand"] | null {
  switch (ageBand.trim()) {
    case "18-24":
      return "18_24";
    case "25-34":
      return "25_34";
    case "35-44":
      return "35_44";
    case "45+":
      return "45_plus";
    default:
      return null;
  }
}

function normalizeInput(
  input: OwnerProfileCreationRequest,
): NormalizedOwnerProfileCreationInput | null {
  const displayName = input.displayName.trim();
  const shortBio = input.shortBio.trim();
  const rpcAgeBand = normalizeAgeBand(input.ageBand);

  if (
    displayName.length < displayNameMinLength ||
    displayName.length > displayNameMaxLength ||
    shortBio.length > shortBioMaxLength ||
    rpcAgeBand === null
  ) {
    return null;
  }

  return {
    displayName,
    shortBio: shortBio.length > 0 ? shortBio : null,
    rpcAgeBand,
  };
}

function classifyRpcError(error: { code?: string; message?: string }): OwnerProfileCreationBoundaryStatus {
  if (
    error.code === "28000" ||
    error.message?.includes("AUTHENTICATED_OWNER_REQUIRED") === true
  ) {
    return "not_authenticated";
  }

  if (error.code === "42501") {
    return "denied";
  }

  if (error.code === "PGRST301" || error.code === "PGRST302") {
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

export async function requestOwnerProfileCreation(
  input: OwnerProfileCreationRequest,
): Promise<OwnerProfileCreationBoundaryResult> {
  const normalizedInput = normalizeInput(input);

  if (normalizedInput === null) {
    return createResult("invalid_input", getSafeMessage("invalid_input"));
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return createResult(
      "client_unavailable",
      getSafeMessage("client_unavailable"),
    );
  }

  try {
    const { error } = await boundary.client.rpc(
      "create_owner_identity_foundation",
      {
        p_chosen_display_name: normalizedInput.displayName,
        p_short_bio: normalizedInput.shortBio,
        p_age_band: normalizedInput.rpcAgeBand,
      },
    );

    if (error !== null) {
      const status = classifyRpcError(error);

      return createResult(status, getSafeMessage(status));
    }

    return createResult("created", getSafeMessage("created"));
  } catch {
    return createResult("network_failed", getSafeMessage("network_failed"));
  }
}
