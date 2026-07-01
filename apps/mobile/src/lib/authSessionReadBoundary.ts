import type {
  AnonymousIdentityReadiness,
  AuthErrorState,
  AuthSessionState,
  AuthUserView,
  OwnerCreationReadiness,
  SessionBoundarySnapshot,
  SessionRecoveryState,
} from "./authSessionBoundary";
import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type AuthSessionReadBoundaryStatus =
  | "client_unavailable"
  | "unauthenticated"
  | "authenticated_client_observed"
  | "expired"
  | "read_failed";

export type AuthSessionReadBoundaryResult = Readonly<{
  kind: "auth_session_read_boundary_result";
  phaseGate: "auth_session_read_boundary";
  status: AuthSessionReadBoundaryStatus;
  snapshot: SessionBoundarySnapshot;
  clientAvailable: boolean;
  sessionPresent: boolean;
  isBackendAuthority: boolean;
  isServerConfirmed: boolean;
  isMutationEnabled: boolean;
  isListenerEnabled: boolean;
}>;

type SafeUserSource = Readonly<{
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
}>;

const recoveryNone: SessionRecoveryState = {
  status: "none",
  reason: null,
  requiresServerRecheck: false,
};

const recoveryRecheck: SessionRecoveryState = {
  status: "server_recheck_required",
  reason: "auth_session_read_failed",
  requiresServerRecheck: true,
};

const anonymousIdentityUnknown: AnonymousIdentityReadiness = {
  status: "unknown",
  serverConfirmedAnonymousIdentityId: null,
  isServerConfirmed: false,
  localCacheTrusted: false,
};

const ownerCreationBlocked: OwnerCreationReadiness = {
  status: "not_authenticated",
  error: null,
  canRequest: false,
  isRequestEligibilityOnly: true,
};

function getStringMetadataValue(
  metadata: Record<string, unknown> | null | undefined,
  keys: readonly string[],
): string | null {
  if (metadata === null || metadata === undefined) {
    return null;
  }

  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function mapSafeUserView(user: SafeUserSource): AuthUserView {
  return {
    id: user.id,
    displayName: getStringMetadataValue(user.user_metadata, [
      "display_name",
      "full_name",
      "name",
    ]),
    email: user.email ?? null,
    phone: user.phone ?? null,
    providerLabel: getStringMetadataValue(user.app_metadata, ["provider"]),
    isServerDerived: true,
    isDisplayOnly: true,
  };
}

function createAuthError(
  message: string | null,
  recovery: SessionRecoveryState,
): AuthErrorState {
  return {
    code: "SESSION_REFRESH_FAILED",
    message,
    recoveryStatus: recovery.status,
  };
}

function createSnapshot(input: {
  session: AuthSessionState;
  recovery: SessionRecoveryState;
  errors?: readonly AuthErrorState[];
}): SessionBoundarySnapshot {
  return {
    session: input.session,
    anonymousIdentity: anonymousIdentityUnknown,
    ownerCreation: ownerCreationBlocked,
    recovery: input.recovery,
    errors: input.errors ?? [],
  };
}

function createResult(input: {
  status: AuthSessionReadBoundaryStatus;
  snapshot: SessionBoundarySnapshot;
  clientAvailable: boolean;
  sessionPresent: boolean;
}): AuthSessionReadBoundaryResult {
  return {
    kind: "auth_session_read_boundary_result",
    phaseGate: "auth_session_read_boundary",
    status: input.status,
    snapshot: input.snapshot,
    clientAvailable: input.clientAvailable,
    sessionPresent: input.sessionPresent,
    isBackendAuthority: false,
    isServerConfirmed: false,
    isMutationEnabled: false,
    isListenerEnabled: false,
  };
}

function isExpired(expiresAt: number | null | undefined): boolean {
  if (typeof expiresAt !== "number") {
    return false;
  }

  return expiresAt <= Math.floor(Date.now() / 1000);
}

export async function readAuthSessionBoundary(): Promise<AuthSessionReadBoundaryResult> {
  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    const status =
      boundary.reason === "missing_env" ? "unknown" : "unauthenticated";
    const session: AuthSessionState = {
      status,
      user: null,
      error: null,
      recovery: recoveryNone,
      isServerConfirmed: false,
      isLocalOnly: false,
    };

    return createResult({
      status: "client_unavailable",
      snapshot: createSnapshot({ session, recovery: recoveryNone }),
      clientAvailable: false,
      sessionPresent: false,
    });
  }

  try {
    const { data, error } = await boundary.client.auth.getSession();

    if (error !== null) {
      const authError = createAuthError(error.message, recoveryRecheck);
      const session: AuthSessionState = {
        status: "refresh_failed",
        user: null,
        error: authError,
        recovery: recoveryRecheck,
        isServerConfirmed: false,
        isLocalOnly: false,
      };

      return createResult({
        status: "read_failed",
        snapshot: createSnapshot({
          session,
          recovery: recoveryRecheck,
          errors: [authError],
        }),
        clientAvailable: true,
        sessionPresent: false,
      });
    }

    const observedSession = data.session;

    if (observedSession === null) {
      const session: AuthSessionState = {
        status: "unauthenticated",
        user: null,
        error: null,
        recovery: recoveryNone,
        isServerConfirmed: false,
        isLocalOnly: false,
      };

      return createResult({
        status: "unauthenticated",
        snapshot: createSnapshot({ session, recovery: recoveryNone }),
        clientAvailable: true,
        sessionPresent: false,
      });
    }

    if (isExpired(observedSession.expires_at)) {
      const session: AuthSessionState = {
        status: "expired",
        user: mapSafeUserView(observedSession.user),
        error: null,
        recovery: recoveryRecheck,
        isServerConfirmed: false,
        isLocalOnly: false,
      };

      return createResult({
        status: "expired",
        snapshot: createSnapshot({ session, recovery: recoveryRecheck }),
        clientAvailable: true,
        sessionPresent: true,
      });
    }

    const session: AuthSessionState = {
      status: "authenticated",
      user: mapSafeUserView(observedSession.user),
      error: null,
      recovery: recoveryNone,
      isServerConfirmed: false,
      isLocalOnly: false,
    };

    return createResult({
      status: "authenticated_client_observed",
      snapshot: createSnapshot({ session, recovery: recoveryNone }),
      clientAvailable: true,
      sessionPresent: true,
    });
  } catch {
    const authError = createAuthError(null, recoveryRecheck);
    const session: AuthSessionState = {
      status: "recovery_required",
      user: null,
      error: authError,
      recovery: recoveryRecheck,
      isServerConfirmed: false,
      isLocalOnly: false,
    };

    return createResult({
      status: "read_failed",
      snapshot: createSnapshot({
        session,
        recovery: recoveryRecheck,
        errors: [authError],
      }),
      clientAvailable: true,
      sessionPresent: false,
    });
  }
}
