import type {
  AnonymousIdentityReadiness,
  AuthErrorState,
  AuthSessionState,
  OwnerCreationReadiness,
  SessionRecoveryState,
} from "./authSessionBoundary";

type EligibilityStatus = "eligible" | "blocked" | "pending" | "needs_recovery";

export type AuthRequestEligibility = Readonly<{
  status: EligibilityStatus;
  canRequest: boolean;
  reason: string;
  isBackendAuthority: false;
}>;

export type AnonymousIdentityUxState = Readonly<{
  status: "unknown" | "pending" | "ready" | "blocked" | "needs_refresh";
  canUseAnonymousIdentity: boolean;
  isServerConfirmed: boolean;
  localCacheTrusted: false;
  isBackendAuthority: false;
}>;

export type OwnerCreationEligibility = Readonly<{
  status: "eligible" | "blocked" | "pending" | "complete" | "needs_recovery";
  canRequestCreation: boolean;
  isStableForUi: boolean;
  isBackendAuthority: false;
}>;

export type AuthErrorCategory = Readonly<{
  status:
    | "none"
    | "denied"
    | "session_expired"
    | "cache_mismatch"
    | "security_block"
    | "offline_block"
    | "recoverable"
    | "unknown";
  requiresRecovery: boolean;
  message: string | null;
}>;

export type SessionRecoveryGuidance = Readonly<{
  status:
    | "none"
    | "retry"
    | "reauth"
    | "clear_local_data"
    | "server_recheck"
    | "wait_until_online"
    | "security_review";
  canContinue: boolean;
  isBackendAuthority: false;
}>;

// These helpers are inert and side-effect-free.
// They do not create backend authority.
// Backend owner source remains auth.uid().
// Client state cannot assign owner_user_id.
// Local readiness is not a payment/reveal/entitlement authority.

export function mapAuthSessionToRequestEligibility(
  state: AuthSessionState,
): AuthRequestEligibility {
  switch (state.status) {
    case "authenticated":
      if (state.isServerConfirmed && !state.isLocalOnly && state.user !== null) {
        return {
          status: "eligible",
          canRequest: true,
          reason: "authenticated_server_confirmed",
          isBackendAuthority: false,
        };
      }

      return {
        status: "blocked",
        canRequest: false,
        reason: "authenticated_but_not_server_confirmed",
        isBackendAuthority: false,
      };

    case "loading":
    case "refresh_pending":
      return {
        status: "pending",
        canRequest: false,
        reason: state.status,
        isBackendAuthority: false,
      };

    case "recovery_required":
    case "refresh_failed":
      return {
        status: "needs_recovery",
        canRequest: false,
        reason: state.status,
        isBackendAuthority: false,
      };

    case "unknown":
    case "unauthenticated":
    case "expired":
    case "local_cached_untrusted":
      return {
        status: "blocked",
        canRequest: false,
        reason: state.status,
        isBackendAuthority: false,
      };
  }
}

export function mapAnonymousIdentityToUxState(
  readiness: AnonymousIdentityReadiness,
): AnonymousIdentityUxState {
  switch (readiness.status) {
    case "ready":
      return {
        status: readiness.isServerConfirmed ? "ready" : "needs_refresh",
        canUseAnonymousIdentity: readiness.isServerConfirmed,
        isServerConfirmed: readiness.isServerConfirmed,
        localCacheTrusted: false,
        isBackendAuthority: false,
      };

    case "creation_pending":
      return {
        status: "pending",
        canUseAnonymousIdentity: false,
        isServerConfirmed: false,
        localCacheTrusted: false,
        isBackendAuthority: false,
      };

    case "needs_refresh":
    case "stale_cache":
      return {
        status: "needs_refresh",
        canUseAnonymousIdentity: false,
        isServerConfirmed: false,
        localCacheTrusted: false,
        isBackendAuthority: false,
      };

    case "denied":
    case "blocked":
      return {
        status: "blocked",
        canUseAnonymousIdentity: false,
        isServerConfirmed: false,
        localCacheTrusted: false,
        isBackendAuthority: false,
      };

    case "unknown":
    case "not_created":
    case "creation_eligible":
      return {
        status: "unknown",
        canUseAnonymousIdentity: false,
        isServerConfirmed: false,
        localCacheTrusted: false,
        isBackendAuthority: false,
      };
  }
}

