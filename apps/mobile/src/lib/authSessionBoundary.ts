export type AuthSessionStatus =
  | "unknown"
  | "loading"
  | "unauthenticated"
  | "authenticated"
  | "refresh_pending"
  | "expired"
  | "refresh_failed"
  | "local_cached_untrusted"
  | "recovery_required";

export type AnonymousIdentityReadinessStatus =
  | "unknown"
  | "not_created"
  | "creation_eligible"
  | "creation_pending"
  | "ready"
  | "denied"
  | "blocked"
  | "stale_cache"
  | "needs_refresh";

export type OwnerCreationReadinessStatus =
  | "not_authenticated"
  | "session_loading"
  | "session_expired"
  | "eligible"
  | "pending"
  | "complete"
  | "denied"
  | "idempotent_existing"
  | "blocked_by_policy"
  | "network_unavailable"
  | "needs_recovery";

export type AuthErrorCode =
  | "AUTHENTICATED_OWNER_REQUIRED"
  | "SESSION_MISSING"
  | "SESSION_EXPIRED"
  | "SESSION_REFRESH_FAILED"
  | "OWNER_CREATION_DENIED"
  | "OWNER_CREATION_IDEMPOTENT_EXISTING"
  | "ANONYMOUS_IDENTITY_NOT_READY"
  | "LOCAL_CACHE_MISMATCH"
  | "REPLAYED_SESSION_SUSPECTED"
  | "OFFLINE_TRUST_BLOCKED"
  | "DEBUG_TRUST_BLOCKED"
  | "NETWORK_UNAVAILABLE"
  | "UNKNOWN_AUTH_ERROR";

export type SessionRecoveryStatus =
  | "none"
  | "refresh_required"
  | "reauth_required"
  | "clear_local_cache_required"
  | "server_recheck_required"
  | "blocked_until_online"
  | "security_review_required";

export const AUTH_SESSION_STATUSES = [
  "unknown",
  "loading",
  "unauthenticated",
  "authenticated",
  "refresh_pending",
  "expired",
  "refresh_failed",
  "local_cached_untrusted",
  "recovery_required",
] as const satisfies readonly AuthSessionStatus[];

export const ANONYMOUS_IDENTITY_READINESS_STATUSES = [
  "unknown",
  "not_created",
  "creation_eligible",
  "creation_pending",
  "ready",
  "denied",
  "blocked",
  "stale_cache",
  "needs_refresh",
] as const satisfies readonly AnonymousIdentityReadinessStatus[];

export const OWNER_CREATION_READINESS_STATUSES = [
  "not_authenticated",
  "session_loading",
  "session_expired",
  "eligible",
  "pending",
  "complete",
  "denied",
  "idempotent_existing",
  "blocked_by_policy",
  "network_unavailable",
  "needs_recovery",
] as const satisfies readonly OwnerCreationReadinessStatus[];

export const AUTH_ERROR_CODES = [
  "AUTHENTICATED_OWNER_REQUIRED",
  "SESSION_MISSING",
  "SESSION_EXPIRED",
  "SESSION_REFRESH_FAILED",
  "OWNER_CREATION_DENIED",
  "OWNER_CREATION_IDEMPOTENT_EXISTING",
  "ANONYMOUS_IDENTITY_NOT_READY",
  "LOCAL_CACHE_MISMATCH",
  "REPLAYED_SESSION_SUSPECTED",
  "OFFLINE_TRUST_BLOCKED",
  "DEBUG_TRUST_BLOCKED",
  "NETWORK_UNAVAILABLE",
  "UNKNOWN_AUTH_ERROR",
] as const satisfies readonly AuthErrorCode[];

export const SESSION_RECOVERY_STATUSES = [
  "none",
  "refresh_required",
  "reauth_required",
  "clear_local_cache_required",
  "server_recheck_required",
  "blocked_until_online",
  "security_review_required",
] as const satisfies readonly SessionRecoveryStatus[];

export type AuthUserView = Readonly<{
  // server-derived, display-only, never authority
  id: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  providerLabel: string | null;
  isServerDerived: true;
  isDisplayOnly: true;
}>;

export type AuthErrorState = Readonly<{
  code: AuthErrorCode;
  message: string | null;
  recoveryStatus: SessionRecoveryStatus;
}>;

export type SessionRecoveryState = Readonly<{
  status: SessionRecoveryStatus;
  reason: string | null;
  requiresServerRecheck: boolean;
}>;

export type AuthSessionState = Readonly<{
  status: AuthSessionStatus;
  user: AuthUserView | null;
  error: AuthErrorState | null;
  recovery: SessionRecoveryState;
  isServerConfirmed: boolean;
  isLocalOnly: boolean;
}>;

export type AnonymousIdentityReadiness = Readonly<{
  status: AnonymousIdentityReadinessStatus;
  serverConfirmedAnonymousIdentityId: string | null;
  isServerConfirmed: boolean;
  localCacheTrusted: false;
}>;

export type OwnerCreationReadiness = Readonly<{
  status: OwnerCreationReadinessStatus;
  error: AuthErrorState | null;
  canRequest: boolean;
  isRequestEligibilityOnly: true;
}>;

export type FutureOwnerCreationRequest = Readonly<{
  p_chosen_display_name: string;
  p_short_bio: string;
  p_age_band: string;
}>;

export type SessionBoundarySnapshot = Readonly<{
  session: AuthSessionState;
  anonymousIdentity: AnonymousIdentityReadiness;
  ownerCreation: OwnerCreationReadiness;
  recovery: SessionRecoveryState;
  errors: readonly AuthErrorState[];
}>;
