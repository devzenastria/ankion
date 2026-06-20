import type {
  AnonymousIdentityReadiness,
  AuthErrorState,
  AuthSessionState,
  OwnerCreationReadiness,
  SessionRecoveryState,
} from "./authSessionBoundary";

type ViewTone = "neutral" | "ready" | "pending" | "blocked" | "attention";

export type AuthSessionViewState = Readonly<{
  status: "ready" | "pending" | "blocked" | "needs_recovery";
  tone: ViewTone;
  title: string;
  detail: string;
  canRequest: boolean;
  isBackendAuthority: false;
}>;

export type AnonymousIdentityViewState = Readonly<{
  status: "ready" | "pending" | "blocked" | "needs_refresh";
  tone: ViewTone;
  title: string;
  detail: string;
  canDisplayAnonymousSurface: boolean;
  isBackendAuthority: false;
}>;

export type OwnerCreationViewState = Readonly<{
  status: "ready" | "pending" | "complete" | "blocked" | "needs_recovery";
  tone: ViewTone;
  title: string;
  detail: string;
  canShowCreationCta: boolean;
  isBackendAuthority: false;
}>;

export type AuthBoundaryViewState = Readonly<{
  session: AuthSessionViewState;
  anonymousIdentity: AnonymousIdentityViewState;
  ownerCreation: OwnerCreationViewState;
  recoveryStatus: SessionRecoveryState["status"];
  errorMessage: string | null;
  canShowPrimaryCta: boolean;
  isBackendAuthority: false;
}>;

// These helpers are inert and side-effect-free.
// They do not create backend authority.
// Backend owner source remains auth.uid().
// Client state cannot assign owner_user_id.
// Local readiness is not a payment/reveal/entitlement authority.

export function getAuthSessionViewState(
  state: AuthSessionState,
): AuthSessionViewState {
  switch (state.status) {
    case "authenticated":
      if (state.isServerConfirmed && !state.isLocalOnly && state.user !== null) {
        return {
          status: "ready",
          tone: "ready",
          title: "Session ready",
          detail: "Account session is ready for safe requests.",
          canRequest: true,
          isBackendAuthority: false,
        };
      }

      return {
        status: "blocked",
        tone: "attention",
        title: "Session needs confirmation",
        detail: "Wait for a fresh server check before continuing.",
        canRequest: false,
        isBackendAuthority: false,
      };

    case "loading":
    case "refresh_pending":
      return {
        status: "pending",
        tone: "pending",
        title: "Checking session",
        detail: "Wait while the session state is refreshed.",
        canRequest: false,
        isBackendAuthority: false,
      };

    case "refresh_failed":
    case "recovery_required":
      return {
        status: "needs_recovery",
        tone: "attention",
        title: "Session needs recovery",
        detail: "Retry session recovery before continuing.",
        canRequest: false,
        isBackendAuthority: false,
      };

    case "unknown":
    case "unauthenticated":
    case "expired":
    case "local_cached_untrusted":
      return {
        status: "blocked",
        tone: "blocked",
        title: "Session not ready",
        detail: "Do not continue until session state is confirmed.",
        canRequest: false,
        isBackendAuthority: false,
      };
  }
}

export function getAnonymousIdentityViewState(
  readiness: AnonymousIdentityReadiness,
): AnonymousIdentityViewState {
  switch (readiness.status) {
    case "ready":
      return readiness.isServerConfirmed
        ? {
            status: "ready",
            tone: "ready",
            title: "Anonymous identity ready",
            detail: "Anonymous surface can be prepared for display.",
            canDisplayAnonymousSurface: true,
            isBackendAuthority: false,
          }
        : {
            status: "needs_refresh",
            tone: "attention",
            title: "Anonymous identity needs refresh",
            detail: "Refresh before trusting anonymous readiness.",
            canDisplayAnonymousSurface: false,
            isBackendAuthority: false,
          };

    case "creation_pending":
      return {
        status: "pending",
        tone: "pending",
        title: "Anonymous identity pending",
        detail: "Wait for identity readiness before continuing.",
        canDisplayAnonymousSurface: false,
        isBackendAuthority: false,
      };

    case "needs_refresh":
    case "stale_cache":
      return {
        status: "needs_refresh",
        tone: "attention",
        title: "Anonymous identity needs refresh",
        detail: "Refresh before showing anonymous readiness.",
        canDisplayAnonymousSurface: false,
        isBackendAuthority: false,
      };

    case "denied":
    case "blocked":
      return {
        status: "blocked",
        tone: "blocked",
        title: "Anonymous identity blocked",
        detail: "Do not continue with anonymous readiness.",
        canDisplayAnonymousSurface: false,
        isBackendAuthority: false,
      };

    case "unknown":
    case "not_created":
    case "creation_eligible":
      return {
        status: "blocked",
        tone: "neutral",
        title: "Anonymous identity not ready",
        detail: "Wait for confirmed readiness before continuing.",
        canDisplayAnonymousSurface: false,
        isBackendAuthority: false,
      };
  }
}

export function getOwnerCreationViewState(
  readiness: OwnerCreationReadiness,
): OwnerCreationViewState {
  switch (readiness.status) {
    case "eligible":
      return {
        status: "ready",
        tone: "ready",
        title: "Profile setup available",
        detail: "Creation can be requested when the user continues.",
        canShowCreationCta: readiness.canRequest,
        isBackendAuthority: false,
      };

    case "pending":
    case "session_loading":
      return {
        status: "pending",
        tone: "pending",
        title: "Profile setup pending",
        detail: "Wait for the current step to finish.",
        canShowCreationCta: false,
        isBackendAuthority: false,
      };

    case "complete":
    case "idempotent_existing":
      return {
        status: "complete",
        tone: "ready",
        title: "Profile setup complete",
        detail: "The setup state is stable for the interface.",
        canShowCreationCta: false,
        isBackendAuthority: false,
      };

    case "network_unavailable":
    case "needs_recovery":
      return {
        status: "needs_recovery",
        tone: "attention",
        title: "Profile setup needs recovery",
        detail: "Retry after the session state is safe.",
        canShowCreationCta: false,
        isBackendAuthority: false,
      };

    case "not_authenticated":
    case "session_expired":
    case "denied":
    case "blocked_by_policy":
      return {
        status: "blocked",
        tone: "blocked",
        title: "Profile setup blocked",
        detail: "Do not continue until eligibility is restored.",
        canShowCreationCta: false,
        isBackendAuthority: false,
      };
  }
}

export function getAuthBoundaryViewState(input: {
  session: AuthSessionState;
  anonymousIdentity: AnonymousIdentityReadiness;
  ownerCreation: OwnerCreationReadiness;
  authError?: AuthErrorState | null;
  recovery: SessionRecoveryState;
}): AuthBoundaryViewState {
  const session = getAuthSessionViewState(input.session);
  const anonymousIdentity = getAnonymousIdentityViewState(
    input.anonymousIdentity,
  );
  const ownerCreation = getOwnerCreationViewState(input.ownerCreation);

  return {
    session,
    anonymousIdentity,
    ownerCreation,
    recoveryStatus: input.recovery.status,
    errorMessage: input.authError?.message ?? null,
    canShowPrimaryCta:
      session.canRequest &&
      anonymousIdentity.status === "ready" &&
      ownerCreation.status === "ready",
    isBackendAuthority: false,
  };
}