export function mapOwnerCreationToEligibility(
  readiness: OwnerCreationReadiness,
): OwnerCreationEligibility {
  switch (readiness.status) {
    case "eligible":
      return {
        status: "eligible",
        canRequestCreation: readiness.canRequest,
        isStableForUi: false,
        isBackendAuthority: false,
      };

    case "complete":
    case "idempotent_existing":
      return {
        status: "complete",
        canRequestCreation: false,
        isStableForUi: true,
        isBackendAuthority: false,
      };

    case "pending":
    case "session_loading":
      return {
        status: "pending",
        canRequestCreation: false,
        isStableForUi: false,
        isBackendAuthority: false,
      };

    case "network_unavailable":
    case "needs_recovery":
      return {
        status: "needs_recovery",
        canRequestCreation: false,
        isStableForUi: false,
        isBackendAuthority: false,
      };

    case "not_authenticated":
    case "session_expired":
    case "denied":
    case "blocked_by_policy":
      return {
        status: "blocked",
        canRequestCreation: false,
        isStableForUi: false,
        isBackendAuthority: false,
      };
  }
}

export function mapAuthErrorToCategory(
  error: AuthErrorState | null,
): AuthErrorCategory {
  if (error === null) {
    return {
      status: "none",
      requiresRecovery: false,
      message: null,
    };
  }

  switch (error.code) {
    case "AUTHENTICATED_OWNER_REQUIRED":
    case "OWNER_CREATION_DENIED":
    case "OWNER_CREATION_IDEMPOTENT_EXISTING":
    case "ANONYMOUS_IDENTITY_NOT_READY":
      return {
        status: "denied",
        requiresRecovery: error.recoveryStatus !== "none",
        message: error.message,
      };

    case "SESSION_MISSING":
    case "SESSION_EXPIRED":
    case "SESSION_REFRESH_FAILED":
      return {
        status: "session_expired",
        requiresRecovery: true,
        message: error.message,
      };

    case "LOCAL_CACHE_MISMATCH":
      return {
        status: "cache_mismatch",
        requiresRecovery: true,
        message: error.message,
      };

    case "REPLAYED_SESSION_SUSPECTED":
    case "DEBUG_TRUST_BLOCKED":
      return {
        status: "security_block",
        requiresRecovery: true,
        message: error.message,
      };

    case "OFFLINE_TRUST_BLOCKED":
    case "NETWORK_UNAVAILABLE":
      return {
        status: "offline_block",
        requiresRecovery: true,
        message: error.message,
      };

    case "UNKNOWN_AUTH_ERROR":
      return {
        status: "unknown",
        requiresRecovery: true,
        message: error.message,
      };
  }
}

export function mapSessionRecoveryToGuidance(
  recovery: SessionRecoveryState,
): SessionRecoveryGuidance {
  switch (recovery.status) {
    case "none":
      return {
        status: "none",
        canContinue: true,
        isBackendAuthority: false,
      };

    case "refresh_required":
      return {
        status: "retry",
        canContinue: false,
        isBackendAuthority: false,
      };

    case "reauth_required":
      return {
        status: "reauth",
        canContinue: false,
        isBackendAuthority: false,
      };

    case "clear_local_cache_required":
      return {
        status: "clear_local_data",
        canContinue: false,
        isBackendAuthority: false,
      };

    case "server_recheck_required":
      return {
        status: "server_recheck",
        canContinue: false,
        isBackendAuthority: false,
      };

    case "blocked_until_online":
      return {
        status: "wait_until_online",
        canContinue: false,
        isBackendAuthority: false,
      };

    case "security_review_required":
      return {
        status: "security_review",
        canContinue: false,
        isBackendAuthority: false,
      };
  }
}
